/**
 * Basic example of using express-shell-exec
 */

'use strict';

const express = require('express');
const shellExec = require('../index');

const app = express();
const port = 3000;

// Use middleware to add shellExec capabilities to requests
app.use(shellExec.middleware());

// Example route using synchronous execution
app.get('/system-info', (req, res) => {
  const result = req.shellExec.exec('uname -a');
  
  res.json({
    title: 'System Information',
    command: 'uname -a',
    result
  });
});

// Example route using asynchronous execution
app.get('/directory-listing', async (req, res) => {
  const path = req.query.path || '.';
  const sanitizedPath = path.replace(/[;&|$<>]/g, '');
  
  try {
    const result = await req.shellExec.exec(`ls -la ${sanitizedPath}`);
    
    res.json({
      title: 'Directory Listing',
      path: sanitizedPath,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to execute command',
      message: error.message
    });
  }
});

// Example route using spawn with streaming
app.get('/stream-output', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  
  const { childProcess, resultPromise } = req.shellExec.spawn('ping', ['-c', '5', '8.8.8.8'], {
    onStdout: (data) => {
      res.write(data);
    },
    onStderr: (data) => {
      res.write(`ERROR: ${data}`);
    }
  });
  
  resultPromise.then((result) => {
    res.write(`\nCommand exited with code: ${result.code}`);
    res.end();
  }).catch((error) => {
    res.write(`\nCommand failed: ${error.message}`);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Example server running at http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- /system-info - Get system information');
  console.log('- /directory-listing?path=<path> - List directory contents');
  console.log('- /stream-output - Stream ping command output');
});