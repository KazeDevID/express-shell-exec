/**
 * Security utilities for safe command execution
 */

'use strict';

const debug = require('debug')('express-shell-exec:security');

/**
 * Sanitizes a command to prevent command injection
 * @param {String} command - The command to sanitize
 * @returns {String} - The sanitized command
 */
function sanitizeCommand(command) {
  // Handle basic command injection patterns
  let sanitized = command
    .replace(/;([\s]*$)/g, '') // Remove trailing semicolons
    .replace(/\|\|/g, '\\|\\|') // Escape logical OR
    .replace(/&&/g, '\\&\\&'); // Escape logical AND
  
  debug('Sanitized command:', sanitized);
  return sanitized;
}

/**
 * Creates a whitelist of allowed commands
 * @param {Array} allowedCommands - Array of allowed command patterns (strings or RegExp)
 * @returns {Function} - Function that checks if a command is allowed
 */
function createCommandWhitelist(allowedCommands = []) {
  debug('Creating command whitelist with patterns:', allowedCommands);
  
  return function isCommandAllowed(command) {
    if (!command || typeof command !== 'string') {
      return false;
    }
    
    for (const allowed of allowedCommands) {
      if (typeof allowed === 'string' && command.startsWith(allowed)) {
        debug(`Command '${command}' matches whitelist pattern '${allowed}'`);
        return true;
      } else if (allowed instanceof RegExp && allowed.test(command)) {
        debug(`Command '${command}' matches whitelist regex pattern`);
        return true;
      }
    }
    
    debug(`Command '${command}' does not match any whitelist pattern`);
    return false;
  };
}

/**
 * Sanitizes environment variables to prevent injection
 * @param {Object} env - Environment variables object
 * @returns {Object} - Sanitized environment variables
 */
function sanitizeEnv(env) {
  if (!env || typeof env !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(env)) {
    // Skip if key or value is not a string
    if (typeof key !== 'string' || typeof value !== 'string') {
      continue;
    }
    
    // Basic sanitization of environment variable values
    sanitized[key] = value
      .replace(/`/g, '\\`') // Escape backticks
      .replace(/\$/g, '\\$'); // Escape dollar signs
  }
  
  debug('Sanitized environment variables');
  return sanitized;
}

module.exports = {
  sanitizeCommand,
  createCommandWhitelist,
  sanitizeEnv
};