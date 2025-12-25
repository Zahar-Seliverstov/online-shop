import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
    // Очищаем базу данных
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log("🗑️  База данных очищена");

    // Создаем пользователей
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
        data: {
            email: "admin@shop.com",
            password: hashedPassword,
            name: "Администратор",
            role: "ADMIN",
        },
    });

    const user = await prisma.user.create({
        data: {
            email: "user@shop.com",
            password: hashedPassword,
            name: "Иван Иванов",
            role: "USER",
        },
    });

    console.log("👥 Пользователи созданы");

    // Создаем категории
    const electronics = await prisma.category.create({
        data: { name: "Электроника" },
    });

    const clothing = await prisma.category.create({
        data: { name: "Одежда" },
    });

    const books = await prisma.category.create({
        data: { name: "Книги" },
    });

    const home = await prisma.category.create({
        data: { name: "Для дома" },
    });

    console.log("📂 Категории созданы");

    // Создаем товары
    const products = [
        {
            name: "Смартфон Samsung Galaxy S24",
            description:
                "Флагманский смартфон с отличной камерой и производительностью",
            price: 79999,
            imageUrl:
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
            stock: 15,
            categoryId: electronics.id,
        },
        {
            name: "Ноутбук Apple MacBook Air M2",
            description: "Легкий и мощный ноутбук для работы и творчества",
            price: 129999,
            imageUrl:
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
            stock: 8,
            categoryId: electronics.id,
        },
        {
            name: "Беспроводные наушники AirPods Pro",
            description: "Наушники с активным шумоподавлением",
            price: 24999,
            imageUrl:
                "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
            stock: 25,
            categoryId: electronics.id,
        },
        {
            name: "Умные часы Apple Watch Series 9",
            description: "Фитнес-трекер и уведомления на вашем запястье",
            price: 44999,
            imageUrl:
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
            stock: 12,
            categoryId: electronics.id,
        },
        {
            name: "Футболка хлопковая базовая",
            description: "Классическая футболка из 100% хлопка",
            price: 1299,
            imageUrl:
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            stock: 50,
            categoryId: clothing.id,
        },
        {
            name: "Джинсы прямого кроя",
            description: "Удобные джинсы на каждый день",
            price: 3999,
            imageUrl:
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
            stock: 30,
            categoryId: clothing.id,
        },
        {
            name: "Зимняя куртка",
            description: "Теплая куртка для холодной погоды",
            price: 8999,
            imageUrl:
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            stock: 20,
            categoryId: clothing.id,
        },
        {
            name: "Кроссовки спортивные",
            description: "Легкие и удобные кроссовки для бега",
            price: 5499,
            imageUrl:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            stock: 35,
            categoryId: clothing.id,
        },
        {
            name: 'Книга "Чистый код"',
            description: "Роберт Мартин - библия программиста",
            price: 1899,
            imageUrl:
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
            stock: 40,
            categoryId: books.id,
        },
        {
            name: 'Книга "1984" Джордж Оруэлл',
            description: "Классика антиутопии",
            price: 799,
            imageUrl:
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            stock: 60,
            categoryId: books.id,
        },
        {
            name: "Набор из 3 книг - детективы",
            description: "Коллекция лучших детективных романов",
            price: 2499,
            imageUrl:
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            stock: 25,
            categoryId: books.id,
        },
        {
            name: "Кофеварка капельная",
            description: "Приготовьте идеальный кофе дома",
            price: 4599,
            imageUrl:
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
            stock: 18,
            categoryId: home.id,
        },
        {
            name: "Набор посуды 12 предметов",
            description: "Качественная посуда для вашей кухни",
            price: 6999,
            imageUrl:
                "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400",
            stock: 22,
            categoryId: home.id,
        },
        {
            name: "Плед мягкий 150x200",
            description: "Уютный плед для холодных вечеров",
            price: 2299,
            imageUrl:
                "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400",
            stock: 45,
            categoryId: home.id,
        },
        {
            name: "Настольная лампа LED",
            description: "Современная лампа с регулировкой яркости",
            price: 3299,
            imageUrl:
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
            stock: 28,
            categoryId: home.id,
        },
        {
            name: "Планшет iPad Air",
            description: "Мощный планшет для работы и развлечений",
            price: 64999,
            imageUrl:
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
            stock: 10,
            categoryId: electronics.id,
        },
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    console.log("📦 Товары созданы");
    console.log("");
    console.log("✅ Seed выполнен успешно!");
    console.log("");
    console.log("📧 Тестовые пользователи:");
    console.log("   Admin: admin@shop.com / password123");
    console.log("   User:  user@shop.com / password123");
}

main()
    .catch((e) => {
        console.error("❌ Ошибка при выполнении seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
