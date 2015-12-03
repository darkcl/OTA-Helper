const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var devToolsOpen = false;
// Quit when all windows are closed.


app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  });

  var ret = globalShortcut.register('ctrl+x', function() {
    console.log('ctrl+x is pressed');
    // Open the DevTools.
    if (mainWindow.isDevToolsOpened()) {
      mainWindow.closeDevTools();
    } else {
      mainWindow.openDevTools({detach: true});
    }
    
  });

  if (!ret) {
    console.log('registration failed');
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('ctrl+x'));

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

app.on('will-quit', function() {
  // Unregister a shortcut.
  globalShortcut.unregister('ctrl+x');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
