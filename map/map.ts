
export abstract class BaseMap<K, V> {
    abstract get size(): number

    abstract clear():void
    abstract has(key: K): boolean
    abstract get(key: K): V|null
    abstract set(key: K, value: V): void
    abstract delete(key: K): void
    abstract keys(): IterableIterator<K>
    abstract entries(): IterableIterator<[K,V]>

    getOrCreate(key: K, value: (() => V)|V): V {
        const v = this.get(key)
        if (v != null) {
            return v
        }
        if (typeof value === 'function') {
            const evaluted = (value as (() => V))()
            this.set(key, evaluted);
            return evaluted;
        } else {
            this.set(key, value)
            return value
        }
    }

    getOrDefault(key: K, value: (() => V)|V): V {
        const v = this.get(key)
        if (v != null) {
            return v
        }
        if (typeof value === 'function') {
            const evaluted = (value as (() => V))()
            return evaluted;
        } else {
            return value
        }
    }
}

export abstract class BaseStringMap extends BaseMap<string, string> {

}


export class SimpleMap<K, V> extends BaseMap<K, V> {
    private map = new Map<K, V>()

    get size():number {return this.map.size}
    clear():void {this.map.clear()}
    has(key: K): boolean {return this.map.has(key)}
    get(key: K): V|null {let v = this.map.get(key); return v == undefined? null: v}
    set(key: K, value: V): void {this.map.set(key, value)}
    delete(key: K): void {this.map.delete(key)}
    //
    keys(): IterableIterator<K> {return this.map.keys()}
    entries(): IterableIterator<[K,V]> {return this.map.entries()}
}


export class LocalStorageMap extends BaseStringMap {
    get size():number {return localStorage.length}
    clear():void {localStorage.clear()}
    has(key: string): boolean {return key in localStorage}
    get(key: string): string|null {return localStorage.getItem(key)}
    set(key: string, value: string): void {localStorage.setItem(key, value)}
    delete(key: string): void {localStorage.removeItem(key)}
    keys(): IterableIterator<string> {return (null as any) as IterableIterator<string>}
    entries(): IterableIterator<[string, string]> {return (null as any) as IterableIterator<[string, string]>}
}

export class SessionStorageMap extends BaseStringMap {
    get size():number {return sessionStorage.length}
    clear():void {sessionStorage.clear()}
    has(key: string): boolean {return key in sessionStorage}
    get(key: string): string|null {return sessionStorage.getItem(key)}
    set(key: string, value: string): void {sessionStorage.setItem(key, value)}
    delete(key: string): void {sessionStorage.removeItem(key)}
    keys(): IterableIterator<string> {return (null as any) as IterableIterator<string>}
    entries(): IterableIterator<[string, string]> {return (null as any) as IterableIterator<[string, string]>}
}


