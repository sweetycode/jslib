import { installScript } from "@jslib/scripts/install"

export const MERMAID_SCRIPT = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js'


interface MermaidApi {
    initialize: ({startOnLoad}: {startOnLoad: boolean}) => void
    render: (id: string, source: string) => Promise<{svg: string}>
}

// mermaid.initialize({ startOnLoad: false });
export async function installMermaid(): Promise<MermaidApi> {
    return installScript(MERMAID_SCRIPT).then(() => {
        return (window as any)['mermaid'] as MermaidApi
    }).then((mermaidApi) => {
        mermaidApi.initialize({startOnLoad: false})
        return mermaidApi
    })
}