module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // The academic name (e.g., "Computer Science 101")
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 50], // Ensures subject names aren't too short or long
        },
      },
      // Course overview for the student search page
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Foreign Key: Linking the subject to a specific Lecturer
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if the module is system-wide
      },
    },
    {
      // Indexes make the "Subject Search" feature lightning fast
      indexes: [{ fields: ["name"] }, { fields: ["teacherId"] }],
    },
  );

  /**
   * DATABASE RELATIONSHIPS:
   * Each subject is overseen by one Teacher (Lecturer).
   */
  Subject.associate = (models) => {
    Subject.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "lecturer",
      onDelete: "SET NULL", // If the lecturer leaves, the course remains in the system
    });

    // Potential for future expansion:
    // Subject.hasMany(models.Question, { foreignKey: 'subjectId' });
  };

  return Subject;
};
