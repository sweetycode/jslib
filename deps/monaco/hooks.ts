import { useEffect, useRef, type MutableRef } from "preact/hooks";
import { installMonaco } from "./install";
import type { ICodeEditor } from "./types";

export function useMonacoRef({containerRef, language='plaintext', value='', init}: {containerRef: MutableRef<HTMLDivElement|null>, value?: string, language?: string, init?:(editor: any) => void}): MutableRef<ICodeEditor|null>  {
    const editorRef = useRef<ICodeEditor|any>(null)

    useEffect(() => {
        installMonaco().then((monaco) => {
            const editor = editorRef.current = monaco.editor.create(containerRef.current!, {
                automaticLayout: true,
                fontSize: 18,
                //renderSideBySide: true,
                lineNumbersMinChars: 3,
                language: language,
                value: value,
            });

            if (init) {
                init(editor)
            }
        })
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose()
                editorRef.current = null
            }
        }
    })

    return editorRef
}
