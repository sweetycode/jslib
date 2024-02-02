/**
 * syntax: 
 * 
 * _@cmd(args)_
 */


export interface TemplateContext {
    lang?: 'cn'|'en'
    vars?: {
        [key: string]: string
    }
}

interface Command {
    name: string
    handle(ctx: TemplateContext, argument: string, body: string): string
}

function parseArgument(argument: string): {[key: string]: string} {
    const pairs = argument.split(',')
    const result: {[key: string]: string} = {}
    for (let pair of pairs) {
        const kv = pair.split('=', 2)
        if (kv.length == 2) {
            result[kv[0]] = kv[1]
        } else {
            result[kv[0]] = ''
        }
    }
    return result
}

class Comment implements Command {
    name = 'comment'
    handle(ctx: TemplateContext, argument: string, body: string): string {
        return ''
    }
}

class IfCN implements Command {
    name = 'ifCN'
    
    handle(ctx: TemplateContext, argument: string, body: string): string {
        return ctx.lang == 'cn' ? body: ''
    }
}

class IfEN implements Command {
    name = 'ifEN'
    handle(ctx: TemplateContext, argument: string, body: string): string {
        return ctx.lang == 'en' ? body: ''
    }
}

class Newline implements Command {
    name = 'newline'
    handle(ctx: TemplateContext, argument: string, body: string): string {
        return '\n' + (body ? body: '')
    }
}

class Var implements Command {
    name = 'var'
    handle(ctx: TemplateContext, argument: string, body: string): string {
        if (body) {
            throw new Error(`ctx command should't has body`)
        }
        if (!argument) {
            throw new Error(`ctx command should has argument`)
        }
        return ctx.vars ? ctx.vars[argument]: ''
    }
}

class Section implements Command {
    name = 'section'
    handle(ctx: TemplateContext, argument: string, body: string): string {
        const clz = this.getClass(ctx, argument)
        const result = []
        result.push(clz ? `<section class="${clz}">`: `<section>`)
        result.push(body)
        result.push(`</section>`)
        return result.join('\n')
    }

    getClass(ctx: TemplateContext, argument: string): string|null {
        const params = parseArgument(argument)
        console.log({params})
        if (params['class']) {
            return params['class']
        }
        if (params['classvar'])  {
            const ctxKey = `classvar-` + params['classvar']
            if (ctx.vars && ctx.vars[ctxKey]) {
                return ctx.vars[ctxKey]
            }
        }
        return null
    }
}


class Table implements Command {
    name = 'table'

    handle(ctx: TemplateContext, argument: string, body: string): string {
        if (!body) {
            return ''
        }
        const kv = this.parseArgument(argument)
        return this.render(body!, kv)
    }

    parseArgument(argument: string|null): {head: boolean, full: boolean} {
        let head = true
        let full = false
        return {head, full}
    }

    render(body: string, kv: {head: boolean, full: boolean}): string {
        let lines = body.split('\n').map(line => line.trim()).filter(Boolean).map(line => line.split('|'))
        if (lines.length == 0) {
            return ''
        }
        
        const thead = kv.head ? `\n<thead><tr>${lines[0].map(v => `<th>${v}</th>`).join('')}</tr></thead>\n`: ''
        lines = kv.head ? lines.slice(1): lines

        return `<table>${thead}<tbody>${lines.map(line => `\n<tr>${line.map(v => `<td>${v}</td>`).join('')}</tr>`).join('\n')}</tbody></table>`
    }
}


class CommandRegister {
    private commandsMap: Map<string, Command> = new Map()

    register(command: Command): CommandRegister {
        if (!command.name.match(/^[a-zA-Z0-9]+$/)) {
            throw Error(`invalid command name: ${command.name}`)
        }
        this.commandsMap.set(command.name, command)
        return this
    }

    getTransplier(): Transpiler {
        return new Transpiler(this.commandsMap)
    }
}


class CommandStack {
    presetStack:[Command, string][] = []
    commands: [Command, string][] = []
    stackLength: number = 0

    push(command: Command, argument: string) {
        this.commands[this.stackLength++] = [command, argument]
    }

    pop(): [Command, string]|null {
        if (this.stackLength == 0) {
            return null
        }
        return this.commands[--this.stackLength]
    }
    peek(): [Command, string]|null {
        if (this.stackLength == 0) {
            return null
        }
        return this.commands[this.stackLength - 1]
    }

    apply(ctx: TemplateContext, source: string): string {
        let result = source
        for (let index = this.stackLength - 1; index >=0; index --) {
            let [command, argument] = this.commands[index]
            result = command.handle(ctx, argument, result)
        }
        return result
    }

    verify(commandName: string) {
        if (this.stackLength == 0) {
            throw Error('unexpected end')
        }
        if (commandName && commandName != this.commands[this.stackLength-1][0].name) {
            throw Error(`mismatched end with ${commandName}`)
        }
    }
}

class Transpiler {
    commandsMap: Map<string, Command>
    commandsPattern: RegExp
    stack: CommandStack = new CommandStack()

    constructor(commandsMap: Map<string, Command>) {
        this.commandsMap = commandsMap
        this.commandsPattern = Transpiler.compile(commandsMap)
    }

    private static compile(commandsMap: Map<String, Command>): RegExp {
        const allNames = ['end']
        for (let cmd of commandsMap.values()) {
            allNames.push(cmd.name)
        }
        const pattern = `_@(${allNames.join('|')})\\((.*?)\\)@?_`
        return new RegExp(pattern, 'g')
    }

    transpile(source: string, ctx: TemplateContext): string {
        let lastIndex = 0
        let match = this.commandsPattern.exec(source)
        let results: string[] = []
        while (match) {
            const [allMatched, commandName, argument] = match as any as [string, string, string]
            const startIndex = match.index
            const selfClose = allMatched.endsWith(')@_')
            const content = source.substring(lastIndex, startIndex)
            //console.log({allMatched, commandName, argument, startIndex, selfClose, lastIndex, content})

            commandName == 'end' && this.stack.verify(argument)
            results.push(this.stack.apply(ctx, content))
            commandName == 'end' ? this.stack.pop(): this.stack.push(this.commandsMap.get(commandName)!, argument)
            if (commandName != 'end' && selfClose) {
                results.push(this.stack.apply(ctx, ''))
                this.stack.pop()
            }

            lastIndex = startIndex + allMatched.length
            match = this.commandsPattern.exec(source)
        }

        const remainingContent = source.substring(lastIndex)
        results.push(this.stack.apply(ctx, remainingContent))

        return results.join('')
    }
}

const register = new CommandRegister()

register.register(new IfCN())
        .register(new IfEN())
        .register(new Newline())
        .register(new Var())
        .register(new Table())
        .register(new Section())

let s = `
# abc

123
_@newline()@_
abnc
_@ifCN(1basdf,123123,123123)_

only CN
_@end()_

_@ifEN()_ hello world _@end()_
`

export function render(source: string, ctx: TemplateContext): string {
    const transpiler = register.getTransplier()
    return transpiler.transpile(source, ctx)
}

export function test() {
    console.log(render(s, {'lang': 'cn'}))
}