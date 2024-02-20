import { sha1 } from "./crypt"


function genTagId(type: "js"|"css", sign: string): string {
    return `dy${sign.slice(0, 8)}`
}

export async function installScript(
    src: string
): Promise<{success: boolean, firstTime: boolean}> {
    const sign = await sha1(src)
    const tagId = genTagId('js', sign)
    let el = document.getElementById(tagId)
    if (el != null) {
        console.log(`skip duplicated dynload script: ${src}`)
        return {success: el.dataset.ok === '1', firstTime: false}
    }
    return new Promise(r => {
        el = document.createElement('script');
        el.setAttribute('id', tagId)
        el.setAttribute('src', src)

        function listener(success: boolean) {
            el!.dataset.ok = success? '1': '0'
            if (!success) {
                console.log(`failed to dyn load script: ${src}`)
            }
            r({success, firstTime: true})
        }
        el.addEventListener('load', () => listener(true))
        el.addEventListener('error', () => listener(false))
        document.body.appendChild(el)
    })
}

export async function installStyle(src: string): Promise<void> {
    const sign = await sha1(src)
    const tagId = genTagId('js', sign)
    let el = document.getElementById(tagId)
    if (el != null) {
        console.log(`skip duplicated dynload style: ${src}`)
        return
    }

    return new Promise(r => {
        el = document.createElement('link')
        el.setAttribute('rel', 'stylesheet')
        el.setAttribute('id', tagId)
        el.setAttribute('type', 'text/css')
        el.setAttribute('href', src)

        function listener(success: boolean) {
            el!.dataset.ok = success? '1': '0'
            if (!success) {
                console.log(`failed to dynload style: ${src}`)
            }
            r()
        }
        el.addEventListener('load', () => listener(true))
        el.addEventListener('error', () => listener(false))
        document.head.appendChild(el)
    })
}