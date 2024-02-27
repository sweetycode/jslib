import { useEffect, type MutableRef } from "preact/hooks";
import { installSplitJs } from "./install";

export function useRefSplitJs({refs, initializeStyle=true, options={}}: {refs: MutableRef<HTMLDivElement|null>[], initializeStyle?: boolean, options?: {[key:string]: any}}) {
    useEffect(() => {
        let instance: any = null
        installSplitJs(initializeStyle !== false).then((splitJs) => {
            instance = splitJs(refs.map(ref => ref.current) as HTMLElement[], options)
        });
        return () => {
            if (instance != null) {
                instance.destroy()
                instance = null
            }
        }
    }, [])
}