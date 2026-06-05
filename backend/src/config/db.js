import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import toml from 'toml';
import { fileURLToPath } from 'url';

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Cargar la configuración desde config.toml
const configPath = path.join(__dirname, '../../config.toml');
const config = toml.parse(fs.readFileSync(configPath, 'utf-8')).database;

// 2. Configurar SSL optimizado para Render y Aiven
let sslConfig = false;

if (config.ssl) {
    const caPath = path.join(__dirname, '../../', config.ssl_ca_path || '');
    if (config.ssl_ca_path && fs.existsSync(caPath)) {
        // Si el archivo físico existe en el proyecto, lo lee y lo usa
        sslConfig = {
            rejectUnauthorized: true,
            ca: fs.readFileSync(caPath).toString(),
        };
    } else {
        // Si el archivo físico NO existe (caso Render), fuerza el SSL estándar requerido por Aiven
        sslConfig = {
            rejectUnauthorized: false,
            require: true,
            rejectUnauthorized: false
        };
    }
}

// 3. Crear la instancia de Sequelize
export const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: false,

        dialectOptions: {
            ssl: sslConfig
        },

        pool: {
            max: config.pool_max || 10,
            min: config.pool_min || 2,
            acquire: config.connection_timeout || 60000,
            idle: config.pool_idle || 10000,
            evict: 1000,
        },

        retry: {
            match: [
                /ConnectionError/,
                /SequelizeHostNotFoundError/,
                /ENOTFOUND/,
                /ECONNREFUSED/,
                /ECONNRESET/,
            ],
            max: config.retry_attempts || 3,
        },
    }
);

// 4. Función connectDB para compatibilidad con server.js
export async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a PostgreSQL establecida correctamente.');
            return true;
        } catch (error) {
            console.error(`❌ Error al conectar (Intentos restantes: ${retries - 1}):`, error.message);
            retries -= 1;
            if (retries === 0) {
                console.log('💡 Verifica tu conexión a Internet o los datos en config.toml.');
                throw error;
            }
            // Esperar 3 segundos antes de intentar de nuevo
            await new Promise(res => setTimeout(res, 3000));
        }
    }
}
