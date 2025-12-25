import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// Проверка токена JWT
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: "Токен не предоставлен" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Получаем пользователя из базы
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "Пользователь не найден" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(403).json({ error: "Недействительный токен" });
    }
};

// Проверка роли администратора
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res
            .status(403)
            .json({ error: "Доступ запрещен. Требуются права администратора" });
    }
    next();
};

// Опциональная аутентификация (не требует обязательного токена)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Игнорируем ошибки для опциональной аутентификации
    }
    next();
};