# node-proxy
用node搭建http/https代理

http代理+保存：
如要保存网页A，其url为urlA （http://xxx）
```
// configs/list.js
list[urlA] = true;
```

启动：
```node saveHttpProxy.js```

windows修改右下角网络连接，代理服务器设为127.0.0.1

注意事项：
首次访问A，请直接在地址栏输入urlA访问，不能从其他页面跳转；
开着服务时最好不要从该页面上点超链接，否则跳转过去的页面资源也会被保存下来

关闭：console输入任意字符回车后（保存当前配置），关闭

还原文件：
```node getOrigin.js  urlA```
参数为页面url
之后会在该页面目录生成source文件夹
