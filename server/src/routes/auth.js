import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Регистрация
router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Некорректный email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Пароль должен быть не менее 6 символов"),
        body("name").optional().trim(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;

            // Проверяем, существует ли пользователь
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({
                    error: "Пользователь с таким email уже существует",
                });
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создаем пользователя
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                    role: "USER",
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });

            // Генерируем токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(201).json({
                message: "Регистрация успешна",
                user,
                token,
            });
        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({ error: "Ошибка при регистрации" });
        }
    }
);

// Вход
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Некорректный email"),
        body("password").notEmpty().withMessage("Пароль обязателен"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Находим пользователя
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res
                    .status(401)
                    .json({ error: "Неверный email или пароль" });
            }

            // Проверяем пароль
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordValid) {
                return res
                    .status(401)
                    .json({ error: "Неверный email или пароль" });
            }

            // Генерируем токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "Вход выполнен успешно",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                token,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Ошибка при входе" });
        }
    }
);

// Получение текущего пользователя
router.get("/me", authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});

// Выход
router.post("/logout", (req, res) => {
    res.json({ message: "Выход выполнен успешно" });
});

export default router;
