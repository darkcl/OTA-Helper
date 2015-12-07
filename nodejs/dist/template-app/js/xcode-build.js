// Xcode build
var childProcess = require('child_process');
var Q = require('q');
var fs = require('fs');
var moment = require('moment');

// xcodebuild -configuration Release -scheme "$appname" -destination generic/platform=iOS  -workspace "$workspace" clean archive -archivePath "$build_location/App-$NOW"
// xcodebuild -configuration Release -exportArchive -exportFormat ipa -archivePath "$build_location/App-$NOW.xcarchive" -exportPath "$build_location/$ipaname-$NOW.ipa" -exportProvisioningProfile "$provision"

exports.buildIpa = function(outputPath, config, schema, provision, dateStr) {
	var deferred = Q.defer();
	console.log(outputPath + '/App-' + nowStr);

	var process = childProcess.spawn(
		'xcodebuild', 
		['-configuration', config,
		'-exportArchive', 
		'-exportFormat', 'ipa',
		'-archivePath', (outputPath + '/App-' + nowStr),
		'-exportPath', (outputPath + '/' + schema + '-' + nowStr + '.ipa'),
		'-exportProvisioningProfile', provision
		]);
	process.stdout.on('close', function (data) {
		if(fs.existsSync(outputPath + '/' + schema + '-' + nowStr + '.ipa')){
			deferred.resolve(nowStr);
		}else{
			deferred.reject("Archieve Failed");
		}
	}); 
	process.stdout.on('data', function (data) {
    	// console.log(String(data));
		console.log(String(data));
        // result += String(data);
    });
    process.stderr.on('data', function (data) {
    	console.log(String(data));
    	deferred.reject("Archieve Failed");
        // deferred.reject(String(data));
    });

    return deferred.promise;
}

exports.buildArchieve = function(outputPath, workspace, config, schema) {
	
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
			deferred.resolve(nowStr);
		}else{
			deferred.reject("Archieve Failed");
		}
	}); 
	process.stdout.on('data', function (data) {
    	// console.log(String(data));
		console.log(String(data));
        // result += String(data);
    });
    process.stderr.on('data', function (data) {
    	console.log(String(data));
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