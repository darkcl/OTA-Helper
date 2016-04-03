/*
The MIT License (MIT)
Copyright (c) Patrick Londema <plondema@service2media.com>
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Inspired by Silas Knobel <dev@katun.ch>
*/

'use strict';


/**
 * CertDownloader([options]).
 * Construct a new CertDownloader.
 * 
 * `options` overrides one or several defaults and should be in JSON format
 * with any of the following options:
 * `certName`: name of the certificate (default is `AppleIncRootCertificate.cer`)
 * `url`     : URL to download the certificate from (default is
 *             `http://www.apple.com/appleca/AppleIncRootCertificate.cer`)
 * `cache`   : path to cache location (a.k.a. where to keep the certificates locally,
 *             by default this is the operating system's default directory for temp files)
 */
function CertDownloader(options) {
    this.fs = require('fs');
    this.util = require('util');
    this.certName = 'AppleIncRootCertificate.cer';
    this.rootUrl = 'http://www.apple.com/appleca/AppleIncRootCertificate.cer';
    this.cachePath = require('os').tmpdir();
    if (options) {
        if (options.certName) {
            this.certName = options.certName;
        }
        if (options.url) {
            this.rootUrl = options.url;
        }
        if (options.cache) {
            this.cachePath = options.cache;
        }
    }
}

/**
 * Retrieve the certificate.
 * 
 * Attempts to download a missing certificate and returns the path to said
 * certificate if available (either cached or downloaded).
 * The callback gets two arguments (err, path), where path is a string to
 * the location of the certificate.
 */
CertDownloader.prototype.cert = function (callback) {
    var _this = this;
    var certPath = require('path').join(_this.cachePath, _this.certName);
    if (_this.fs.exists(certPath)) {
        callback(null, certPath);
    } else {
        require('http').get(_this.rootUrl, function (res) {
            var downloadStream = _this.fs.createWriteStream(certPath);
            res.pipe(downloadStream);
            return downloadStream.on('finish', function () {
                return downloadStream.close(function () {
                    return callback(null, certPath);
                });
            });
        }).on('error', function (error) {
            callback(error);
        });
    }
};

/**
 * Retrieve the certificate in PEM format.
 * 
 * Attempts to download and convert a missing certificate and returns the
 * path to said certificate if available (either cached or converted).
 * The callback gets two arguments (err, path), where path is a string
 * to the location of the certificate.
 */
CertDownloader.prototype.pem = function (callback) {
    var _this = this;
    var pemPath = require('path').join(_this.cachePath, _this.util.format('%s.pem', _this.certName.split('.')[0]));
    if (_this.fs.exists(pemPath)) {
        callback(null, pemPath);
    } else {
        _this.cert(function (error, certPath) {
            if (error) {
                callback(error);
            } else {
                var exec = require('child_process').exec;
                var execOptions = {cwd: _this.cachePath};
                var cmd = _this.util.format(
                    'openssl x509 -inform der -in %s -out %s',
                    certPath,
                    pemPath);
                return exec(cmd, execOptions, function (error) {
                    if (error) {
                        return callback(error);
                    } else {
                        return callback(null, pemPath);
                    }
                });
            }
        });
    }
};

/**
 * Verifies a file against the certificate.
 * 
 * Attempts to download and convert a missing certificate and returns the
 * content of the file if succesfully verified.
 * The callback gets two arguments (err, output), where output is the content
 * of the file if succesfully verified.
 */
CertDownloader.prototype.verify = function (file, callback) {
    var _this = this;
    _this.pem(function (error, pemPath) {
        if (error) {
            return callback(error);
        }
        var exec = require('child_process').exec;
        var execOptions = {cwd: _this.cachePath};
        var cmd = _this.util.format(
            'openssl smime -in %s -inform der -verify -CAfile %s',
            file,
            pemPath);
        exec(cmd, execOptions, function (error, output) {
            if (error) {
                return callback(error);
            } else {
                return callback(null, output);
            }
        });
    });
};

module.exports = CertDownloader;