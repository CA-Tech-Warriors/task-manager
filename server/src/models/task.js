// Owner: A (card A-4)
const { DataTypes } = require('sequelize');
const { STATUSES, PRIORITIES, TITLE_MAX, DESCRIPTION_MAX } = require('../constants');

module.exports = (sequelize) =>
  sequelize.define(
    'Task',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING(TITLE_MAX),
        allowNull: false,
        validate: { len: { args: [1, TITLE_MAX], msg: `Title must be 1 to ${TITLE_MAX} characters.` } },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        validate: {
          len: { args: [0, DESCRIPTION_MAX], msg: `Description can be up to ${DESCRIPTION_MAX} characters.` },
        },
      },
      status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: STATUSES[0] },
      priority: { type: DataTypes.ENUM(...PRIORITIES), allowNull: false, defaultValue: 'medium' },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { tableName: 'tasks' },
  );
