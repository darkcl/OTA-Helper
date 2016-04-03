'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _attrAccept = require('attr-accept');

var _attrAccept2 = _interopRequireDefault(_attrAccept);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var supportMultiple = typeof document !== 'undefined' && document && document.createElement ? 'multiple' in document.createElement('input') : true;

var Dropzone = (function (_React$Component) {
  _inherits(Dropzone, _React$Component);

  function Dropzone(props, context) {
    _classCallCheck(this, Dropzone);

    _React$Component.call(this, props, context);
    this.onClick = this.onClick.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      isDragActive: false
    };
  }

  Dropzone.prototype.componentDidMount = function componentDidMount() {
    this.enterCounter = 0;
  };

  Dropzone.prototype.allFilesAccepted = function allFilesAccepted(files) {
    var _this = this;

    return files.every(function (file) {
      return _attrAccept2['default'](file, _this.props.accept);
    });
  };

  Dropzone.prototype.onDragEnter = function onDragEnter(e) {
    e.preventDefault();

    // Count the dropzone and any children that are entered.
    ++this.enterCounter;

    // This is tricky. During the drag even the dataTransfer.files is null
    // But Chrome implements some drag store, which is accesible via dataTransfer.items
    var dataTransferItems = e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];

    // Now we need to convert the DataTransferList to Array
    var allFilesAccepted = this.allFilesAccepted(Array.prototype.slice.call(dataTransferItems));

    this.setState({
      isDragActive: allFilesAccepted,
      isDragReject: !allFilesAccepted
    });

    if (this.props.onDragEnter) {
      this.props.onDragEnter.call(this, e);
    }
  };

  Dropzone.prototype.onDragOver = function onDragOver(e) {
    e.preventDefault();
  };

  Dropzone.prototype.onDragLeave = function onDragLeave(e) {
    e.preventDefault();

    // Only deactivate once the dropzone and all children was left.
    if (--this.enterCounter > 0) {
      return;
    }

    this.setState({
      isDragActive: false,
      isDragReject: false
    });

    if (this.props.onDragLeave) {
      this.props.onDragLeave.call(this, e);
    }
  };

  Dropzone.prototype.onDrop = function onDrop(e) {
    e.preventDefault();

    // Reset the counter along with the drag on a drop.
    this.enterCounter = 0;

    this.setState({
      isDragActive: false,
      isDragReject: false
    });

    var droppedFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    var max = this.props.multiple ? droppedFiles.length : 1;
    var files = [];

    for (var i = 0; i < max; i++) {
      var file = droppedFiles[i];
      // We might want to disable the preview creation to support big files
      if (!this.disablePreview) {
        file.preview = window.URL.createObjectURL(file);
      }
      files.push(file);
    }

    if (this.props.onDrop) {
      this.props.onDrop.call(this, files, e);
    }

    if (this.allFilesAccepted(files)) {
      if (this.props.onDropAccepted) {
        this.props.onDropAccepted.call(this, files, e);
      }
    } else {
      if (this.props.onDropRejected) {
        this.props.onDropRejected.call(this, files, e);
      }
    }
  };

  Dropzone.prototype.onClick = function onClick() {
    if (!this.props.disableClick) {
      this.open();
    }
  };

  Dropzone.prototype.open = function open() {
    var fileInput = this.refs.fileInput;
    fileInput.value = null;
    fileInput.click();
  };

  Dropzone.prototype.render = function render() {
    var className = undefined,
        style = undefined,
        activeStyle = undefined,
        rejectStyle = undefined;

    className = this.props.className || '';

    if (this.state.isDragActive && this.props.activeClassName) {
      className += ' ' + this.props.activeClassName;
    }
    if (this.state.isDragReject && this.props.rejectClassName) {
      className += ' ' + this.props.rejectClassName;
    }

    if (this.props.style || this.props.activeStyle || this.props.rejectStyle) {
      if (this.props.style) {
        style = this.props.style;
      }
      if (this.props.activeStyle) {
        activeStyle = this.props.activeStyle;
      }
      if (this.props.rejectStyle) {
        rejectStyle = this.props.rejectStyle;
      }
    } else if (!className) {
      style = {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: '#666',
        borderStyle: 'dashed',
        borderRadius: 5
      };
      activeStyle = {
        borderStyle: 'solid',
        backgroundColor: '#eee'
      };
      rejectStyle = {
        borderStyle: 'solid',
        backgroundColor: '#ffdddd'
      };
    }

    var appliedStyle = undefined;
    if (activeStyle && this.state.isDragActive) {
      appliedStyle = _extends({}, style, activeStyle);
    } else if (rejectStyle && this.state.isDragReject) {
      appliedStyle = _extends({}, style, rejectStyle);
    } else {
      appliedStyle = _extends({}, style);
    }

    var inputAttributes = {
      type: 'file',
      style: { display: 'none' },
      ref: 'fileInput',
      accept: this.props.accept,
      onChange: this.onDrop
    };

    supportMultiple && (inputAttributes.multiple = this.props.multiple);
    this.props.name && (inputAttributes.name = this.props.name);

    return _react2['default'].createElement(
      'div',
      {
        className: className,
        style: appliedStyle,
        onClick: this.onClick,
        onDragEnter: this.onDragEnter,
        onDragOver: this.onDragOver,
        onDragLeave: this.onDragLeave,
        onDrop: this.onDrop
      },
      this.props.children,
      _react2['default'].createElement('input', inputAttributes)
    );
  };

  return Dropzone;
})(_react2['default'].Component);

Dropzone.defaultProps = {
  disablePreview: false,
  disableClick: false,
  multiple: true
};

Dropzone.propTypes = {
  onDrop: _react2['default'].PropTypes.func,
  onDropAccepted: _react2['default'].PropTypes.func,
  onDropRejected: _react2['default'].PropTypes.func,
  onDragEnter: _react2['default'].PropTypes.func,
  onDragLeave: _react2['default'].PropTypes.func,

  style: _react2['default'].PropTypes.object,
  activeStyle: _react2['default'].PropTypes.object,
  rejectStyle: _react2['default'].PropTypes.object,
  className: _react2['default'].PropTypes.string,
  activeClassName: _react2['default'].PropTypes.string,
  rejectClassName: _react2['default'].PropTypes.string,

  disablePreview: _react2['default'].PropTypes.bool,
  disableClick: _react2['default'].PropTypes.bool,
  multiple: _react2['default'].PropTypes.bool,
  accept: _react2['default'].PropTypes.string,
  name: _react2['default'].PropTypes.string
};

exports['default'] = Dropzone;
module.exports = exports['default'];