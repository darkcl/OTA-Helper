var fs = require('fs');
var plist = require('plist');

const ipcRenderer = require('electron').ipcRenderer;

var provisionloader = require(__dirname + '/js/provision-loader.js');
var xcodebuild = require(__dirname + '/js/xcode-build.js');
var appController = {
  listener: null,
  data: plist.parse(fs.readFileSync(__dirname + '/data/test.plist', 'utf8')),
  selectedProject: null,
  title: "OTA Helper",
  isReady: false,
  isProjectLoading: false,
  provisionings: [],
  currentXcodeConfig: null,

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
        { className: 'form-control' },
        itemNodes
      )
    );
  }
});

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
    xcodebuild.buildArchieve(this.props.appState.getCurrentProjectData()["export"], isProject ? this.props.appState.getCurrentProjectData()["project"] + '/project.xcworkspace' : this.props.appState.getCurrentProjectData()["project"], "Release", this.props.appState.currentXcodeConfig.targets[0]).then(function (response) {
      console.log(response);
      xcodebuild.buildIpa(that.props.appState.getCurrentProjectData()["export"], "Release", that.props.appState.currentXcodeConfig.targets[0], that.props.appState.getCurrentProjectData()["cert"], response).then(function (response2) {
        console.log(response2);
      }).fin(function () {});
    }).fin(function () {});
    console.log("Export");
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
            React.createElement(OptionField, { inputName: 'Targets', data: this.props.appState.currentXcodeConfig.targets }),
            React.createElement(OptionField, { inputName: 'Build Configurations (Default is Release)', data: this.props.appState.currentXcodeConfig.configs, preselect: 'Release' }),
            React.createElement(OptionField, { inputName: 'Schema', data: this.props.appState.currentXcodeConfig.schema, preselect: this.props.appState.currentXcodeConfig.schema[0] }),
            React.createElement(OptionField, { inputName: 'Provisioning Profile', data: provisions, preselect: this.props.appState.getCurrentProjectData()["cert"] }),
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

  render: function () {
    return React.createElement(
      'footer',
      { className: 'toolbar toolbar-footer' },
      React.createElement(
        'div',
        { className: 'toolbar-actions' },
        React.createElement(
          'button',
          { className: 'btn btn-primary' },
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
        React.createElement(FooterBar, null)
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

ReactDOM.render(React.createElement(WindowsContent, null), document.body);