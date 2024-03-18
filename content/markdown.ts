// @ts-ignore
import { marked } from "marked"
import type { ContentEntry } from "./blog"
import { render, type TemplateContext } from "./template_engine"

interface HasVars {
    vars?: {[key: string]: string}
}


export function renderMarkdown<T extends HasVars>(content: ContentEntry<T>, ctx: TemplateContext = {}): string {
    const vars = content.data.vars ? content.data.vars: {}
    return marked.parse(render(content.body, {
        ...ctx,
        vars: {
            ...ctx.vars,
            ...vars,
        }
    })) as string
}