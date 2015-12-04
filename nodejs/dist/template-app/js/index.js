var fs = require('fs');
var plist = require('plist');

const ipcRenderer = require('electron').ipcRenderer;

var fs = require('fs');

var appController = {
  listener: null,
  data: plist.parse(fs.readFileSync(__dirname + '/data/test.plist', 'utf8')),
  selectedProject: null,
  title: "OTA Helper",
  setSelected: function (project) {
    this.selectedProject = project;
    this.listener.changed();
  },

  setTitle: function (title) {
    this.title = title;
    this.listener.changed();
  },

  getCurrentProjectData: function () {
    // console.log(this.selectedProject);
    return this.data["saveInfo_projects"][this.selectedProject];
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
        React.createElement(
          'option',
          null,
          'Option one'
        ),
        React.createElement(
          'option',
          null,
          'Option two'
        ),
        React.createElement(
          'option',
          null,
          'Option three'
        ),
        React.createElement(
          'option',
          null,
          'Option four'
        ),
        React.createElement(
          'option',
          null,
          'Option five'
        ),
        React.createElement(
          'option',
          null,
          'Option six'
        ),
        React.createElement(
          'option',
          null,
          'Option seven'
        ),
        React.createElement(
          'option',
          null,
          'Option eight'
        )
      )
    );
  }
});

var MainContent = React.createClass({
  displayName: 'MainContent',

  handleExportPathClick: function () {
    ipcRenderer.on('asynchronous-reply', function (event, arg) {
      console.log(arg); // prints "pong"
    });
    ipcRenderer.send('asynchronous-message', 'ping');
  },
  handleClick: function () {
    // body...
    console.log("Export");
  },
  render: function () {

    if (this.props.appState.selectedProject != null) {
      var data = this.props.appState.getCurrentProjectData();
      // console.log(data);
      return React.createElement(
        'div',
        { className: 'pane' },
        React.createElement(
          'div',
          { style: divStyle },
          React.createElement(InputField, { inputType: 'text', placeholder: 'Email1', inputName: 'Email' }),
          React.createElement(InputField, { inputType: 'password', placeholder: 'Password', inputName: 'Password' }),
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
          React.createElement(OptionField, { inputName: 'Provisioning Profile' }),
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
    } else {
      return React.createElement(
        'div',
        { className: 'pane' },
        React.createElement(
          'h1',
          null,
          'Project Settings'
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
  },
  //update if the app tells us it changed
  changed: function () {
    this.forceUpdate();
  },
  render: function () {
    var app = this.state.app;
    return React.createElement(
      'div',
      { className: 'window' },
      React.createElement(TitleBar, { title: app.title }),
      React.createElement(AppContent, { appState: app }),
      React.createElement(FooterBar, null)
    );
  }
});

ReactDOM.render(React.createElement(WindowsContent, null), document.body);