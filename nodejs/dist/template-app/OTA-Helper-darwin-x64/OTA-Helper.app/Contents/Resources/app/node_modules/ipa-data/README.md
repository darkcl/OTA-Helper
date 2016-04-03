# ipa-data
A node module for reading metadata from an IPA file  

`npm install ipa-data`

## Usage
```javascript
var ipaData = require('ipa-data')

ipaData('path/to/ipa.ipa', function(err, metadata){
  if(err){
    throw err;
  }
  console.log(metadata);
})

```
