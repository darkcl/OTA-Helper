var childProcess = require('child_process');
var plist = require('plist');
var Q = require('q');

/**
 * load plist profile from a mobile provisioning file
 * @param {String} filename
 * @return {Promise}
 */
exports.loadProfile = function (filename) {
    var deferred = Q.defer();
    var process = childProcess.spawn('security', ['cms', '-D', '-i', filename]);

    var profile = '';
    process.stdout.on('close', function (data) {
        if ( profile ) {
            var result = plist.parse(profile);
            deferred.resolve(result);
        }
        else {
            deferred.reject("could not extract profile");
        }
    });

    process.stdout.on('data', function (data) {
        profile += String(data);
    });

    process.stderr.on('data', function (data) {
        deferred.reject(String(data));
    });

    return deferred.promise;
};