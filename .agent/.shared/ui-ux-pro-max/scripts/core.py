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
     * @param opts The compression options
     */
    constructor(filename: string, opts?: DeflateOptions);
    process(chunk: Uint8Array, final: boolean): void;
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * Asynchronous streaming DEFLATE compression for ZIP archives
 */
export declare class AsyncZipDeflate implements ZipInputFile {
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
    terminate: AsyncTerminable;
    /**
     * Creates an asynchronous DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compression options
     */
    constructor(filename: string, opts?: DeflateOptions);
    process(chunk: Uint8Array, final: boolean): void;
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    push(chunk: Uint8Array, final?: boolean): void;
}
/**
 * A zippable archive to which files can incrementally be added
 */
export declare class Zip {
    private u;
    private d;
    /**
     * Creates an empty ZIP archive to which files can be added
     * @param cb The callback to call whenever data for the generated ZIP archive
     *           is available
     */
    constructor(cb?: AsyncFlateStreamHandler);
    /**
     * Adds a file to the ZIP archive
     * @param file The file stream to add
     */
    add(file: ZipInputFile): void;
    /**
     * Ends the process of adding files and prepares to emit the final chunks.
     * This *must* be called after adding all desired files for the resulting
     * ZIP file to work properly.
     */
    end(): void;
    private e;
    /**
     * A method to terminate any internal workers used by the stream. Subsequent
     * calls to add() will fail.
     */
    terminate(): void;
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
}
/**
 * Asynchronously creates a ZIP file
 * @param data The directory structure for the ZIP archive
 * @param opts The main options, merged with per-file options
 * @param cb The callback to call with the generated ZIP archive
 * @returns A function that can be used to immediately terminate the compression
 */
export declare function zip(data: AsyncZippable, opts: AsyncZipOptions, cb: FlateCallback): AsyncTerminable;
/**
 * Asynchronously creates a ZIP file
 * @param data The directory structure for the ZIP archive
 * @param cb The callback to call with the generated ZIP archive
 * @returns A function that can be used to immediately terminate the compression
 */
export declare function zip(data: AsyncZippable, cb: FlateCallback): AsyncTerminable;
/**
 * Synchronously creates a ZIP file. Prefer using `zip` for better performance
 * with more than one file.
 * @param data The directory structure for the ZIP archive
 * @param opts The main options, merged with per-file options
 * @returns The generated ZIP archive
 */
export declare function zipSync(data: Zippable, opts?: ZipOptions): Uint8Array;
/**
 * A decoder for files in ZIP streams
 */
export interface UnzipDecoder {
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
    /**
     * Pushes a chunk to be decompressed
     * @param data The data in this chunk. Do not consume (detach) this data.
     * @param final Whether this is the last chunk in the data stream
     */
    push(data: Uint8Array, final: boolean): void;
    /**
     * A method to terminate any internal workers used by the stream. Subsequent
     * calls to push() should silently fail.
     */
    terminate?: AsyncTerminable;
}
/**
 * A constructor for a decoder for unzip streams
 */
export interface UnzipDecoderConstructor {
    /**
     * Creates an instance of the decoder
     * @param filename The name of the file
     * @param size The compressed size of the file
     * @param originalSize The original size of the file
     */
    new (filename: string, size?: number, originalSize?: number): UnzipDecoder;
    /**
     * The compression format for the data stream. This number is determined by
     * the spec in PKZIP's APPNOTE.txt, section 4.4.5. For example, 0 = no
     * compression, 8 = deflate, 14 = LZMA
     */
    compression: number;
}
/**
 * Information about a file to be extracted from a ZIP archive
 */
export interface UnzipFileInfo {
    /**
     * The name of the file
     */
    name: string;
    /**
     * The compressed size of the file
     */
    size: number;
    /**
     * The original size of the file
     */
    originalSize: number;
    /**
     * The compression format for the data stream. This number is determined by
     * the spec in PKZIP's APPNOTE.txt, section 4.4.5. For example, 0 = no
     * compression, 8 = deflate, 14 = LZMA. If the filter function returns true
     * but this value is not 8, the unzip function will throw.
     */
    compression: number;
}
/**
 * A filter for files to be extracted during the unzipping process
 * @param file The info for the current file being processed
 * @returns Whether or not to extract the current file
 */
export type UnzipFileFilter = (file: UnzipFileInfo) => boolean;
/**
 * Streaming file extraction from ZIP archives
 */
export interface UnzipFile {
    /**
     * The handler to call whenever data is available
     */
    ondata: AsyncFlateStreamHandler;
    /**
     * The name of the file
     */
    name: string;
    /**
     * The compression format for the data stream. This number is determined by
     * the spec in PKZIP's APPNOTE.txt, section 4.4.5. For example, 0 = no
     * compression, 8 = deflate, 14 = LZMA. If start() is called but there is no
     * decompression stream available for this method, start() will throw.
     */
    compression: number;
    /**
     * The compressed size of the file. Will not be present for archives created
     * in a streaming fashion.
     */
    size?: numb