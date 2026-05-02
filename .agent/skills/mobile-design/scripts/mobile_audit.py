eturn false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PolygonElement = /*#__PURE__*/function (_PolylineElement) {
  _inherits__default["default"](PolygonElement, _PolylineElement);

  var _super = _createSuper$v(PolygonElement);

  function PolygonElement() {
    var _this;

    _classCallCheck__default["default"](this, PolygonElement);

    _this = _super.apply(this, arguments);
    _this.type = 'polygon';
    return _this;
  }

  _createClass__default["default"](PolygonElement, [{
    key: "path",
    value: function path(ctx) {
      var boundingBox = _get__default["default"](_getPrototypeOf__default["default"](PolygonElement.prototype), "path", this).call(this, ctx);

      var _this$points = _slicedToArray__default["default"](this.points, 1),
          _this$points$ = _this$points[0],
          x = _this$points$.x,
          y = _this$points$.y;

      if (ctx) {
        ctx.lineTo(x, y);
        ctx.closePath();
      }

      return boundingBox;
    }
  }]);

  return PolygonElement;
}(PolylineElement);

function _createSuper$u(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$u(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$u() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PatternElement = /*#__PURE__*/function (_Element) {
  _inherits__default["default"](PatternElement, _Element);

  var _super = _createSuper$u(PatternElement);

  function PatternElement() {
    var _this;

    _classCallCheck__default["default"](this, PatternElement);

    _this = _super.apply(this, arguments);
    _this.type = 'pattern';
    return _this;
  }

  _createClass__default["default"](PatternElement, [{
    key: "createPattern",
    value: function createPattern(ctx, _, parentOpacityProp) {
      var width = this.getStyle('width').getPixels('x', true);
      var height = this.getStyle('height').getPixels('y', true); // render me using a temporary svg element

      var patternSvg = new SVGElement(this.document, null);
      patternSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
      patternSvg.attributes.width = new Property(this.document, 'width', "".concat(width, "px"));
      patternSvg.attributes.height = new Property(this.document, 'height', "".concat(height, "px"));
      patternSvg.attributes.transform = new Property(this.document, 'transform', this.getAttribute('patternTransform').getValue());
      patternSvg.children = this.children;
      var patternCanvas = this.document.createCanvas(width, height);
      var patternCtx = patternCanvas.getContext('2d');
      var xAttr = this.getAttribute('x');
      var yAttr = this.getAttribute('y');

      if (xAttr.hasValue() && yAttr.hasValue()) {
        patternCtx.translate(xAttr.getPixels('x', true), yAttr.getPixels('y', true));
      }

      if (parentOpacityProp.hasValue()) {
        this.styles['fill-opacity'] = parentOpacityProp;
      } else {
        Reflect.deleteProperty(this.styles, 'fill-opacity');
      } // render 3x3 grid so when we transform there's no white space on edges


      for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
          patternCtx.save();
          patternSvg.attributes.x = new Property(this.document, 'x', x * patternCanvas.width);
          patternSvg.attributes.y = new Property(this.document, 'y', y * patternCanvas.height);
          patternSvg.render(patternCtx);
          patternCtx.restore();
        }
      }

      var pattern = ctx.createPattern(patternCanvas, 'repeat');
      return pattern;
    }
  }]);

  return PatternElement;
}(Element);

function _createSuper$t(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$t(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$t() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var MarkerElement = /*#__PURE__*/function (_Element) {
  _inherits__default["default"](MarkerElement, _Element);

  var _super = _createSuper$t(MarkerElement);

  function MarkerElement() {
    var _this;

    _classCallCheck__default["default"](this, MarkerElement);

    _this = _super.apply(this, arguments);
    _this.type = 'marker';
    return _this;
  }

  _createClass__default["default"](MarkerElement, [{
    key: "render",
    value: function render(ctx, point, angle) {
      if (!point) {
        return;
      }

      var x = point.x,
          y = point.y;
      var orient = this.getAttribute('orient').getString('auto');
      var markerUnits = this.getAttribute('markerUnits').getString('strokeWidth');
      ctx.translate(x, y);

      if (orient === 'auto') {
        ctx.rotate(angle);
      }

      if (markerUnits === 'strokeWidth') {
        ctx.scale(ctx.lineWidth, ctx.lineWidth);
      }

      ctx.save(); // render me using a temporary svg element

      var markerSvg = new SVGElement(this.document, null);
      markerSvg.type = this.type;
      markerSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
      markerSvg.attributes.refX = new Property(this.document, 'refX', this.getAttribute('refX').getValue());
      markerSvg.attributes.refY = new Property(this.document, 'refY', this.getAttribute('refY').getValue());
      markerSvg.attributes.width = new Property(this.document, 'width', this.getAttribute('markerWidth').getValue());
      markerSvg.attributes.height = new Property(this.document, 'height', this.getAttribute('markerHeight').getValue());
      markerSvg.attributes.overflow = new Property(this.document, 'overflow', this.getAttribute('overflow').getValue());
      markerSvg.attributes.fill = new Property(this.document, 'fill', this.getAttribute('fill').getColor('black'));
      markerSvg.attributes.stroke = new Property(this.document, 'stroke', this.getAttribute('stroke').getValue('none'));
      markerSvg.children = this.children;
      markerSvg.render(ctx);
      ctx.restore();

      if (markerUnits === 'strokeWidth') {
        ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
      }

      if (orient === 'auto') {
        ctx.rotate(-angle);
      }

      ctx.translate(-x, -y);
    }
  }]);

  return MarkerElement;
}(Element);

function _createSuper$s(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$s(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$s() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var DefsElement = /*#__PURE__*/function (_Element) {
  _inherits__default["default"](DefsElement, _Element);

  var _super = _createSuper$s(DefsElement);

  function DefsElement() {
    var _this;

    _classCallCheck__default["default"](this, DefsElement);

    _this = _super.apply(this, arguments);
    _this.type = 'defs';
    return _this;
  }

  _createClass__default["default"](DefsElement, [{
    key: "render",
    value: function render() {// NOOP
    }
  }]);

  return DefsElement;
}(Element);

function _createSuper$r(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$r(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$r() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var GElement = /*#__PURE__*/function (_RenderedElement) {
  _inherits__default["default"](GElement, _RenderedElement);

  var _super = _createSuper$r(GElement);

  function GElement() {
    var _this;

    _classCallCheck__default["default"](this, GElement);

    _this = _super.apply(this, arguments);
    _this.type = 'g';
    return _this;
  }

  _createClass__default["default"](GElement, [{
    key: "getBoundingBox",
    value: function getBoundingBox(ctx) {
      var boundingBox = new BoundingBox();
      this.children.forEach(function (child) {
        boundingBox.addBoundingBox(child.getBoundingBox(ctx));
      });
      return boundingBox;
    }
  }]);

  return GElement;
}(RenderedElement);

function _createSuper$q(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$q(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$q() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var GradientElement = /*#__PURE__*/function (_Element) {
  _inherits__default["default"](GradientElement, _Element);

  var _super = _createSuper$q(GradientElement);

  function GradientElement(document, node, captureTextNodes) {
    var _this;

    _classCallCheck__default["default"](this, GradientElement);

    _this = _super.call(this, document, node, captureTextNodes);
    _this.attributesToInherit = ['gradientUnits'];
    _this.stops = [];

    var _assertThisInitialize = _assertThisInitialized__default["default"](_this),
        stops = _assertThisInitialize.stops,
        children = _assertThisInitialize.children;

    children.forEach(function (child) {
      if (child.type === 'stop') {
        stops.push(child);
      }
    });
    return _this;
  }

  _createClass__default["default"](GradientElement, [{
    key: "getGradientUnits",
    value: function getGradientUnits() {
      return this.getAttribute('gradientUnits').getString('objectBoundingBox');
    }
  }, {
    key: "createGradien{"version":3,"file":"stackblur-es.min.js","sources":["../src/stackblur.js"],"sourcesContent":["/* eslint-disable no-bitwise -- used for calculations */\n/* eslint-disable unicorn/prefer-query-selector -- aiming at\n  backward-compatibility */\n/**\n* StackBlur - a fast almost Gaussian Blur For Canvas\n*\n* In case you find this class useful - especially in commercial projects -\n* I am not totally unhappy for a small donation to my PayPal account\n* mario@quasimondo.de\n*\n* Or support me on flattr:\n* {@link https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript}.\n*\n* @module StackBlur\n* @author Mario Klingemann\n* Contact: mario@quasimondo.com\n* Website: {@link http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html}\n* Twitter: @quasimondo\n*\n* @copyright (c) 2010 Mario Klingemann\n*\n* Permission is hereby granted, free of charge, to any person\n* obtaining a copy of this software and associated documentation\n* files (the \"Software\"), to deal in the Software without\n* restriction, including without limitation the rights to use,\n* copy, modify, merge, publish, distribute, sublicense, and/or sell\n* copies of the Software, and to permit persons to whom the\n* Software is furnished to do so, subject to the following\n* conditions:\n*\n* The above copyright notice and this permission notice shall be\n* included in all copies or substantial portions of the Software.\n*\n* THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\n* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES\n* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\n* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT\n* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\n* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\n* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR\n* OTHER DEALINGS IN THE SOFTWARE.\n*/\n\nconst mulTable = [\n  512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292,\n  512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292,\n  273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259,\n  496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292,\n  282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373,\n  364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259,\n  507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381,\n  374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292,\n  287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461,\n  454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373,\n  368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309,\n  305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259,\n  257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442,\n  437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381,\n  377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332,\n  329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,\n  289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259\n];\n\nconst shgTable = [\n  9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,\n  17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,\n  19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,\n  20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,\n  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,\n  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,\n  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,\n  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,\n  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,\n  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,\n  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,\n  23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,\n  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,\n  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,\n  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,\n  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24\n];\n\n/**\n * @param {string|HTMLImageElement} img\n * @param {string|HTMLCanvasElement} canvas\n * @param {Float} radius\n * @param {boolean} blurAlphaChannel\n * @param {boolean} useOffset\n * @param {boolean} skipStyles\n * @returns {undefined}\n */\nfunction processImage (\n  img, canvas, radius, blurAlphaChannel, useOffset, skipStyles\n) {\n  if (typeof img === 'string') {\n    img = document.getElementById(img);\n  }\n\n  if (\n    !img ||\n    (Object.prototype.toString.call(img).slice(8, -1) ===\n      'HTMLImageElement' && !('naturalWidth' in img))\n  ) {\n    return;\n  }\n\n  const dimensionType = useOffset ? 'offset' : 'natural';\n  let w = img[dimensionType + 'Width'];\n  let h = img[dimensionType + 'Height'];\n\n  // add ImageBitmap support,can blur texture source\n  if (Object.prototype.toString.call(img).slice(8, -1) === 'ImageBitmap') {\n    w = img.width;\n    h = img.height;\n  }\n\n  if (typeof canvas === 'string') {\n    canvas = document.getElementById(canvas);\n  }\n  if (!canvas || !('getContext' in canvas)) {\n    return;\n  }\n\n  if (!skipStyles) {\n    canvas.style.width = w + 'px';\n    canvas.style.height = h + 'px';\n  }\n  canvas.width = w;\n  canvas.height = h;\n\n  const context = canvas.getContext('2d');\n  context.clearRect(0, 0, w, h);\n  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);\n\n  if (isNaN(radius) || radius < 1) { return; }\n\n  if (blurAlphaChannel) {\n    processCanvasRGBA(canvas, 0, 0, w, h, radius);\n  } else {\n    processCanvasRGB(canvas, 0, 0, w, h, radius);\n  }\n}\n\n/**\n * @param {string|HTMLCanvasElement} canvas\n * @param {Integer} topX\n * @param {Integer} topY\n * @param {Integer} width\n * @param {Integer} height\n * @throws {Error|TypeError}\n * @returns {ImageData} See {@link https://html.spec.whatwg.org/multipage/canvas.html#imagedata}\n */\nfunction getImageDataFromCanvas (canvas, topX, topY, width, height) {\n  if (typeof canvas === 'string') {\n    canvas = document.getElementById(canvas);\n  }\n  if (!canvas || typeof canvas !== 'object' || !('getContext' in canvas)) {\n    throw new TypeError(\n      'Expecting canvas with `getContext` method ' +\n            'in processCanvasRGB(A) calls!'\n    );\n  }\n\n  const context = canvas.getContext('2d');\n\n  try {\n    return context.getImageData(topX, topY, width, height);\n  } catch (e) {\n    throw new Error('unable to access image data: ' + e);\n  }\n}\n\n/**\n * @param {HTMLCanvasElement} canvas\n * @param {Integer} topX\n * @param {Integer} topY\n * @param {Integer} width\n * @param {Integer} height\n * @param {Float} radius\n * @returns {undefined}\n */\nfunction processCanvasRGBA (canvas, topX, topY, width, height, radius) {\n  if (isNaN(radius) || radius < 1) { return; }\n  radius |= 0;\n\n  let imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);\n\n  imageData = processImageDataRGBA(\n    imageData, topX, topY, width, height, radius\n  );\n\n  canvas.getContext('2d').putImageData(imageData, topX, topY);\n}\n\n/**\n * @param {ImageData} imageData\n * @param {Integer} topX\n * @param {Integer} topY\n * @param {Integer} width\n * @param {Integer} height\n * @param {Float} radius\n * @returns {ImageData}\n */\nfunction processImageDataRGBA (imageData, topX, topY, width, height, radius) {\n  const pixels = imageData.data;\n\n  const div = 2 * radius + 1;\n  // const w4 = width << 2;\n  const widthMinus1 = width - 1;\n  const heightMinus1 = height - 1;\n  const radiusPlus1 = radius + 1;\n  const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;\n\n  const stackStart = new BlurStack();\n  let stack = stackStart;\n  let stackEnd;\n  for (let i = 1; i < div; i++) {\n    stack = stack.next = new BlurStack();\n    if (i === radiusPlus1) {\n      stackEnd = stack;\n    }\n  }\n  stack.next = stackStart;\n\n  let stackIn = null,\n    stackOut = null,\n    yw = 0,\n    yi = 0;\n\n  const mulSum = mulTable[radius];\n  const shgSum = shgTable[radius];\n\n  for (let y = 0; y < height; y++) {\n    stack = stackStart;\n\n    const pr = pixels[yi],\n      pg = pixels[yi + 1],\n      pb = pixels[yi + 2],\n      pa = pixels[yi + 3];\n\n    for (let i = 0; i < radiusPlus1; i++) {\n      stack.r = pr;\n      stack.g = pg;\n      stack.b = pb;\n      stack.a = pa;\n      stack = stack.next;\n    }\n\n    let rInSum = 0, gInSum = 0, bInSum = 0, aInSum = 0,\n      rOutSum = radiusPlus1 * pr,\n      gOutSum = radiusPlus1 * pg,\n      bOutSum = radiusPlus1 * pb,\n      aOutSum = radiusPlus1 * pa,\n      rSum = sumFactor * pr,\n      gSum = sumFactor * pg,\n      bSum = sumFactor * pb,\n      aSum = sumFactor * pa;\n\n    for (let i = 1; i < radiusPlus1; i++) {\n      const p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);\n\n      const r = pixels[p],\n        g = pixels[p + 1],\n        b = pixels[p + 2],\n        a = pixels[p + 3];\n\n      const rbs = radiusPlus1 - i;\n      rSum += (stack.r = r) * rbs;\n      gSum += (stack.g = g) * rbs;\n      bSum += (stack.b = b) * rbs;\n      aSum += (stack.a = a) * rbs;\n\n      rInSum += r;\n      gInSum += g;\n      bInSum += b;\n      aInSum += a;\n\n      stack = stack.next;\n    }\n\n    stackIn = stackStart;\n    stackOut = stackEnd;\n    for (let x = 0; x < width; x++) {\n      const paInitial = (aSum * mulSum) >>> shgSum;\n      pixels[yi + 3] = paInitial;\n      if (paInitial !== 0) {\n        const a = 255 / paInitial;\n        pixels[yi] = ((rSum * mulSum) >>> shgSum) * a;\n        pixels[yi + 1] = ((gSum * mulSum) >>> shgSum) * a;\n        pixels[yi + 2] = ((bSum * mulSum) >>> shgSum) * a;\n      } else {\n        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;\n      }\n\n      rSum -= rOutSum;\n      gSum -= gOutSum;\n      bSum -= bOutSum;\n      aSum -= aOutSum;\n\n      rOutSum -= stackIn.r;\n      gOutSum -= stackIn.g;\n      bOutSum -= stackIn.b;\n      aOutSum -= stackIn.a;\n\n      let p = x + radius + 1;\n      p = (yw + (p < widthMinus1\n        ? p\n        : widthMinus1)) << 2;\n\n      rInSum += (stackIn.r = pixels[p]);\n      gInSum += (stackIn.g = pixels[p + 1]);\n      bInSum += (stackIn.b = pixels[p + 2]);\n      aInSum += (stackIn.a = pixels[p + 3]);\n\n      rSum += rInSum;\n      gSum += gInSum;\n      bSum += bInSum;\n      aSum += aInSum;\n\n      stackIn = stackIn.next;\n\n      const {r, g, b, a} = stackOut;\n\n      rOutSum += r;\n      gOutSum += g;\n      bOutSum += b;\n      aOutSum += a;\n\n      rInSum -= r;\n      gInSum -= g;\n      bInSum -= b;\n      aInSum -= a;\n\n      stackOut = stackOut.next;\n\n      yi += 4;\n    }\n    yw += width;\n  }\n\n  for (let x = 0; x < width; x++) {\n    yi = x << 2;\n\n    let pr = pixels[yi],\n      pg = pixels[yi + 1],\n      pb = pixels[yi + 2],\n      pa = pixels[yi + 3],\n      rOutSum = radiusPlus1 * pr,\n      gOutSum = radiusPlus1 * pg,\n      bOutSum = radiusPlus1 * pb,\n      aOutSum = radiusPlus1 * pa,\n      rSum = sumFactor * pr,\n      gSum = sumFactor * pg,\n      bSum = sumFactor * pb,\n      aSum = sumFactor * pa;\n\n    stack = stackStart;\n\n    for (let i = 0; i < radiusPlus1; i++) {\n      stack.r = pr;\n      stack.g = pg;\n      stack.b = pb;\n      stack.a = pa;\n      stack = stack.next;\n    }\n\n    let yp = width;\n\n    let gInSum = 0, bInSum = 0, aInSum = 0, rInSum = 0;\n    for (let i = 1; i <= radius; i++) {\n      yi = (yp + x) << 2;\n\n      const rbs = radiusPlus1 - i;\n      rSum += (stack.r = (pr = pixels[yi])) * rbs;\n      gSum += (stack.g = (pg = pixels[yi + 1])) * rbs;\n      bSum += (stack.b = (pb = pixels[yi + 2])) * rbs;\n      aSum += (stack.a = (pa = pixels[yi + 3])) * rbs;\n\n      rInSum += pr;\n      gInSum += pg;\n      bInSum += pb;\n      aInSum += pa;\n\n      stack = stack.next;\n\n      if (i < heightMinus1) {\n        yp += width;\n      }\n    }\n\n    yi = x;\n    stackIn = stackStart;\n    stackOut = stackEnd;\n    for (let y = 0; y < height; y++) {\n      let p = yi << 2;\n      pixels[p + 3] = pa = (aSum * mulSum) >>> shgSum;\n      if (pa > 0) {\n        pa = 255 / pa;\n        pixels[p] = ((rSum * mulSum) >>> shgSum) * pa;\n        pixels[p + 1] = ((gSum * mulSum) >>> shgSum) * pa;\n        pixels[p + 2] = ((bSum * mulSum) >>> shgSum) * pa;\n      } else {\n        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;\n      }\n\n      rSum -= rOutSum;\n      gSum -= gOutSum;\n      bSum -= bOutSum;\n      aSum -= aOutSum;\n\n      rOutSum -= stackIn.r;\n      gOutSum -= stackIn.g;\n      bOutSum -= stackIn.b;\n      aOutSum -= stackIn.a;\n\n      p = (x + (\n        ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) *\n                width\n      )) << 2;\n\n      rSum += (rInSum += (stackIn.r = pixels[p]));\n      gSum += (gInSum += (stackIn.g = pixels[p + 1]));\n      bSum += (bInSum += (stackIn.b = pixels[p + 2]));\n      aSum += (aInSum += (stackIn.a = pixels[p + 3]));\n\n      stackIn = stackIn.next;\n\n      rOutSum += (pr = stackOut.r);\n      gOutSum += (pg = stackOut.g);\n      bOutSum += (pb = stackOut.b);\n      aOutSum += (pa = stackOut.a);\n\n      rInSum -= pr;\n      gInSum -= pg;\n      bInSum -= pb;\n      aInSum -= pa;\n\n      stackOut = stackOut.next;\n\n      yi += width;\n    }\n  }\n  return imageData;\n}\n\n/**\n * @param {HTMLCanvasElement} canvas\n * @param {Integer} topX\n * @param {Integer} topY\n * @param {Integer} width\n * @param {Integer} height\n * @param {Float} radius\n * @returns {undefined}\n */\nfunction processCanvasRGB (canvas, topX, topY, width, height, radius) {\n  if (isNaN(radius) || radius < 1) { return; }\n  radius |= 0;\n\n  let imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);\n  imageData = processImageDataRGB(\n    imageData, topX, topY, width, height, radius\n  );\n\n  canvas.getContext('2d').putImageData(imageData, topX, topY);\n}\n\n/**\n * @param {ImageData} imageData\n * @param {Integer} topX\n * @param {Integer} topY\n * @param {Integer} width\n * @param {Integer} height\n * @param {Float} radius\n * @returns {ImageData}\n */\nfunction processImageDataRGB (imageData, topX, topY, width, height, radius) {\n  const pixels = imageData.data;\n\n  const div = 2 * radius + 1;\n  // const w4 = width << 2;\n  const widthMinus1 = width - 1;\n  const heightMinus1 = height - 1;\n  const radiusPlus1 = radius + 1;\n  const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;\n\n  const stackStart = new BlurStack();\n  let stack = stackStart;\n  let stackEnd;\n  for (let i = 1; i < div; i++) {\n    stack = stack.next = new BlurStack();\n    if (i === radiusPlus1) {\n      stackEnd = stack;\n    }\n  }\n  stack.next = stackStart;\n  let stackIn = null;\n  let stackOut = null;\n\n  const mulSum = mulTable[radius];\n  const shgSum = shgTable[radius];\n\n  let p, rbs;\n  let yw = 0, yi = 0;\n\n  for (let y = 0; y < height; y++) {\n    let pr = pixels[yi],\n      pg = pixels[yi + 1],\n      pb = pixels[yi + 2],\n      rOutSum = radiusPlus1 * pr,\n      gOutSum = radiusPlus1 * pg,\n      bOutSum = radiusPlus1 * pb,\n      rSum = sumFactor * pr,\n      gSum = sumFactor * pg,\n      bSum = sumFactor * pb;\n\n    stack = stackStart;\n\n    for (let i = 0; i < radiusPlus1; i++) {\n      stack.r = pr;\n      stack.g = pg;\n      stack.b = pb;\n      stack = stack.next;\n    }\n\n    let rInSum = 0, gInSum = 0, bInSum = 0;\n    for (let i = 1; i < radiusPlus1; i++) {\n      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);\n      rSum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);\n      gSum += (stack.g = (pg = pixels[p + 1])) * rbs;\n      bSum += (stack.b = (pb = pixels[p + 2])) * rbs;\n\n      rInSum += pr;\n      gInSum += pg;\n      bInSum += pb;\n\n      stack = stack.next;\n    }\n\n    stackIn = stackStart;\n    stackOut = stackEnd;\n    for (let x = 0; x < width; x++) {\n      pixels[yi] = (rSum * mulSum) >>> shgSum;\n      pixels[yi + 1] = (gSum * mulSum) >>> shgSum;\n      pixels[yi + 2] = (bSum * mulSum) >>> shgSum;\n\n      rSum -= rOutSum;\n      gSum -= gOutSu          attributes
        } = currentNode;
        /* Check if we have attributes; if not we might have a text node */
        if (!attributes || _isClobbered(currentNode)) {
          return;
        }
        const hookEvent = {
          attrName: '',
          attrValue: '',
          keepAttr: true,
          allowedAttributes: ALLOWED_ATTR,
          forceKeepAttr: undefined
        };
        let l = attributes.length;
        /* Go backwards over all attributes; safely remove bad ones */
        while (l--) {
          const attr = attributes[l];
          const {
            name,
            namespaceURI,
            value: attrValue
          } = attr;
          const lcName = transformCaseFunc(name);
          const initValue = attrValue;
          let value = name === 'value' ? initValue : stringTrim(initValue);
          /* Execute a hook if present */
          hookEvent.attrName = lcName;
          hookEvent.attrValue = value;
          hookEvent.keepAttr = true;
          hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
          _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
          value = hookEvent.attrValue;
          /* Full DOM Clobbering protection via namespace isolation,
           * Prefix id and name attributes with `user-content-`
           */
          if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name') && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
            // Remove the attribute with this value
            _removeAttribute(name, currentNode);
            // Prefix the value and later re-create the attribute with the sanitized value
            value = SANITIZE_NAMED_PROPS_PREFIX + value;
          }
          // Else: already prefixed, leave the attribute alone — the prefix is
          // itself the clobbering protection, and re-applying it is incorrect.
          /* Work around a security issue with comments inside attributes */
          if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) {
            _removeAttribute(name, currentNode);
            continue;
          }
          /* Make sure we cannot easily use animated hrefs, even if animations are allowed */
          if (lcName === 'attributename' && stringMatch(value, 'href')) {
            _removeAttribute(name, currentNode);
            continue;
          }
          /* Did the hooks approve of the attribute? */
          if (hookEvent.forceKeepAttr) {
            continue;
          }
          /* Did the hooks approve of the attribute? */
          if (!hookEvent.keepAttr) {
            _removeAttribute(name, currentNode);
            continue;
          }
          /* Work around a security issue in jQuery 3.0 */
          if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
            _removeAttribute(name, currentNode);
            continue;
          }
          /* Sanitize attribute content to be template-safe */
          if (SAFE_FOR_TEMPLATES) {
            arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
              value = stringReplace(value, expr, ' ');
            });
          }
          /* Is `value` valid for this attribute? */
          const lcTag = transformCaseFunc(currentNode.nodeName);
          if (!_isValidAttribute(lcTag, lcName, value)) {
            _removeAttribute(name, currentNode);
            continue;
          }
          /* Handle attributes that require Trusted Types */
          if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
            if (namespaceURI) ; else {
              switch (trustedTypes.getAttributeType(lcTag, lcName)) {
                case 'TrustedHTML':
                  {
                    value = trustedTypesPolicy.createHTML(value);
                    break;
                  }
                case 'TrustedScriptURL':
                  {
                    value = trustedTypesPolicy.createScimport { applyUnfilter } from './applyUnfilter';
const uint16 = new Uint16Array([0x00ff]);
const uint8 = new Uint8Array(uint16.buffer);
const osIsLittleEndian = uint8[0] === 0xff;
/**
 * Decodes the Adam7 interlaced PNG data.
 *
 * @param params - DecodeInterlaceNullParams
 * @returns - array of pixel data.
 */
export function decodeInterlaceAdam7(params) {
    const { data, width, height, channels, depth } = params;
    // Adam7 interlacing pattern
    const passes = [
        { x: 0, y: 0, xStep: 8, yStep: 8 }, // Pass 1
        { x: 4, y: 0, xStep: 8, yStep: 8 }, // Pass 2
        { x: 0, y: 4, xStep: 4, yStep: 8 }, // Pass 3
        { x: 2, y: 0, xStep: 4, yStep: 4 }, // Pass 4
        { x: 0, y: 2, xStep: 2, yStep: 4 }, // Pass 5
        { x: 1, y: 0, xStep: 2, yStep: 2 }, // Pass 6
        { x: 0, y: 1, xStep: 1, yStep: 2 }, // Pass 7
    ];
    const bytesPerPixel = Math.ceil(depth / 8) * channels;
    const resultData = new Uint8Array(height * width * bytesPerPixel);
    let offset = 0;
    // Process each pass
    for (let passIndex = 0; passIndex < 7; passIndex++) {
        const pass = passes[passIndex];
        // Calculate pass dimensions
        const passWidth = Math.ceil((width - pass.x) / pass.xStep);
        const passHeight = Math.ceil((height - pass.y) / pass.yStep);
        if (passWidth <= 0 || passHeight <= 0)
            continue;
        const passLineBytes = passWidth * bytesPerPixel;
        const prevLine = new Uint8Array(passLineBytes);
        // Process each scanline in this pass
        for (let y = 0; y < passHeight; y++) {
            // First byte is the filter type
            const filterType = data[offset++];
            const currentLine = data.subarray(offset, offset + passLineBytes);
            offset += passLineBytes;
            // Create a new line for the unfiltered data
            const newLine = new Uint8Array(passLineBytes);
            // Apply the appropriate unfilter
            applyUnfilter(filterType, currentLine, newLine, prevLine, passLineBytes, bytesPerPixel);
            prevLine.set(newLine);
            for (let x = 0; x < passWidth; x++) {
                const outputX = pass.x + x * pass.xStep;
                const outputY = pass.y + y * pass.yStep;
                if (outputX >= width || outputY >= height)
                    continue;
                for (let i = 0; i < bytesPerPixel; i++) {
                    resultData[(outputY * width + outputX) * bytesPerPixel + i] =
                        newLine[x * bytesPerPixel + i];
                }
            }
        }
    }
    if (depth === 16) {
        const uint16Data = new Uint16Array(resultData.buffer);
        if (osIsLittleEndian) {
            for (let k = 0; k < uint16Data.length; k++) {
                // PNG is always big endian. Swap the bytes.
                uint16Data[k] = swap16(uint16Data[k]);
            }
        }
        return uint16Data;
    }
    else {
        return resultData;
    }
}
function swap16(val) {
    return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}
//# sourceMappingURL=decodeInterlaceAdam7.js.map                                                                                                   