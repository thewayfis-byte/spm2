const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { isStaff } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.use(isStaff);

router.get('/', async (req, res) => {
    try {
        const userOrders = await query(
            'SELECT COUNT(*) as count FROM orders WHERE status NOT IN (?, ?)',
            ['Готов', 'Переделывается']
        );

        const totalUsers = await query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['client']);

        const totalRevenue = await query(
            'SELECT SUM(money) as total FROM pay_list WHERE money > 0'
        );

        const recentOrders = await query(
            `SELECT o.*, u.first_name, u.last_name, s.price
             FROM orders o
             JOIN users u ON o.user_id = u.id
             LEFT JOIN services s ON o.service = s.service
             ORDER BY o.created_at DESC
             LIMIT 10`
        );

        res.render('admin/dashboard', {
            activeOrders: userOrders[0].count,
            totalUsers: totalUsers[0].count,
            totalRevenue: totalRevenue[0].total || 0,
            recentOrders
        });
    } catch (error) {
        console.error('Ошибка загрузки панели:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки панели' });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await query(
            `SELECT o.*, u.first_name, u.last_name, s.service as service_name,
             d.first_name as designer_name, m.first_name as manager_name
             FROM orders o
             JOIN users u ON o.user_id = u.id
             LEFT JOIN services s ON o.service = s.service
             LEFT JOIN users d ON o.designer_id = d.id
             LEFT JOIN users m ON o.manager_id = m.id
             ORDER BY o.created_at DESC`
        );

        res.render('admin/orders', { orders });
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки заказов' });
    }
});

router.post('/orders/:id/assign-designer', async (req, res) => {
    try {
        const { id } = req.params;
        const { designer_id } = req.body;

        await query(
            'UPDATE orders SET designer_id = ?, status = ? WHERE id = ?',
            [designer_id, 'Выполняется', id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка назначения дизайнера:', error);
        res.status(500).json({ success: false, message: 'Ошибка назначения дизайнера' });
    }
});

router.post('/orders/:id/update-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Просматривается', 'Описывается', 'Проверяется', 'Оплачивается', 'В очереди', 'Выполняется', 'Готов', 'Переделывается'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Неверный статус' });
        }

        await query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ success: false, message: 'Ошибка обновления статуса' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await query(
            'SELECT * FROM users ORDER BY created_at DESC'
        );

        res.render('admin/users', { users });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки пользователей' });
    }
});

router.post('/users/:id/update-role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['client', 'designer', 'manager', 'admin'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Неверная роль' });
        }

        await query(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        if (role !== 'client') {
            await query(
                'INSERT INTO staff (user_id, staff_group) VALUES (?, ?) ON DUPLICATE KEY UPDATE staff_group = ?',
                [id, role, role]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ success: false, message: 'Ошибка обновления роли' });
    }
});

router.post('/users/:id/block', async (req, res) => {
    try {
        const { id } = req.params;

        await query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['blocked', id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        res.status(500).json({ success: false, message: 'Ошибка блокировки пользователя' });
    }
});

router.get('/services', async (req, res) => {
    try {
        const services = await query(
            'SELECT * FROM services ORDER BY priority DESC'
        );

        res.render('admin/services', { services });
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки услуг' });
    }
});

router.post('/services/create', async (req, res) => {
    try {
        const { service, price, about } = req.body;

        await query(
            'INSERT INTO services (service, price, about, priority) VALUES (?, ?, ?, 0)',
            [service, price, about]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка создания услуги:', error);
        res.status(500).json({ success: false, message: 'Ошибка создания услуги' });
    }
});

router.post('/services/:id/update', async (req, res) => {
    try {
        const { id } = req.params;
        const { service, price, about, priority } = req.body;

        await query(
            'UPDATE services SET service = ?, price = ?, about = ?, priority = ? WHERE id = ?',
            [service, price, about, priority, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления услуги:', error);
        res.status(500).json({ success: false, message: 'Ошибка обновления услуги' });
    }
});

router.post('/services/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;

        await query('DELETE FROM services WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления услуги:', error);
        res.status(500).json({ success: false, message: 'Ошибка удаления услуги' });
    }
});

router.get('/staff', async (req, res) => {
    try {
        const staff = await query(
            `SELECT s.*, u.email, u.first_name, u.last_name
             FROM staff s
             JOIN users u ON s.user_id = u.id
             ORDER BY s.created_at DESC`
        );

        res.render('admin/staff', { staff });
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки сотрудников' });
    }
});

module.exports = router;
