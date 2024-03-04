import { useState } from "preact/hooks";
import { FakeStorage, LruCache } from "./lruCache";

export function useSessionValue(key: string, defaultValue: (() => string)): [string, (newValue: string) => void] {
    const [value, setValue] = useState<string>(() => {
        if (typeof sessionStorage === 'undefined') {  // node env
            return defaultValue()
        }
        const result = sessionStorage.getItem(key)
        if (result != null) {
            return result
        } else {
            const value = defaultValue()
            sessionStorage.setItem(key, value)
            return value
        }
    })

    return [value, (newValue) => {
        sessionStorage.setItem(key, newValue)
        setValue(newValue)
    }]
}

export function useLocalStorage(): Storage  {
    const [cache] = useState(() => {
        if (typeof localStorage === 'undefined') { // node env
            return new FakeStorage() as Storage
        }
        return localStorage
    })
    return cache
}

export function useLruCache({scope, maxSize, ttl}: {scope: string, maxSize?: number, ttl?: number}): LruCache {
    const [cache] = useState(() => {
        if (typeof localStorage === 'undefined') { // node env
            return new FakeStorage() as LruCache
        }
        return new LruCache({scope, maxSize, ttl})
    })
    return cache
}