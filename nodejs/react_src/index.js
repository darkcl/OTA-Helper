var data = [
  {id: 1, author: "Pete Hunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
];

var fs = require('fs');
var plist = require('plist');

var obj = plist.parse(fs.readFileSync(__dirname +'/data/test.plist', 'utf8'));
console.log(JSON.stringify(obj));

var TitleBar = React.createClass({
  render: function() {
    return (
      <header className="toolbar toolbar-header">
        <h1 className="title">OTA Helper</h1>
      </header>
    );
  }
});

var SideBarItem = React.createClass({
  render: function() {
    return (
      <span className="nav-group-item">
        <span className="icon icon-folder"></span>
        {this.props.itemName}
      </span>
    )
  }
})

var SideBar = React.createClass({
  render: function() {
    var itemNodes = Object.keys(this.props.data).map(function(projects) {
      console.log(projects);
      return (
        <SideBarItem itemName = {projects}/>
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

var MainContent = React.createClass({
  render: function () {
    return (
      <div className="pane">
            <h1>Project Settings</h1>
          </div>
    )
  }
});

var AppContent = React.createClass({
  render: function() {
    return (
      <div className="window-content">
        <div className="pane-group">
          <SideBar data={obj["saveInfo_projects"]}/>
          <MainContent />
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
  render : function() {
    return (
      <div className="window">
        <TitleBar />
        <AppContent />
        <FooterBar />
      </div>
    )
  }
})



ReactDOM.render(
  <WindowsContent />,
  document.body
);