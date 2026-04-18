// Re-export from auth module — single source of truth for User schema
const User = require('./user.model');
module.exports = require('../auth/auth.model');
