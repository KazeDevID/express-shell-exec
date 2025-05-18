/**
 * Express.js middleware for shell command execution
 */

'use strict';

const debug = require('debug')('express-shell-exec:middleware');
const ShellExec = require('./shell-exec');
const { validateCommand } = require('./validators');
const { sanitizeCommand } = require('./security');

/**
 * Creates Express middleware for executing shell commands
 * @param {Object} options - Middleware options
 * @returns {Function} - Express middleware function
 */
function createMiddleware(options = {}) {
  debug('Creating middleware with options:', options);
  
  const shellExec = new ShellExec(options);
  const isAsync = options.async !== false;
  
  return function shellExecMiddleware(req, res, next) {
    // Add shell execution methods to the request object
    req.shellExec = {
      /**
       * Execute a command in the middleware chain
       * @param {String} command - Command to execute
       * @param {Object} cmdOptions - Command options
       * @returns {Promise|Object} - Result of the command execution
       */
      exec: function(command, cmdOptions = {}) {
        try {
          validateCommand(command);
          const sanitizedCommand = sanitizeCommand(command);
          
          debug(`Middleware executing ${isAsync ? 'async' : 'sync'} command:`, sanitizedCommand);
          
          if (isAsync) {
            return shellExec.exec(sanitizedCommand, {
              ...options,
              ...cmdOptions
            });
          } else {
            return shellExec.execSync(sanitizedCommand, {
              ...options,
              ...cmdOptions
            });
          }
        } catch (error) {
          debug('Middleware execution error:', error.message);
          next(error);
          return { success: false, error: error.message };
        }
      },
      
      /**
       * Spawn a command with streaming output in the middleware chain
       * @param {String} command - Command to execute
       * @param {Array} args - Command arguments
       * @param {Object} cmdOptions - Command options
       * @returns {Object} - Child process and promise
       */
      spawn: function(command, args = [], cmdOptions = {}) {
        try {
          validateCommand(command);
          
          debug('Middleware spawning command:', command, args);
          
          return shellExec.spawn(command, args, {
            ...options,
            ...cmdOptions
          });
        } catch (error) {
          debug('Middleware spawn error:', error.message);
          next(error);
          return { 
            childProcess: null, 
            resultPromise: Promise.reject(error) 
          };
        }
      }
    };
    
    next();
  };
}

module.exports = createMiddleware;