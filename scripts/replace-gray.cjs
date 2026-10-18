const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(findFiles(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  });
  return files;
}

findFiles('src').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('text-gray-400')) {
    content = content.replace(/text-gray-400/g, 'text-gray-500');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
