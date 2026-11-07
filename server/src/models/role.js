// Owner: A (card A-5)
const { DataTypes } = require('sequelize');
const { ROLES } = require('../constants');

module.exports = (sequelize) =>
  sequelize.define(
    'Role',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(20), allowNull: false, unique: true, validate: { isIn: [ROLES] } },
    },
    { tableName: 'roles', timestamps: false },
  );
