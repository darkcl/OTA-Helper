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

var SideBar = React.createClass({
  displayName: "SideBar",

  render: function () {
    return React.createElement(
      "div",
      { className: "pane pane-sm sidebar" },
      React.createElement(
        "nav",
        { className: "nav-group" },
        React.createElement(
          "h5",
          { className: "nav-group-title" },
          "Favorites"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-home" }),
          "connors"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item active" },
          React.createElement("span", { className: "icon icon-light-up" }),
          "Photon"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-download" }),
          "Downloads"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-folder" }),
          "Documents"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-window" }),
          "Applications"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-signal" }),
          "AirDrop"
        ),
        React.createElement(
          "span",
          { className: "nav-group-item" },
          React.createElement("span", { className: "icon icon-monitor" }),
          "Desktop"
        )
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
        "table",
        { className: "table-striped" },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "th",
              null,
              "Name"
            ),
            React.createElement(
              "th",
              null,
              "Kind"
            ),
            React.createElement(
              "th",
              null,
              "Date Modified"
            ),
            React.createElement(
              "th",
              null,
              "Author"
            )
          )
        ),
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "bars.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "base.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "button-groups.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "buttons.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "docs.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "forms.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "grid.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "icons.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "images.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "lists.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "mixins.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "navs.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "normalize.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "photon.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "tables.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "tabs.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "utilities.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              null,
              "variables.scss"
            ),
            React.createElement(
              "td",
              null,
              "Document"
            ),
            React.createElement(
              "td",
              null,
              "Oct 13, 2015"
            ),
            React.createElement(
              "td",
              null,
              "connors"
            )
          )
        )
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
        React.createElement(SideBar, null),
        React.createElement(MainContent, null)
      )
    );
  }
});

var WindowsContent = React.createClass({
  displayName: "WindowsContent",

  render: function () {
    return React.createElement(
      "div",
      null,
      React.createElement(TitleBar, null),
      React.createElement(AppContent, null)
    );
  }
});

ReactDOM.render(React.createElement(WindowsContent, null), document.getElementById('content'));