module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define("Users", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  });

  Users.associate = function(models) {
    Users.hasMany(models.Runs, {
      onDelete: "cascade"
    });

    Users.hasMany(models.Routes, {
      onDelete: "cascade"
    });
  };

  return Users;
};
