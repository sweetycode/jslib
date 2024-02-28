import { installScript, installStyle } from "@jslib/scripts/install"

export const HANDSONTABLE_SCRIPT = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js'

const HANDSONTABLE_STYLE = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css'

export interface HandsontableNamespace {
    (element: HTMLElement, options: {[key: string]: any}): Handsontable
}

export interface Handsontable {
    getData: () => Array<Array<any>>
    loadData: (csv: any) => void
    destroy: () => void
}


export async function installHandsontable(): Promise<HandsontableNamespace> {
    installStyle(HANDSONTABLE_STYLE)
    await installScript(HANDSONTABLE_SCRIPT)
    return (window as any)['Handsontable'] as HandsontableNamespace
}