var data = [{ id: 1, author: "Pete Hunt", text: "This is one comment" }, { id: 2, author: "Jordan Walke", text: "This is *another* comment" }];

var fs = require('fs');
var plist = require('plist');

var obj = plist.parse(fs.readFileSync(__dirname + '/data/test.plist', 'utf8'));
console.log(JSON.stringify(obj));

var TitleBar = React.createClass({
  displayName: "TitleBar",

  render: function () {
    return React.createElement(
      "header",
      { className: "toolbar toolbar-header" },
      React.createElement(
        "h1",
        { className: "title" },
        "OTA Helper"
      )
    );
  }
});

var SideBarItem = React.createClass({
  displayName: "SideBarItem",

  render: function () {
    return React.createElement(
      "span",
      { className: "nav-group-item" },
      React.createElement("span", { className: "icon icon-folder" }),
      this.props.itemName
    );
  }
});

var SideBar = React.createClass({
  displayName: "SideBar",

  render: function () {
    var itemNodes = Object.keys(this.props.data).map(function (projects) {
      console.log(projects);
      return React.createElement(SideBarItem, { itemName: projects });
    });
    return React.createElement(
      "div",
      { className: "pane pane-sm sidebar" },
      React.createElement(
        "nav",
        { className: "nav-group" },
        React.createElement(
          "h5",
          { className: "nav-group-title" },
          "Projects"
        ),
        itemNodes
      )
    );
  }
});

var MainContent = React.createClass({
  displayName: "MainContent",

  render: function () {
    return React.createElement(
      "div",
      { className: "pane" },
      React.createElement(
        "h1",
        null,
        "Project Settings"
      )
    );
  }
});

var AppContent = React.createClass({
  displayName: "AppContent",

  render: function () {
    return React.createElement(
      "div",
      { className: "window-content" },
      React.createElement(
        "div",
        { className: "pane-group" },
        React.createElement(SideBar, { data: obj["saveInfo_projects"] }),
        React.createElement(MainContent, null)
      )
    );
  }
});

var FooterBar = React.createClass({
  displayName: "FooterBar",

  render: function () {
    return React.createElement(
      "footer",
      { className: "toolbar toolbar-footer" },
      React.createElement(
        "div",
        { className: "toolbar-actions" },
        React.createElement(
          "button",
          { className: "btn btn-primary" },
          "Add"
        )
      )
    );
  }
});

var WindowsContent = React.createClass({
  displayName: "WindowsContent",

  render: function () {
    return React.createElement(
      "div",
      { className: "window" },
      React.createElement(TitleBar, null),
      React.createElement(AppContent, null),
      React.createElement(FooterBar, null)
    );
  }
});

ReactDOM.render(React.createElement(WindowsContent, null), document.body);