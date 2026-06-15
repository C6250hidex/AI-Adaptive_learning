"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
require("dotenv").config(); // Essential for loading the Cloud DB URL
const db = {};

let sequelize;

/**
 * 1. DYNAMIC CONNECTION STRATEGY
 * In Production (Render), we use the single DATABASE_URL string.
 * In Development, we use individual parameters from the .env file.
 */
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Essential for Render's managed Postgres
      },
    },
    logging: false, // Prevents console clutter in production
  });
} else {
  // Local development fallback (MySQL or local Postgres)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    },
  );
}

/**
 * 2. AUTOMATIC MODULE INDEXING
 * This block scans the 'models' folder and initializes every
 * file (User.js, Question.js, etc.) automatically.
 */
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js",
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

/**
 * 3. RELATIONSHIP SYNCHRONIZATION
 * Triggers the .associate() function in each model to build
 * the Foreign Keys in MySQL/Postgres.
 */
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export both the instance (sequelize) and the Class (Sequelize)
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
