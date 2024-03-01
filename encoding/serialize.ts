import { b64Decode, b64Encode } from "./base64"
import { builtinCompress, builtinDecompress } from "./compress/builtin"
import { encodeObject, decodeObject } from './object';
import { seal, unseal } from './seal';

export async function serialize(data: string): Promise<string> {
    const buffer = await builtinCompress('deflate-raw', data)
    return seal(b64Encode(buffer))
}

export async function deserialize(data: string): Promise<{data?: string, ok: boolean}> {
    const {source, ok} = unseal(data)
    if (!ok) {
        return {ok}
    }
    const buffer = b64Decode(source!)
    return {ok, data: await builtinDecompress('deflate-raw', buffer)}
}


export async function serializeObject(object: {[key: string]: number|string|boolean}): Promise<string> {
    return await serialize(encodeObject(object))
}

export async function deserializeObject(data: string): Promise<{data?: {[key: string]: any}, ok: boolean}> {
    const {ok, data: deserialized} = await deserialize(data)
    if (!ok) {
        return {ok}
    }

    return {ok, data: decodeObject(deserialized!)}
}
