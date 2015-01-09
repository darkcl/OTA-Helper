# OTA-Helper
Simple helper application that export Ad Hoc Deployment for iOS Project, including upload and version checking.

Download:
---
Pre-built binaries can be found [here].
[here]: https://github.com/darkcl/OTA-Helper/releases/download/v0.1.0/OTA.Helper.app.zip

How to use:
---
1. Input all the fields.
2. Export
3. Wait
4. Done

The helper will generate a json file that will be upload to sftp server, here is a example html that read that json file (replace **<code>generated_json.json</code>** to your json):

```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Example</title>
  <script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-1.11.2.min.js"></script>        

	<script type="text/javascript">
		$(document).ready(function(e) {
			$.getJSON('./generated_json.json', function (response) {
				$.each(response, function(idx, rec){
				
					var parser = new DOMParser();
					$('.ios-list').append($(document.createElement('li')).append(rec));
				})
			});
		});
	</script>
</head>


<body>
  <b>iPhone</b>
  <ul class='ios-list'>
  	
  </ul>
  <br>
</body>

```

Build Instructions : 
---
 1. Download the project
 2. Install Cocoapods
	<pre><code>sudo gem install cocoapods
	</code></pre>
 3. Install dependency
 	<pre><code>pod install
	</code></pre>
	

Reference : 
---

 1. OTA Buddy : https://github.com/sveinungkb/ios-ota-buddy
 2. NSTask Tutorial in *raywenderlich.com* :http://www.raywenderlich.com/36537/nstask-tutorial
