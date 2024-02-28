import { sha1 } from "./crypt"


async function generateId(src: string): Promise<string> {
    const sign = await sha1(src)
    return sign.slice(0, 8)
}

const getNodeEventSource = (() => {
    const mapping = new Map<String, Promise<void>>()
    return async function(elem: HTMLElement, id: string) {
        const value = mapping.get(id)
        if (value != null) {
            return value
        }
        const eventSource = new Promise<void>((r, e) => {
            elem.addEventListener('load', () => r())
            elem.addEventListener('error', (reason) => e(reason))
        })
        mapping.set(id, eventSource)
        return eventSource
    }
})();


export const {setInstallDependecies, getInstallDependency} = (() => {
    var dependenciesMap = new Map<string, () => Promise<void>>()
    return {
        setInstallDependecies(dependencies: {[key: string]:() => Promise<void>}) {
            Object.keys(dependencies).forEach(key => {
                dependenciesMap.set(key, dependencies[key])
            })
        },
        getInstallDependency(src: string): (() => Promise<void>) | null {
            const value = dependenciesMap.get(src)
            if (value == null) {
                return null
            }
            return value
        }
    }
})();


export async function installScript(
    src: string
): Promise<void> {
    const dependency = getInstallDependency(src)
    if (dependency != null) {
        await dependency()
    }

    const id = await generateId(src)
    let el = document.getElementById(id)
    if (el == null) {
        el = document.createElement('script');
        el.setAttribute('id', id)
        el.setAttribute('src', src)
        document.body.appendChild(el)
    }

    return getNodeEventSource(el, id)
}

export async function installStyle(href: string): Promise<void> {
    const id = await generateId(href)
    let el = document.getElementById(id)
    if (el == null) {
        el = document.createElement('link')
        el.setAttribute('rel', 'stylesheet')
        el.setAttribute('id', id)
        el.setAttribute('type', 'text/css')
        el.setAttribute('href', href)
        document.head.appendChild(el)
    }
}

export async function installInlineScript(script: string, id?: string): Promise<void> {
    const elemId = id || await generateId(script)
    let el = document.getElementById(elemId)
    if (el == null) {
        el = document.createElement('script')
        el.setAttribute('id', elemId)
        el.innerHTML = script
        document.body.appendChild(el)
    }
}

export async function installInlineStyle(style: string, id?: string): Promise<void> {
    const elemId = id || await generateId(style)
    let el = document.getElementById(elemId)
    if (el == null) {
        el = document.createElement('style')
        el.setAttribute('id', elemId)
        el.innerText = style
        document.head.appendChild(el)
    }
}