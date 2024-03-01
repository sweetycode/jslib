import { b64CharAt, b64DecodeInt, b64EncodeInt, b64FindCharCode } from './base64';


const DEBUG = (...data: any) => {}

const VT_STRING = 0
const VT_INTEGER = 1
const VT_BOOLEAN = 2
// const VT_OBJECT = 3

const KEY_LENGTH_MASK_BITS = 4
const KEY_LENGTH_MASK = (1 << KEY_LENGTH_MASK_BITS) - 1


/**
 * 
 * [key length and value type - b64][key][value]
 * - boolean value: 0 or 1
 * - number value: b64
 * - string value: [length - b64][value]
 * - null/undefined value: omit
 */
export function encodeObject(data: {[key: string]:number|string|boolean|undefined|null}): string {
    const result = []
    if (typeof data !== 'object') {
        throw new Error(`encodeObject can't work for other type data: ${data}`)
    }

    for (let key of Object.keys(data)) {
        if (key.length > KEY_LENGTH_MASK) {
            throw new Error(`key ${key} too long for encodeObject`)
        }
        const value = data[key]
        if (value == null) {
            continue
        }
        const {encodedValue, valueType} = encodeObjectValue(value)
        const encodedKey = encodeObjectKey(key, valueType)

        DEBUG({key, encodedKey, value, encodedValue})
        result.push(encodedKey, encodedValue)
    }
    return result.join('')
}

export function decodeObject(input: string): {[key: string]: any} {
    const result: {[key: string]: any} = {}
    while(input.length > 0) {
        const {key, valueType, length: keyLength} = decodeObjectKey(input)
        input = input.substring(keyLength)
        const {value, length: valueLength} = decodeObjectValue(input, valueType)
        input = input.substring(valueLength)
        result[key] = value
        DEBUG({key, value, valueType, keyLength, valueLength})
    }

    return result
}

function encodeObjectValue(value: string|number|boolean): {encodedValue: string, valueType: number} {
    if (typeof value === 'string') {
        return {encodedValue: b64EncodeInt(value.length) + value, valueType: VT_STRING}
    } else if (typeof value === 'boolean') {
        return {encodedValue: value?'1': '0', valueType: VT_BOOLEAN}
    } else if (typeof value === 'number') {
        return {encodedValue: b64EncodeInt(value), valueType: VT_INTEGER}
    } else {
        throw new Error(`unsupport value type of object: ${value}`)
    }
}

function decodeObjectValue(encodedValue: string, valueType: number): {value: string|number|boolean, length: number} {
    if (valueType == VT_INTEGER) {
        const {n, length} = b64DecodeInt(encodedValue)
        DEBUG('decodeObjectValue', {encodedValue, valueType, n, length})
        return {length, value: n}
    } else if (valueType == VT_STRING) {
        const {n: valueLength, length} = b64DecodeInt(encodedValue)
        return {length: valueLength + length, value: encodedValue.substring(length, valueLength + length)}
    } else if (valueType == VT_BOOLEAN) {
        return {length: 1, value: encodedValue.charAt(0) == '1'}
    } else {
        throw new Error(`unsupport value type of object: ${valueType}`)
    }
}

function encodeObjectKey(key: string, valueType: number): string {
    DEBUG('encodeObjectKey: ', {key, valueType, n: (valueType << KEY_LENGTH_MASK_BITS) + key.length})
    const encodedKeyLength = b64CharAt((valueType << KEY_LENGTH_MASK_BITS) + key.length)
    return encodedKeyLength + key
}

function decodeObjectKey(encodedKey: string): {key: string, valueType: number, length: number} {
    const keyLengthWithType = b64FindCharCode(encodedKey.charCodeAt(0))
    const keyLength = keyLengthWithType & KEY_LENGTH_MASK
    const valueType = keyLengthWithType >> KEY_LENGTH_MASK_BITS

    DEBUG('decodeObjectKey', {encodedKey, keyLengthWithType, keyLength, valueType})

    return {valueType, length: keyLength + 1, key: encodedKey.substring(1, keyLength+1)}
}