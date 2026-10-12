const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const file = () => path.join(app.getPath('userData'), 'settings.json');

function load() {
  try { return JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { return {}; }
}
function save(patch) {
  fs.writeFileSync(file(), JSON.stringify({ ...load(), ...patch }));
}

module.exports = { load, save };
