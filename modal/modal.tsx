import { createElement, render, type ComponentChildren, type FunctionComponent } from "preact";

export interface ModalProps<T> {
    submit: (value: T) => void
    cancel: () => void
    addCleanFn: (cleanFn: () => void) => void
}

export async function showModal<T>(component: FunctionComponent<ModalProps<T>>): Promise<T> {
    const el = document.createElement('div')
    document.body.appendChild(el)


    function addCleanFn(cleanFn: () => void) {

    }

    function executeCleanFn() {

    }

    return new Promise((resolve, reject) => {
        function submit(value: T) {
            executeCleanFn()
            el.remove()
            resolve(value)
        }
    
        function cancel() {
            executeCleanFn()
            el.remove()
        }
        render(createElement(component, {addCleanFn, submit, cancel}), el)
    })
}

export function ModalWrapper({children, onSubmit, onCancel}: {children: ComponentChildren, onSubmit: () => void, onCancel: () => void}) {
    return <div className="absolute top-0 left-0 h-screen w-full bg-gray-900/60 flex justify-center items-center">
        <div className="bg-white p-4 rounded opacity-100">
            {children}
            <div className="border-t border-gray-200 pt-2 mt-2 text-right space-x-2">
                <button onClick={onCancel} className="bg-orange-400 hover:bg-orange-500 text-white px-1 rounded-sm">Cancel</button>
                <button onClick={onSubmit} className="bg-blue-400 hover:bg-blue-500 text-white px-1 rounded-sm">Submit</button>
            </div>
        </div>
    </div>
}