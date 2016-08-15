// http代理 + 本地保存
"use strict"
var http = require('http');
var url = require('url');
var fs = require('fs');
var needlist = require('./configs/list');

var filemap = JSON.parse(fs.readFileSync('./configs/map.json', 'utf8') || '{}');
// 存储 二进制文件（响应体） 的文件夹
var buf_dir = '/buffer';

if (!fs.existsSync('./files')) {
	fs.mkdirSync('./files');
}

var server = http.createServer((req, res) => {
	// 获取本次请求的 源地址
	var _url = url.parse(req.url);
	var _referer;

	if (req.headers.referer) {
		// 加载的是页面资源
		_referer = req.headers.referer;
	} else {
		// 加载的是页面
		_referer = _url.protocol + '//' + _url.host + _url.path;
	}

	// 判断源地址是否在抓取列表中
	let inNeed = false;
	if (needlist[_referer]) {
		inNeed = true;
	} else {
		// 判断源地址是否在抓取页面的所有资源数组中
		for (let k in filemap) {
			if (filemap[k].resources.indexOf(_referer)) {
				inNeed = true;
				_referer = k;
				break;
			}
		}	
	}
	
	if (inNeed) {
		// 本次请求资源的 地址
		// 把 queryString 从 url.path 里去掉，之后再访问时只以path为唯一标识，不带queryString
		let rawUri = _url.path.split('?');
		let _uri = _url.protocol + '//' + _url.host + rawUri[0];
		// referer页面的文件目录
		let _dir = './files/' + _referer.replace(/[\/,\\,\:,\*,\?,\",<,>,|,\.]/g, '_');
		// console.log(_uri);
		if (!filemap[_referer]) {
			// 首次访问
			filemap[_referer] = Object.create(null);
			filemap[_referer].resources = [];
			// 创建该页面的文件目录
			if (!fs.existsSync(_dir)) {
				fs.mkdirSync(_dir);
				fs.mkdirSync(_dir + buf_dir);
			}
		}

		let _map = filemap[_referer];
		// 查找map中该资源
		if (_map[_uri]) {
			console.log('from cache: ' + _uri);
			// 存在本地文件 之间返回当初保存的头与内容
			res.writeHead(200, _map[_uri].headers);
			fs.createReadStream(_dir + buf_dir + '/' + _map[_uri].filename).pipe(res);
		} else {
			// 保存该资源至该抓取页面的所需资源数组
			_map.resources.push(_uri);
			_map[_uri] = Object.create(null);
			// 对应保存的本地文件名
			let newFilePath = _uri.replace(/[\/,\\,\:,\*,\?,\",<,>,|,\.]/g, '_');
			_map[_uri].filename = newFilePath;
			// 保存queryString
			if (rawUri[1]) {
				_map[_uri].qs = rawUri[1];	
			}
			// 禁用缓存 向目的地址请求资源
			req.headers['cache-control'] = 'no-cache';
			let options = {
				protocol: 'http:',
				host: _url.host,
				method: req.method,
				path: _url.path, // 初次请求该资源时用原始path，带有queryString
				headers: req.headers,
			};
			let p_req = http.request(options, (p_res) => {
				console.log(options.method + ' ' + p_res.statusCode + ' and cached : ' + options.host + options.path);
				// 先向浏览器返回响应的资源
				res.writeHead(p_res.statusCode, p_res.headers);
				p_res.pipe(res);
				// 保存响应头
				_map[_uri].headers = p_res.headers;
				// 保存到本地文件
				p_res.pipe(fs.createWriteStream(_dir + buf_dir + '/' + newFilePath));
			});
			p_req.on('error', (err) => {
				console.log(err);
				res.end('proxy wrong!');
			});
			// 发送请求
			req.pipe(p_req);
		}
	} else {
		// 不在本地页面列表 正常请求响应
		let options = {
			protocol: 'http:',
			host: _url.host,
			method: req.method,
			path: _url.path,
			headers: req.headers
		};
		let p_req = http.request(options, (p_res) => {
			res.writeHead(p_res.statusCode, p_res.headers);
			console.log(options.method + ' ' + p_res.statusCode + ' : ' + options.host + options.path);
			p_res.pipe(res);
		});
		p_req.on('error', (err) => {
			console.log(err);
			res.end('proxy wrong!');
		});
		req.pipe(p_req);
	}

});

process.on('SIGINT', () => {
	console.log('goodbye! 配置已更新.');
	fs.writeFileSync('./configs/map.json', JSON.stringify(filemap), 'utf8');
	process.exit();
});

server.listen(10000);