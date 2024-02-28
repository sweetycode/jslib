import { installScript } from "@jslib/scripts/install"

export const CSVPARSE_SCRIPT = 'https://cdn.jsdelivr.net/npm/csv-parse@5.5.4/dist/umd/sync.min.js'

export const CSVSTRINGIFY_SCRIPT = 'https://cdn.jsdelivr.net/npm/csv-stringify@6.4.6/dist/iife/sync.min.js'


export interface CsvParse {
    (csv: string, options?: {[key: string]: any}): object
}

export interface CsvStringify {
    (csv: Array<Array<any>>): string
}

export async function installCsvParse() {
    await installScript(CSVPARSE_SCRIPT)
    return (window as any).csv_parse_sync.parse as CsvParse
}

export async function installCsvStringify() {
    await installScript(CSVSTRINGIFY_SCRIPT)
    return (window as any).csv_stringify_sync.stringify as CsvStringify
}