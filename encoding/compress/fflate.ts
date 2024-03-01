import { installScript } from "../../scripts/install"
import { string2Uint8Array } from "../buffers"

export const FFLATE_SCRIPT = 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js'

export interface FFlateCompressOptions {
    level?: number
    [key: string]: any
}

export type FflateCompressFormat = 'zlib'|'gzip'|'zip'

type FflateCallback = (error: Error, result: Uint8Array) => void

interface FflateNamespace {
    zlib: (source: Uint8Array, options: FFlateCompressOptions, callback: FflateCallback) => void
    zip: (source: Uint8Array, options: FFlateCompressOptions, callback: FflateCallback) => void
    gzip: (source: Uint8Array, options: FFlateCompressOptions, callback: FflateCallback) => void
    unzlib: (compressed: Uint8Array, callback: FflateCallback) => void
    unzip: (compressed: Uint8Array, callback: FflateCallback) => void
    gunzip: (compressed: Uint8Array, callback: FflateCallback) => void
}

export async function installFflate(): Promise<FflateNamespace> {
    await installScript(FFLATE_SCRIPT)
    return getFflate()
}

function getFflate(): FflateNamespace {
    return (window as any)['fflate'] as FflateNamespace
}

export function fflateCompress(format: FflateCompressFormat, source: string, options: FFlateCompressOptions ={}): Promise<Uint8Array> {
    const array = string2Uint8Array(source)
    return new Promise((r, e) => {
        const callback: FflateCallback = (error, result) => {
            if (error != null) {
                e(error)
            } else {
                r(result)
            }
        }
        switch (format) {
            case "zlib": return getFflate().zlib(array, options, callback)
            case "gzip": return getFflate().gzip(array, options, callback)
            case "zip":  return getFflate().zip(array, options, callback)
        }
    })
}
