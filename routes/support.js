const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10000000 }
});

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const tickets = await query(
            `SELECT st.*, u.first_name as manager_name
             FROM support_tickets st
             LEFT JOIN users u ON st.manager_id = u.id
             WHERE st.user_id = ?
             ORDER BY st.created_at DESC`,
            [req.session.user.id]
        );

        res.render('support/list', { tickets });
    } catch (error) {
        console.error('Ошибка загрузки тикетов:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки тикетов' });
    }
});

router.post('/create', isAuthenticated, upload.array('files', 5), async (req, res) => {
    try {
        const { message } = req.body;

        const ticketCount = await query('SELECT COUNT(*) as count FROM support_tickets');
        const number = ticketCount[0].count + 1;

        const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`).join(',') : '';

        const result = await query(
            'INSERT INTO support_tickets (user_id, number) VALUES (?, ?)',
            [req.session.user.id, number]
        );

        await query(
            'INSERT INTO support_messages (ticket_id, user_id, message, attachment) VALUES (?, ?, ?, ?)',
            [result.insertId, req.session.user.id, message, attachments]
        );

        res.json({ success: true, ticket_id: result.insertId });
    } catch (error) {
        console.error('Ошибка создания тикета:', error);
        res.status(500).json({ success: false, message: 'Ошибка создания тикета' });
    }
});

router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const tickets = await query(
            `SELECT st.*, u.first_name as manager_name, u.last_name as manager_lastname
             FROM support_tickets st
             LEFT JOIN users u ON st.manager_id = u.id
             WHERE st.id = ? AND st.user_id = ?`,
            [id, req.session.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).render('error', { error: 'Тикет не найден' });
        }

        const messages = await query(
            `SELECT sm.*, u.first_name, u.last_name, u.role
             FROM support_messages sm
             JOIN users u ON sm.user_id = u.id
             WHERE sm.ticket_id = ?
             ORDER BY sm.created_at ASC`,
            [id]
        );

        res.render('support/detail', {
            ticket: tickets[0],
            messages
        });
    } catch (error) {
        console.error('Ошибка загрузки тикета:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки тикета' });
    }
});

router.post('/:id/message', isAuthenticated, upload.array('files', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const tickets = await query(
            'SELECT * FROM support_tickets WHERE id = ? AND user_id = ?',
            [id, req.session.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Тикет не найден' });
        }

        const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`).join(',') : '';

        await query(
            'INSERT INTO support_messages (ticket_id, user_id, message, attachment) VALUES (?, ?, ?, ?)',
            [id, req.session.user.id, message, attachments]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        res.status(500).json({ success: false, message: 'Ошибка отправки сообщения' });
    }
});

router.post('/:id/close', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const tickets = await query(
            'SELECT * FROM support_tickets WHERE id = ? AND user_id = ?',
            [id, req.session.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Тикет не найден' });
        }

        await query(
            'UPDATE support_tickets SET status = ? WHERE id = ?',
            ['closed', id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка закрытия тикета:', error);
        res.status(500).json({ success: false, message: 'Ошибка закрытия тикета' });
    }
});

module.exports = router;
