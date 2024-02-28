import { useEffect, useRef, type MutableRef } from 'preact/hooks';
import { installHandsontable, type Handsontable } from './install';
export function useHandsontable({containerRef, options}: {containerRef: MutableRef<HTMLDivElement|null>, options: any}) {
    const tableRef = useRef<Handsontable|null>(null)
    useEffect(() => {
        installHandsontable().then(handsontable => {
            const table = tableRef.current = handsontable(containerRef.current!, {...options, licenseKey: 'non-commercial-and-evaluation'})
        })
        return () => {
            if (tableRef.current != null) {
                tableRef.current.destroy()
                tableRef.current = null
            }
        }
    }, [])
    return tableRef
}