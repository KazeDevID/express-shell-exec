/**
 * Core shell execution functionality
 */

'use strict';

const { exec, execSync, spawn } = require('child_process');
const { promisify } = require('util');
const debug = require('debug')('express-shell-exec');
const { validateCommand } = require('./validators');
const { sanitizeCommand } = require('./security');

const execPromise = promisify(exec);

/**
 * ShellExec class for executing shell commands
 */
class ShellExec {
  /**
   * Create a new ShellExec instance
   * @param {Object} options - Configuration options
   * @param {Number} options.timeout - Default timeout in milliseconds
   * @param {String} options.cwd - Default working directory
   * @param {Object} options.env - Default environment variables
   */
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 30000,
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env
    };
    
    debug('Initialized with options:', this.options);
  }

  /**
   * Execute a shell command synchronously
   * @param {String} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {Object} - Result object with stdout, stderr and exit code
   */
  execSync(command, options = {}) {
    validateCommand(command);
    const sanitizedCommand = sanitizeCommand(command);
    
    const execOptions = {
      timeout: options.timeout || this.options.timeout,
      cwd: options.cwd || this.options.cwd,
      env: { ...this.options.env, ...(options.env || {}) }
    };
    
    debug(`Executing sync command: ${sanitizedCommand}`);
    
    try {
      const stdout = execSync(sanitizedCommand, execOptions);
      return {
        stdout: stdout.toString(),
        stderr: '',
        code: 0,
        success: true
      };
    } catch (error) {
      debug(`Error executing sync command: ${error.message}`);
      return {
        stdout: error.stdout ? error.stdout.toString() : '',
        stderr: error.stderr ? error.stderr.toString() : error.message,
        code: error.status || 1,
        success: false,
        error
      };
    }
  }

  /**
   * Execute a shell command asynchronously
   * @param {String} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Promise resolving to result object with stdout, stderr and exit code
   */
  async exec(command, options = {}) {
    validateCommand(command);
    const sanitizedCommand = sanitizeCommand(command);
    
    const execOptions = {
      timeout: options.timeout || this.options.timeout,
      cwd: options.cwd || this.options.cwd,
      env: { ...this.options.env, ...(options.env || {}) }
    };
    
    debug(`Executing async command: ${sanitizedCommand}`);
    
    try {
      const { stdout, stderr } = await execPromise(sanitizedCommand, execOptions);
      return {
        stdout: stdout,
        stderr: stderr,
        code: 0,
        success: true
      };
    } catch (error) {
      debug(`Error executing async command: ${error.message}`);
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        code: error.code || 1,
        success: false,
        error
      };
    }
  }

  /**
   * Spawn a shell command with streaming output
   * @param {String} command - Command to execute
   * @param {Array} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Object} - Child process and promise
   */
  spawn(command, args = [], options = {}) {
    validateCommand(command);
    
    const spawnOptions = {
      timeout: options.timeout || this.options.timeout,
      cwd: options.cwd || this.options.cwd,
      env: { ...this.options.env, ...(options.env || {}) },
      shell: options.shell !== false,
      stdio: options.stdio || 'pipe'
    };
    
    debug(`Spawning command: ${command} with args:`, args);
    
    const childProcess = spawn(command, args, spawnOptions);
    let stdout = '';
    let stderr = '';
    
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        if (options.onStdout) {
          options.onStdout(chunk);
        }
      });
    }
    
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        if (options.onStderr) {
          options.onStderr(chunk);
        }
      });
    }
    
    const resultPromise = new Promise((resolve) => {
      childProcess.on('close', (code) => {
        const result = {
          stdout,
          stderr,
          code,
          success: code === 0
        };
        
        debug(`Command exited with code: ${code}`);
        resolve(result);
      });
    });
    
    return {
      childProcess,
      resultPromise
    };
  }

  /**
   * Set default options for all command executions
   * @param {Object} options - Options to set
   */
  setOptions(options) {
    this.options = {
      ...this.options,
      ...options
    };
    
    debug('Updated options:', this.options);
  }
}

module.exports = ShellExec;