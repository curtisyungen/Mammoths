module.exports = function(sequelize, DataTypes) {
  var Routes = sequelize.define("Routes", {
    name: DataTypes.STRING,
    location: DataTypes.STRING,
    distance: DataTypes.FLOAT,
    wayPoints: DataTypes.STRING(10000),
    startIcon: DataTypes.STRING(500),
    endIcon: DataTypes.STRING(500,)
  });

  Routes.associate = function(models) {
    Routes.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Routes;
};
