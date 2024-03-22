import type { ICodeEditor } from "./types";
import { debounce as debounceFn } from '../../scripts/perf';


export function getEditorValue(editor: ICodeEditor): string {
    return editor.getModel().getValue()
}

export function setEditorValue(editor: ICodeEditor, value: string): void {
    return editor.getModel().setValue(value)
}


export function listenEditorChange(editor: ICodeEditor, onChange: (editor: ICodeEditor) => void, debounce: number = 500) {
    return editor.getModel().onDidChangeContent(debounceFn(() => onChange(editor), debounce))
}