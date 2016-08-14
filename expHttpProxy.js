"use strict"
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var url = require('url');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get(/.*/, (req, res) => {
	request({
		method: req.method,
		url: url.parse(req.url),
		headers: req.headers
	})
	.pipe(res);
});

app.post(/.*/, (req, res) => {
	// console.log(req.body);
	request.post({
		method: req.method,
		url: url.parse(req.url),
		headers: req.headers
	})
	.form(req.body)
	.pipe(res);
});

app.listen(10000);