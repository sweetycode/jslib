import { mapGetOrCreate, mapGetOrDefault } from "./collections"
import { defaultThrottledCache, now, type ThrottledCache } from "./throttledCache"

const DEBUG = (...args: any) => console.log(...args)

// a key item for persisting
interface KeyEntry {
    k: string // key
    t: number // timestamp of second, read or update
}

interface KeysMapInplaceOperation {
    (keysMap: Map<string, number>): void
}

function keyEntriesToMap(keyEntries: KeyEntry[]): Map<string, number> {
    const result = new Map<string, number>
    keyEntries.forEach(entry => result.set(entry.k, entry.t));
    return result
}

function keysMapToEntries(keysMap: Map<string, number>): KeyEntry[] {
    const result: KeyEntry[] = []
    for (let key of keysMap.keys()) {
        result.push({k: key, t: keysMap.get(key)!})
    }
    return result
}

class LRUStrategy {
    maxSize?: number
    ttl?: number
    removeKeys: (keys: string[]) => void

    constructor({maxSize, ttl, removeKeys}: {maxSize?: number, ttl?: number, removeKeys: (keys: string[]) => void}) {
        this.maxSize = maxSize
        this.ttl = ttl
        this.removeKeys = removeKeys
    }

    applyStrategy(keysMap: Map<string, number>) {
        // sorted from newest to oldest
        let keys = keysMapToEntries(keysMap).sort((a, b) => b.t - a.t)
        if (keys.length == 0) {
            return
        }

        let splitIndex = keys.length
        if (this.maxSize != null && this.maxSize < splitIndex) {
            splitIndex = this.maxSize
        }
        if (this.ttl != null) {
            const timestamp = now()
            for (; splitIndex > 0; splitIndex--) {
                if (timestamp - keys[splitIndex-1].t < this.ttl) {
                    break
                }
            }
        }
        if (splitIndex < keys.length) {
            this.removeKeys(keys.slice(splitIndex).map(entry => entry.k))
        }
    }
}

function getScopeRegistryKey(scope: string) {
    return `${scope}.__k`
}

function getScopeKey(scope: string, key: string) {
    return `${scope}.${key}`
}


class KeyRegistryManager {
    throttledCache: ThrottledCache
    lruStrategy: LRUStrategy

    // {scope => {key => lastTouchAt}}
    registry: Map<string, Map<string, number>> = new Map()
    // {scope => operation}
    operations: Map<string, KeysMapInplaceOperation[]> = new Map()

    constructor(throttledCache: ThrottledCache, lruStrategy: LRUStrategy) {
        this.throttledCache = throttledCache
        this.lruStrategy = lruStrategy
    }

    onGetItem(scope: string, key: string) {
        this.throttledUpdateScopeKeys(scope, 1, (keysMap) => {
            if (keysMap.has(key)) {
                keysMap.set(key, now())
            }
        })
    }

    onSetItem(scope: string, key: string) {
        this.throttledUpdateScopeKeys(scope, 1, (keysMap) => {
            keysMap.set(key, now())
        })
    }

    onRemoveItem(scope: string, key: string) {
        this.throttledUpdateScopeKeys(scope, 1, (keysMap) => {
            keysMap.delete(key)
        })
    }

    private throttledUpdateScopeKeys(scope: string, throttle: number, operation: KeysMapInplaceOperation) {
        DEBUG(`throttledUpdateScopeKeys, scope: ${scope}, throttle: ${throttle}, operation: ${operation}`)
        mapGetOrCreate(this.operations, scope, [])
            .push(operation)

        const scopeKey = getScopeRegistryKey(scope)
        this.throttledCache.setItem(scopeKey, () => {
            /**
             * 1. load from store
             * 2. get pending operations
             * 3. execute operation AND update the cache
             * 4. clear pending operations
             * 5. return value to store
             */
            const value = this.throttledCache.getItem(scopeKey, 0)
            DEBUG(`throttledUpdateScopeKeys setItem, scopeKey:${scopeKey}, value: ${value}`)
            const keyEntries = value == null ? []: JSON.parse(value) as KeyEntry[]
            const keysMap = keyEntriesToMap(keyEntries)
            this.registry.set(scope, keysMap)

            mapGetOrDefault(this.operations, scope, []).forEach(operation => {
                operation(keysMap)
            })
            this.operations.delete(scope)

            // LRU
            this.lruStrategy.applyStrategy(keysMap)

            let latestKeyEntries = keysMapToEntries(keysMap)
            return JSON.stringify(latestKeyEntries)
        }, throttle)
    }
}

export class LruCache {
    scope: string
    throttledCache: ThrottledCache
    keyRegistryManager: KeyRegistryManager

    constructor({scope, maxSize, ttl}: {scope: string, maxSize?: number, ttl?: number}) {
        this.scope = scope
        this.throttledCache = defaultThrottledCache
        const lruStrategy = new LRUStrategy({maxSize, ttl, removeKeys: (keys) => this.removeKeys(keys)})
        this.keyRegistryManager = new KeyRegistryManager(this.throttledCache, lruStrategy)
    }

    getItem(key: string, rotten?: number): string|null {
        this.keyRegistryManager.onGetItem(this.scope, key)
        return this.throttledCache.getItem(getScopeKey(this.scope, key), rotten)
    }

    setItem(key: string, value: string, throttle: number = 30) {
        this.keyRegistryManager.onSetItem(this.scope, key)
        return this.throttledCache.setItem(getScopeKey(this.scope, key), value, throttle)
    }

    removeItem(key: string) {
        this.keyRegistryManager.onRemoveItem(this.scope, key)
        return this.throttledCache.removeItem(getScopeKey(this.scope, key))
    }

    private removeKeys(keys: string[]) {
        console.log('remove keys by lru:', keys)
        keys.forEach(key => this.removeItem(key))
    }
}

export class FakeStorage {
    constructor() {
    }

    getItem(key: string): string|null {
        return null
    }

    setItem(key: string, value: string) {
    }

    removeItem(key: string) {
    }
}