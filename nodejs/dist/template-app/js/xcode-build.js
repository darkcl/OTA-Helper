// Xcode build
var childProcess = require('child_process');
var Q = require('q');

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
    	console.log (targetStartLine);
    	console.log (configStartLine);
    	console.log (schemaStartLine);
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