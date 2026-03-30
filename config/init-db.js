require('dotenv').config();
const { initializeDatabase } = require('./database');

async function main() {
    try {
        await initializeDatabase();
        process.exit(0);
    } catch (error) {
        console.error('Ошибка:', error);
        process.exit(1);
    }
}

main();
