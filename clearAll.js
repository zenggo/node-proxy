var fs = require('fs');
var exec = require('child_process').exec, child;

child = exec('rm -rf files',function(err,out) { 

  console.log(out); err && console.log(err); 

});
fs.writeFileSync('./configs/map.json', '');