const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DB_PATH = path.join(__dirname, 'shared_items_db.json');
let items = [];

function load(){
  try{
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    items = JSON.parse(raw);
  }catch(e){
    console.warn('DB load fail, starting empty', e);
    items = [];
  }
}

function save(){
  fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf8');
}

load();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET all
app.get('/items', (req, res) => {
  res.json(items);
});

// POST add (expects { name, unit, perDay })
app.post('/items', (req, res) => {
  const it = req.body;
  if(!it || !it.name) return res.status(400).json({ error: 'name required' });
  // simple duplicate check by name
  const idx = items.findIndex(x=> (x.name||'').toLowerCase() === (it.name||'').toLowerCase());
  if(idx>=0) return res.status(409).json({ error: 'duplicate' });
  items.push(it);
  save();
  res.status(201).json(it);
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Shared-items sample server listening on ${port}`));
