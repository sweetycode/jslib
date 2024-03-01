const B64_KEY_STRING = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
const N0_CC = 48
const N9_CC = 57
const A_CC = 65
const Z_CC = 90
const AA_CC = 97
const ZZ_CC = 122
const US_CC = 95
const HP_CC = 45

export function b64CharAt(index: number): string {
    return B64_KEY_STRING.charAt(index)
}

export function b64FindCharCode(cc: number): number {
    if (isNaN(cc)) {
        return NaN
    }

    if (cc >= N0_CC && cc <= N9_CC) {
        return cc - N0_CC
    } else if (cc >= AA_CC && cc <= ZZ_CC) {
        return cc - AA_CC + 10
    } else if (cc >= A_CC && cc <= Z_CC) {
        return cc - A_CC + 36
    } else if (cc == US_CC) {
        return 62
    } else if (cc == HP_CC) {
        return 63
    } else {
        throw Error(`unknown base64 char code ${cc} (char ${String.fromCharCode(cc)})`)
    }
}

export function b64EncodeInt(i: number): string {
    if (i == 0) return '0'

    const base32Digits = []
    while (i > 0) {
        base32Digits.push(i % 32)
        i = Math.floor(i / 32)
    }

    const chars = []
    for (let index = base32Digits.length - 1; index >= 0; index-- ) {
        const n = base32Digits[index] | (index == 0? 0: 32)
        chars.push(B64_KEY_STRING[n])
    }
    return chars.join('')
}

export function b64DecodeInt(s: string, startIndex: number=0): {n: number, length: number} {
    let result = 0
    let length = 0
    for (let index = startIndex; index < s.length; index++ ) {
        const cc = s.charCodeAt(index)
        const digit = b64FindCharCode(cc)
        result = result * 32 + (digit & 31)
        length += 1
        if (digit < 32) {
            break
        }
    }

    return {n: result, length}
}


export function b64Encode(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer)
    const digits = []
    const tripleNum = Math.floor(byteArray.length / 3)
    const rounedLength = tripleNum * 3
    for (let index = 0; index < rounedLength; index+=3) {
        const bytes = [byteArray[index], byteArray[index+1], byteArray[index+2]]
        digits.push(
            bytes[0] >> 2,
            (bytes[0] & 3) << 4 | bytes[1] >> 4,
            (bytes[1] & 15) << 2 | bytes[2] >> 6,
            bytes[2] & 63
        );
    }

    const bytes = [byteArray[rounedLength], byteArray[rounedLength+1]]
    if (isNaN(bytes[0])) {
        // do nothing
    } else if (isNaN(bytes[1])) {
        digits.push(
            bytes[0] >> 2,
            (bytes[0] & 3) << 4
        )
    } else {
        digits.push(
            bytes[0] >> 2,
            (bytes[0] & 3) << 4 | bytes[1] >> 4,
            (bytes[1] & 15) << 2
        );
    }

    return digits.map(i => B64_KEY_STRING[i]).join("")
}


export function b64Decode(s: string): Uint8Array {
    const quadrupleNum = Math.floor(s.length / 4)
    const rounedLength = quadrupleNum * 4

    const bytes = []

    for (let index = 0; index < rounedLength; index += 4) {
        const digits = [b64FindCharCode(s.charCodeAt(index)), b64FindCharCode(s.charCodeAt(index+1)), b64FindCharCode(s.charCodeAt(index+2)), b64FindCharCode(s.charCodeAt(index+3))]
        bytes.push(
            (digits[0] << 2) | (digits[1] >> 4),
            ((digits[1] & 15) << 4) | digits[2] >> 2,
            ((digits[2] & 3) << 6) | digits[3],
        )
    }

    const digits = [b64FindCharCode(s.charCodeAt(rounedLength)), b64FindCharCode(s.charCodeAt(rounedLength+1)), b64FindCharCode(s.charCodeAt(rounedLength+2))]
    if (isNaN(digits[0])) {
        // do nothing
    } else if (isNaN(digits[1])) {
        bytes.push(digits[0] << 2)
    } else if (isNaN(digits[2])) {
        bytes.push(
            (digits[0] << 2) | (digits[1] >> 4),
            ((digits[1] & 15) << 4)
        )
    } else {
        bytes.push(
            (digits[0] << 2) | (digits[1] >> 4),
            ((digits[1] & 15) << 4) | digits[2] >> 2,
            ((digits[2] & 3) << 6),
        )
    }

    return new Uint8Array(bytes)
}