"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // This command finds your existing email and changes the role to admin
    return queryInterface.sequelize.query(
      `UPDATE "Users" SET role = 'admin' WHERE email = 'chidex6250@gmail.com';`,
    );
  },

  async down(queryInterface, Sequelize) {
    // This allows you to undo the change if needed
    return queryInterface.sequelize.query(
      `UPDATE "Users" SET role = 'student' WHERE email = 'chidex6250@gmail.com';`,
    );
  },
};
("use strict");

module.exports = {
  async up(queryInterface, Sequelize) {
    // This command finds your existing email and changes the role to admin
    return queryInterface.sequelize.query(
      `UPDATE "Users" SET role = 'admin' WHERE email = 'chidex6250@gmail.com';`,
    );
  },

  async down(queryInterface, Sequelize) {
    // This allows you to undo the change if needed
    return queryInterface.sequelize.query(
      `UPDATE "Users" SET role = 'student' WHERE email = 'chidex6250@gmail.com';`,
    );
  },
};
