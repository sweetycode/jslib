import type { ICodeEditor } from "./types";


export function getEditorValue(editor: ICodeEditor): string {
    return editor.getModel().getValue()
}

export function setEditorValue(editor: ICodeEditor, value: string): void {
    return editor.getModel().setValue(value)
}
