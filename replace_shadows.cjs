const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // replace #1A1A1A in shadows
    content = content.replace(/shadow-\[([^\]]+)_#1A1A1A\]/g, 'shadow-[$1_var(--color-slate-900)]');
    // replace #1A1A1A for text
    content = content.replace(/text-\[#1A1A1A\]/g, 'text-slate-900');
    // replace #1A1A1A everywhere it's used as bg
    content = content.replace(/bg-\[#1A1A1A\]/g, 'bg-slate-900');
    
    // Also #475569 might be used in shadow
    content = content.replace(/shadow-\[([^\]]+)_#475569\]/g, 'shadow-[$1_var(--color-slate-600)]');

    fs.writeFileSync(filePath, content);
  }
});
