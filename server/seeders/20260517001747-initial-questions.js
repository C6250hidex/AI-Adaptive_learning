"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Questions", [
      {
        questionText: "What does CPU stand for?",
        optionA: "Central Processing Unit",
        optionB: "Core Print Unit",
        optionC: "Control Power User",
        optionD: "Central Post Utility",
        correctAnswer: "A",
        subject: "Hardware",
        difficulty: "Easy",
        aiScore: 5.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        questionText:
          "Explain the primary difference between a Router and a Switch.",
        optionA: "Routers are faster",
        optionB: "Switches connect networks, Routers connect devices",
        optionC: "Routers connect networks, Switches connect devices",
        optionD: "No difference",
        correctAnswer: "C",
        subject: "Networking",
        difficulty: "Medium",
        aiScore: 18.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        questionText:
          "Evaluate the architectural complexity of implementing asynchronous concurrency in a distributed microservices environment.",
        optionA: "It simplifies logic",
        optionB: "It increases scalability but adds state management overhead",
        optionC: "It is impossible",
        optionD: "It removes the need for a database",
        correctAnswer: "B",
        subject: "Software Architecture",
        difficulty: "Hard",
        aiScore: 32.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Questions", null, {});
  },
};
