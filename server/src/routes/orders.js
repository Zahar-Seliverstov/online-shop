import express from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Получить все заказы пользователя
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(orders);
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ error: "Ошибка при получении заказов" });
    }
});

// Получить один заказ
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Заказ не найден" });
        }

        res.json(order);
    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({ error: "Ошибка при получении заказа" });
    }
});

// Создать заказ
router.post("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Получаем корзину пользователя
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Корзина пуста" });
        }

        // Проверяем наличие товаров на складе
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Недостаточно товара "${item.product.name}" на складе`,
                });
            }
        }

        // Вычисляем общую стоимость
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
        }, 0);

        // Создаем заказ и элементы заказа в транзакции
        const order = await prisma.$transaction(async (tx) => {
            // Создаем заказ
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice,
                    status: "PENDING",
                },
            });

            // Создаем элементы заказа и обновляем остатки
            for (const item of cartItems) {
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    },
                });

                // Уменьшаем остаток товара
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Очищаем корзину
            await tx.cartItem.deleteMany({
                where: { userId },
            });

            return newOrder;
        });

        // Получаем полный заказ с элементами
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: "Заказ успешно создан",
            order: fullOrder,
        });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Ошибка при создании заказа" });
    }
});

export default router;
