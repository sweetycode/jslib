import { useEffect, useRef, type MutableRef } from 'preact/hooks';
import { installPanzoom, type Panzoom } from "./install";

export function usePanzoom({containerRef, init}: {containerRef: MutableRef<HTMLDivElement|null>, init?: (panzoom: Panzoom) => void}) {
    const panzoomRef = useRef<Panzoom|null>(null)
    useEffect(() => {
        installPanzoom().then(panzoom => {
            const instance = panzoomRef.current = panzoom(containerRef.current!, {})
            init && init(instance)
        })
    }, [])

    return panzoomRef
}