import { createUnamangedCodeEditor } from "@jslib/deps/monaco/create"
import { useEffect, useRef } from "preact/hooks"

interface Props {
    value?: string
    language?: string
    className?: string
}

export default function MonacoEditor({className='h-screen', value='', language='plaintext'}: Props) {
    const containerRef = useRef<HTMLDivElement|null>(null)
    useEffect(() => {
        createUnamangedCodeEditor(containerRef.current!, {value, language})
    }, [])

    return <div ref={containerRef} className={className}></div>
}