export function string2Uint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str)
}

export function arrayBuffer2String(buffer: ArrayBuffer): string {
    return new TextDecoder().decode(buffer);
}

export function uint8Array2String(buffer: Uint8Array): string {
    return arrayBuffer2String(buffer)
}

export function string2ArrayBuffer(str: string): Uint8Array {
    return string2Uint8Array(str)
}
