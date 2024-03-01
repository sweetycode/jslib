import { b64CharAt } from "./base64"

function hashCode(s: string) {
    const length = s.length
    let result = 0
    for (let i = 0; i < length; i++) {
        result = ((result * 31) & 0xFFFFFFFF) + s.charCodeAt(i)
    }
    return result
}

function getVerifyCode(s: string): [() => string, () => string] {
    const c1 = () => (s.length * 31) & 15
    const c2 = () => hashCode(s) & 15
    return [() => b64CharAt(c1()), () => b64CharAt(c2())]
}

export function seal(source: string): string {
    if (source.length == 0) {
        return ''
    }

    const [c1, c2] = getVerifyCode(source)
    
    return c1() + c2() + source
}

export function unseal(sealed: string): {source?: string, ok: boolean} {
    if (sealed.length < 3) {
        return {ok: false}
    }
    const source = sealed.substring(2)
    const [c1, c2] = getVerifyCode(source)
    if (c1() == sealed[0] && c2() == sealed[1]) {
        return {source, ok: true}
    }
    return {ok: false}
}