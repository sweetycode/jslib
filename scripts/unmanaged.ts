import { SimpleMap } from "@jslib/map/map"

const INSTANCES_MAP = new SimpleMap<string, any>()

const UNIQUE_ID_SEQ = new SimpleMap<string, number>()


function getUniqueId(namespace: string): string {
    const seq = UNIQUE_ID_SEQ.getOrDefault(namespace, 1)
    const result = `${namespace}-${seq}`
    UNIQUE_ID_SEQ.set(namespace, seq + 1)
    return result
}

function getNamespaceIdentifier(namespace: string): string {
    return `${namespace}Id`
}


function getInstanceSlot(namespace: string, elem: HTMLElement) {
    return {
        getInstance(): any|null {
            const id = elem.dataset[getNamespaceIdentifier(namespace)]
            if (id != null) {
                return INSTANCES_MAP.get(id) || null
            }
            return null
        },
        setInstance(instance: any) {
            const id = getUniqueId(namespace)
            INSTANCES_MAP.set(id, instance)
            elem.dataset[getNamespaceIdentifier(namespace)] = id
        }
    }
}


export async function createUnmanaged<T>(namespace: string, container: HTMLElement, factory: () => Promise<T>): Promise<T> {
    if (container == null) {
        throw new Error(`failed to create ${namespace} due to null container element.`)
    }

    const {getInstance, setInstance} = getInstanceSlot(namespace, container)
    const instance = getInstance()
    if (instance != null) {
        return instance
    }

    const newInstance = await factory()
    setInstance(newInstance)
    return newInstance
}