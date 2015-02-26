var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var db = require("../libs/sequelize");

module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z][a-z0-9-]{5,15}$/
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    }
  }, {
    classMethods: {
      findByLogin: function (name, password, cb) {
        User.find({
          where: {
            name: name
          }
        }).success(function (user) {
          if (user && bcrypt.compareSync(password, user.password)) {
            cb(user);
          } else {
            cb();
          }
        });
      },
      newLogin: function (data) {
        data.password = bcrypt.hashSync(data.password, salt);
        return User.create(data);
      },
      associate: function (models) {
        //models.registration.belongsTo(User);
        User.belongsTo(models.registration);
        User.hasMany(models.app);
        models.app.hasMany(User);
        User.hasMany(models.device);
        models.device.hasMany(User);
      }
    }
  });

  return User;
};