"use strict"
var fs = require('fs');
var zlib = require('zlib');
var source_dir = '/source';
var buf_dir = '/buffer';

// 获取mime类型与对应的文件扩展名
var mimes = JSON.parse(fs.readFileSync('./configs/mimeTypes.json', 'utf8'));
var filemap = JSON.parse(fs.readFileSync('./configs/map.json', 'utf8') || '{}');

var page = process.argv[2];
var map = filemap[page];
var root_dir = './files/' + page.replace(/[\/,\\,\:,\*,\?,\",<,>,|,\.]/g, '_'); 
var buf_dir = root_dir + buf_dir; 
var _dir = root_dir + source_dir;

if (!fs.existsSync(root_dir)) {
	console.log('没有保存该页面。');
	process.exit();
}

// 创建source目录
if (!fs.existsSync(_dir)) {
	fs.mkdirSync(_dir);
}

for (let uri in map) {
	if (uri === 'resources') { continue; }
	// 资源的路径与文件名
	let rawUriStr = uri;
	let rawUri = uri.split('?');
	// 路径，querystring
	uri = rawUri[0];
	let queryString = rawUri.length > 1 ? rawUri[1] : '';

	let paths = uri.match(/\:\/\/.*/)[0].substr(3).split('/');
	let protocol = uri.match(/.*\:\/\//)[0];
	let filename = paths.pop();
	if (!filename) {
		// xxx.com/a/ 的情况
		filename = paths[paths.length - 1];
	}
	paths[0] = protocol + paths[0];
	// 资源mime类型
	let contentType = map[rawUriStr].headers['content-type'];
	let charset = '';
	if (contentType) {
		contentType = contentType.split(';');
		let type = contentType[0].toLowerCase();
		// todo
		charset = contentType[1] && contentType[1].toLowerCase().indexOf('charset') > -1 ? contentType[1].toLowerCase().split('=').pop() : '';
		let extname = mimes[type];
		// 属于mime列表中的类型
		if (extname && (filename.indexOf('.') < 0 || filename.split('.').pop() !== extname)) {
			// 加上文件扩展名
			filename += '.' + extname;
		}
	}
	
	let now_dir = _dir;
	paths.forEach((v, i) => {
		now_dir += '/' + v.replace(/[\/,\\,\:,\*,\?,\",<,>,|,\.]/g, '_');
		if (!fs.existsSync(now_dir)) {
			fs.mkdirSync(now_dir);
		}
	});
	
	// 请求同一个接口但querystring不同的情况
	if (queryString) {
		if (!fs.existsSync(now_dir + '/qsMap.txt')) {
			fs.writeFileSync(now_dir + '/qsMap.txt', rawUriStr + ' : ' + filename + '\n', 'utf8');
		} else {
			if (fs.existsSync(now_dir + '/' + filename)) {
				// 重名文件 打个标记
				filename += '-' + new Date().getTime().toString();
			}
			fs.appendFileSync(now_dir + '/qsMap.txt', rawUriStr + ' : ' + filename + '\n', 'utf8');
		}
	}

	let ws = charset ? fs.createWriteStream(now_dir + '/' + filename, charset) : fs.createWriteStream(now_dir + '/' + filename);
	let rs = fs.createReadStream(buf_dir + '/' + map[rawUriStr].filename);
	// gzip, compress, deflate, identity
	if (map[rawUriStr].headers['content-encoding'] && map[rawUriStr].headers['content-encoding'].toLowerCase() === 'gzip') {
		// gzip 解压
		let gunzipStream = zlib.createGunzip();
		rs.pipe(gunzipStream).pipe(ws);
	} else {
		rs.pipe(ws);
	}

}

