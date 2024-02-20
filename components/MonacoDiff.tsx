import { useEffect, useRef } from "preact/hooks";
import { installMonaco, type MonacoEditor } from "./Monaco";

export default function MonacoDiff({value1, value2, className='h-screen'}: {value1: string, value2: string, className?: string}) {
    const containerRef = useRef<HTMLDivElement|null>(null)
    const editorRef = useRef(null)
    useEffect(() => {
        installMonaco().then((monaco: MonacoEditor) => {
            const editor = editorRef.current = monaco.editor.createDiffEditor(containerRef.current!, {
                automaticLayout: true,
				fontSize: 18,
				originalEditable: true,
				lineNumbersMinChars: 3,
				renderMarginRevertIcon: false,
				useInlineViewWhenSpaceIsLimited: false,
            })

            editor.setModel({original: monaco.editor.createModel('', 'javascript'), modified: monaco.editor.createModel('', 'javascript')})
        })
    }, [])

    return <div ref={containerRef} className={className}></div>
}