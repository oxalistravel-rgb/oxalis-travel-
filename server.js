const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Mock API endpoints
app.get('/api/programmes', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data/programmes.json', 'utf8'));
  res.json(data);
});

app.post('/api/programmes', (req, res) => {
  if (req.headers['x-admin-password'] !== 'oxalis2024') return res.status(401).send();
  const data = JSON.parse(fs.readFileSync('data/programmes.json', 'utf8'));
  const newProg = { id: Date.now().toString(), ...req.body };
  data.push(newProg);
  fs.writeFileSync('data/programmes.json', JSON.stringify(data, null, 2));
  res.json(newProg);
});

app.put('/api/programmes/:id', (req, res) => {
  if (req.headers['x-admin-password'] !== 'oxalis2024') return res.status(401).send();
  const data = JSON.parse(fs.readFileSync('data/programmes.json', 'utf8'));
  const idx = data.findIndex(p => p.id === req.params.id || p.id === parseInt(req.params.id));
  if (idx > -1) {
    data[idx] = { ...data[idx], ...req.body };
    fs.writeFileSync('data/programmes.json', JSON.stringify(data, null, 2));
    res.json(data[idx]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/programmes/:id', (req, res) => {
  if (req.headers['x-admin-password'] !== 'oxalis2024') return res.status(401).send();
  let data = JSON.parse(fs.readFileSync('data/programmes.json', 'utf8'));
  data = data.filter(p => p.id !== req.params.id && p.id !== parseInt(req.params.id));
  fs.writeFileSync('data/programmes.json', JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.use(express.static(__dirname));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3001, () => console.log('Server running on 3001'));
