import { useCallback, useEffect, useRef } from "preact/hooks"
import { installScript } from "../scripts/install"
import { debounce } from "../scripts/perf"

interface Props {
    value: string
    onChange?: (v:string) => void
    language?: string
    className?: string
}

export interface MonacoEditor {
    editor: {
        create: (container: HTMLElement, options: {[key: string]: any}) => any
        createDiffEditor: (container: HTMLElement, options: {[key: string]: any}) => any
        createModel: (value: string, lang: string) => any
    }
}

export async function installMonaco(): Promise<MonacoEditor> {
    await installScript('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js')

    const windowRequire = (window as any).require as any
    windowRequire.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }})
    return new Promise((r) => {
        windowRequire(['vs/editor/editor.main'], () => r((window as any).monaco as MonacoEditor))
    })
}

export default function Monaco({className='h-screen', value='', onChange, language}: Props) {
    const editorElem = useRef<any>(null)
    const editorRef = useRef<any>(null)
    const editorValueRef = useRef<string|null>(value)

    useEffect(() => {
        installMonaco().then((monaco) => {
            const editor = editorRef.current = monaco.editor.create(editorElem.current, {
                automaticLayout: true,
                fontSize: 18,
                //renderSideBySide: true,
                lineNumbersMinChars: 3,
                language: language,
                value: value,
            });

            if (onChange != null) {
                editor.getModel().onDidChangeContent(debounce(() => {
                    const value = editor.getModel().getValue()
                    if (editorValueRef.current == value) {
                        return
                    }
                    //console.log('onChange')
                    onChange(editorValueRef.current = editor.getModel().getValue())
                }, 300))
            }
        })
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose()
                editorRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (editorRef.current == null || value == editorValueRef.current) {
            return
        }
        editorRef.current.getModel().setValue(value)
    }, [value])

    return <div ref={editorElem} className={className}></div>
}