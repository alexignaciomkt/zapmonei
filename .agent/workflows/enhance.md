var _typeof = require("./typeof.js")["default"];
var setFunctionName = require("./setFunctionName.js");
var toPropertyKey = require("./toPropertyKey.js");
function old_createMetadataMethodsForProperty(e, t, a, r) {
  return {
    getMetadata: function getMetadata(o) {
      old_assertNotFinished(r, "getMetadata"), old_assertMetadataKey(o);
      var i = e[o];
      if (void 0 !== i) if (1 === t) {
        var n = i["public"];
        if (void 0 !== n) return n[a];
      } else if (2 === t) {
        var l = i["private"];
        if (void 0 !== l) return l.get(a);
      } else if (Object.hasOwnProperty.call(i, "constructor")) return i.constructor;
    },
    setMetadata: function setMetadata(o, i) {
      old_assertNotFinished(r, "setMetadata"), old_assertMetadataKey(o);
      var n = e[o];
      if (void 0 === n && (n = e[o] = {}), 1 === t) {
        var l = n["public"];
        void 0 === l && (l = n["public"] = {}), l[a] = i;
      } else if (2 === t) {
        var s = n.priv;
        void 0 === s && (s = n["private"] = new Map()), s.set(a, i);
      } else n.constructor = i;
    }
  };
}
function old_convertMetadataMapToFinal(e, t) {
  var a = e[Symbol.m