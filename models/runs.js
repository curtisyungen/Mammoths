module.exports = function(sequelize, DataTypes) {
  var Runs = sequelize.define("Runs", {
    date: DataTypes.STRING,
    distance: DataTypes.FLOAT,
    route: DataTypes.STRING,
    duration: DataTypes.STRING,
    location: DataTypes.STRING,
    surface: DataTypes.STRING,
  });

  Runs.associate = function(models) {
    Runs.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false
      }
    });

    Runs.belongsTo(models.Routes, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  
  return Runs;
};
