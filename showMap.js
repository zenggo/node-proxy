var fs = require('fs');
console.log(JSON.parse(fs.readFileSync('./configs/map.json', 'utf8')));