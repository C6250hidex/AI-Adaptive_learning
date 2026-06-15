module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // The officially indexed module name (e.g., "Data Structures")
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
        set(val) {
          // Senior Touch: Automatically trim and format subject names
          this.setDataValue("name", val.trim());
        },
      },
      // High-level overview displayed in the Course Discovery UI
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // The Lecturer assigned to oversee this specific track
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      // PROFESSIONAL SYSTEM OPTIMIZATION:
      // Indexes ensure the "Course Search" bar remains responsive
      indexes: [{ fields: ["name"] }, { fields: ["teacherId"] }],
      timestamps: true, // Tracks when new modules are introduced to the system
    },
  );

  /**
   * DATABASE RELATIONSHIPS:
   * Each subject module is linked to exactly one Faculty Member.
   */
  Subject.associate = (models) => {
    // Allows us to fetch a subject and see who the Lecturer is
    Subject.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "lecturer", // Human-readable alias for API responses
      onDelete: "SET NULL", // Keep the course active even if the teacher leaves
    });
  };

  return Subject;
};
