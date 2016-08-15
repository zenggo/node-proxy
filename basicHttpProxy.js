// 基本http代理
"use strict"
var http = require('http');
var url = require('url');
var request = require('request');
var fs = require('fs');

var server = http.createServer((req, res) => {
	// 获取本次请求信息
	var options = {
		protocol: 'http:',
		host: req.headers.host,
		method: req.method,
		path: url.parse(req.url).path,
		headers: req.headers
	};
	// req, p_res 都是IncomingMessage实例，前者是sever接收请求，后者是node作为客户端发起请求接收的响应，后者才具有statusCode属性
	// IncomingMessage是stream.Readable的实例
	// res是ServerResPonse的实例，继承自stram.Writable
	// stream类实例可以使用pipe方法来简化代码
	var p_req = http.request(options, (p_res) => {
		console.log(options.method + ' ' + p_res.statusCode + ' : ' + options.host + options.path);
		// 发起对目的url的请求
		res.writeHead(p_res.statusCode, p_res.headers);
		//chunk 是Buffer实例
		// p_res.on('data', (chunk) => {
		// 	res.write(chunk);
		// });
		// p_res.on('end', () => {
		// 	res.end();
		// });
		p_res.pipe(res);
	});

	p_req.on('error', (err) => {
		console.log(err);
		res.end('proxy wrong!');
	});
	// 发送请求体
	// req.on('data', (chunk) => {
	// 	p_req.write(chunk);
	// });
	// req.on('end', () => {
	// 	// 结束请求
	// 	p_req.end();		
	// });
	req.pipe(p_req);

	// request({
	// 	method: req.method,
	// 	url: url.parse(req.url),
	// 	headers: req.headers
	// }).pipe(res);

});

server.listen(10000);
