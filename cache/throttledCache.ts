import {defaultStorage, type IStorage } from "./storage"

const DEBUG = (...args: any) => console.log(...args)


export function now(): number {
    return Math.floor(Date.now() / 1000)
}


class LazyString {
    _value: string|null = null
    _func: (() => string)|null = null

    constructor(value: string|(()=>string)) {
        if (typeof value === 'function') {
            this._func = value
        } else {
            this._value = value
        }
    }

    getValue(): string {
        if (this._value == null && this._func != null) {
            this._value = this._func()
            this._func = null
        }
        return this._value!
    }
}


export class ThrottledCache {
    valuesRegistry: Map<string, {lazyString: LazyString, timestamp: number}> = new Map()
    schedules: Map<string, {timer: number, timestamp: number}> = new Map()
    
    storage: IStorage
    rotten: number

    constructor(storage: IStorage, rotten: number = 5 * 60) {
        this.storage = storage
        this.rotten = rotten
    }

    private scheduleUpdate(key: string, throttle: number) {
        const schedule = this.schedules.get(key)
        const ts = now()

        DEBUG(`scheduleUpdate, key: ${key}, throttle: ${throttle} `, {schedule})
        if (schedule == null || schedule.timer == 0 || schedule.timestamp > ts + throttle) {
            if (schedule != null && schedule.timer != 0) {
                clearTimeout(schedule.timer)
            }
            this.schedules.set(key, {
                timer: setTimeout(() => this.flushKey(key), throttle),
                timestamp: now() + throttle,
            })
        }
    }

    private flushKey(key: string) {
        DEBUG(`flush key: ${key}`)
        this.schedules.set(key, {timer: 0, timestamp: 0})

        const valueEntry = this.valuesRegistry.get(key)
        if (valueEntry != null) {
            this.storage.setItem(key, valueEntry.lazyString.getValue())
        }
    }

    getItem(key: string, rotten?: number): string|null {
        const valueEntry = this.valuesRegistry.get(key)
        DEBUG(`getItem:`, {valueEntry})
        if (valueEntry != null) {
            const {lazyString, timestamp} = valueEntry
            const useRotten = rotten != null ? rotten: this.rotten
            if (useRotten > now() - timestamp) {
                return lazyString.getValue()
            }
        }

        // load value from storage, and populate the cache
        const value = this.storage.getItem(key)
        if (value != null) {
            this.valuesRegistry.set(key, {lazyString: new LazyString(value), timestamp: now()})
        }
        return value
    }

    setItem(key: string, value: string|(() => string), throttle: number = 30): void {
        this.valuesRegistry.set(key, {lazyString: new LazyString(value), timestamp: now()})
        this.scheduleUpdate(key, throttle)
    }

    removeItem(key: string) {
        this.valuesRegistry.delete(key)
        this.storage.removeItem(key)
    }
}


export const defaultThrottledCache = new ThrottledCache(defaultStorage)
