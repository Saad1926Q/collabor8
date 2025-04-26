// models/index.js
import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const configFile = require('../config/config.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// 🛠 Important fix: use pathToFileURL
const files = fs.readdirSync(__dirname).filter(file =>
  file !== 'index.js' && file.endsWith('.js')
);

for (const file of files) {
  const filePath = path.join(__dirname, file);
  const moduleUrl = pathToFileURL(filePath).href; 

  const { default: modelFunc } = await import(moduleUrl);
  const model = modelFunc(sequelize, DataTypes);
  db[model.name] = model;
}

Object.values(db).forEach(model => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
