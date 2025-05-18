/**
 * Example of async shell execution with express-shell-exec
 */

'use strict';

const express = require('express');
const shellExec = require('../index');

const app = express();
const port = 3001;

// Create a custom shell executor with specific options
const customExec = new shellExec.ShellExec({
  timeout: 10000,
  env: {
    ...process.env,
    CUSTOM_VAR: 'custom-value'
  }
});

// Simple API for executing commands asynchronously
app.get('/api/exec', express.json(), async (req, res) => {
  const command = req.query.command || 'echo "No command provided"';
  
  try {
    const result = await customExec.exec(command);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute multiple commands in parallel
app.get('/api/parallel', async (req, res) => {
  try {
    const commands = [
      'echo "First command"',
      'echo "Second command"',
      'echo "Third command"'
    ];
    
    const results = await Promise.all(
      commands.map(cmd => customExec.exec(cmd))
    );
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute commands with timeout
app.get('/api/timeout', async (req, res) => {
  try {
    // This should timeout after 2 seconds
    const result = await customExec.exec('sleep 5 && echo "Done"', {
      timeout: 2000
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Async example server running at http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- /api/exec?command=<command> - Execute a command');
  console.log('- /api/parallel - Execute multiple commands in parallel');
  console.log('- /api/timeout - Test command timeout');
});