s[name] = style[name];
                this.stylesSpecificity[name] = specificity;
              }
            }
          }
        }
      }
    }
  }, {
    key: "removeStyles",
    value: function removeStyles(element, ignoreStyles) {
      var toRestore = ignoreStyles.reduce(function (toRestore, name) {
        var styleProp = element.getStyle(name);

        if (!styleProp.hasValue()) {
          return toRestore;
        }

        var value = styleProp.getString();
        styleProp.setValue('');
        return [].concat(_toConsumableArray__default["default"](toRestore), [[name, value]]);
      }, []);
      return toRestore;
    }
  }, {
    key: "restoreStyles",
    value: function restoreStyles(element, styles) {
      styles.forEach(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
            name = _ref2[0],
            value = _ref2[1];

        element.getStyle(name, true).setValue(value);
      });
    }
  }, {
    key: "isFirstChild",
    value: function isFirstChild() {
      var _this$parent;

      return ((_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.children.indexOf(this)) === 0;
    }
  }]);

  return Element;
}();
Element.ignoreChildTypes = ['title'];

function _createSuper$J(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$J(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$J() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var UnknownElement = /*#__PURE__*/function (_Element) {
  _inherits__default["default"](UnknownElement, _Element);

  var _super = _createSuper$J(UnknownElement);

  function UnknownElement(document, node, captureTextNodes) {
    var _this;

    _classCallCheck__default["default"](this, UnknownElement);

    _this = _super.call(this