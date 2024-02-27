import { useRef } from "preact/hooks"
import { useMonacoRef } from "@jslib/deps/monaco/hooks"

interface Props {
    value?: string
    language?: string
    className?: string
}

export default function Monaco({className='h-screen', value='', language='plaintext'}: Props) {
    const containerRef = useRef<HTMLDivElement|null>(null)
    useMonacoRef({containerRef, language, value})

    return <div ref={containerRef} className={className}></div>
}