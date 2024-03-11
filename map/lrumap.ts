import { BaseMap, LocalStorageMap, SimpleMap } from './map';

enum Trigger {
    Check,
    CheckAll,
    Read,
    Write,
    Delete,
    Clear,
}

function nowMilliSecond() {
    return Date.now()
}

function nowSecond() {
    return Math.floor(nowMilliSecond() / 1000)
}

function neverReachGuard(val: never) {}


class BaseLruMap<K, V> extends BaseMap<K, V> {
    private maxSize: number
    private ttl: number
    private valueMap: BaseMap<K, V>
    private timeMap: BaseMap<K, number>
    private quota: number = 0

    constructor({valueMap, timeMap, maxSize = 0, ttl = 0}: {valueMap: BaseMap<K, V>, timeMap: BaseMap<K, number>, maxSize: number, ttl: number}) {
        super()
        this.valueMap = valueMap
        this.timeMap = timeMap
        this.maxSize = maxSize
        this.ttl = ttl
    }

    get size():number {
        this.checkLru(Trigger.CheckAll)
        return this.valueMap.size
    }

    clear():void {
        this.checkLru(Trigger.Clear)
        this.valueMap.clear(); 
    }
    has(key: K): boolean {
        this.checkLru(Trigger.Check, key)
        return this.valueMap.has(key)
    }
    get(key: K): V|null {
        this.checkLru(Trigger.Read, key)
        return this.valueMap.get(key)
    }
    set(key: K, value: V): void {
        this.checkLru(Trigger.Write, key)
        this.valueMap.set(key, value)
    }
    delete(key: K): void {
        this.checkLru(Trigger.Delete, key)
        this.valueMap.delete(key)
    }

    keys(): IterableIterator<K> {
        this.checkLru(Trigger.CheckAll)
        return this.valueMap.keys()
    }

    entries(): IterableIterator<[K, V]> {
        this.checkLru(Trigger.CheckAll)
        return this.valueMap.entries()
    }

    private deleteEntry(key: K): void {
        this.valueMap.delete(key)
        this.timeMap.delete(key)
    }

    private checkLru(trigger: Trigger, key: K|null = null) {
        if (this.ttl == 0 && this.maxSize == 0) {  // No limitation
            return 
        }

        switch (trigger) {
        case Trigger.Clear:
            this.timeMap.clear()
            this.quota = 0
            return;  // No need any action
        case Trigger.Delete:
            key != null && this.timeMap.delete(key)
            this.quota += 1
            key = null
            return;  // No need further action
        case Trigger.Write:
            if (key != null) {
                const existing = this.timeMap.has(key)
                this.timeMap.set(key, nowSecond())
                this.quota += 1
                if (existing) {
                    return
                }
            }
            this.quota += 5
            key = null
            break;
        case Trigger.Read:
            if (key != null) {
                const existing = this.timeMap.has(key)
                if (existing) {
                    this.timeMap.set(key, nowSecond())
                }
            }
            this.quota += 1
            key = null
            break
        case Trigger.Check:
            this.quota += 1
            break;
        case Trigger.CheckAll:
            this.quota = 100
            break;
        default:
            neverReachGuard(trigger);
        }

        if (this.quota >= 100) {
            this.fullEvacuate()
            return
        }

        if (key != null) {
            if (this.overSize() > 0) {
                this.fullEvacuate()
            } else {
                this.partialEvacuate(key)
            }
        }
    }

    private partialEvacuate(key: K) {
        if (this.ttl == 0 || key == null) {
            return
        }
        const timestamp = this.timeMap.get(key)
        if (timestamp != null && nowSecond() - timestamp > this.ttl) {
            this.deleteEntry(key)
        }
    }

    private fullEvacuate() {
        this.evacuateExpired()
        this.evacuateOverSized()
        
        // reset weight
        this.quota = 0
    }

    private overSize(): number {
        return this.maxSize > 0? this.timeMap.size - this.maxSize: 0
    }

    private evacuateExpired() {
        if (this.ttl > 0) {
            const now = nowSecond()
            for(let [key, timestamp] of this.timeMap.entries()) {
                if (timestamp != null && now - timestamp > this.ttl) {
                    this.deleteEntry(key)
                }
            }
        }
    }

    private evacuateOverSized() {
        const overSize = this.overSize()
        if (overSize <= 0) {
            return 
        }
        const items = []
        for (let [key, timestamp] of this.timeMap.entries()) {
            items.push({key, timestamp})
        }
        items.sort((a, b) => a.timestamp - b.timestamp)
        for (let index = 0; index < overSize; index++) {
            this.deleteEntry(items[index].key)
        }
    }
}


export class SimpleLruMap<K, V> extends BaseLruMap<K, V> {
    constructor({maxSize = 0, ttl = 0}) {
        super({valueMap: new SimpleMap<K, V>, timeMap: new SimpleMap<K, number>(), maxSize, ttl})
    }
}

export class LocalStorageLruMap extends BaseLruMap<string, string> {
    constructor({scope, maxSize = 0, ttl = 0}: {scope: string, maxSize: number, ttl: number}) {
        super({
            valueMap: new LocalStorageMap(), 
            timeMap: new LocalStorageTimeMap(scope), 
            maxSize,
            ttl
        })
    }
}

class LocalStorageTimeMap extends BaseMap<string, number> {
    scope: string
    constructor(scope: string) {
        super()
        this.scope = scope
    }

    get size():number {return this.load().size}
    clear():void {this.save(new SimpleMap())}
    has(key: string): boolean {return this.load().has(key)}
    get(key: string): number|null {return this.load().get(key)}
    set(key: string, value: number): void {
        const timeMap = this.load();
        timeMap.set(key, value)
        this.save(timeMap)
    }
    delete(key: string): void {
        const timeMap = this.load();
        timeMap.delete(key)
        this.save(timeMap)
    }
    keys(): IterableIterator<string> {
        const timeMap = this.load();
        return timeMap.keys()
    }

    entries(): IterableIterator<[string, number]> {
        const timeMap = this.load();
        return timeMap.entries()
    }

    private load(): SimpleMap<string, number> {
        const result = new SimpleMap<string, number>()
        const value = localStorage.getItem(`${this.scope}.__k`)
        if (value != null) {
            for (let segment of value.split(';')) {
                const kv = segment.split(',', 2)
                if (kv.length != 2) {
                    console.error(`invalid format: ${segment}`)
                    continue
                }
                result.set(kv[0], parseInt(kv[1]))
            }
        }
        return result
    }

    private save(timeMap: SimpleMap<string, number>) {
        const items = []
        for (let key of timeMap.keys()) {
            items.push(`${key},${timeMap.get(key)}`)
        }
        const value = items.join(';')
        localStorage.setItem(`${this.scope}.__k`, value)
    }
}


