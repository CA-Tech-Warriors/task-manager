// Owner: A (card A-4)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'That username is taken.' },
        validate: {
          len: { args: [3, 30], msg: 'Username must be 3 to 30 characters.' },
          is: { args: /^[A-Za-z0-9_.-]+$/, msg: 'Use letters, numbers, dots, dashes or underscores.' },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'An account with that email already exists.' },
        validate: { isEmail: { msg: 'Enter a valid email address.' } },
      },
      // Only ever a bcrypt hash. Never returned in responses (see defaultScope).
      passwordHash: { type: DataTypes.STRING(100), allowNull: false },
    },
    {
      tableName: 'users',
      defaultScope: { attributes: { exclude: ['passwordHash'] } },
      scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
    },
  );
