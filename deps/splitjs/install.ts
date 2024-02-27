import { installInlineStyle, installScript } from "@jslib/scripts/install";

// https://split.js.org/#/

const DEFAULT_STYLE = `
.split {
    display: flex;
    flex-direction: row;
}
.gutter {
    background-color: #eee;
    background-repeat: no-repeat;
    background-position: 50%;
}

.gutter.gutter-horizontal {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: col-resize;
}
`

interface SplitJS {
    (elements: HTMLElement[], options?: {[key: string]: any}): any
}

export const SPLITJS_SCRIPT = 'https://cdn.jsdelivr.net/npm/split.js@1.6.5/dist/split.min.js'

export async function installSplitJs(initializeStyle: boolean = true): Promise<SplitJS> {
    if (initializeStyle) {
        await installInlineStyle(DEFAULT_STYLE)
    }
    return await installScript(SPLITJS_SCRIPT)
        .then(() => {
            return (window as any)['Split'] as SplitJS
        })
}