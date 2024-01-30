import { useCallback, useEffect, useRef } from "preact/hooks"
import { dynScript } from "@jslib/scripts/dynld"
import { debounce } from "@jslib/scripts/perf"

interface Props {
    value: string
    onChange?: (v:string) => void
    language?: string
    className?: string
}

interface MonacoEditor {
    editor: {
        create: (container: HTMLElement, options: {[key: string]: any}) => any
    }
}

function dynMonaco(): Promise<MonacoEditor> {
    return new Promise((resolve, reject) => {
        dynScript('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js')
        .then(() => {
            const windowRequire = (globalThis.require as any)
            windowRequire.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }})
            windowRequire(['vs/editor/editor.main'], () => resolve(window.monaco as MonacoEditor))
        }).catch(reject)
    })
}

export default function Monaco({className='h-full', value='', onChange, language}: Props) {
    const editorElem = useRef<any>(null)
    const editorRef = useRef<any>(null)

    const debouncedOnChange = useCallback(debounce((v: string) => {
        onChange && onChange(v)
    }, 300), [onChange])

    useEffect(() => {
        dynMonaco().then((monaco) => {
            const editor = editorRef.current = monaco.editor.create(editorElem.current, {
                automaticLayout: true,
                fontSize: 18,
                //renderSideBySide: true,
                lineNumbersMinChars: 3,
                language: language,
                value: value,
            });

            editor.getModel().onDidChangeContent((evt: any) => {
                debouncedOnChange(editor.getModel().getValue())
            })
        })
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose()
                editorRef.current = null
            }
        }
    }, [])

    return <div ref={editorElem} className={className}></div>
}