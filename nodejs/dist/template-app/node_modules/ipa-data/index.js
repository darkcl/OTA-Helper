var Decompress = require('decompress');
var plist = require('simple-plist');
var fs = require('fs');

module.exports = function(filePath, cb){
  new Decompress({mode: '755'})
    .src(filePath)
    .use(Decompress.zip({strip: 2}))
    .run(function(err, files){
      if(err){
        return cb(err, null);
      }
      for(i in files){
        if(files[i].basename == 'Info.plist'){
          var timestamp = process.hrtime()
          fs.writeFile(__dirname + '/temp-'+timestamp+'.plist', files[i].contents, function(err) {
              if(err) {
                  return cb(err, null);
              }
              var data = {
                ipa: fs.statSync(filePath),
                plist: plist.readFileSync(__dirname + '/temp-'+timestamp+'.plist')
              }
              cb(null, data);
              fs.unlinkSync(__dirname + '/temp-'+timestamp+'.plist');
          });
        }
      }
    });
}
