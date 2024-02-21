import { installScript } from "../../scripts/install"
import type { MonacoNamespace } from "./types"

export async function installMonaco(): Promise<MonacoNamespace> {
    await installScript('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js')

    const windowRequire = (window as any).require as any
    windowRequire.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }})
    return new Promise((r) => {
        windowRequire(['vs/editor/editor.main'], () => r((window as any).monaco as MonacoNamespace))
    })
}