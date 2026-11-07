// The API contract values (team card T-1). The frontend uses the same values
// in client/src/config.js. Change both together.
const STATUSES = ['todo', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];
const ROLES = ['admin', 'user'];

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;

module.exports = { STATUSES, PRIORITIES, ROLES, TITLE_MAX, DESCRIPTION_MAX };
