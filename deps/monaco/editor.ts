import type { MutableRef } from "preact/hooks";
import type { ICodeEditor } from "./types";
import { debounce as debounce_ } from "@jslib/scripts/perf"

export function registerOnChange({editor, onChange, debounce}: {editor: ICodeEditor, onChange: (value: string) => void, debounce?: number}) {
    editor.getModel().onDidChangeContent(debounce_(() => {
        onChange(editor.getModel().getValue())
    }, debounce))
}

export function getValueHelper(editor: ICodeEditor): {getValue: () => string, setValue: (value: string) => void} {
    return {
        getValue() {
            return editor.getModel().getValue()
        },
        setValue(value: string) {
            return editor.getModel().setValue(value)
        }
    }
}

export function getRefValueHelper(editorRef: MutableRef<ICodeEditor|null>): {getValue: () => string, setValue: (value: string) => void}  {
    return {
        getValue() {
            return editorRef.current != null? editorRef.current.getModel().getValue(): ''
        },
        setValue(value: string) {
            editorRef.current != null && editorRef.current.getModel().setValue(value)
        }
    }
}