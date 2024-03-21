import { installScript } from "../../scripts/install"
import type { MonacoApi } from "./types"

export const MONACO_SCRIPT = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js'

export async function installMonaco(): Promise<MonacoApi> {
    await installScript(MONACO_SCRIPT)

    const windowRequire = (window as any).require as any
    windowRequire.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }})
    return new Promise((r) => {
        windowRequire(['vs/editor/editor.main'], () => r((window as any).monaco as MonacoApi))
    })
}