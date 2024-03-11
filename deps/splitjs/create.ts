import { installSplitJs } from "./install";

export async function createUnmanagedSplitjs(elements: HTMLDivElement[], {useDefaultStyle=true}) {
    return installSplitJs(useDefaultStyle !== false).then((splitJs) => {
        return splitJs(elements, {})
    });
}