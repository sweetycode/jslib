import { sha1 } from "./crypt"

const dependenciesMap = new Map<string, () => Promise<void>>()
const eventSourceMap = new Map<string, Promise<void>>()



async function generateId(src: string): Promise<string> {
    const sign = await sha1(src)
    return sign.slice(0, 8)
}


export function setInstallDependecies(dependencies: {[key: string]:() => Promise<void>}) {
    Object.keys(dependencies).forEach(key => {
        dependenciesMap.set(key, dependencies[key])
    })
}

export function getInstallDependency(src: string): (() => Promise<void>) | null {
    const value = dependenciesMap.get(src)
    if (value == null) {
        return null
    }
    return value
}


export async function installScript(
    src: string
): Promise<void> {
    const exsiting = eventSourceMap.get(src)
    if (exsiting) {
        return exsiting
    }

    // install dependencies
    const dependency = getInstallDependency(src)
    if (dependency != null) {
        await dependency()
    }

    // create element
    const el = document.createElement('script');
    el.setAttribute('src', src)

    const eventSource = new Promise<void>((r, e) => {
        el.addEventListener('load', () => r())
        el.addEventListener('error', (reason) => e(reason))
    })
    eventSourceMap.set(src, eventSource)
    document.head.appendChild(el)

    return eventSource
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

const inlineStyleSet = new Map<string, HTMLElement>()
export function installInlineStyle(style: string): () => void {
    if (!inlineStyleSet.has(style)) {
        const el = document.createElement('style')
        el.innerHTML = style
        document.head.appendChild(el)
        inlineStyleSet.set(style, el)
    }
    
    return () => uninstallInlineStyle(style)
}

function uninstallInlineStyle(style: string) {
    const elem = inlineStyleSet.get(style)
    if (elem != null) {
        elem.remove()
        inlineStyleSet.delete(style)
    }
}
