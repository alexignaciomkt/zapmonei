
/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pako = {}));
})(this, (function (exports) { 'use strict';

  // (C) 1995-2013 Jean-loup Gailly and Mark Adler
  // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
  //
  // This software is provided 'as-is', without any express or implied
  // warranty. In no event will the authors be held liable for any damages
  // arising from the use of this software.
  //
  // Permission is granted to anyone to use this software for any purpose,
  // including commercial applications, and to alter it and redistribute it
  // freely, subject to the following restrictions:
  //
  // 1. The origin of this software must not be misrepresented; you must not
  //   claim that you wrote the original software. If you use this software
  //   in a product, an acknowledgment in the product documentation would be
  //   appreciated but is not required.
  // 2. Altered source versions must be plainly marked as such, and must not be
  //   misrepresented as being the original software.
  // 3. This notice may not be removed or altered from any source distribution.

  /* eslint-disable space-unary-ops */

  /* Public constants ==========================================================*/
  /* ===========================================================================*/

  //const Z_FILTERED          = 1;
  //const Z_HUFFMAN_ONLY      = 2;
  //const Z_RLE               = 3;
  var Z_FIXED$1 = 4;
  //const Z_DEFAULT_STRATEGY  = 0;

  /* Possible values of the data_type field (though see inflate()) */
  var Z_BINARY = 0;
  var Z_TEXT = 1;
  //const Z_ASCII             = 1; // = Z_TEXT
  var Z_UNKNOWN$1 = 2;

  /*============================================================================*/

  function zero$1(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }

  // From zutil.h

  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;
  /* The three kinds of block type */

  var MIN_MATCH$1 = 3;
  var MAX_MATCH$1 = 258;
  /* The minimum and maximum match lengths */

  // From deflate.h
  /* ===========================================================================
   * Internal compression state.
   */

  var LENGTH_CODES$1 = 29;
  /* number of length codes, not counting the special END_BLOCK code */

  var LITERALS$1 = 256;
  /* number of literal bytes 0..255 */

  var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
  /* number of Literal or Length codes, including the END_BLOCK code */

  var D_CODES$1 = 30;
  /* number of distance codes */

  var BL_CODES$1 = 19;
  /* number of codes used to transfer the bit lengths */

  var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
  /* maximum heap size */

  var MAX_BITS$1 = 15;
  /* All codes must not exceed MAX_BITS bits */

  var Buf_size = 16;
  /* size of bit buffer in bi_buf */

  /* ===========================================================================
   * Constants
   */

  var MAX_BL_BITS = 7;
  /* Bit length codes must not exceed MAX_BL_BITS bits */

  var END_BLOCK = 256;
  /* end of block literal code */

  var REP_3_6 = 16;
  /* repeat previous bit length 3-6 times (2 bits of repeat count) */

  var REPZ_3_10 = 17;
  /* repeat a zero length 3-10 times  (3 bits of repeat count) */

  var REPZ_11_138 = 18;
  /* repeat a zero length 11-138 times  (7 bits of repeat count) */

  /* eslint-disable comma-spacing,array-bracket-spacing */
  var extra_lbits = /* extra bits for each length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
  var extra_dbits = /* extra bits for each distance code */
  new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  var extra_blbits = /* extra bits for evar n in e)Ot(t,n,e[n],r);return t},ve=Object.setPrototypeOf||("__proto__"in{}?function(){var t,e=!1,r={};try{(t=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(r,[]),e=r instanceof Array}catch(t){}return function(r,n){return H(r),function(t){if("object"==typeof t||x(t))return t;throw TypeError("Can't set "+String(t)+" as a prototype")}(n),e?t.call(r,n):r.__proto__=n,r}}():void 0),ye=K.f,de=I("toStringTag"),ge=function(t,e,r){t&&!y(t=r?t:t.prototype,de)&&ye(t,de,{configurable:!0,value:e})},me=I("species"),xe=function(t){var e=w(t),r=K.f;B&&e&&!e[me]&&r(e,me,{configurable:!0,get:function(){return this}})},be=function(t,e,r){if(t instanceof e)return t;throw TypeError("Incorrect "+(r?r+" ":"")+"invocation")},we={},Se=I("iterator"),Oe=Array.prototype,ke=function(t){return void 0!==t&&(we.Array===t||Oe[Se]===t)},Te=function(t,e,r){if(G(t),void 0===e)return t;switch(r){case 0:return function(){return t.call(e)};case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,i){return t.call(e,r,n,i)}}return function(){return t.apply(e,arguments)}},Ae=I("iterator"),Re=function(t){if(null!=t)return W(t,Ae)||W(t,"@@iterator")||we[Pt(t)]},Pe=function(t,e){var r=arguments.length<2?Re(t):e;if(G(r))return H(r.call(t));throw TypeError(String(t)+" is not iterable")},Ee=function(t,e,r){var n,i;H(t);try{if(!(n=W(t,"return"))){if("throw"===e)throw r;return r}n=n.call(t)}catch(t){i=!0,n=t}if("throw"===e)throw r;if(i)throw n;return H(n),r},Ce=function(t,e){this.stopped=t,this.result=e},Me=function(t,e,r){var n,i,o,a,u,s,c,l=r&&r.that,f=!(!r||!r.AS_ENTRIES),h=!(!r||!r.IS_ITERATOR),p=!(!r||!r.INTERRUPTED),v=Te(e,l,1+f+p),y=function(t){return n&&Ee(n,"normal",t),new Ce(!0,t)},d=function(t){return f?(H(t),p?v(t[0],t[1],y):v(t[0],t[1])):p?v(t,y):v(t)};if(h)n=t;else{if(!(i=Re(t)))throw TypeError(String(t)+" is not iterable");if(ke(i)){for(o=0,a=Gt(t);a>o;o++)if((u=d(t[o]))&&u instanceof Ce)return u;return new Ce(!1)}n=Pe(t,i)}for(s=n.next;!(c=s.call(n)).done;){try{u=d(c.value)}catch(t){Ee(n,"throw",t)}if("object"==typeof u&&u&&u instanceof Ce)return u}return new Ce(!1)},Ne=I("iterator"),_e=!1;try{var Ie=0,Ve={next:function(){return{done:!!Ie++}},return:function(){_e=!0}};Ve[Ne]=function(){return this},Array.from(Ve,(function(){throw 2}))}catch(t){}var Le,Be,je,De,Fe=function(t,e){if(!e&&!_e)return!1;var r=!1;try{var n={};n[Ne]=function(){return{next:function(){return{done:r=!0}}}},t(n)}catch(t){}return r},ze=[],Ue=w("Reflect","constru