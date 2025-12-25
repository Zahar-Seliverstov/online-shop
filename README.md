# online-shop

## Запуск проекта
```
cd server
npm install // Установка зависимостей
npm run prisma:generate // Генерация модулей prisma для работы ORM
npm run prisma:migrate // Миграция
node prisma:seed // Наполнение базы данных
npm run dev // Запуск проекта
```
cd client
npm install // Установка зависимостей
npm run dev // Запуск проекта

## Важно знать!!!
Сервер работает с postgresql.
Конфиграция подключения к базе данных меняется в .env
