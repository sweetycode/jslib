import { installScript } from "@jslib/scripts/install"

export const PANZOOM_SCRIPT = 'https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.min.js'


export interface PanzoomNamespace {
    (element: HTMLElement, options: {[key: string]: any}): Panzoom
}

export interface Panzoom {
    zoomIn: () => void
    zoomOut: () => void
    reset: () => void
    zoom: (n: number) => void
    zoomWithWheel: (event: WheelEvent) => void
}

export async function installPanzoom(): Promise<PanzoomNamespace> {
    await installScript(PANZOOM_SCRIPT)
    return (window as any)['Panzoom'] as PanzoomNamespace
}