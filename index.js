/**
 * Express Shell Exec
 * A lightweight module for executing shell commands in Express.js applications
 */

'use strict';

const ShellExec = require('./lib/shell-exec');
const middleware = require('./lib/middleware');

// Create a new instance with default options
const shellExec = new ShellExec();

// Export the main instance
module.exports = shellExec;

// Export the constructor for custom instances
module.exports.ShellExec = ShellExec;

// Export the middleware factory
module.exports.middleware = middleware;

// Export utility functions
module.exports.validators = require('./lib/validators');
module.exports.security = require('./lib/security');