import { installScript } from "@jslib/scripts/install";

interface PlantumlEncoder {
    encode(source: string): string
}

export const PLANTUML_SCRIPT = 'https://cdn.jsdelivr.net/npm/plantuml-encoder@1.3.0/dist/plantuml-encoder.min.js'

export async function installPlantUmlEncoder(): Promise<PlantumlEncoder> {
    return await installScript(PLANTUML_SCRIPT).then(() => {
        return (window as any)['plantumlEncoder'] as PlantumlEncoder
    })
}