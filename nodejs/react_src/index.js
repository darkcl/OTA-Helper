var fs = require('fs');
var plist = require('plist');

const ipcRenderer = require('electron').ipcRenderer;

var fs = require('fs');

var appController = {
  listener: null,
  data: plist.parse(fs.readFileSync(__dirname +'/data/test.plist', 'utf8')),
  selectedProject: null,
  title: "OTA Helper",
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
    return (
      <div className="form-group">
        <label>{this.props.inputName}</label>
        <select className="form-control">
          <option>Option one</option>
          <option>Option two</option>
          <option>Option three</option>
          <option>Option four</option>
          <option>Option five</option>
          <option>Option six</option>
          <option>Option seven</option>
          <option>Option eight</option>
        </select>
      </div>
    )
  }
})

var MainContent = React.createClass({
  handleExportPathClick: function() {
    ipcRenderer.on('asynchronous-reply', function(event, arg) {
      console.log(arg); // prints "pong"
    });
    ipcRenderer.send('asynchronous-message', 'ping');
  },
  handleClick: function() {
    // body...
    console.log("Export");
  },
  render: function () {

    if (this.props.appState.selectedProject != null) {
      var data = this.props.appState.getCurrentProjectData();
      // console.log(data);
      return(
        <div className="pane">
        <div style={divStyle}>
          <InputField inputType='text' placeholder='Email1' inputName='Email' />
          <InputField inputType='password' placeholder='Password' inputName='Password' />
          <div className="form-group">
            <label>Export Path</label><br/>
            <label>{this.props.appState.getCurrentProjectData()["export"]}</label>
            <button className="btn btn-form btn-default pull-right" onClick={this.handleExportPathClick}>...</button>
          </div>
          <OptionField inputName='Provisioning Profile' />

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
  },
  //update if the app tells us it changed
  changed: function () {
    this.forceUpdate();
  },
  render : function() {
    var app = this.state.app;
    return (
      <div className="window">
        <TitleBar title={app.title}/>
        <AppContent appState={app}/>
        <FooterBar />
      </div>
    )
  }
})



ReactDOM.render(
  <WindowsContent />,
  document.body
);