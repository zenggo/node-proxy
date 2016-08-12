var http = require('http');
var url = require('url');
var request = require('request');

var server = http.createServer(function (req, res) {
	var _header = req.headers,
		_url = url.parse(req.url),
		_method = req.method;
	var opt = {
		protocol: 'http:',
		host: _url.host,
		method: _method,
		path: _url.path,
		// url: _url,
		headers: _header
	};

	var req = http.request(opt, (response) => {
	  // response.setEncoding('utf8');
	  let chunks = [], size = 0;
	  let hd = response.headers;
	  response.on('data', (chunk) => {
		  chunks.push(chunk);
		  size += chunk.length;
	  });
	  response.on('end', () => {
	  	// console.log(bf.toString('utf8'));
	  	res.writeHead(response.statusCode, hd);
	  	let data = bufferConcat(chunks, size);
	    res.write(data);
	    res.end();
	  });
	});

	req.on('error', (e) => {
	  console.log(`problem with request: ${e.message}`);
	});
	req.end();
	// res.end();
	// request(opt).pipe(res);
});

function bufferConcat (chunks, size) {
	let data = null;
	switch (chunks.length) {
		case 0:
			data = new Buffer(0);
			break;
		case 1:
			data = chunks[0];
			break;
		default: 
			data = new Buffer(size);
			for (let i = 0, pos = 0; i < chunks.length; i++) {
				let chunk = chunks[i];
				chunk.copy(data, pos);
				pos += chunk.length;
			}
			break;
	}
	return data;
}

server.listen(10000);