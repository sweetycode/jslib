import { useState } from "preact/hooks";
import { LocalStorageLruMap } from "./lrumap";
import { LocalStorageMap, SessionStorageMap, SimpleMap, type BaseStringMap } from "./map";


export function getSessionStorageMap(): BaseStringMap {
    return typeof sessionStorage === 'undefined'? new SimpleMap(): new SessionStorageMap()
}

export function getLocalStorageMap(): BaseStringMap {
    return typeof localStorage === 'undefined'? new SimpleMap(): new LocalStorageMap()
}


export function useLocalStorageMap(): BaseStringMap {
    return useState(() => {
        return getLocalStorageMap()
    })[0]
}

export function useLocalStorageValue(key: string, defaultValue: string|null = null, creation: boolean = false): string|null {
    const [value] = useState<string>(() => {
        const result = localStorage.get(key)
        return result == null ? defaultValue: result;
    })
    return value
}

export function useSessionStorageValue(key: string, defaultValue: string|(() => string), creation: boolean = false): string {
    const [value] = useState<string>((): string => {
        const sessionStorage = getSessionStorageMap()
        let result = sessionStorage.get(key)
        if (result != null)  {
            return result
        }
        result = typeof defaultValue === 'function' ? defaultValue(): defaultValue
        creation && sessionStorage.set(key, result)
        return result
    })
    return value
}

export function useLocalStorageState(key: string, defaultValue: (() => string)|string|null = null): [() => string|null, (value: string) => void]  {
    const [getValue, setValue] = useState(() => {
        const result = localStorage.get(key)
        return result == null ? defaultValue: result;
    })

    return [
        getValue(),
        (value: string) => {
            setValue(value)
            localStorage.setItem(key, value)
        }
    ]
}

export function useSessionStorageState(key: string, defaultValue: (() => string)|string|null = null): [() => string|null, (value: string) => void]  {
    const [getValue, setValue] = useState(() => {
        const result = sessionStorage.get(key)
        return result == null ? defaultValue: result;
    })

    return [
        getValue(),
        (value: string) => {
            setValue(value)
            sessionStorage.setItem(key, value)
        }
    ]
}

export function getLocalStorageLruMap({scope, maxSize, ttl}: {scope: string, maxSize: number, ttl: number}): BaseStringMap {
    return typeof localStorage === 'undefined'? new SimpleMap(): new LocalStorageLruMap({scope, maxSize, ttl})
}

export function useLocalStorageLruMap({scope, maxSize, ttl}: {scope: string, maxSize: number, ttl: number}): BaseStringMap {
    return useState(() => {
        return getLocalStorageLruMap({scope, maxSize, ttl})
    })[0]
}


export function useAppState({scope, maxSize, ttl}: {scope: string, initialValue?: string, maxSize: number, ttl: number}): [() => string|null, (value: string)=>void] {
    const sessionId = useSessionStorageValue(`${scope}.sessionId`, () => Date.now().toString(), true)
    const [lruCache] = useState(() => {
        return new LocalStorageLruMap({scope, maxSize, ttl})
    })

    return [
        () => lruCache.get(sessionId),
        (value: string)  => lruCache.set(sessionId, value)
    ]
}

