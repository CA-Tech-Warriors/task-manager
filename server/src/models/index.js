// Loads every model and sets up relationships. Owner: A (card A-5).
// Shared file: other people import from here but shouldn't need to edit it.
const { sequelize, state } = require('../db');

const Role = require('./role')(sequelize);
const User = require('./user')(sequelize);
const Task = require('./task')(sequelize);

Role.hasMany(User, { foreignKey: { name: 'roleId', allowNull: false } });
User.belongsTo(Role, { foreignKey: { name: 'roleId', allowNull: false } });

// Deleting a user deletes their tasks.
User.hasMany(Task, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

module.exports = { sequelize, state, Role, User, Task };
