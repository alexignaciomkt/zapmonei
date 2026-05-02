t,
            segment = _this2$findSegmentToF.segment,
            rotation = _this2$findSegmentToF.rotation;

        offset = nextOffset;

        if (!segment.p0 || !segment.p1) {
          return;
        } // const width = this.getLineLength(
        // 	segment.p0.x,
        // 	segment.p0.y,
        // 	segment.p1.x,
        // 	segment.p1.y
        // );
        // Note: Since glyphs are rendered one at a time, any kerning pair data built into the font will not be used.
        // Can foresee having a rough pair table built in that the developer can override as needed.
        // Or use "dx" attribute of the <text> node as a naive replacement
        // const kern = 0;
        // placeholder for future implementation
        // const midpoint = this.getPointOnLine(
        // 	kern + width / 2.0,
        // 	segment.p0.x, segment.p0.y, segment.p1.x, segment.p1.y
        // );


        _this2.glyphInfo.push({
          // transposeX: midpoint.x,
          // transposeY: midpoint.y,
          text: chars[i],
          p0: segment.p0,
          p1: segment.p1,
          rotation: rotation
        });
      });
    }
  }, {
    key: "parsePathData",
    value: function parsePathData(path) {
      this.pathLength = -1; // reset path length

      if (!path) {
        return [];
      }

      var pathCommands = [];
      var pathParser = path.pathParser;
      pathParser.reset(); // convert l, H, h, V, and v to L

      while (!pathParser.isEnd()) {
        var current = pathParser.current;
        var startX = current ? current.x : 0;
        var startY = current ? current.y : 0;
        var command = pathParser.next();
        var nextCommandType = command.type;
        var points = [];

        switch (command.type) {
          case PathParser.MOVE_TO:
            this.pathM(pathParser, points);
            break;

          case PathParser.LINE_TO:
            nextCommandType = this.pathL(pathParser, points);
            break;

          case PathParser.HORIZ_LINE_TO:
            nextCommandType = this.pathH(pathParser, points);
            break;

          case PathParser.VERT_LINE_TO:
            nextCommandType = this.pathV(pathParser, points);
            break;

          case PathParser.CURVE_TO:
            this.pathC(pathParser, points);
            break;

          case PathParser.SMOOTH_CURVE_TO:
            nextCommandType = this.pathS(pathParser, points);
            break;

          case PathParser.QUAD_TO:
            this.pathQ(pathParser, points);
            break;

          case PathParser.SMOOTH_QUAD_TO:
            nextCommandType = this.pathT(pathParser, points);
            break;

          case PathParser.ARC:
            points = this.pathA(pathParser);
            break;

          case PathParser.CLOSE_PATH:
            PathElement.pathZ(pathParser);
            break;
        }

        if (command.type !== PathParser.CLOSE_PATH) {
          pathCommands.push({
            type: nextCommandType,
            points: points,
            start: {
              x: startX,
              y: startY
            },
            pathLength: this.calcLength(startX, startY, nextCommandType, points)
          });
        } else {
          pathCommands.push({
            type: PathParser.CLOSE_PATH,
            points: [],
            pathLength: 0
          });
        }
      }

      return pathCommands;
    }
  }, {
    key: "pathM",
    value: function pathM(pathParser, points) {
      var _PathElement$pathM$po = PathElement.pathM(pathParser).point,
          x = _PathElement$pathM$po.x,
          y = _PathElement$pathM$po.y;
      points.push(x, y);
    }
  }, {
    key: "pathL",
    value: function pathL(pathParser, points) {
      var _PathElement$pathL$po = PathElement.pathL(pathParser).point,
          x = _PathElement$pathL$po.x,
          y = _PathElement$pathL$po.y;
      points.push(x, y);
      return PathParser.LINE_TO;
    }
  }, {
    key: "pathH",
    value: function pathH(pathParser, points) {
      var _PathElement$pathH$po = PathElement.pathH(pathParser).point,
          x = _PathElement$pathH$po.x,
          y = _PathElement$pathH$po.y;
      points.push(x, y);
      return PathParser.LINE_TO;
    }
  }, {
    key: "pathV",
    value: function pathV(pathParser, points) {
      var _PathElement$pathV$po = PathElement.pathV(pathParser).point,
          x = _PathElement$pathV$po.x,
          y = _PathElement$pathV$po.y;
      points.push(x, y);
      return PathParser.LINE_TO;
    }
  }, {
    key: "pathC",
    value: function pathC(pathParser, points) {
      var _PathElement$pathC = PathElement.pathC(pathParser),
          point = _PathElement$pathC.point,
          controlPoint = _PathElement$pathC.controlPoint,
          currentPoint = _PathElement$pathC.currentPoint;

      points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
  }, {
    key: "pathS",
    value: function pathS(pathParser, points) {
      var _PathElement$pathS = PathElement.pathS(pathParser),
          point = _PathElement$pathS.point,
          controlPoint = _PathElement$pathS.controlPoint,
          currentPoint = _PathElement$pathS.currentPoint;

      points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
      return PathParser.CURVE_TO;
    }
  }, {
    key: "pathQ",
    value: function pathQ(pathParser, points) {
      var _PathElement$pathQ = PathElement.pathQ(pathParser),
          controlPoint = _PathElement$pathQ.controlPoint,
          currentPoint = _PathElement$pathQ.currentPoint;

      points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
  }, {
    key: "pathT",
    value: function pathT(pathParser, points) {
      var _PathElement$pathT = PathElement.pathT(pathParser),
          controlPoint = _PathElement$pathT.controlPoint,
          currentPoint = _PathElement$pathT.currentPoint;

      points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
      return PathParser.QUAD_TO;
    }
  }, {
    key: "pathA",
    value: function pathA(pathParser) {
      var _PathElement$pathA = PathElement.pathA(pathParser),
          rX = _PathElement$pathA.rX,
          rY = _PathElement$pathA.rY,
          sweepFlag = _PathElement$pathA.sweepFlag,
          xAxisRotation = _PathElement$pathA.xAxisRotation,
          centp = _PathElement$pathA.centp,
          a1 = _PathElement$pathA.a1,
          ad = _PathElement$pathA.ad;

      if (sweepFlag === 0 && ad > 0) {
        ad -= 2 * Math.PI;
      }

      if (sweepFlag === 1 && ad < 0) {
        ad += 2 * Math.PI;
      }

      return [centp.x, centp.y, rX, rY, a1, ad, xAxisRotation, sweepFlag];
    }
  }, {
    key: "calcLength",
    value: function calcLength(x, y, commandType, points) {
      var len = 0;
      var p1 = null;
      var p2 = null;
      var t = 0;

      switch (commandType) {
        case PathParser.LINE_TO:
          return this.getLineLength(x, y, points[0], points[1]);

        case PathParser.CURVE_TO:
          // Approximates by breaking curve into 100 line segments
          len = 0.0;
          p1 = this.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);

          for (t = 0.01; t <= 1; t += 0.01) {
            p2 = this.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }

          return len;

        case PathParser.QUAD_TO:
          // Approximates by breaking curve into 100 line segments
          len = 0.0;
          p1 = this.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);

          for (t = 0.01; t <= 1; t += 0.01) {
            p2 = this.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }

          return len;

        case PathParser.ARC:
          {
            // Approximates by breaking curve into line segments
            len = 0.0;
            vINDX( 	 ≥‡            (     Ë       a                     [◊    p `     ù    
 ºø⁄÷Å’‹˚%Ù÷Å’‹˚%Ù÷Å’‹ÜÌNÈ≥’‹ P      GL               s t a c k b l u r - e s . j s r◊    x h     ù    
 è◊Å’‹>Æ◊Å’‹>Æ◊Å’‹ñ∑◊Å’‹        ·               s t a c k b l u r - e s . m i n . j s ®◊    Ä p     ù    
 ˛ü◊Å’‹√Æ◊Å’‹√Æ◊Å’‹¨Æ◊Å’‹ Ä      Ï}               s t a c k b l u r - e s . m i n . j s . m a p Ç◊    p Z     ù    
 *Ü+◊Å’‹É37◊Å’‹É37◊Å’‹É37◊Å’‹ `      qR               s t  c k b l u r . j s       ö◊    x b     ù    
 ¸e◊Å’‹ˆ∑l◊Å’‹ˆ∑l◊Å’‹+èl◊Å’‹        Ú               s t a c k b l u r . m i n . j s       ∏◊    Ä j     ù    
 ´e∆◊Å’‹3G‡◊Å’‹3G‡◊Å’‹0å‘◊Å’‹ Ä      Œ}               s t a c k b l u r . m i n . j s . m a p                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              intLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),F=i(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),H=i(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),B=i(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),G=i(["#text"]),W=i(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),j=i(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Y=i(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),X=i(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),q=a(/\{\{[\w\W]*|[\w\W]*\}\}/gm),$=a(/<%[\w\W]*|[\w\W]*%>/gm),K=a(/\$\{[\w\W]*/gm),V=a(/^data-[\-\w.\u00B7-\uFFFF]+$/),Z=a(/^aria-[\-\w]+$/),J=a(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Q=a(/^(?:\w+script|data):/i),ee=a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),te=a(/^html$/i),ne=a(/^[a-z][.\w]*(-[.\w]+)+$/i);var oe=Object.freeze({__proto__:null,ARIA_ATTR:Z,ATTR_WHITESPACE:ee,CUSTOM_ELEMENT:ne,DATA_ATTR:V,DOCTYPE_NAME:te,ERB_EXPR:$,IS_ALLOWED_URI:J,IS_SCRIPT_OR_DATA:Q,MUSTACHE_EXPR:q,TMPLIT_EXPR:K});const re=1,ie=3,ae=7,le=8,ce=9,se=function(){return"undefined"==typeof window?null:window};var ue=function t(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:se();const o=e=>t(e);if(o.version="3.4.1",o.removed=[],!n||!n.document||n.document.nodeType!==ce||!n.Element)return o.isSupported=!1,o;let{document:r}=n;const a=r,c=a.currentScript,{DocumentFragment:s,HTMLTemplateElement:C,Node:L,Element:x,NodeFilter:q,NamedNodeMap:$=n.NamedNodeMap||n.MozNamedAttrMap,HTMLFormElement:K,DOMParser:V,trustedTypes:Z}=n,Q=x.prototype,ee=M(Q,"cloneNode"),ne=M(Q,"remove"),ue=M(Q,"nextSibling"),me=M(Q,"childNodes"),fe=M(Q,"parentNode");if("function"==typeof C){const e=r.createElement("template");e.content&&e.content.ownerDocument&&(r=e.content.ownerDocument)}let pe,de="";const{implementation:he,createNodeIterator:Te,createDocumentFragment:ge,getElementsByTagName:ye}=r,{importNode:Ae}=a;let Ee={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};o.isSupported="function"==typeof e&&"function"==typeof fe&&he&&void 0!==he.createHTMLDocument;const{MUSTACHE_EXPR:_e,ERB_EXPR:Se,TMPLIT_EXPR:be,DATA_ATTR:Ne,ARIA_ATTR:Re,IS_SCRIPT_OR_DATA:De,ATTR_WHITESPACE:Oe,CUSTOM_ELEMENT:Ie}=oe;let{IS_ALLOWED_URI:we}=oe,Ce=null;const Le=k({},[...P,...U,...z,...H,...G]);let ke=null;const xe=k({},[...W,...j,...Y,...X]);let ve=Object.seal(l(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Me=null,Pe=null;const Ue=Object.seal(l(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let ze=!0,Fe=!0,He=!1,Be=!0,Ge=!1,We=!0,je=!1,Ye=!1,Xe=!1,qe=!1,$e=!1,Ke=!1,Ve=!0,Ze=!1;const Je="user-content-";let Qe=!0,et=!1,tt={},nt=null;const ot=k({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let rt=null;const it=k({},["audio","video","img","source","image","track"]);let at=null;const lt=k({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),ct="http://www.w3.org/1998/Math/MathML",st="http://www.w3.org/2000/svg",ut="http://www.w3.org/1999/xhtml";let mt=ut,ft=!1,pt=null;const dt=k({},[ct,st,ut],g);let ht=k({},["mi","mo","mn","ms","mtext"]),Tt=k({},["annotation-xml"]);const gt=k({},["title","style","font","a","script"]);let yt=null;const At=["application/xhtml+xml","text/html"];let Et=null,_t=null;const St=r.createElement("form"),bt=function(e){return e instanceof RegExp||e instanceof Function},Nt=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(_t&&_t===e)return;e&&"object"==typeof e||(e={}),e=v(e),yt=-1===At.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,Et="application/xhtml+xml"===yt?g:T,Ce=D(e,"ALLOWED_TAGS")&&h(e.ALLOWED_TAGS)?k({},e.ALLOWED_TAGS,Et):Le,ke=D(e,"ALLOWED_ATTR")&&h(e.ALLOWED_ATTR)?k({},e.ALLOWED_ATTR,Et):xe,pt=D(e,"ALLOWED_NAMESPACES")&&h(e.ALLOWED_NAMESPACES)?k({},e.ALLOWED_NAMESPACES,g):dt,at=D(e,"ADD_URI_SAFE_ATTR")&&h(e.ADD_URI_SAFE_ATTR)?k(v(lt),e.ADD_URI_SAFE_ATTR,Et):lt,rt=D(e,"ADD_DATA_URI_TAGS")&&h(e.ADD_DATA_URI_TAGS)?k(v(it),e.ADD_DATA_URI_TAGS,Et):it,nt=D(e,"FORBID_CONTENTS")&&h(e.FORBID_CONTENTS)?k({},e.FORBID_CONTENTS,Et):ot,Me=D(e,"FORBID_TAGS")&&h(e.FORBID_TAGS)?k({},e.FORBID_TAGS,Et):v({}),Pe=D(e,"FORBID_ATTR")&&h(e.FORBID_ATTR)?k({},e.FORBID_ATTR,Et):v({}),tt=!!D(e,"USE_PROFILES")&&(e.USE_PROFILES&&"object"==typeof e.USE_PROFILES?v(e.USE_PROFILES):e.USE_PROFILES),ze=!1!==e.ALLOW_ARIA_ATTR,Fe=!1!==e.ALLOW_DATA_ATTR,He=e.ALLOW_UNKNOWN_PROTOCOLS||!1,Be=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,Ge=e.SAFE_FOR_TEMPLATES||!1,We=!1!==e.SAFE_FOR_XML,je=e.WHOLE_DOCUMENT||!1,qe=e.RETURN_DOM||!1,$e=e.RETURN_DOM_FRAGMENT||!1,Ke=e.RETURN_TRUSTED_TYPE||!1,Xe=e.FORCE_BODY||!1,Ve=!1!==e.SANITIZE_DOM,Ze=e.SANITIZE_NAMED_PROPS||!1,Qe=!1!==e.KEEP_CONTENT,et=e.IN_PLACE||!1,we=function(e){try{return I(e,""),!0}catch(e){return!1}}(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:J,mt="string"==typeof e.NAMESPACE?e.NAMESPACE:ut,ht=D(e,"MATHML_TEXT_INTEGRATION_POINTS")&&e.MATHML_TEXT_INTEGRATION_POINTS&&"object"==typeof e.MATHML_TEXT_INTEGRATION_POINTS?v(e.MATHML_TEXT_INTEGRATION_POINTS):k({},["mi","mo","mn","ms","mtext"]),Tt=D(e,"HTML_INTEGRATION_POINTS")&&e.HTML_INTEGRATION_POINTS&&"object"==typeof e.HTML_INTEGRATION_POINTS?v(e.HTML_INTEGRATION_POINTS):k({},["annotation-xml"]);const t=D(e,"CUSTOM_ELEMENT_HANDLING")&&e.CUSTOM_ELEMENT_HANDLING&&"object"==typeof e.CUSTOM_ELEMENT_HANDLING?v(e.CUSTOM_ELEMENT_HANDLING):l(null);if(ve=l(null),D(t,"tagNameCheck")&&bt(t.tagNameCheck)&&(ve.tagNameCheck=t.tagNameCheck),D(t,"attributeNameCheck")&&bt(t.attributeNameCheck)&&(ve.attributeNameCheck=t.attributeNameCheck),D(t,"allowCustomizedBuiltInElements")&&"boolean"==typeof t.allowCustomizedBuiltInElements&&(ve.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),Ge&&(Fe=!1),$e&&(qe=!0),tt&&(Ce=k({},G),ke=l(null),!0===tt.html&&(k(Ce,P),k(ke,W)),!0===tt.svg&&(k(Ce,U),k(ke,j),k(ke,X)),!0===tt.svgFilters&&(k(Ce,z),k(ke,j),k(ke,X)),!0===tt.mathMl&&(k(Ce,H),k(ke,Y),k(ke,X))),Ue.tagCheck=null,Ue.attributeCheck=null,D(e,"ADD_TAGS")&&("function"==typeof e.ADD_TAGS?Ue.tagCheck=e.ADD_TAGS:h(e.ADD_TAGS)&&(Ce===Le&&(Ce=v(Ce)),k(Ce,e.ADD_TAGS,Et))),D(e,"ADD_ATTR")&&("function"==typeof e.ADD_ATTR?Ue.attributeCheck=e.ADD_ATTR:h(e.ADD_ATTR)&&(ke===xe&&(ke=v(ke)),k(ke,e.ADD_ATTR,Et))),D(e,"ADD_URI_SAFE_ATTR")&&h(e.ADD_URI_SAFE_ATTR)&&k(at,e.ADD_URI_SAFE_ATTR,Et),D(e,"FORBID_CONTENTS")&&h(e.FORBID_CONTENTS)&&(nt===ot&&(nt=v(nt)),k(nt,e.FORBID_CONTENTS,Et)),D(e,"ADD_FORBID_CONTENTS")&&h(e.ADD_FORBID_CONTENTS)&&(nt===ot&&(nt=v(nt)),k(nt,e.ADD_FORBID_CONTENTS,Et)),Qe&&(Ce["#text"]=!0),je&&k(Ce,["html","head","body"]),Ce.table&&(k(Ce,["tbody"]),delete Me.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw w('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw w('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');pe=e.TRUSTED_TYPES_POLICY,de=pe.createHTML("")}else void 0===pe&&(pe=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const o="data-tt-policy-suffix";t&&t.hasAttribute(o)&&(n=t.getAttribute(o));const r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{/**
 * Codes for errors generated within this library
 */
export declare const FlateErrorCode: {
    readonly UnexpectedEOF: 0;
    readonly InvalidBlockType: 1;
    readonly InvalidLengthLiteral: 2;
    readonly InvalidDistance: 3;
    readonly StreamFinished: 4;
    readonly NoStreamHandler: 5;
    readonly InvalidHeader: 6;
    readonly NoCallback: 7;
    readonly InvalidUTF8: 8;
    readonly ExtraFieldTooLong: 9;
    readonly InvalidDate: 10;
    readonly FilenameTooLong: 11;
    readonly StreamFinishing: 12;
    readonly InvalidZipData: 13;
    readonly UnknownCompressionMethod: 14;
};
/**
 * An error generated within this library
 */
export interface FlateError extends Error {
    /**
     * The code associated with this error
     */
    code: number;
}
/**
 * Options for decompressing a DEFLATE stream
 */
export interface InflateStreamOptions {
    /**
     * The dictionary used to compress the original data. If no dictionary was used during compression, this option has no effect.
     *
     * Supplying the wrong dictionary during decompression usually yields corrupt output or causes an invalid distance error.
     */
    dictionary?: Uint8Array;
}
/**
 * Options for decompressing DEFLATE data
 */
export interface InflateOptions extends InflateStreamOptions {
    /**
     * The buffer into which to write the decompressed data. Saves memory if you know the decompressed size in advance.
     *
     * Note that if the decompression result is larger than the size of this buffer, it will be truncated to fit.
     */
    out?: Uint8Array;
}
/**
 * Options for decompressing a GZIP stream
 */
export interface GunzipStreamOptions extends InflateStreamOptions {
}
/**
 * Options for decompressing GZIP data
 */
export interface GunzipOptions extends InflateStreamOptions {
    /**
     * The buffer into which to write the decompressed data. GZIP already encodes the output size, so providing this doesn't save memory.
     *
     * Note that if the decompression result is larger than the size of this buffer, it will be truncated to fit.
     */
    out?: Uint8Array;
}
/**
 * Options for decompressing a Zlib stream
 */
export interface UnzlibStreamOptions extends InflateStreamOptions {
}
/**
 * Options for decompressing Zlib data
 */
export interface UnzlibOptions extends InflateOptions {
}
/**
 * Options for compressing data into a DEFLATE format
 */
export interface DeflateOptions {
    /**
     * The level of compression to use, ranging from 0-9.
     *
     * 0 will store the data without compression.
     * 1 is fastest but compresses the worst, 9 is slowest but compresses the best.
     * The default level is 6.
     *
     * Typically, binary data benefits much more from higher values than text data.
     * In both cases, higher values usually take disproportionately longer than the reduction in final size that results.
     *
     * For example, a 1 MB text file could:
     * - become 1.01 MB with level 0 in 1ms
     * - become 400 kB with level 1 in 10ms
     * - become 320 kB with level 9 in 100ms
     */
    level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /**
     * The memory level to use, ranging from 0-12. Increasing this increases speed and compression ratio at the cost of memory.
     *
     * Note that this is exponential: while level 0 uses 4 kB, level 4 uses 64 kB, level 8 uses 1 MB, and level 12 uses 16 MB.
     * It is recommended not to lower the value below 4, since that tends to hurt performance.
     * In addition, values above 8 tend to help very little on most data and can even hurt performance.
     *
     * The default value is automatically determined based on the size of the input data.
     */
    mem?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    /**
     * A buffer containing common byte sequences in the input data that can be used to significantly improve compression ratios.
     *
     * Dictionaries should be 32kB or smaller and include strings or byte sequences likely to appear in the input.
     * The decompressor must supply the same dictionary as the compressor to extract the original data.
     *
     * Dictionaries only improve aggregate compression ratio when reused across multiple small inputs. They should typically not be used otherwise.
     *
     * Avoid using dictionaries with GZIP and ZIP to maximize software compatibility.
     */
    dictionary?: Uint8Array;
}
/**
 * Options for compressing data into a GZIP format
 */
export interface GzipOptions extends DeflateOptions {
    /**
     * When the file was last modified. Defaults to the current time.
     * Set this to 0 to avoid revealing a modification date entirely.
     */
    mtime?: Date | string | number;
    /**
     * The filename of the data. If the `gunzip` command is used to decompress the data, it will output a file
     * with this name instead of the name of the compressed file.
     */
    filename?: string;
}
/**
 * Options for compressing data into a Zlib format
 */
export interface ZlibOptions extends DeflateOptions {
}
/**
 * Handler for data (de)compression streams
 * @param data The data output from the stream processor
 * @param final Whether this is the final block
 */
export type FlateStreamHandler = (data: Uint8Array, final: boolean) => void;
/**
 * Handler for asynchronous data (de)compression streams
 * @param err Any error that occurred
 * @param data The data output from the stream processor
 * @param final Whether this is the final block
 */
export type AsyncFlateStreamHandler = (err: FlateError | null, data: Uint8Array, final: boolean) => void;
/**
 * Handler for the asynchronous completion of (de)compression for a data chunk
 * @param size The number of bytes that were processed. This is measured in terms of the input
 * (i.e. compressed bytes for decompression, uncompressed bytes for compression.)
 */
export type AsyncFlateDrainHandler = (size: number) => void;
/**
 * Callback for asynchronous (de)compression methods
 * @param err Any error that occurred
 * @param data The resulting data. Only present if `err` is null
 */
export type FlateCallback = (err: FlateError | null, data: Uint8Array) => void;
interface AsyncOptions {
    /**
     * Whether or not to "consume" the source data. This will make the typed array/buffer you pass in
     * unusable but will increase performance and reduce memory usage.
     */
    consume?: boolean;
}
/**
 * Options for compressing data asynchronously into a DEFLATE format
 */
export interface AsyncDeflateOptions extends DeflateOptions, AsyncOptions {
}
/**
 * Options for decompressing DEFLATE data asynchronously
 */
export interface AsyncInflateOptions extends AsyncOptions, InflateStreamOptions {
    /**
     * The original size of the data. Currently, the asynchronous API disallows
     * writing into a buffer you provide; the best you can do is provide the
     * size in bytes and be given back a new typed array.
     */
    size?: number;
}
/**
 * Options for compressing data asynchronously into a GZIP format
 */
export interface AsyncGzipOptions extends GzipOptions, AsyncOptions {
}
/**
 * Options for decompressing GZIP data asynchronously
 */
export interface AsyncGunzipOptions extends AsyncOptions, InflateStreamOptions {
}
/**
 * Options for compressing data asynchronously into a Zlib format
 */
export interface AsyncZlibOptions extends ZlibOptions, AsyncOptions {
}
/**
 * Options for decompressing Zlib data asynchronously
 */
export interface AsyncUnzlibOptions extends AsyncInflateOptions {
}
/**
 * A terminable compression/decompression process
 */
export interface AsyncTerminable {
    /**
     * Terminates the worker thread immediately. The callback will not be called.
     */
    (): void;
}
/**
 * Streaming DEFLATE compression
 */
export declare class Deflate {
    /**
     * Creates a DEFLATE stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: DeflateOptions, cb?: FlateStreamHandler);
    /**
     * Creates a DEFLATE stream
     * @param cb The callback to call whenever data is deflated
     */
    constructor(cb?: FlateStreamHandler);
    private b;
    private s;
    private o;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    private p;
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * deflated output for small inputs.
     */
    flush(): void;
}
/**
 * Asynchronous streaming DEFLATE compression
 */
export declare class AsyncDeflate {
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
    /**
     * The handler to call whenever buffered source data is processed (i.e. `queuedSize` updates)
     */
    ondrain?: AsyncFlateDrainHandler;
    /**
     * The number of uncompressed bytes buffered in the stream
     */
    queuedSize: number;
    /**
     * Creates an asynchronous DEFLATE stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: DeflateOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous DEFLATE stream
     * @param cb The callback to call whenever data is deflated
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * deflated output for small inputs.
     */
    flush(): void;
    /**
     * A method to terminate the stream's internal worker. Subsequent calls to
     * push() will silently fail.
     */
    terminate: AsyncTerminable;
}
/**
 * Asynchronously compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @param cb The function to be called upon compression completion
 * @returns A function that can be used to immediately terminate the compression
 */
export declare function deflate(data: Uint8Array, opts: AsyncDeflateOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param cb The function to be called upon compression completion
 */
export declare function deflate(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @returns The deflated version of the data
 */
export declare function deflateSync(data: Uint8Array, opts?: DeflateOptions): Uint8Array;
/**
 * Streaming DEFLATE decompression
 */
export declare class Inflate {
    private s;
    private o;
    private p;
    private d;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    /**
     * Creates a DEFLATE decompression stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: InflateStreamOptions, cb?: FlateStreamHandler);
    /**
     * Creates a DEFLATE decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: FlateStreamHandler);
    private e;
    private c;
    /**
     * Pushes a chunk to be inflated
     * @param chunk The chunk to push
     * @param final Whether this is the final chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * Asynchronous streaming DEFLATE decompression
 */
export declare class AsyncInflate {
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
    /**
     * The handler to call whenever buffered source data is processed (i.e. `queuedSize` updates)
     */
    ondrain?: AsyncFlateDrainHandler;
    /**
     * The number of compressed bytes buffered in the stream
     */
    queuedSize: number;
    /**
     * Creates an asynchronous DEFLATE decompression stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: InflateStreamOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous DEFLATE decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Pushes a chunk to be inflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    /**
     * A method to terminate the stream's internal worker. Subsequent calls to
     * push() will silently fail.
     */
    terminate: AsyncTerminable;
}
/**
 * Asynchronously expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param opts The decompression options
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function inflate(data: Uint8Array, opts: AsyncInflateOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function inflate(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
export declare function inflateSync(data: Uint8Array, opts?: InflateOptions): Uint8Array;
/**
 * Streaming GZIP compression
 */
export declare class Gzip {
    private c;
    private l;
    private v;
    private o;
    private s;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    /**
     * Creates a GZIP stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: GzipOptions, cb?: FlateStreamHandler);
    /**
     * Creates a GZIP stream
     * @param cb The callback to call whenever data is deflated
     */
    constructor(cb?: FlateStreamHandler);
    /**
     * Pushes a chunk to be GZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    private p;
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * GZIPped output for small inputs.
     */
    flush(): void;
}
/**
 * Asynchronous streaming GZIP compression
 */
export declare class AsyncGzip {
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
    /**
     * The handler to call whenever buffered source data is processed (i.e. `queuedSize` updates)
     