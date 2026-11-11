const fs = require("node:fs");
const path = require("node:path");
const file = path.join(__dirname, "../../data/state.json");
function read() {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return { warnings: {}, roster: [], autoRoleId: null }; }
}
function write(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
module.exports = { read, write };
