const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'design_studio',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

async function query(sql, values) {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query(sql, values);
        connection.release();
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        console.log('Инициализация базы данных...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const connection = await pool.getConnection();
        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.error('Error executing statement:', statement);
                        console.error('Error:', error.message);
                    }
                }
            }
        }

        connection.release();
        console.log('База данных инициализирована успешно!');
    } catch (error) {
        console.error('Ошибка инициализации БД:', error);
        throw error;
    }
}

module.exports = { pool, query, initializeDatabase };
