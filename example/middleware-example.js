/**
 * Example of using express-shell-exec as middleware
 */

'use strict';

const express = require('express');
const shellExec = require('../index');

const app = express();
const port = 3002;

// Only allow specific commands in this application
const allowedCommands = shellExec.security.createCommandWhitelist([
  'echo',
  'date',
  'uptime',
  'free',
  /^df\s+-h/
]);

// Custom middleware that only allows specific commands
app.use((req, res, next) => {
  const originalExec = req.shellExec ? req.shellExec.exec : null;
  
  // Add the middleware after shellExec middleware
  if (originalExec) {
    req.shellExec.exec = function(command, options) {
      if (!allowedCommands(command)) {
        return {
          success: false,
          stderr: 'Command not allowed',
          code: 403
        };
      }
      
      return originalExec.call(req.shellExec, command, options);
    };
  }
  
  next();
});

// Add shellExec middleware
app.use(shellExec.middleware({
  timeout: 5000,
  async: true
}));

// Command execution endpoint
app.get('/run/:command', async (req, res) => {
  const command = req.params.command;
  const result = await req.shellExec.exec(command);
  
  if (result.success) {
    res.json({
      command,
      output: result.stdout,
      success: true
    });
  } else {
    res.status(result.code === 403 ? 403 : 500).json({
      command,
      error: result.stderr,
      success: false
    });
  }
});

// Get system status information
app.get('/system-status', async (req, res) => {
  try {
    const [dateResult, uptimeResult, memoryResult] = await Promise.all([
      req.shellExec.exec('date'),
      req.shellExec.exec('uptime'),
      req.shellExec.exec('free -h')
    ]);
    
    res.json({
      date: dateResult.stdout.trim(),
      uptime: uptimeResult.stdout.trim(),
      memory: memoryResult.stdout.trim(),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

app.listen(port, () => {
  console.log(`Middleware example server running at http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- /run/:command - Run a specific command');
  console.log('- /system-status - Get system status information');
});