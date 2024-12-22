import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './src/config.js';

async function testConnection() {
    try {
        const sequelize = new Sequelize(DATABASE_URL, {
            dialect: 'postgres',
            logging: console.log
        });

        await sequelize.authenticate();
        console.log('connection successful');
        process.exit(0);
    } catch (error) {
        console.error('naaah broooo connection failed', error);
        process.exit(1);
    }
}

testConnection();