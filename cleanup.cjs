const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');
const lines = content.split('\n');
const startLine0 = 170; // 0-indexed index for line 171
const deleteCount = 11; // lines 171 to 181
lines.splice(startLine0, deleteCount);
fs.writeFileSync('server.ts', lines.join('\n'));
