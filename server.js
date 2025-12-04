const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint to solve the cube
app.post('/solve', (req, res) => {
  const { cube } = req.body;

  if (!cube || cube.length !== 54) {
    return res.status(400).json({ error: 'Invalid cube state' });
  }

  // Spawn a child process to run the Python solver
  const pythonProcess = spawn('python3', [path.join(__dirname, 'js', 'solver.py'), cube]);

  let solution = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    solution += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: error || 'Python process failed' });
    }

    // Parse and return the solution
    res.json({ solution: solution.trim() });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
