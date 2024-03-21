import { installMonaco } from "./install";
import type { ICodeEditor } from "./types";
import { createUnmanaged } from "@jslib/scripts/unmanaged";
import { debounce } from '../../scripts/perf';


interface CodeEditorOptions {
    language?: string
    value?: string|null
    onChange?: (editor: ICodeEditor, ...args: any) => void
    debounce?: number
    init?: (editor: ICodeEditor) => void
}

export async function createUnamangedCodeEditor(container: HTMLElement, 
    {language, value='', onChange, debounce: debounceMs = 400, init}: CodeEditorOptions): Promise<ICodeEditor> {
    return await createUnmanaged('monaco', container, async () => {
        const monacoNamespace = await installMonaco()

        const editor = monacoNamespace.editor.create(container, {
            automaticLayout: true,
            fontSize: 18,
            //renderSideBySide: true,
            lineNumbersMinChars: 3,
            language: language,
            value: value || '',
        });

        if (onChange) {
            editor.getModel().onDidChangeContent(debounce((...args: any) => onChange(editor, ...args), debounceMs))
        }

        if (init) {
            init(editor)
        }

        return editor
    })
}


interface DiffEditorOptions {
    left: string
    right: string
    lang?: string
    fontSize?: number
    wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded",
    lineNumbers?: 'on'|'off',
    splitViewDefaultRatio?: number
    enableSplitViewResizing?: boolean
}

export async function createUnmanagedDiffEditor(container: HTMLElement, 
    {left, right, 
        lang="plaintext", 
        wordWrap='off', 
        fontSize=18, 
        lineNumbers='on', 
        splitViewDefaultRatio=0.5,
        enableSplitViewResizing=true,
    }: DiffEditorOptions) {
    return await createUnmanaged('diff', container, async () => {
        const monacoApi = await installMonaco()
        const editor = monacoApi.editor.createDiffEditor(container, {
            automaticLayout: true,
            fontSize,
            originalEditable: true,
            lineNumbersMinChars: 3,
            renderMarginRevertIcon: false,
            useInlineViewWhenSpaceIsLimited: false,
            wordWrap,
            lineNumbers,
            splitViewDefaultRatio,
            enableSplitViewResizing,
        })

        editor.setModel({original: monacoApi.editor.createModel(left, lang), modified: monacoApi.editor.createModel(right, lang)})
        return editor
    })
}