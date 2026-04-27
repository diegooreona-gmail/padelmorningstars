const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { data: { fecha: '', hora: '', cerrada: false, inscritos: [] }, historico: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.get('/api', (req, res) => {
  res.json(readDB());
});

app.post('/api', (req, res) => {
  const db = readDB();
  const { data, historico } = req.body;
  
  if (data) db.data = data;
  if (historico) db.historico = historico;
  
  writeDB(db);
  res.json(db);
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});