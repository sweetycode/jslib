import { createUnmanaged } from "@jslib/scripts/unmanaged";
import { installHandsontable, type Handsontable } from "./install";
import { debounce } from '../../scripts/perf';


interface Options {
    onChange?: (table: Handsontable) => void
    debounce?: number
}

export async function createUnmanagedHandsontable(container: HTMLElement, {onChange, debounce: debounceMs=500}: Options) {
    return await createUnmanaged('handsontable', container, async () => {
        const handsontable = await installHandsontable()
        const table = handsontable(container, {
            licenseKey: 'non-commercial-and-evaluation',
            afterChange: onChange != null ? debounce(() => onChange(table), debounceMs): undefined,
        });
        
        return table
    })
}