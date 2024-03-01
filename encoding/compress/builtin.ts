import { arrayBuffer2String, string2ArrayBuffer } from "../buffers"

export type BuiltinCompressFormat = 'deflate'|'gzip'|'deflate-raw'

// see: https://evanhahn.com/javascript-compression-streams-api-with-strings/
export async function builtinCompress(format: BuiltinCompressFormat, source: string): Promise<ArrayBuffer> {
    const stream = new CompressionStream(format)
    const writer = stream.writable.getWriter()
    writer.write(string2ArrayBuffer(source))
    writer.close()
    const buffer = await new Response(stream.readable).arrayBuffer()
    console.log(`builtinCompress:`, {format, source, buffer})
    return buffer
}

export async function builtinDecompress(format: BuiltinCompressFormat, compressed: ArrayBuffer): Promise<string> {
    const stream = new DecompressionStream(format)
    const writer = stream.writable.getWriter()
    writer.write(compressed)
    writer.close()
    const buffer = await new Response(stream.readable).arrayBuffer()
    return arrayBuffer2String(buffer)
}
