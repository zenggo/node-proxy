var fs = require('fs');

var rs = fs.createReadStream('./file/aaa.txt', {
	encoding: 'utf8'
});

var ws = fs.createWriteStream('./file/bbb.txt', {
	encoding: 'utf8'
});

rs.on('data', (chunk) => {
	ws.write(chunk);
});

rs.on('end', () => {
	ws.end();
	console.log('ok!');
});

rs.on('close', () => {
	console.log('closed!');
});

ws.on('finish', () => {
	console.log('ws closed!');
});