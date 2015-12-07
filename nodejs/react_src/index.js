var fs = require('fs');
var plist = require('plist');

const ipcRenderer = require('electron').ipcRenderer;

var provisionloader = require(__dirname + '/js/provision-loader.js');
var xcodebuild = require(__dirname + '/js/xcode-build.js');

var appController = {
  listener: null,
  data: plist.parse(fs.readFileSync(__dirname +'/data/test.plist', 'utf8')),
  selectedProject: null,
  title: "OTA Helper",
  isReady: false,
  provisionings: [],
  addProvisionings: function(data) {
    // console.log(data);
    this.provisionings.push(data);
  },

  startLoading: function() {
    var provisioningDir = process.env.HOME + '/Library/MobileDevice/Provisioning\ Profiles/';
    var that = this;
    fs.readdir( provisioningDir, function (err, files) { 
      if (!err) {
        for (var i = files.length - 1; i >= 0; i--) {
          var fileName = files[i];
          // console.log(fileName);
          var count = 0;
          if (fileName.indexOf('mobileprovision') != -1) {
            var dir = process.env.HOME + '/Library/MobileDevice/Provisioning\ Profiles/';

            provisionloader.loadProfile(dir + fileName)
            .then(function (value){
              that.addProvisionings(value);
            })
            .fin(function (){
              count++;
              // console.log('Loaded: ' + count  + '/' + files.length);

              that.setIsReady(count == files.length - 1);
            });
            
          }
        }
      }else{
        console.log(err);
      }
    });
    
  },

  setIsReady: function(ready){
    this.isReady = ready;
    this.listener.changed();
  },

  setSelected: function(project) {
    this.selectedProject = project;
    this.listener.changed();
  },
  
  setTitle: function(title) {
    this.title = title;
    this.listener.changed();
  },

  getCurrentProjectData: function() {
    // console.log(this.selectedProject);
    return this.data["saveInfo_projects"][this.selectedProject];
  },

  saveProjects: function() {

  },

  setProjectData: function(project) {
    this.data["saveInfo_projects"][this.selectedProject] = project;
    this.listener.changed();
  }
}

var TitleBar = React.createClass({
  render: function() {
    return (
      <header className="toolbar toolbar-header">
        <h1 className="title">OTA Helper</h1>
      </header>
    );
  }
});

// console.log(plist.parse(fs.readFileSync('/Users/yeungyiuhung/Library/MobileDevice/Provisioning\ Profiles/6d774418-a45f-45cd-8373-e045573a316c.mobileprovision', 'utf8')));

// Project List

var SideBarItem = React.createClass({
  handleClick: function(event) {
    this.props.appState.setSelected(this.props.itemName);
  },
  render: function() {
    var itemState = (this.props.itemName != this.props.appState.selectedProject) ? 'nav-group-item' : 'nav-group-item active';
    return (
      <span className={itemState} onClick={this.handleClick}>
        <span className="icon icon-folder"></span>
        {this.props.itemName}
      </span>
    );
  }
})

var SideBar = React.createClass({
  render: function() {
    var data = this.props.appState.data["saveInfo_projects"];
    var app = this.props.appState;
    var itemNodes = Object.keys(data).map(function(projects) {
      // console.log(projects);
      return (
        <SideBarItem itemName = {projects} appState={app}/>
      );
    });
    return (
      <div className="pane pane-sm sidebar">
            <nav className="nav-group">
              <h5 className="nav-group-title">Projects</h5>
              {itemNodes}
            </nav>
          </div>
    );
  }
})


//Main Content
var divStyle = {
    margin: '10px'
};

var InputField = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.inputName}</label>
        <input type={this.props.inputType} className="form-control" placeholder={this.props.placeholder} value={this.props.defaultValue}/>
      </div>
    )
  }
})

var OptionField = React.createClass({
  render: function() {
    // console.log(this.props.data);
    var preselect = this.props.preselect;
    var itemNodes = this.props.data.map(function(item) {
      // console.log(projects);
      if (item == preselect) {
        return (
          <option selected>{item}</option>
        );
      }else{
        return (
          <option>{item}</option>
        );
      }
      
    });
    return (
      <div className="form-group">
        <label>{this.props.inputName}</label>
        <select className="form-control">
          {itemNodes}
        </select>
      </div>
    )
  }
})

var MainContent = React.createClass({
  handleExportPathClick: function() {
    console.log('click');
    var path = ipcRenderer.sendSync('synchronous-message', 'export_path');
    console.log(path);
  },

  handleProjectPathClick: function() {
    console.log('click project');
    console.log(ipcRenderer.sendSync('synchronous-message', 'project_path'));
  },

  handleClick: function() {
    console.log("Export");
  },
  render: function () {

    if (this.props.appState.selectedProject != null) {
      var data = this.props.appState.getCurrentProjectData();
      // console.log(data);
      var provisions = this.props.appState.provisionings.map(function(value){
        return value["Name"];
      });
      // console.log("Provision :"+provisions);

      return(
        <div className="pane">
        <div style={divStyle}>
          <div className="form-group">
            <label>Project Path</label><br/>
            <label>{this.props.appState.getCurrentProjectData()["project"]}</label>
            <button className="btn btn-form btn-default pull-right" onClick={this.handleProjectPathClick}>...</button>
          </div>
          <div className="form-group">
            <label>Export Path</label><br/>
            <label>{this.props.appState.getCurrentProjectData()["export"]}</label>
            <button className="btn btn-form btn-default pull-right" onClick={this.handleExportPathClick}>...</button>
          </div>
          <OptionField inputName='Provisioning Profile' data={provisions} preselect={this.props.appState.getCurrentProjectData()["cert"]}/>

          <div className="form-actions padded-top">
            <button className="btn btn-form btn-primary pull-right" onClick={this.handleClick}>Export</button>
          </div>
        </div>
        </div>
      );
    }else{
      return (
      <div className="pane">
        <h1>Project Settings</h1>
      </div>
    );
    }
  }
});

var AppContent = React.createClass({
  render: function() {
    // console.log(this.props.appState);
    return (
      <div className="window-content">
        <div className="pane-group">
          <SideBar appState={this.props.appState}/>
          <MainContent appState={this.props.appState}/>
        </div>
      </div>
    )
  }
});

var FooterBar = React.createClass({
  render : function() {
    return (
      <footer className="toolbar toolbar-footer">
      <div className="toolbar-actions">
        <button className="btn btn-primary">
          Add
        </button>
      </div>
    </footer>
    )
  }
})

var WindowsContent = React.createClass({
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
  render : function() {
    var app = this.state.app;
    if (app.isReady) {
      // console.log(app.provisionings);
      return (
        <div className="window">
          <TitleBar title={app.title}/>
          <AppContent appState={app}/>
          <FooterBar />
        </div>
      );
    }else{
      return (
        <div className="window">
          <TitleBar title={app.title}/>
          <h1>Loading...</h1>
        </div>
      );
    }
    
  }
})



ReactDOM.render(
  <WindowsContent />,
  document.body
);