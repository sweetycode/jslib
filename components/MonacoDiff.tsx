import { useEffect, useRef } from "preact/hooks";
import { installMonaco,  } from "../deps/monaco/install"
import { type IDiffEditor } from "../deps/monaco/types";

export default function MonacoDiff({value1, value2, lang='plaintext', className='h-screen'}: {value1: string, value2: string, lang?: string, className?: string}) {
    const containerRef = useRef<HTMLDivElement|null>(null)
    const editorRef = useRef<IDiffEditor|null>(null)
    useEffect(() => {
        installMonaco().then((monaco) => {
            const editor = editorRef.current = monaco.editor.createDiffEditor(containerRef.current!, {
                automaticLayout: true,
				fontSize: 18,
				originalEditable: true,
				lineNumbersMinChars: 3,
				renderMarginRevertIcon: false,
				useInlineViewWhenSpaceIsLimited: false,
            })

            editor.setModel({original: monaco.editor.createModel(value1, lang), modified: monaco.editor.createModel(value2, lang)})
        })
    }, [])

    return <div ref={containerRef} className={className}></div>
}