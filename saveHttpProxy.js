// 基本http代理

var http = require('http');
var url = require('url');
// var request = require('request');
var fs = require('fs');

var server = http.createServer((req, res) => {
	var options = {
		protocol: 'http:',
		host: req.headers.host,
		method: req.method,
		path: url.parse(req.url).path,
		headers: req.headers
	};

	if (options.method.toLowerCase() === 'post') {
		console.log(options.headers);
	}
	
	// var filename = './file/' + new Date().getTime().toString();
	// var ws = fs.createWriteStream(filename);
	// ws.on('error', (err) => {
	// 	console.log(err);
	// });

	var p_req = http.request(options, (p_res) => {
		res.writeHead(p_res.statusCode, p_res.headers);
	
		if (options.method.toLowerCase() === 'post') {
			console.log(p_res.statusCode, p_res.headers);
		}

		p_res.on('data', (chunk) => {
			res.write(chunk);
			// ws.write(chunk);
		});
		p_res.on('end', () => {
			res.end();
			// ws.end();
		});

	});

	p_req.on('error', (err) => {
		console.log(err);
		res.end('proxy wrong!');
	});

	p_req.end();

});

server.listen(10000);