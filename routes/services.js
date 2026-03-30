const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const services = await query(
            'SELECT * FROM services ORDER BY priority DESC, service ASC'
        );

        res.render('services/list', { services });
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки услуг' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const services = await query(
            'SELECT * FROM services WHERE id = ?',
            [id]
        );

        if (services.length === 0) {
            return res.status(404).render('error', { error: 'Услуга не найдена' });
        }

        res.render('services/detail', { service: services[0] });
    } catch (error) {
        console.error('Ошибка загрузки услуги:', error);
        res.status(500).render('error', { error: 'Ошибка загрузки услуги' });
    }
});

module.exports = router;
