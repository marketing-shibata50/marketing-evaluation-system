const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = new sqlite3.Database('./database/evaluations.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// API Routes

// Get all employees
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get employee by ID
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json(row);
    }
  });
});

// Create new employee
app.post('/api/employees', (req, res) => {
  const { name, department, position } = req.body;
  db.run(
    'INSERT INTO employees (name, department, position) VALUES (?, ?, ?)',
    [name, department, position],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, department, position });
      }
    }
  );
});

// Get evaluations for an employee
app.get('/api/evaluations/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const { pattern } = req.query;
  
  let query = 'SELECT * FROM evaluations WHERE employee_id = ?';
  const params = [employeeId];
  
  if (pattern) {
    query += ' AND pattern_type = ?';
    params.push(pattern);
  }
  
  query += ' ORDER BY evaluation_date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Save evaluation
app.post('/api/evaluations', (req, res) => {
  const { employee_id, pattern_type, evaluation_data, period_start, period_end } = req.body;
  
  db.run(
    `INSERT INTO evaluations (employee_id, pattern_type, evaluation_data, period_start, period_end, evaluation_date)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [employee_id, pattern_type, JSON.stringify(evaluation_data), period_start, period_end],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: 'Evaluation saved successfully' });
      }
    }
  );
});

// Update evaluation
app.put('/api/evaluations/:id', (req, res) => {
  const { id } = req.params;
  const { evaluation_data } = req.body;
  
  db.run(
    'UPDATE evaluations SET evaluation_data = ?, evaluation_date = datetime("now") WHERE id = ?',
    [JSON.stringify(evaluation_data), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Evaluation not found' });
      } else {
        res.json({ message: 'Evaluation updated successfully' });
      }
    }
  );
});

// Get evaluation patterns configuration
app.get('/api/patterns', (req, res) => {
  db.all('SELECT * FROM evaluation_patterns ORDER BY pattern_number', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Update evaluation pattern configuration
app.put('/api/patterns/:id', (req, res) => {
  const { id } = req.params;
  const { pattern_config } = req.body;
  
  db.run(
    'UPDATE evaluation_patterns SET pattern_config = ?, updated_at = datetime("now") WHERE id = ?',
    [JSON.stringify(pattern_config), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Pattern not found' });
      } else {
        res.json({ message: 'Pattern configuration updated successfully' });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});