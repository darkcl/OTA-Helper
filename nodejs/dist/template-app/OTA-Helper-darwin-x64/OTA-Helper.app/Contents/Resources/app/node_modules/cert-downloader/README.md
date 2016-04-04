# cert-downloader [![Build Status](https://travis-ci.org/evi-snowm/cert-downloader.svg?branch=develop)](https://travis-ci.org/evi-snowm/cert-downloader)

This is a helper module that allows you to dowload an SSL certificate, by default that of Apple Inc..

Offered functionality:
* Download certificate and store locally.
* Convert certificate to PEM format.
* Validate a file against the certificate.

**NOTE** OpenSSL or compatible must be installed on your system if you wish to use certificates in the PEM format.
Without this tool, only the download function will work.

## Install
```sh
$ npm install cert-downloader
```

## Usage

```js
var CertDownloader = require('cert-downloader');
var certDl = new CertDownloader();

// download and save in default (cache) location
certDl.cert(function (error, certificatePath) {
    if(error) {
        console.error('Error ' + error);
    } else {
        console.log('Certificate downloaded to ' + certificatePath);
        // /nodeproject/certificate/AppleIncRootCertificate.cer
    }
});

// download and convert to PEM (will use cached cer file and convert that to pem)
certDl.pem(function (error, certificatePath) {
    if(error) {
        console.error('Error ' + error);
    } else {
        console.log('Certificate downloaded to ' + certificatePath);
        // /nodeproject/certificate/AppleIncRootCertificate.pem
    }
});

// verifiy an existing file against the certificate
// (will download and convert if required)
var file = '/nodeproject/certicate/file-to-verify';
certDl.verify(file, function(error, output) {
    if(error){
      return callback('File verification failed: ' + error);
    }
    console.log('Verified output: ' + output);
  });
```

## License

MIT © Patrick Londema