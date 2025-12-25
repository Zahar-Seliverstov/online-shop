import express from "express";
import prisma from "../lib/prisma.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Получить корзину
router.get("/", optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        const where = userId ? { userId } : { sessionId, userId: null };

        const cartItems = await prisma.cartItem.findMany({
            where,
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        // Вычисляем общую стоимость
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
        }, 0);

        res.json({
            items: cartItems,
            totalPrice,
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ error: "Ошибка при получении корзины" });
    }
});

// Добавить товар в корзину
router.post("/add", optionalAuth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        if (!productId) {
            return res.status(400).json({ error: "ID товара обязателен" });
        }

        // Проверяем наличие товара
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        if (product.stock < quantity) {
            return res
                .status(400)
                .json({ error: "Недостаточно товара на складе" });
        }

        // Проверяем, есть ли уже товар в корзине
        const where = userId
            ? { productId: parseInt(productId), userId }
            : { productId: parseInt(productId), sessionId, userId: null };

        const existingItem = await prisma.cartItem.findFirst({ where });

        let cartItem;

        if (existingItem) {
            // Обновляем количество
            const newQuantity = existingItem.quantity + parseInt(quantity);

            if (product.stock < newQuantity) {
                return res
                    .status(400)
                    .json({ error: "Недостаточно товара на складе" });
            }

            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: { product: true },
            });
        } else {
            // Создаем новый элемент корзины
            cartItem = await prisma.cartItem.create({
                data: {
                    productId: parseInt(productId),
                    quantity: parseInt(quantity),
                    userId: userId || null,
                    sessionId: userId ? null : sessionId,
                },
                include: { product: true },
            });
        }

        res.json({
            message: "Товар добавлен в корзину",
            cartItem,
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ error: "Ошибка при добавлении в корзину" });
    }
});

// Обновить количество товара в корзине
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        if (quantity < 1) {
            return res
                .status(400)
                .json({ error: "Количество должно быть больше 0" });
        }

        // Проверяем принадлежность элемента корзины
        const where = { id: parseInt(id) };
        if (userId) {
            where.userId = userId;
        } else {
            where.sessionId = sessionId;
            where.userId = null;
        }

        const cartItem = await prisma.cartItem.findFirst({
            where,
            include: { product: true },
        });

        if (!cartItem) {
            return res.status(404).json({ error: "Элемент корзины не найден" });
        }

        // Проверяем наличие товара
        if (cartItem.product.stock < quantity) {
            return res
                .status(400)
                .json({ error: "Недостаточно товара на складе" });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) },
            include: { product: true },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ error: "Ошибка при обновлении корзины" });
    }
});

// Удалить товар из корзины
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        // Проверяем принадлежность элемента корзины
        const where = { id: parseInt(id) };
        if (userId) {
            where.userId = userId;
        } else {
            where.sessionId = sessionId;
            where.userId = null;
        }

        const cartItem = await prisma.cartItem.findFirst({ where });

        if (!cartItem) {
            return res.status(404).json({ error: "Элемент корзины не найден" });
        }

        await prisma.cartItem.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: "Товар удален из корзины" });
    } catch (error) {
        console.error("Delete cart item error:", error);
        res.status(500).json({ error: "Ошибка при удалении из корзины" });
    }
});

// Очистить корзину
router.delete("/", optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.sessionID;

        const where = userId ? { userId } : { sessionId, userId: null };

        await prisma.cartItem.deleteMany({ where });

        res.json({ message: "Корзина очищена" });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({ error: "Ошибка при очистке корзины" });
    }
});

export default router;
