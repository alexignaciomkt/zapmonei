/**
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
     */
    ondrain?: AsyncFlateDrainHandler;
    /**
     * The number of uncompressed bytes buffered in the stream
     */
    queuedSize: number;
    /**
     * Creates an asynchronous GZIP stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: GzipOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous GZIP stream
     * @param cb The callback to call whenever data is deflated
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Pushes a chunk to be GZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * GZIPped output for small inputs.
     */
    flush(): void;
    /**
     * A method to terminate the stream's internal worker. Subseque not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Write the header */
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    /* zlib header */
    let header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
    let level_flags = -1;

    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= (level_flags << 6);
    if (s.strstart !== 0) { header |= PRESET_DICT; }
    header += 31 - (header % 31);

    putShortMSB(s, header);

    /* Save the adler32 of the preset dictionary: */
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 0xffff);
    }
    strm.adler = 1; // adler32(0L, Z_NULL, 0);
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK;
    }
  }
//#ifdef GZIP
  if (s.status === GZIP_STATE) {
    /* gzip header */
    strm.adler = 0;  //crc32(0L, Z_NULL, 0);
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) { // s->gzhead == Z_NULL
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;

      /* Compression must start with an empty pending buffer */
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK;
      }
    }
    else {
      put_byte(s, (s.gzhead.text ? 1 : 0) +
                  (s.gzhead.hcrc ? 2 : 0) +
                  (!s.gzhead.extra ? 0 : 4) +
                  (!s.gzhead.name ? 0 : 8) +
                  (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 0xff);
      put_byte(s, (s.gzhead.time >> 8) & 0xff);
      put_byte(s, (s.gzhead.time >> 16) & 0xff);
      put_byte(s, (s.gzhead.time >> 24) & 0xff);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, s.gzhead.os & 0xff);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 0xff);
        put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        // zmemcpy(s.pending_buf + s.pending,
        //    s.gzhead.extra + s.gzindex, copy);
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        //--- HCRC_UPDATE(beg) ---//
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        //---//
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK;
        }
        beg = 0;
        left -= copy;
      }
      // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
      //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      // zmemcpy(s->pending_buf + s->pending,
      //     s->gzhead->extra + s->gzindex, left);
      s.pending_bufrveAspectRatio
     */

  }, {
    key: "resize",
    value: function resize(width) {
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : width;
      var preserveAspectRatio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.documentElement.resize(width, height, preserveAspectRatio);
    }
  }], [{
    key: "from",
    value: function () {
      var _from = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(ctx, svg) {
        var options,
            parser,
            svgDocument,
            _args2 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
                parser = new Parser(options);
                _context2.next = 4;
                return parser.parse(svg);

              case 4:
                svgDocument = _context2.sent;
                return _context2.abrupt("return", new Canvg(ctx, svgDocument, options));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function from(_x, _x2) {
        return _from.apply(this, arguments);
      }

      return from;
    }()
    /**
     * Create Canvg instance from SVG source string.
     * @param ctx - Rendering context.
     * @param svg - SVG source string.
     * @param options - Rendering options.
     * @returns Canvg instance.
     */

  }, {
    key: "fromString",
    value: function fromString(ctx, svg) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var parser = new Parser(options);
      var svgDocument = parser.parseFromString(svg);
      return new Canvg(ctx, svgDocument, options);
    }
  }]);

  return Canvg;
}();

exports.AElement = AElement;
exports.AnimateColorElement = AnimateColorElement;
exports.AnimateElement = AnimateElement;
exports.AnimateTransformElement = AnimateTransformElement;
exports.BoundingBox = BoundingBox;
exports.CB1 = CB1;
exports.CB2 = CB2;
exports.CB3 = CB3;
exports.CB4 = CB4;
exports.Canvg = Canvg;
exports.CircleElement = CircleElement;
exports.ClipPathElement = ClipPathElement;
exports.DefsElement = DefsElement;
exports.DescElement = DescElement;
exports.Document = Document;
exports.Element = Element;
exports.EllipseElement = EllipseElement;
exports.FeColorMatrixElement = FeColorMatrixElement;
exports.FeCompositeElement = FeCompositeElement;
exports.FeDropShadowElement = FeDropShadowElement;
exports.FeGaussianBlurElement = FeGaussianBlurElement;
exports.FeMorphologyElement = FeMorphologyElement;
exports.FilterElement = FilterElement;
exports.Font = Font;
exports.FontElement = FontElement;
exports.FontFaceElement = FontFaceElement;
exports.GElement = GElement;
exports.GlyphElement = GlyphElement;
exports.GradientElement = GradientElement;
exports.ImageElement = ImageElement;
exports.LineElement = LineElement;
exports.LinearGradientElement = LinearGradientElement;
exports.MarkerElement = MarkerElement;
exports.MaskElement = MaskElement;
exports.Matrix = Matrix;
exports.MissingGlyphElement = MissingGlyphElement;
exports.Mouse = Mouse;
exports.PSEUDO_ZERO = PSEUDO_ZERO;
exports.Parser = Parser;
exports.PathElement = PathElement;
exports.PathParser = PathParser;
exports.PatternElement = PatternElement;
exports.Point = Point;
exports.PolygonElement = PolygonElement;
exports.PolylineElement = PolylineElement;
exports.Property = Property;
exports.QB1 = QB1;
exports.QB2 = QB2;
exports.QB3 = QB3;
exports.RadialGradientElement = RadialGradientElement;
exports.RectElement = RectElement;
exports.RenderedElement = RenderedElement;
exports.Rotate = Rotate;
exports.SVGElement = SVGElement;
exports.SVGFontLoader = SVGFontLoader;
exports.Scale = Scale;
exports.Screen = Screen;
exports.Skew = Skew;
exports.SkewX = SkewX;
exports.SkewY = SkewY;
exports.StopElement = StopElement;
exports.StyleElement = StyleElement;
exports.SymbolElement = SymbolElement;
exports.TRefElement = TRefElement;
exports.TSpanElement = TSpanElement;
exports.TextElement = TextElement;
exports.TextPathElement = TextPathElement;
exports.TitleElement = TitleElement;
exports.Transform = Transform;
exports.Translate = Translate;
exports.UnknownElement = UnknownElement;
exports.UseElement = UseElement;
exports.ViewPort = ViewPort;
exports.compressSpaces = compressSpaces;
exports["default"] = Canvg;
exports.getSelectorSpecificity = getSelectorSpecificity;
exports.normalizeAttributeName = normalizeAttributeName;
exports.normalizeColor = normalizeColor;
exports.parseExternalUrl = parseExternalUrl;
exports.presets = index;
exports.toNumbers = toNumbers;
exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.vectorMagnitude = vectorMagnitude;
exports.vectorsAngle = vectorsAngle;
exports.vectorsRatio = vectorsRatio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6W10sInNvdXJjZXNDb250ZW50IjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz# StackBlur CHANGES

## 2.7.0

- fix: use unsigned right shift to fix blur radius larger than 180 #59 (@kayahr)
- chore: update build files (@kayahr)

## 2.6.0

- feat: ImageBitmap support (@Jason11Q)

## 2.5.0

- Enhancement: boolean arg to skip setting canvas styles (@LukeeeeBennett)
- Build: As per latest devDeps.
- Docs: Update API docs as per latest

**Dev-facing:**

- Linting: As per ash-nazg
- npm: Switch to server without reported vulnerabilities
- npm: Switch to pnpm lock
- npm: Update devDeps (and switch to new ash-nazg peerDeps)

## 2.4.0

- Enhancement (image): add useOffsetWidth option for scaled images
- Refactoring: Move `let` to closer/deeper scope
- Linting: As per latest ash-nazg (add or avoid need for disable comments)
- npm: Update devDeps.

## 2.3.0

- Build: Update build files per latest devDeps
- Linting (ESLint): Switch to ash-nazg/sauron-node
- Linting (ESLint): Lint MD, HTML, hidden files
- Linting (ESLint): Switch to 2 sp. indent, fix max-len
- Linting (ESLint): Prefer `document.querySelector` in demo
- Linting (ESLint): Add a recommended extension (js) to eslintrc
- Maintenance: Add `.editorconfig`
- Mainenance: Use `.json` extension on `.babelrc`
- npm: Remove `package-lock.json` in favor of `yarn.lock`
- npm: Avoid bundling `rollup.config.js`
- npm: Move from deprecated `opn-cli` to `open-cli`
- npm: Add valid `engines` (pointing to minimum Node version until may confirm)
- npm: Update devDeps (except jsdoc which seems to still have a problem
    with ESM exports: <https://github.com/jsdoc/jsdoc/issues/1644>)

## 2.2.0

- Build fix: Target 100% coverage
- Refactoring (minor): `x + x` -> `2 * x`
- npm Add prepublishOnly script for yarn
- npm: Update devDeps (no impact on build)

## 2.1.0

- Enhancement: Throw descriptive `TypeError` rather than silently returning
    upon `processCanvasRGB`/`processCanvasRGBA` methods not supplying proper
    canvas (dependent methods will throw anyways, so shouldn't be a
    breaking change)
- Enhancement: Update TypeScript definition (@Jose Peleteiro)

## 2.0.0

- Breaking change: Remove now deprecated Bower
- Fix: Duck type with image or canvas in place of `instanceof` check
    (and a broken one)
- Enhancement: Add JSDoc comments
- Linting (ESLint): Add ESLint with "standard" base
- Linting (Markdown): Add `.remarkrc`
- Linting (package.json): Add recommended properties
- Linting (HTML): Add empty favicon to suppress console
- License: Change MIT license file name to reflect license type (MIT)
- Docs: Move changelog to own file: `CHANGES.md`
- Demo: Move demo to own directory (with static server to avoid Chrome
    security problems reaching out of folder)
- Demo: Move JS and CSS to separate files for easier linting/examination
- Build: Move from Grunt to Rollup, supporting ES6 Modules distribution
    as well as UMD
- Build: Add npm-recommended `package-lock.json`
- npm: Add start, eslint, rollup, open-docs, docs scripts
- npm: Add `module` for ES6 module discovery and switch `main` to point
    to `dist`

## 1.4.1

- Moves `grunt-cli` to `devDependencies` (#23)

## 1.4.0

- Allows the lib to be used with node-canvas

## 1.3.0

- TypeScript typings added

## 1.2.1

- Includes built files in the NPM packgage

## 1.2.0

- Remove alerts and obsolete `netscape.security.PrivilegeManager`

## 1.1.0

- Allow blur to be applied to `ImageData` directly (thanks @WebSeed)

## 1.0.0

- First Release
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       nt calls to
     * push() will silently fail.
     */
    terminate: AsyncTerminable;
}
/**
 * Asynchronously compresses data with GZIP
 * @param data The data to compress
 * @param opts The compression options
 * @param cb The function to be called upon compression completion
 * @returns A function that can be used to immediately terminate the compression
 */
export declare function gzip(data: Uint8Array, opts: AsyncGzipOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously compresses data with GZIP
 * @param data The data to compress
 * @param cb The function to be called upon compression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function gzip(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Compresses data with GZIP
 * @param data The data to compress
 * @param opts The compression options
 * @returns The gzipped version of the data
 */
export declare function gzipSync(data: Uint8Array, opts?: GzipOptions): Uint8Array;
/**
 * Handler for new GZIP members in concatenated GZIP streams. Useful for building indices used to perform random-access reads on compressed files.
 * @param offset The offset of the new member relative to the start of the stream
 */
export type GunzipMemberHandler = (offset: number) => void;
/**
 * Streaming single or multi-member GZIP decompression
 */
export declare class Gunzip {
    private v;
    private r;
    private o;
    private p;
    private s;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    /**
     * The handler to call whenever a new GZIP member is found
     */
    onmember?: GunzipMemberHandler;
    /**
     * Creates a GUNZIP stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: GunzipStreamOptions, cb?: FlateStreamHandler);
    /**
     * Creates a GUNZIP stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: FlateStreamHandler);
    /**
     * Pushes a chunk to be GUNZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * Asynchronous streaming single or multi-member GZIP decompression
 */
export declare class AsyncGunzip {
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
     * The handler to call whenever a new GZIP member is found
     */
    onmember?: GunzipMemberHandler;
    /**
     * Creates an asynchronous GUNZIP stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: GunzipStreamOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous GUNZIP stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Pushes a chunk to be GUNZIPped
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
 * Asynchronously expands GZIP data
 * @param data The data to decompress
 * @param opts The decompression options
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function gunzip(data: Uint8Array, opts: AsyncGunzipOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously expands GZIP data
 * @param data The data to decompress
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function gunzip(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Expands GZIP data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
export declare function gunzipSync(data: Uint8Array, opts?: GunzipOptions): Uint8Array;
/**
 * Streaming Zlib compression
 */
export declare class Zlib {
    private c;
    private v;
    private o;
    private s;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    /**
     * Creates a Zlib stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: ZlibOptions, cb?: FlateStreamHandler);
    /**
     * Creates a Zlib stream
     * @param cb The callback to call whenever data is deflated
     */
    constructor(cb?: FlateStreamHandler);
    /**
     * Pushes a chunk to be zlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
    private p;
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * zlibbed output for small inputs.
     */
    flush(): void;
}
/**
 * Asynchronous streaming Zlib compression
 */
export declare class AsyncZlib {
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
     * Creates an asynchronous Zlib stream
     * @param opts The compression options
     * @param cb The callback to call whenever data is deflated
     */
    constructor(opts: ZlibOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous Zlib stream
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
     * zlibbed output for small inputs.
     */
    flush(): void;
    /**
     * A method to terminate the stream's internal worker. Subsequent calls to
     * push() will silently fail.
     */
    terminate: AsyncTerminable;
}
/**
 * Asynchronously compresses data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @param cb The function to be called upon compression completion
 */
export declare function zlib(data: Uint8Array, opts: AsyncZlibOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously compresses data with Zlib
 * @param data The data to compress
 * @param cb The function to be called upon compression completion
 * @returns A function that can be used to immediately terminate the compression
 */
export declare function zlib(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
export declare function zlibSync(data: Uint8Array, opts?: ZlibOptions): Uint8Array;
/**
 * Streaming Zlib decompression
 */
export declare class Unzlib {
    private v;
    private p;
    /**
     * The handler to call whenever data is available
     */
    ondata: FlateStreamHandler;
    /**
     * Creates a Zlib decompression stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: UnzlibStreamOptions, cb?: FlateStreamHandler);
    /**
     * Creates a Zlib decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: FlateStreamHandler);
    /**
     * Pushes a chunk to be unzlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * Asynchronous streaming Zlib decompression
 */
export declare class AsyncUnzlib {
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
     * Creates an asynchronous Zlib decompression stream
     * @param opts The decompression options
     * @param cb The callback to call whenever data is inflated
     */
    constructor(opts: UnzlibStreamOptions, cb?: AsyncFlateStreamHandler);
    /**
     * Creates an asynchronous Zlib decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Pushes a chunk to be decompressed from Zlib
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
 * Asynchronously expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function unzlib(data: Uint8Array, opts: AsyncUnzlibOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously expands Zlib data
 * @param data The data to decompress
 * @param cb The function to be called upon decompression completion
 * @returns A function that can be used to immediately terminate the decompression
 */
export declare function unzlib(data: Uint8Array, cb: FlateCallback): AsyncTerminable;
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
export declare function unzlibSync(data: Uint8Array, opts?: UnzlibOptions): Uint8Array;
export { gzip as compress, AsyncGzip as AsyncCompre