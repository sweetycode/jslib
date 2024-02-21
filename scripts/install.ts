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


export async function installScript(
    src: string
): Promise<void> {
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