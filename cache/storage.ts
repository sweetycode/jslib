// interface Storage {
//     setString(key: string, value: string|null): void
//     getString(key: string, defaultValue: string|null): string|null
//     getObject<T>(key: string, defaultValue: T|null): T|null
//     setObject<T>(key: string, value: T): void
//     removeItem(key: string): void
// }


export interface IStorage {
    setItem: (key: string, value: string) => void
    getItem: (key: string) => string|null
    removeItem: (key: string) => void
}


class Storage {
    setItem(key: string, value: string): void {
        localStorage.setItem(key, value)
    }

    getItem(key: string, defaultValue: string|null = null): string|null {
        const value =localStorage.getItem(key)
        return value != null? value: defaultValue
    }

    getObject<T>(key: string, defaultValue: T|null): T|null {
        const value = this.getItem(key)
        if (value == null) {
            return defaultValue
        } else {
            return JSON.parse(value)
        }
    }

    setObject<T>(key: string, value: T) {
        this.setItem(key, JSON.stringify(value))
    }

    removeItem(key: string) {
        localStorage.removeItem(key)
    }

    removeObject(key: string) {
        this.removeItem(key)
    }
}

export const defaultStorage = new Storage()