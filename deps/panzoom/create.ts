import { installPanzoom, type Panzoom } from "./install"

export async function createUnmanagedPanzoom(container: HTMLElement): Promise<Panzoom> {
    return installPanzoom().then(panzoom => {
        return panzoom(container, {})
    })
}