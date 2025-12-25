import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Получить все категории
router.get("/", async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        res.json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ error: "Ошибка при получении категорий" });
    }
});

// Получить одну категорию
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                products: {
                    take: 20,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return res.status(404).json({ error: "Категория не найдена" });
        }

        res.json(category);
    } catch (error) {
        console.error("Get category error:", error);
        res.status(500).json({ error: "Ошибка при получении категории" });
    }
});

export default router;
