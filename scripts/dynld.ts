import { sha1 } from "./crypt"


function makeTagId(type: "js"|"css", sign: string): string {
    return `dyn${type}_${sign.slice(0, 8)}`
}

export async function dynScript(
    src: string
): Promise<{success: boolean, firstTime: boolean}> {
    const sign = await sha1(src)
    const tagId = makeTagId('js', sign)
    let el = document.getElementById(tagId)
    if (el != null) {
        console.log(`duplicated dyn load script: ${src}`)
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
