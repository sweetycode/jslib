export interface MonacoNamespace {
    editor: EditorNamespace
}


export interface EditorNamespace {
    create: (container: HTMLElement, options: {[key: string]: any}) => ICodeEditor
    createDiffEditor: (container: HTMLElement, options: {[key: string]: any}) => IDiffEditor
    createModel: (value: string, lang: string) => ITextModel
}

interface IDisposable {
    dispose: () => void
}

interface IEditor extends IDisposable {
    addAction: (descriptor: IActionDescriptor) => void
}

export interface ICodeEditor extends IEditor{
    getModel: () => ITextModel
}

export interface IDiffEditor extends IEditor {
    setModel: ({original, modified}: {original: ITextModel, modified: ITextModel}) => void
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