export function mapGetOrCreate<K, V>(map: Map<K, V>, key: K, factory: V|((key: K) => V)): V {
    let value = map.get(key)
    if (value == null) {
        if (typeof factory === 'function') {
            value = (factory as (key: K) => V)(key)
        } else {
            value = factory
        }
        map.set(key, value)
    }
    return value
}

export function mapGetOrDefault<K, V>(map: Map<K, V>, key: K, factory: V|((key: K) => V)): V {
    let value = map.get(key)
    if (value == null) {
        if (typeof factory === 'function') {
            value = (factory as (key: K) => V)(key)
        } else {
            value = factory
        }
    }
    return value
}