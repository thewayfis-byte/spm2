# Гайд по установке и запуску NowkeArt Design Studio

## Требования

- Node.js v14+
- MySQL 5.7+ или MariaDB 10.3+
- npm или yarn

## Установка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Конфигурация базы данных

#### Вариант 1: Локальная MySQL база данных

**Windows (XAMPP/WAMP):**
1. Откройте phpMyAdmin (обычно http://localhost/phpmyadmin)
2. Создайте новую базу данных с названием `design_studio`
3. Импортируйте файл `/config/schema.sql`:
   - В phpMyAdmin выберите базу `design_studio`
   - Откройте вкладку "SQL"
   - Скопируйте содержимое файла `config/schema.sql` и выполните

**MacOS/Linux:**
```bash
mysql -u root -p < config/schema.sql
```

Введите пароль MySQL при запросе.

#### Вариант 2: Автоматическая инициализация

```bash
npm run db:init
```

Эта команда автоматически создаст все таблицы из схемы.

### 3. Конфигурация окружения

Отредактируйте файл `.env`:

```env
NODE_ENV=development
PORT=3000

# Настройки базы данных
DB_HOST=localhost        # адрес MySQL сервера
DB_PORT=3306            # порт MySQL (обычно 3306)
DB_USER=root            # пользователь MySQL
DB_PASSWORD=            # пароль MySQL (оставить пусто если нет)
DB_NAME=design_studio   # имя базы данных

SESSION_SECRET=your-secret-key-change-in-production

# Yookassa платежи (опционально)
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

### 4. Запуск приложения

**Режим разработки:**
```bash
npm run dev
```

**Режим продакшена:**
```bash
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура базы данных

### Основные таблицы:

#### 1. **users** - Пользователи системы
- `id` - уникальный ID
- `email` - электронная почта
- `password` - хешированный пароль
- `first_name` - имя
- `last_name` - фамилия
- `role` - роль (client, designer, manager, admin)
- `status` - статус (active, blocked)

#### 2. **orders** - Заказы
- `id` - ID заказа
- `user_id` - ID клиента
- `service` - название услуги
- `status` - статус заказа:
  - Просматривается - новый заказ
  - Описывается - в процессе описания
  - Проверяется - на проверке
  - Оплачивается - ожидание оплаты
  - В очереди - оплачено, в очереди
  - Выполняется - дизайнер работает
  - Готов - завершено, ждет вывода
  - Переделывается - требует доработки
- `designer_id` - ID дизайнера
- `manager_id` - ID менеджера
- `number` - номер заказа
- `attachment` - прикрепленные файлы
- `arms` - дополнительные требования

#### 3. **services** - Услуги
- `id` - ID услуги
- `service` - название услуги
- `price` - цена услуги
- `about` - описание услуги
- `priority` - приоритет в списке

#### 4. **staff** - Сотрудники
- `user_id` - ID пользователя
- `staff_group` - группа (admin, manager, designer, moder)
- `balance` - баланс сотрудника
- `orders_all` - всего заказов
- `orders_did` - выполненных заказов
- `dialog_all` - всего обращений в поддержку
- `dialog_did` - обработанных обращений

#### 5. **support_tickets** - Тикеты поддержки
- `id` - ID тикета
- `user_id` - ID пользователя
- `manager_id` - ID менеджера поддержки
- `status` - статус (open, closed)
- `number` - номер тикета

#### 6. **order_messages** - Сообщения по заказам
- `order_id` - ID заказа
- `user_id` - ID автора сообщения
- `message` - текст сообщения
- `attachment` - вложения

#### 7. **support_messages** - Сообщения поддержки
- `ticket_id` - ID тикета
- `user_id` - ID автора сообщения
- `message` - текст сообщения
- `attachment` - вложения

#### 8. **pay_list** - История платежей
- `user_id` - ID пользователя
- `money` - сумма платежа
- `id_form` - ID платежа в Yookassa
- `service` - услуга
- `designer` - ID дизайнера
- `bet` - процент комиссии

#### 9. **reviews** - Отзывы о дизайнерах
- `user_id` - ID автора отзыва
- `order_id` - ID заказа
- `designer_id` - ID дизайнера
- `rating` - оценка (1-5)
- `comment` - текст отзыва

#### 10. **control_close_orders** - Контроль открытых заказов
- `user_id` - ID клиента
- `date_last_message` - дата последнего сообщения

#### 11. **settings** - Глобальные настройки
- `setting_key` - ключ настройки
- `setting_value` - значение

Дополнительные таблицы:
- `staff_perms` - права доступа сотрудников
- `designer_service` - услуги дизайнеров
- `promocodes` - промокоды
- `used_promocode` - использованные промокоды
- `raything_list` - история штрафов
- `balance_list` - история балансов
- `check_free` - бесплатные проверки

## Первый запуск

1. Откройте http://localhost:3000
2. Зарегистрируйте новый аккаунт
3. Для доступа к админ панели установите роль `admin` пользователю в базе:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

4. Войдите и перейдите на http://localhost:3000/admin

## Функциональность

### Для клиентов
- Регистрация и вход
- Просмотр каталога услуг
- Создание заказов
- Загрузка файлов
- Чат с дизайнером
- Отслеживание статуса заказа
- Оплата через Yookassa
- Создание тикетов поддержки
- История заказов

### Для дизайнеров
- Просмотр новых заказов в очереди
- Работа над заказом
- Отправка результатов
- Управление ставками по услугам
- История выполненных заказов
- Отслеживание баланса

### Для менеджеров
- Управление заказами
- Назначение дизайнеров
- Обработка тикетов поддержки
- Контроль качества
- История работы

### Для админа
- Полное управление системой
- Управление пользователями
- Управление услугами
- Управление заказами
- Управление сотрудниками
- Просмотр статистики
- Настройки системы

## Проблемы и решения

### Проблема: "Cannot find module 'mysql2'"
**Решение:** Установите зависимости:
```bash
npm install
```

### Проблема: "ECONNREFUSED - MySQL сервер не запущен"
**Решение:** Убедитесь что MySQL сервер запущен:
- Windows: запустите XAMPP/WAMP
- MacOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Проблема: "Access denied for user 'root'@'localhost'"
**Решение:** Проверьте учетные данные в `.env` файле

### Проблема: "Database 'design_studio' doesn't exist"
**Решение:** Создайте базу данных и выполните инициализацию:
```bash
npm run db:init
```

## Интеграция Yookassa

1. Зарегистрируйтесь на https://yookassa.ru
2. Получите Shop ID и Secret Key
3. Добавьте их в `.env`:
```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```
4. Настройте webhook URL в кабинете Yookassa

## Развертывание

Для развертывания на сервер:
1. Используйте PM2 для управления процессом
2. Настройте HTTPS
3. Установите переменную `NODE_ENV=production`
4. Используйте reverse proxy (nginx)
5. Настройте базу данных с паролем

## Поддержка

При возникновении ошибок проверьте логи консоли для дополнительной информации.
