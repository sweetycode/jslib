import { installMonaco } from "./install";
import type { ICodeEditor } from "./types";
import { createUnmanaged } from "@jslib/scripts/unmanaged";
import { debounce } from '../../scripts/perf';


interface Options {
    language?: string
    value?: string
    onChange?: (editor: ICodeEditor, ...args: any) => void
    debounce?: number
    init?: (editor: ICodeEditor) => void
}

export async function createUnamangedMonaco(container: HTMLElement, 
    {language, value='', onChange, debounce: debounceMs = 400, init}: Options): Promise<ICodeEditor> {
    return await createUnmanaged('monaco', container, async () => {
        const monacoNamespace = await installMonaco()

        const editor = monacoNamespace.editor.create(container, {
            automaticLayout: true,
            fontSize: 18,
            //renderSideBySide: true,
            lineNumbersMinChars: 3,
            language: language,
            value: value,
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