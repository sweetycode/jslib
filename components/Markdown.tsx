import { render, type Context } from '../content/template_engine'
// @ts-ignore: Allow host project lack of the external dependeny
import {marked} from 'marked'

marked.use({renderer: {
    paragraph(text: string): string|false {
        if (text.trim().startsWith('<astro')) {
            return text
        }
        return false
    }
}})


function getPrefixedWhitespace(s: string): string {
    return /^\s*/.exec(s)![0]
}

function stripPrefiexedWhitespace(s: string): {result: string, prefixedWhitespace?: string} {
    /**
     * As astro automatically strip beginning whitespace from first line, 
     * we have to check the second line.
     */

    const lines = s.split('\n')
    let nonWhitespaceLines = []
    for (let line of lines) {
        if (/^\s*$/.test(line)) {
            continue
        }
        nonWhitespaceLines.push(line)
        if (nonWhitespaceLines.length == 2) {
            break
        }
    }

    if (nonWhitespaceLines.length < 2) {
        return {result: s}
    }

    var prefixedWhitespace = getPrefixedWhitespace(nonWhitespaceLines[1])

    var prefixPattern = new RegExp(`^${prefixedWhitespace}`)
    return {result: lines.map(s => s.replace(prefixPattern, '')).join('\n'), prefixedWhitespace,}
}

export default function Markdown({children, context={}, debug}: {children?: any, context: Context, debug?: boolean}) {
    if (!children) {
        return;
    }
    const rawInput: string = children!.props.value.toString()
    const {result: markdown, prefixedWhitespace} = stripPrefiexedWhitespace(rawInput)
    //const instructedMarkdown = instructMarkdown(markdown)
    const fixedMarkdown = fixAstroComponent(markdown)
    const renderedMarkdown = render(fixedMarkdown, context)
    if (debug) {
        console.log({rawInput, prefixedWhitespace, markdown, renderedMarkdown})
    }
    const html = marked.parse(renderedMarkdown) as string
    return <div dangerouslySetInnerHTML={{__html: html}}></div>
}

function fixAstroComponent(source: string): string {
    return source.split('\n').map(line => line.startsWith('<astro') ? '\n' + line + '\n': line).join('\n')
}

