// Xcode build
var childProcess = require('child_process');
var Q = require('q');
var fs = require('fs');
var moment = require('moment');

// xcodebuild -configuration Release -scheme "$appname" -destination generic/platform=iOS  -workspace "$workspace" clean archive -archivePath "$build_location/App-$NOW"
// xcodebuild -configuration Release -exportArchive -exportFormat ipa -archivePath "$build_location/App-$NOW.xcarchive" -exportPath "$build_location/$ipaname-$NOW.ipa" -exportProvisioningProfile "$provision"
var _this = this;

exports.escapeShellArg = function (cmd) {
    return '\'' + cmd.replace(/\'/g, "'\\''") + '\'';
};

exports.exportPlist = function(ipaName, ipaPath, downloadUrl, schema) {
	var deferred = Q.defer();
	console.log('Export plist for path: ' + ipaPath);
	console.log('Export plist for downloadUrl ' + downloadUrl);
	// NSArray *arg = @[@"plist",
 //                             [NSString stringWithFormat:@"%@-%@.ipa",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString],
 //                             [NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.ipa",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]],
 //                             [NSString stringWithFormat:@"%@-%@.plist",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString],
 //                             projectName];
 	var path = _this.escapeShellArg(__dirname + '/sh/otabuddy.sh');
 	var arg = ['plist',
		ipaName + '.ipa',
		downloadUrl,
		ipaName + '.plist',
		schema
		];
	var process = childProcess.exec(
		path + ' plist ' + ipaName + '.ipa ' + downloadUrl + ' ' + ipaName + '.plist ' + _this.escapeShellArg(schema),
		{ cwd: ipaPath}
		)
	process.stdout.on('close', function (data) {
		if(fs.existsSync(ipaPath + '/' + ipaName + '.plist')){
			deferred.resolve('Export Plist Success');
		}else{
			deferred.reject("Export Plist Failed");
		}
	}); 

	process.stdout.on('data', function (data) {
		deferred.notify(String(data));
    });

    process.stderr.on('data', function (data) {
    	deferred.notify(String(data));
    });

	return deferred.promise;
};

exports.exportIpa = function (outputPath, config, schema, provision, dateStr, projectName) {
	var deferred = Q.defer();
	var nowStr = dateStr;
	console.log('Build IPA' + outputPath + '/App-' + nowStr);

	var process = childProcess.spawn(
		'xcodebuild', 
		['-configuration', config,
		'-exportArchive', 
		'-exportFormat', 'ipa',
		'-archivePath', (outputPath + '/App-' + nowStr + '.xcarchive'),
		'-exportPath', (outputPath + '/' + projectName + '-' + nowStr + '.ipa'),
		'-exportProvisioningProfile', provision
		]);
	process.stdout.on('close', function (data) {
		if(fs.existsSync(outputPath + '/' + projectName + '-' + nowStr + '.ipa')){
			deferred.resolve(projectName + '-' + nowStr);
		}else{
			deferred.reject("Archieve Failed");
		}
	}); 
	process.stdout.on('data', function (data) {
    	// console.log(String(data));
		// console.log(String(data));
		deferred.notify(String(data));
        // result += String(data);
    });
    process.stderr.on('data', function (data) {
    	// console.log('Error: ' + String(data));
    	deferred.notify(String(data));
    	// deferred.reject("Archieve Failed");
        // deferred.reject(String(data));
    });

    return deferred.promise;
}

exports.buildArchieve = function(outputPath, workspace, config, schema, provision, projectName, downloadUrl) {
	
	var deferred = Q.defer();
	var now = new Date();
	var nowStr = moment(now).format("YYYYMMDDhhmmss");

	console.log(outputPath + '/App-' + nowStr);
	var process = childProcess.spawn(
		'xcodebuild', 
		['-configuration', config,
		'-scheme', schema,
		'-destination', 'generic/platform=iOS',
		'clean', 
		'archive',
		'-workspace', workspace,
		'-archivePath', (outputPath + '/App-' + nowStr)]);

	process.stdout.on('close', function (data) {
		if(fs.existsSync(outputPath + '/App-' + nowStr + '.xcarchive')){
			_this.exportIpa(outputPath, config, projectName, provision, nowStr, projectName)
			.then(function(response){
				_this.exportPlist(response, outputPath, downloadUrl, schema)
				.then(function(re){
					deferred.resolve(re);
				})
				.progress(function(log){
					deferred.notify(log);
				})
				.fail(function(err){
					deferred.reject(err);
				})
			})
			.progress(function(log){
				deferred.notify(log);
			})
			.fail(function(err){
				deferred.reject(err);
			})
		}else{
			deferred.reject("Archieve Failed");
		}
	}); 
	process.stdout.on('data', function (data) {
    	// console.log(String(data));
		// console.log(String(data));
		deferred.notify(String(data));
        // result += String(data);
    });
    process.stderr.on('data', function (data) {
    	// console.log(String(data));
    	deferred.notify(String(data));
        // deferred.reject(String(data));
    });
	return deferred.promise;
}

exports.listConfig = function (dirname) {
    var deferred = Q.defer();
    console.log(dirname);
    var process = childProcess.spawn('xcodebuild', ['-list'], {cwd: dirname});

    var result = '';

    var targets = [];
    var configs = [];
    var schema = [];

    //state
    var targetStartLine = 0;
    var configStartLine = 0;
    var schemaStartLine = 0;

    process.stdout.on('close', function (data) {
    	var arr = result.split('\n');
    	console.log(arr);

    	for (var i = 0; i < arr.length; i++) {
    		var output = arr[i];
    		if (output.indexOf('Targets:') != -1) {
    			targetStartLine = i;
    		}

    		if (output.indexOf('Build Configurations:') != -1) {
    			configStartLine = i;
    		}

    		if (output.indexOf('Schemes:') != -1) {
    			schemaStartLine = i;
    		}
    	}
    	for (var i = targetStartLine+1; i < arr.length; i++) {
    		var output = arr[i];
    		if (output == '') {
    			break;
    		}else{
    			targets.push(output.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    		}
    	};

    	for (var i = configStartLine+1; i < arr.length; i++) {
    		var output = arr[i];
    		if (output == '') {
    			break;
    		}else{
    			configs.push(output.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    		}
    	};

		for (var i = schemaStartLine+1; i < arr.length; i++) {
    		var output = arr[i];
    		if (output == '') {
    			break;
    		}else{
    			schema.push(output.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    		}
    	};

        if ( result ) {
            deferred.resolve(
            	{
            		'targets': targets,
            		'configs': configs,
            		'schema': schema,
        		}
    		);
        }
        else {
            deferred.reject("could not extract info");
        }
    });

    process.stdout.on('data', function (data) {
    	// console.log(String(data));

        result += String(data);
    });

    process.stderr.on('data', function (data) {
    	// console.log(String(data));
        // deferred.reject(String(data));
    });

    return deferred.promise;
};