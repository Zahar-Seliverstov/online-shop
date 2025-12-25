import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Получить все товары с пагинацией и фильтрацией
router.get("/", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            categoryId,
            search,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Формируем условия фильтрации
        const where = {};

        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Получаем товары
        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: order,
            },
            skip,
            take,
        });

        // Получаем общее количество
        const total = await prisma.product.count({ where });

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ error: "Ошибка при получении товаров" });
    }
});

// Получить один товар по ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!product) {
            return res.status(404).json({ error: "Товар не найден" });
        }

        res.json(product);
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ error: "Ошибка при получении товара" });
    }
});

// Получить популярные товары
router.get("/featured/popular", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            take: 8,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.json(products);
    } catch (error) {
        console.error("Get popular products error:", error);
        res.status(500).json({ error: "Ошибка при получении товаров" });
    }
});

export default router;
