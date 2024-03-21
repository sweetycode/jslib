export interface MonacoApi {
    editor: EditorApi
}


interface EditorOptions {
    fontSize?: number
    lineNumbers?: "on" | "off" | "relative" | "interval" | ((lineNumber: number) => string)
    readOnly?: boolean
    [key: string]: any
}

interface DiffEditorOptions extends EditorOptions {
    splitViewDefaultRatio?: number
    enableSplitViewResizing?: boolean
}

export interface EditorApi {
    create: (container: HTMLElement, options: EditorOptions) => ICodeEditor
    createDiffEditor: (container: HTMLElement, options: DiffEditorOptions) => IDiffEditor
    createModel: (value: string, lang: string) => ITextModel
}

interface IDisposable {
    dispose: () => void
}

interface IEditor extends IDisposable {
    addAction: (descriptor: IActionDescriptor) => void
}

export interface ICodeEditor extends IEditor {
    getModel: () => ITextModel
    updateOptions: (newOptions: EditorOptions) => void
}

export interface IDiffEditorModel {
    original: ITextModel, modified: ITextModel
}

export interface IDiffEditor extends IEditor {
    setModel: (model: IDiffEditorModel) => void
    getModel: () => IDiffEditorModel
    getOriginalEditor: () => ICodeEditor
    getModifiedEditor: () => ICodeEditor
}

export interface ITextModel {
    getValue: () => string
    setValue: (value: string) => void
    onDidChangeContent: (listener: (e: any) => void) => void
}

//https://microsoft.github.io/monaco-editor/playground.html?source=v0.46.0#example-interacting-with-the-editor-adding-an-action-to-an-editor-instance
export interface IActionDescriptor {
    id: string,
    label: string,
    contextMenuGroupId: 'navigation',
    contextMenuOrder: number,
    run: (editor: ICodeEditor) => void
}