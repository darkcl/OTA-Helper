var fs = require('fs');
var plist = require('plist');
var React = require('react');
var ReactDOM = require('react-dom');
var Dropzone = require('dropzone');

const ipcRenderer = require('electron').ipcRenderer;

if (fs.existsSync(__dirname + '/data/projects.json') == false) {
  fs.writeFileSync(__dirname + '/data/projects.json', "{\"saveInfo_projects\": \"\"}", 'utf8');
}

var provisionloader = require(__dirname + '/js/provision-loader.js');
var xcodebuild = require(__dirname + '/js/xcode-build.js');
var appController = {
  listener: null,
  data: JSON.parse(fs.readFileSync(__dirname + '/data/projects.json', 'utf8')),
  selectedProject: null,
  title: "OTA Helper",
  isReady: false,
  isProjectLoading: false,
  provisionings: [],
  currentXcodeConfig: null,
  currentBuildSetting: null,

  addProvisionings: function (data) {
    // console.log(data);
    this.provisionings.push(data);
  },

  startLoading: function () {
    var provisioningDir = process.env.HOME + '/Library/MobileDevice/Provisioning\ Profiles/';
    var that = this;

    fs.readdir(provisioningDir, function (err, files) {
      if (!err) {
        for (var i = files.length - 1; i >= 0; i--) {
          var fileName = files[i];
          // console.log(fileName);
          var count = 0;
          if (fileName.indexOf('mobileprovision') != -1) {
            var dir = process.env.HOME + '/Library/MobileDevice/Provisioning\ Profiles/';

            provisionloader.loadProfile(dir + fileName).then(function (value) {
              that.addProvisionings(value);
            }).fin(function () {
              count++;
              // console.log('Loaded: ' + count  + '/' + files.length);

              that.setIsReady(count == files.length - 1);
            });
          }
        }
      } else {
        console.log(err);
      }
    });
  },

  setIsReady: function (ready) {
    this.isReady = ready;
    this.listener.changed();
  },

  setSelected: function (project) {
    this.selectedProject = project;
    this.isProjectLoading = true;
    var that = this;
    var path = this.getCurrentProjectData()["project"].substring(0, this.getCurrentProjectData()["project"].lastIndexOf("/"));
    console.log(path);
    this.listener.changed();
    xcodebuild.listConfig(path).then(function (response) {
      that.currentXcodeConfig = response;
    }).fin(function () {
      that.isProjectLoading = false;
      that.listener.changed();
    });
  },

  addProject: function (projectName, projectPath, outputPath, baseUrl) {
    this.data["saveInfo_projects"][projectName] = {
      "export": outputPath,
      "project": projectPath,
      "domain": baseUrl
    };
    this.listener.changed();
  },

  setTitle: function (title) {
    this.title = title;
    this.listener.changed();
  },

  getCurrentProjectData: function () {
    // console.log(this.selectedProject);
    return this.data["saveInfo_projects"][this.selectedProject];
  },

  saveProjects: function () {},

  setProjectData: function (project) {
    this.data["saveInfo_projects"][this.selectedProject] = project;
    this.listener.changed();
  }
};

// xcodebuild.exportPlist('Facesss-20151211052546', '/Users/yeungyiuhung/Documents/OTA Build/Facesss', 'https://download.cherrypicks.com/FACESSS/OTA/', 'Facesss')
// .then(function(res){
//   console.log(res);
// })
// .fail(function(err){
//   console.log(err);
// })
// .progress(function(log){
//   console.log(log);
// })

var TitleBar = React.createClass({
  displayName: 'TitleBar',

  render: function () {
    return React.createElement(
      'header',
      { className: 'toolbar toolbar-header' },
      React.createElement(
        'h1',
        { className: 'title' },
        'OTA Helper'
      )
    );
  }
});

// console.log(plist.parse(fs.readFileSync('/Users/yeungyiuhung/Library/MobileDevice/Provisioning\ Profiles/6d774418-a45f-45cd-8373-e045573a316c.mobileprovision', 'utf8')));

// Project List

var SideBarItem = React.createClass({
  displayName: 'SideBarItem',

  handleClick: function (event) {
    this.props.appState.setSelected(this.props.itemName);
  },
  render: function () {
    var itemState = this.props.itemName != this.props.appState.selectedProject ? 'nav-group-item' : 'nav-group-item active';
    return React.createElement(
      'span',
      { className: itemState, onClick: this.handleClick },
      React.createElement('span', { className: 'icon icon-folder' }),
      this.props.itemName
    );
  }
});

var SideBar = React.createClass({
  displayName: 'SideBar',

  render: function () {
    var data = this.props.appState.data["saveInfo_projects"];
    var app = this.props.appState;
    var itemNodes = Object.keys(data).map(function (projects) {
      // console.log(projects);
      return React.createElement(SideBarItem, { itemName: projects, appState: app });
    });
    return React.createElement(
      'div',
      { className: 'pane pane-sm sidebar' },
      React.createElement(
        'nav',
        { className: 'nav-group' },
        React.createElement(
          'h5',
          { className: 'nav-group-title' },
          'Projects'
        ),
        itemNodes
      )
    );
  }
});

//Main Content
var divStyle = {
  margin: '10px'
};

var InputField = React.createClass({
  displayName: 'InputField',

  render: function () {
    return React.createElement(
      'div',
      { className: 'form-group' },
      React.createElement(
        'label',
        null,
        this.props.inputName
      ),
      React.createElement('input', { type: this.props.inputType, className: 'form-control', placeholder: this.props.placeholder, value: this.props.defaultValue })
    );
  }
});

var OptionField = React.createClass({
  displayName: 'OptionField',

  render: function () {
    // console.log(this.props.data);
    var preselect = this.props.preselect;
    var itemNodes = this.props.data.map(function (item) {
      // console.log(projects);
      if (item == preselect) {
        return React.createElement(
          'option',
          { selected: true },
          item
        );
      } else {
        return React.createElement(
          'option',
          null,
          item
        );
      }
    });
    return React.createElement(
      'div',
      { className: 'form-group' },
      React.createElement(
        'label',
        null,
        this.props.inputName
      ),
      React.createElement(
        'select',
        { className: 'form-control', onChange: this.props.valueChanged },
        itemNodes
      )
    );
  }
});

var projectController = {
  listener: null,
  target: null,
  scheme: null,
  config: null,
  provisioning: null,
  projectPath: null,
  outputPath: null
};

var MainContent = React.createClass({
  displayName: 'MainContent',

  handleExportPathClick: function () {
    console.log('click');
    var path = ipcRenderer.sendSync('synchronous-message', 'export_path');
    console.log(path);
  },

  handleProjectPathClick: function () {
    console.log('click project');
    console.log(ipcRenderer.sendSync('synchronous-message', 'project_path'));
  },

  handleClick: function () {
    // [arguments addObject:isCocoaPods ? [NSString stringWithFormat:@"%@.xcworkspace", projectName] : [NSString stringWithFormat:@"%@.xcodeproj/project.xcworkspace", projectName]];

    var file = this.props.appState.getCurrentProjectData()["project"].substr(this.props.appState.getCurrentProjectData()["project"].lastIndexOf('/') + 1);

    var isProject = file.indexOf("xcodeproj") == -1 ? false : true;
    var that = this;
    xcodebuild.buildArchieve(this.props.appState.getCurrentProjectData()["export"], isProject ? this.props.appState.getCurrentProjectData()["project"] + '/project.xcworkspace' : this.props.appState.getCurrentProjectData()["project"], "Release", this.props.appState.currentXcodeConfig.targets[0], this.props.appState.getCurrentProjectData()["cert"], this.props.appState.selectedProject, this.props.appState.getCurrentProjectData()["domain"]).then(function (response) {
      console.log(response);
    }).progress(function (log) {
      console.log(log);
    }).fin(function () {});
    console.log("Export");
  },

  targetChanged: function (e) {
    console.log(e.target.value);
  },

  configChanged: function (e) {
    console.log(e.target.value);
  },

  schemeChanged: function (e) {
    console.log(e.target.value);
  },

  provisionChanged: function (e) {
    console.log(e.target.value);
  },

  render: function () {

    if (this.props.appState.selectedProject != null) {
      if (this.props.appState.isProjectLoading) {
        return React.createElement(
          'div',
          { className: 'pane' },
          React.createElement(
            'h1',
            null,
            'Loading...'
          )
        );
      } else {
        var data = this.props.appState.getCurrentProjectData();
        // console.log(data);
        var provisions = this.props.appState.provisionings.map(function (value) {
          return value["Name"];
        });
        console.log("Config :" + this.props.appState.currentXcodeConfig);

        return React.createElement(
          'div',
          { className: 'pane' },
          React.createElement(
            'div',
            { style: divStyle },
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                null,
                'Project Path'
              ),
              React.createElement('br', null),
              React.createElement(
                'label',
                null,
                this.props.appState.getCurrentProjectData()["project"]
              ),
              React.createElement(
                'button',
                { className: 'btn btn-form btn-default pull-right', onClick: this.handleProjectPathClick },
                '...'
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement(
                'label',
                null,
                'Export Path'
              ),
              React.createElement('br', null),
              React.createElement(
                'label',
                null,
                this.props.appState.getCurrentProjectData()["export"]
              ),
              React.createElement(
                'button',
                { className: 'btn btn-form btn-default pull-right', onClick: this.handleExportPathClick },
                '...'
              )
            ),
            React.createElement(OptionField, { inputName: 'Targets', data: this.props.appState.currentXcodeConfig.targets, valueChanged: this.targetChanged }),
            React.createElement(OptionField, { inputName: 'Build Configurations (Default is Release)', data: this.props.appState.currentXcodeConfig.configs, preselect: 'Release', valueChanged: this.configChanged }),
            React.createElement(OptionField, { inputName: 'Schema', data: this.props.appState.currentXcodeConfig.schema, preselect: this.props.appState.currentXcodeConfig.schema[0], valueChanged: this.schemeChanged }),
            React.createElement(OptionField, { inputName: 'Provisioning Profile', data: provisions, preselect: this.props.appState.getCurrentProjectData()["cert"], valueChanged: this.provisionChanged }),
            React.createElement(
              'div',
              { className: 'form-actions padded-top' },
              React.createElement(
                'button',
                { className: 'btn btn-form btn-primary pull-right', onClick: this.handleClick },
                'Export'
              )
            )
          )
        );
      }
    } else {
      return React.createElement(
        'div',
        { className: 'pane' },
        React.createElement(
          'h1',
          null,
          'Select A Project'
        )
      );
    }
  }
});

var AppContent = React.createClass({
  displayName: 'AppContent',

  render: function () {
    // console.log(this.props.appState);
    return React.createElement(
      'div',
      { className: 'window-content' },
      React.createElement(
        'div',
        { className: 'pane-group' },
        React.createElement(SideBar, { appState: this.props.appState }),
        React.createElement(MainContent, { appState: this.props.appState })
      )
    );
  }
});

var FooterBar = React.createClass({
  displayName: 'FooterBar',

  handleClick: function (event) {
    var _this = this;
    var projectName = '';
    var projectLocation = '';
    var outputPath = '';

    swal({
      title: "Add Project",
      text: "Enter Project Name:",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Project Name" }, function (inputValue) {
      if (inputValue === false) return false;
      if (inputValue === "") {
        swal.showInputError("You need to enter a name");
        return false;
      }
      var data = _this.props.appState.data["saveInfo_projects"];
      if (String(inputValue) in data) {
        swal.showInputError("You need to enter a unique name");
        return false;
      }
      // swal("Project Added.", "Project " + inputValue + " is added.", "success");

      swal({
        title: "Select Xcode Project",
        text: '<div id="myId"><p>Drop project file here.</p></div>',
        html: true,
        showConfirmButton: false,
        allowEscapeKey: false
      });
      var myDropzone = new Dropzone("div#myId", {
        url: "/file/post",
        acceptedFiles: '.xcodeproj,.xcworkspace',
        createImageThumbnails: false,
        previewTemplate: '<div style="display:none"></div>',
        maxFiles: 1,
        clickable: false,
        autoProcessQueue: false
      });
      var isShown = false;
      myDropzone.on("addedfile", function (file) {
        /* Maybe display some more file information on your page */
        // if (file.type && file.filePath) {
        if (isShown) {
          return;
        };

        if (file.hasOwnProperty('fullPath')) {
          var fileName = file.fullPath.split('/')[0];
          if (fileName.indexOf('xcodeproj') != -1 || fileName.indexOf('xcworkspace') != -1) {
            var path = file.path.substring(0, file.path.indexOf(fileName) + fileName.length);
            console.log(path);
            console.log(_this);
            isShown = true;
            _this.selectOutput(inputValue, path);
          } else {
            swal.showInputError("You need to select the xcode project");
          }
        } else {
          swal.showInputError("You need to select the xcode project");
        }

        // };
      });
    });
  },
  selectOutput: function (projectName, projectPath) {
    var _this = this;
    console.log('ssssss');
    swal({
      title: "Select Output Path",
      text: '<div id="myId2"><p>Drop a folder here.</p></div>',
      html: true,
      showConfirmButton: false,
      allowEscapeKey: false
    });
    var myDropzone = new Dropzone("div#myId2", {
      url: "/file/post",
      createImageThumbnails: false,
      previewsContainer: false,
      clickable: false,
      autoProcessQueue: false
    });
    var isShown = false;
    myDropzone.on("addedfile", function (file) {
      if (isShown) return;
      if (file.hasOwnProperty('fullPath')) {
        var fileName = file.fullPath.split('/')[0];
        var path = file.path.substring(0, file.path.indexOf(fileName) + fileName.length);
        console.log(path);
        console.log(_this);
        isShown = true;
        // swal({
        //   title: "Select Output path",
        //   text: path,
        //   type: "success"
        // }, function(e){
        //   console.log(e);
        swal({
          title: "Enter Base URL",
          text: "Enter Base URL for ipa to store:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "http://...." }, function (inputValue) {
          if (inputValue === false) return false;
          if (inputValue === "") {
            swal.showInputError("You need to enter a url");
            return false;
          } else {

            swal({
              title: "Added " + projectName,
              text: 'Project' + projectName + ' added.',
              type: 'success'
            }, function (e) {
              _this.props.appState.addProject(projectName, projectPath, path, inputValue);
            });
          }
        });
      } else {
        swal.showInputError("You need to select a folder");
      }
    });
  },

  render: function () {
    return React.createElement(
      'footer',
      { className: 'toolbar toolbar-footer' },
      React.createElement(
        'div',
        { className: 'toolbar-actions' },
        React.createElement(
          'button',
          { className: 'btn btn-primary', onClick: this.handleClick },
          'Add'
        )
      )
    );
  }
});

var WindowsContent = React.createClass({
  displayName: 'WindowsContent',

  getInitialState: function () {
    return {
      app: appController
    };
  },
  //before we render, start listening to the app for changes
  componentWillMount: function () {
    this.state.app.listener = this;
    this.state.app.startLoading();
  },
  //update if the app tells us it changed
  changed: function () {
    this.forceUpdate();
  },
  render: function () {
    var app = this.state.app;

    if (app.isReady) {
      // console.log(app.provisionings);
      return React.createElement(
        'div',
        { className: 'window' },
        React.createElement(TitleBar, { title: app.title }),
        React.createElement(AppContent, { appState: app }),
        React.createElement(FooterBar, { appState: app })
      );
    } else {
      return React.createElement(
        'div',
        { className: 'window' },
        React.createElement(TitleBar, { title: app.title }),
        React.createElement(
          'h1',
          null,
          'Loading...'
        )
      );
    }
  }
});

ReactDOM.render(React.createElement(WindowsContent, null), document.getElementById("main"));