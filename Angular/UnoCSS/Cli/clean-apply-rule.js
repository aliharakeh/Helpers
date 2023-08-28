const fs = require('node:fs');
const path = require('node:path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    }
    else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

const scssFiles = getAllFiles('src').filter(file => file.endsWith('.scss'));

scssFiles.forEach(file => {
  console.log('Cleaning', file);
  let content = fs.readFileSync(file, 'utf8');
  const contentWithoutApplyRule = content.replace(/@apply\s[\s\S]*?;/g, '');
  const cleanedEmptyClasses = contentWithoutApplyRule.replace(/\.[-_a-zA-Z0-9]+\s*\{\s*\}/g, '');
  fs.writeFileSync(file, cleanedEmptyClasses, 'utf8');
});
