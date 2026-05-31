"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 12);

    return queryInterface.bulkInsert("Users", [
      {
        username: "System_Admin",
        email: "admin@adaptive.ai",
        password: hashedPassword,
        role: "admin",
        currentLevel: "Hard",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(
      "Users",
      { email: "admin@adaptive.ai" },
      {},
    );
  },
};
