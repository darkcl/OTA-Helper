/// <reference path="../typings/mocha/mocha.d.ts"/>
'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var currentPath = path.resolve('.');
var certDl = new (require('../'))({cache : currentPath});

describe('Validate', function(){

    // make sure we're actually doing download test
    before(function(done) {
        fs.unlink('AppleIncRootCertificate.cer', function(error) {
            if(!error) {
                fs.unlink('AppleIncRootCertificate.pem', function(error) {
                    done();
                });
            } else {
                done();
            }
        });
    });

    // This will (should) trigger CER download, PEM conversion and embedded.mobileprovision testing
    it('Should return validated output', function(done){
        var file = currentPath + '/test/embedded.mobileprovision';
        certDl.verify(file, function(error, output) {
            assert.equal(error, void 0);
            var data = fs.readFileSync('test/embedded.nonsigned', 'utf8');
            assert.equal(output, data);
            done();
        });
    });

    // double-check the certificate files exist
    it('Certificates should exist', function(){
        fs.stat('AppleIncRootCertificate.cer', function(error,stats){
            assert.equal(error, void 0);
        });
        fs.stat('AppleIncRootCertificate.pem', function(error,stats){
            assert.equal(error, void 0);
        });
    });

    // cleanup of the downloaded files
    after(function(done) {
        fs.unlink('AppleIncRootCertificate.cer', function(error) {
            if(!error) {
                fs.unlink('AppleIncRootCertificate.pem', function(error) {
                    done();
                });
            } else {
                done();
            }
        });
    });
});