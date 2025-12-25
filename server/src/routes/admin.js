import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Применяем middleware ко всем роутам
router.use(authenticateToken);
router.use(requireAdmin);

// Получить статистику
router.get("/stats", async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers, totalRevenue] =
            await Promise.all([
                prisma.product.count(),
                prisma.order.count(),
                prisma.user.count(),
                prisma.order.aggregate({
                    _sum: { totalPrice: true },
                }),
            ]);

        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        res.json({
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue: totalRevenue._sum.totalPrice || 0,
            },
            recentOrders,
        });
    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({ error: "Ошибка при получении статистики" });
    }
});

// Получить все товары для админа
router.get("/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(products);
    } catch (error) {
        console.error("Get admin products error:", error);
        res.status(500).json({ error: "Ошибка при получении товаров" });
    }
});

// Создать товар
router.post(
    "/products",
    [
        body("name").notEmpty().trim().withMessage("Название обязательно"),
        body("description")
            .notEmpty()
            .trim()
            .withMessage("Описание обязательно"),
        body("price")
            .isFloat({ min: 0 })
            .withMessage("Цена должна быть положительным числом"),
        body("stock")
            .isInt({ min: 0 })
            .withMessage("Количество должно быть целым положительным числом"),
        body("categoryId").isInt().withMessage("ID категории обязателен"),
        body("imageUrl")
            .notEmpty()
            .trim()
            .withMessage("URL изображения обязателен"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, description, price, stock, categoryId, imageUrl } =
                req.body;

            // Проверяем существование категории
            const category = await prisma.category.findUnique({
                where: { id: parseInt(categoryId) },
            });

            if (!category) {
                return res.status(404).json({ error: "Категория не найдена" });
            }

            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    categoryId: parseInt(categoryId),
                    imageUrl,
                },
                include: {
                    category: true,
                },
            });

            res.status(201).json({
                message: "Товар успешно создан",
                product,
            });
        } catch (error) {
            console.error("Create product error:", error);
            res.status(500).json({ error: "Ошибка при создании товара" });
        }
    }
);

// Обновить товар
router.put(
    "/products/:id",
    [
        body("name").optional().notEmpty().trim(),
        body("description").optional().notEmpty().trim(),
        body("price").optional().isFloat({ min: 0 }),
        body("stock").optional().isInt({ min: 0 }),
        body("categoryId").optional().isInt(),
        body("imageUrl").optional().notEmpty().trim(),
    ],
    async (req, res) => {
        try {
            const { id } = req.params;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Проверяем существование товара
            const existingProduct = await prisma.product.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingProduct) {
                return res.status(404).json({ error: "Товар не найден" });
            }

            const updateData = {};

            if (req.body.name) updateData.name = req.body.name;
            if (req.body.description)
                updateData.description = req.body.description;
            if (req.body.price !== undefined)
                updateData.price = parseFloat(req.body.price);
            if (req.body.stock !== undefined)
                updateData.stock = parseInt(req.body.stock);
            if (req.body.categoryId)
                updateData.categoryId = parseInt(req.body.categoryId);
            if (req.body.imageUrl) updateData.imageUrl = req.body.imageUrl;

            const product = await prisma.product.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    category: true,
                },
            });

            res.json({
                message: "Товар успешно обновлен",
                product,
            });
        } catch (error) {
            console.error("Update product error:", error);
            res.status(500).json({ error: "Ошибка при обновлении товара" });
        }
    }
);

// Удалить товар
router.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование товара
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: "Товар успешно удален" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ error: "Ошибка при удалении товара" });
    }
});

// Получить все заказы
router.get("/orders", async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
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
        console.error("Get admin orders error:", error);
        res.status(500).json({ error: "Ошибка при получении заказов" });
    }
});

// Обновить статус заказа
router.patch("/orders/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "CANCELLED",
        ];

        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ error: "Недопустимый статус заказа" });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        res.json({
            message: "Статус заказа обновлен",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ error: "Ошибка при обновлении статуса заказа" });
    }
});

export default router;
