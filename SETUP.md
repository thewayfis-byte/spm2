# Быстрый старт за 5 минут

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка базы данных

### Шаг 1: Убедитесь, что MySQL запущен
- **Windows (XAMPP):** запустите XAMPP Control Panel
- **MacOS:** `brew services start mysql`
- **Linux:** `sudo systemctl start mysql`

### Шаг 2: Создайте базу данных

**Способ 1 - Автоматический (рекомендуется):**
```bash
npm run db:init
```

**Способ 2 - Вручную через phpMyAdmin:**
1. Откройте http://localhost/phpmyadmin
2. Создайте новую БД `design_studio`
3. Импортируйте файл `config/schema.sql`

### Шаг 3: Отредактируйте .env файл (если нужно)

Откройте `.env` и установите параметры подключения к MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          (оставить пусто если нет пароля)
DB_NAME=design_studio
```

## 3. Запустите приложение

```bash
npm run dev
```

Откройте http://localhost:3000

## 4. Создайте админ аккаунт

1. Зарегистрируйтесь на сайте
2. Откройте базу данных и выполните SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'ваш-email@example.com';
```
3. Перезагрузитесь на сайте

## SQL команды для управления

### Просмотр всех пользователей:
```sql
SELECT id, email, first_name, role FROM users;
```

### Создание админа:
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

### Просмотр всех заказов:
```sql
SELECT o.*, u.first_name FROM orders o JOIN users u ON o.user_id = u.id;
```

### Просмотр услуг:
```sql
SELECT * FROM services;
```

### Добавить услугу:
```sql
INSERT INTO services (service, price, about) VALUES ('Скин VK', 500, 'Красивый скин для игры');
```

### Удалить услугу:
```sql
DELETE FROM services WHERE id = 1;
```

## Основные URL

- Главная: http://localhost:3000
- Регистрация: http://localhost:3000/auth/register
- Вход: http://localhost:3000/auth/login
- Услуги: http://localhost:3000/services
- Заказы: http://localhost:3000/orders
- Админ панель: http://localhost:3000/admin
- Поддержка: http://localhost:3000/support

## Структура файлов

```
/project
├── server.js              # Главный файл приложения
├── package.json           # Зависимости проекта
├── .env                   # Конфигурация
├── config/
│   ├── database.js        # Подключение к БД
│   ├── schema.sql         # Схема БД
│   └── init-db.js         # Инициализация БД
├── routes/                # API маршруты
│   ├── auth.js            # Вход/Регистрация
│   ├── orders.js          # Заказы
│   ├── services.js        # Услуги
│   ├── support.js         # Поддержка
│   ├── payment.js         # Платежи
│   └── admin.js           # Админ панель
├── middleware/            # Middleware функции
│   └── auth.js            # Проверка прав доступа
├── socket/                # WebSocket
│   └── chat.js            # Чат по заказам
├── views/                 # EJS шаблоны
│   ├── index.ejs          # Главная
│   ├── auth/              # Вход/Регистрация
│   ├── orders/            # Заказы
│   ├── services/          # Услуги
│   ├── support/           # Поддержка
│   ├── admin/             # Админ панель
│   └── partials/          # Компоненты
└── public/                # Статические файлы
    ├── css/
    │   └── style.css      # Стили
    ├── js/
    │   └── main.js        # Скрипты
    └── uploads/           # Загруженные файлы
```

## Решение проблем

### MySQL не подключается
```bash
# Проверьте статус MySQL
mysql -u root -p -e "SELECT 1;"

# Если ошибка - запустите MySQL:
# Windows: запустите XAMPP
# MacOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Ошибка "Access denied"
```bash
# Проверьте пароль в .env
# Если пароля нет:
DB_PASSWORD=

# Если пароль есть:
DB_PASSWORD=your_password
```

### Ошибка "Database doesn't exist"
```bash
# Создайте базу:
npm run db:init
```

### Порт 3000 занят
```bash
# Измените PORT в .env:
PORT=3001
```

## Для разработки

### Запуск с автоперезагрузкой:
```bash
npm run dev
```

### Остановка сервера:
```
Ctrl + C
```

## Дополнительно

- Посмотрите INSTALLATION.md для подробного гайда
- Все таблицы БД с описанием в INSTALLATION.md
- Используйте админ панель для управления системой
