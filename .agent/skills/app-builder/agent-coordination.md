ibute may be invalid after
     * the file is added to the ZIP archive; it must be correct only before the
     * stream completes.
     *
     * If you don't want to have to compute this yourself, consider extending the
     * ZipPassThrough class and overriding its process() method, or using one of
     * ZipDeflate or AsyncZipDeflate.
     */
    size: number;
    /**
     * A CRC of the original file contents. This attribute may be invalid after
     * the file is added to the ZIP archive; it must be correct only before the
     * stream completes.
     *
     * If you don't want to have to generate this yourself, consider extending the
     * ZipPassThrough class and overriding its process() method, or using one of
     * ZipDeflate or AsyncZipDeflate.
     */
    crc: number;
    /**
     * The compression format for the data stream. This number is determined by
     * the spec in PKZIP's APPNOTE.txt, section 4.4.5. For example, 0 = no
     * compression, 8 = deflate, 14 = LZMA
     */
    compression: number;
    /**
     * Bits 1 and 2 of the general purpose bit flag, specified in PKZIP's
     * APPNOTE.txt, section 4.4.4. Should be between 0 and 3. This is unlikely
     * to be necessary.
     */
    flag?: number;
    /**
     * The handler to be called when data is added. After passing this stream to
     * the ZIP file object, this handler will always be defined. To call it:
     *
     * `stream.ondata(error, chunk, final)`
     *
     * error = any error that occurred (null if there was no error)
     *
     * chunk = a Uint8Array of the data that was added (null if there was an
     * error)
     *
     * final = boolean, whether this is the final chunk in the stream
     */
    ondata?: AsyncFlateStreamHandler;
    /**
     * A method called when the stream is no longer needed, for clean-up
     * purposes. This will not always be called after the stream completes,
     * so you may wish to call this.terminate() after the final chunk is
     * processed if you have clean-up logic.
     */
    terminate?: AsyncTerminable;
}
/**
 * A pass-through stream to keep data uncompressed in a ZIP archive.
 */
export declare class ZipPassThrough implements ZipInputFile {
    filename: string;
    crc: number;
    size: number;
    compression: number;
    os?: number;
    attrs?: number;
    comment?: string;
    extra?: Record<number, Uint8Array>;
    mtime?: GzipOptions['mtime'];
    ondata: AsyncFlateStreamHandler;
    private c;
    /**
     * Creates a pass-through stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     */
    constructor(filename: string);
    /**
     * Processes a chunk and pushes to the output stream. You can override this
     * method in a subclass for custom behavior, but by default this passes
     * the data through. You must call this.ondata(err, chunk, final) at some
     * point in this method.
     * @param chunk The chunk to process
     * @param final Whether this is the last chunk
     */
    protected process(chunk: Uint8Array, final: boolean): void;
    /**
     * Pushes a chunk to be added. If you are subclassing this with a custom
     * compression algorithm, note that you must push data from the source
     * file only, pre-compression.
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * Streaming DEFLATE compression for ZIP archives. Prefer using AsyncZipDeflate
 * for better performance
 */
export declare class ZipDeflate implements ZipInputFile {
    filename: string;
    crc: number;
    size: number;
    compression: number;
    flag: 0 | 1 | 2 | 3;
    os?: number;
    attrs?: number;
    comment?: string;
    extra?: Record<number, Uint8Array>;
    mtime?: GzipOptions['mtime'];
    ondata: AsyncFlateStreamHandler;
    private d;
    /**
     * Creates a DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compressietion=e}function P(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(A,this),this.reset(!0)}function E(t){if(t){var r=t[o];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var i=-1,a=function r(){for(;++i<t.length;)if(n.call(t,i))return r.value=t[i],r.done=!1,r;return r.value=e,r.done=!0,r};return a.next=a}}return{next:C}}function C(){return{value:e,done:!0}}return g.prototype=m,s(S,"constructor",m),s(m,"constructor",g),g.displayName=s(m,u,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===g||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,m):(t.__proto__=m,s(t,u,"GeneratorFunction")),t.prototype=Object.create(S),t},t.awrap=function(t){return{__await:t}},O(k.prototype),s(k.prototype,a,(function(){return this})),t.AsyncIterator=k,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new k(c(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(S),s(S,u,"Generator"),s(S,o,(function(){return this})),s(S,"toString",(function(){return"[object Generator]"})),t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=E,P.prototype={constructor:P,reset:function(t){if(this.prev=0,this.next=0,this.sent=t