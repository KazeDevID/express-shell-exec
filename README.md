# Express Shell Exec

A lightweight module for executing shell commands in Express.js applications.

## Features

- **Synchronous and asynchronous shell command execution**
- **Express.js middleware integration**
- **Command validation and sanitization**
- **Timeout and cancellation support**
- **Stdout/stderr output capturing**
- **Detailed error handling**
- **Environment variable management**
- **Working directory configuration**

## Installation

```bash
npm install express-shell-exec
```

## Quick Start

```javascript
const express = require('express');
const shellExec = require('express-shell-exec');

const app = express();

// Use as middleware
app.use(shellExec.middleware());

app.get('/system-info', async (req, res) => {
  const result = await req.shellExec.exec('uname -a');
  res.json(result);
});

app.listen(3000);
```

## Core API

### Direct Usage

```javascript
const shellExec = require('express-shell-exec');

// Synchronous execution
const syncResult = shellExec.execSync('echo "Hello World"');
console.log(syncResult.stdout); // "Hello World"

// Asynchronous execution
shellExec.exec('ls -la')
  .then(result => {
    console.log(result.stdout); // Directory listing
  });

// Using async/await
async function runCommand() {
  const result = await shellExec.exec('npm list');
  console.log(result);
}
```

### Middleware Usage

```javascript
const express = require('express');
const shellExec = require('express-shell-exec');

const app = express();

// Add shell execution capabilities to all requests
app.use(shellExec.middleware({
  timeout: 10000,
  cwd: '/home/user/app'
}));

app.get('/run-command', async (req, res) => {
  const { command } = req.query;
  const result = await req.shellExec.exec(command);
  res.json(result);
});
```

### Spawn with Output Streaming

```javascript
const { childProcess, resultPromise } = shellExec.spawn('npm', ['install'], {
  onStdout: (data) => console.log(data),
  onStderr: (data) => console.error(data)
});

resultPromise.then(result => {
  console.log(`Command completed with code: ${result.code}`);
});
```

## Security

### Command Validation

The module includes built-in command validation to help prevent command injection attacks.

```javascript
const { validators } = require('express-shell-exec');

try {
  validators.validateCommand('rm -rf /'); // Will throw an error
} catch (error) {
  console.error(error.message); // "Potentially dangerous command detected"
}
```

### Command Whitelisting

Create a whitelist of allowed commands to restrict which commands can be executed.

```javascript
const { security } = require('express-shell-exec');

const allowedCommands = security.createCommandWhitelist([
  'echo',
  'ls',
  /^git\s+(status|log)/  // Regex for specific git commands
]);

// Use in middleware
app.use((req, res, next) => {
  const command = req.query.command;
  
  if (!allowedCommands(command)) {
    return res.status(403).json({ error: 'Command not allowed' });
  }
  
  next();
});
```

### Security Best Practices

1. **Never execute user-provided commands without validation**
2. **Use a whitelist of allowed commands when possible**
3. **Run with least privilege (avoid commands requiring root/admin)**
4. **Set appropriate timeouts to prevent long-running commands**
5. **Sanitize all command inputs, especially if they contain user data**
6. **Consider using containment strategies (Docker, chroot) for extra security**

## Configuration Options

### ShellExec Constructor Options

```javascript
const shellExec = new ShellExec({
  timeout: 30000,       // Max execution time (ms)
  cwd: '/path/to/dir',  // Working directory
  env: {                // Environment variables
    NODE_ENV: 'production',
    CUSTOM_VAR: 'value'
  }
});
```

### Command Execution Options

```javascript
const result = await shellExec.exec('command', {
  timeout: 5000,       // Command-specific timeout
  cwd: '/other/path',  // Command-specific working directory
  env: {               // Additional environment variables
    DEBUG: 'true'
  }
});
```

### Middleware Options

```javascript
app.use(shellExec.middleware({
  timeout: 10000,
  cwd: process.cwd(),
  async: true,         // Use async execution (default: true)
  env: process.env
}));
```

## Examples

See the `examples/` directory for complete examples:

- `basic-usage.js` - Simple Express.js integration
- `async-example.js` - Asynchronous command execution
- `middleware-example.js` - Advanced middleware usage

## Error Handling

```javascript
try {
  const result = await shellExec.exec('invalid-command');
  
  if (!result.success) {
    console.error(`Command failed with code ${result.code}`);
    console.error(result.stderr);
  }
} catch (error) {
  console.error('Execution error:', error.message);
}
```

## License

MIT