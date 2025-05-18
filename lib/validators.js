/**
 * Validation utilities for commands and options
 */

'use strict';

const debug = require('debug')('express-shell-exec:validators');

/**
 * Validates that a command string is valid and safe to execute
 * @param {String} command - The command to validate
 * @throws {Error} - If the command is invalid
 */
function validateCommand(command) {
  if (!command) {
    const error = new Error('Command cannot be empty');
    debug('Validation error:', error.message);
    throw error;
  }
  
  if (typeof command !== 'string') {
    const error = new Error('Command must be a string');
    debug('Validation error:', error.message);
    throw error;
  }
  
  if (command.trim() === '') {
    const error = new Error('Command cannot be empty or whitespace');
    debug('Validation error:', error.message);
    throw error;
  }
  
  // Basic validation for suspicious commands
  const dangerousPatterns = [
    /rm\s+(-rf?|--recursive|--force)\s+[\/~]/i, // destructive rm commands
    /mkfs/i, // format commands
    /dd\s+if=.+\s+of=/i, // potentially destructive disk operations
    />(>?)\s*\/(dev|proc|sys)/i // redirecting to system files
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      const error = new Error('Potentially dangerous command detected');
      debug('Validation error:', error.message, { command });
      throw error;
    }
  }

  debug('Command validated successfully:', command);
}

/**
 * Validates timeout value
 * @param {Number} timeout - The timeout value to validate
 * @throws {Error} - If the timeout is invalid
 */
function validateTimeout(timeout) {
  if (timeout !== undefined && (!Number.isInteger(timeout) || timeout < 0)) {
    const error = new Error('Timeout must be a positive integer');
    debug('Validation error:', error.message);
    throw error;
  }
  
  debug('Timeout validated successfully:', timeout);
}

/**
 * Validates environment variables
 * @param {Object} env - The environment variables to validate
 * @throws {Error} - If the env object is invalid
 */
function validateEnv(env) {
  if (env !== undefined && (typeof env !== 'object' || env === null)) {
    const error = new Error('Environment variables must be an object');
    debug('Validation error:', error.message);
    throw error;
  }
  
  debug('Environment variables validated successfully');
}

module.exports = {
  validateCommand,
  validateTimeout,
  validateEnv
};