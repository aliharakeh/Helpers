const fs = require('fs')

fs.readdir(`${__dirname}\\db`, (err, files) => {
  if (err) throw err;
  let data = {}
  files.forEach(file => {
    console.log(`Reading [${file}]`)
    let jsonData = JSON.parse(fs.readFileSync(
      `${__dirname}\\db\\${file}`,
      {
        encoding: 'utf8',
        flag: 'r'
      }));
    data = {
      ...data,
      ...jsonData
    }
  });
  fs.writeFileSync(`${__dirname}\\db.json`, JSON.stringify(data))
  console.log("Mergin DB files [db.json]")
});
