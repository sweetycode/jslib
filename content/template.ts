/**
 * syntax: 
 * 
 * _@cmd(args)_
 */


interface Context {
    lang?: 'cn'|'en'
    payload?: {
        [key: string]: string
    }
}

interface Command {
    name: string
    handle(ctx: Context, argument: string, body: string): string
}

class Comment implements Command {
    name = 'comment'
    handle(ctx: Context, argument: string, body: string): string {
        return ''
    }
}

class IfCN implements Command {
    name = 'ifCN'
    
    handle(ctx: Context, argument: string, body: string): string {
        return ctx.lang == 'cn' ? body: ''
    }
}

class IfEN implements Command {
    name = 'ifEN'
    handle(ctx: Context, argument: string, body: string): string {
        return ctx.lang == 'en' ? body: ''
    }
}

class Newline implements Command {
    name = 'newline'
    handle(ctx: Context, argument: string, body: string): string {
        return '\n' + (body ? body: '')
    }
}

class Ctx implements Command {
    name = 'ctx'
    handle(ctx: Context, argument: string, body: string): string {
        if (body) {
            throw new Error(`ctx command should't has body`)
        }
        if (!argument) {
            throw new Error(`ctx command should has argument`)
        }
        return ctx.payload ? ctx.payload[argument]: ''
    }
}


class Table implements Command {
    name = 'table'

    handle(ctx: Context, argument: string, body: string): string {
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
        let lines = body.split('\n').map(line => line.split('|'))
        
        const thead = kv.head ? `\n<thead><tr>${lines[0].map(v => `\n<td>${v}</td>\n`)}</tr></thead>\n`: ''
        lines = kv.head ? lines.slice(1): lines

        return `<table>${thead}<tbody>${lines.map(line => `\n<tr>${line.map(v => `<td>${v}</td>`)}</tr>`)}</tbody></table>`
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

    apply(ctx: Context, source: string): string {
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
    commandStack: CommandStack = new CommandStack()

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

    transpile(source: string, ctx: Context): string {
        let lastIndex = 0
        let match = this.commandsPattern.exec(source)
        let results: string[] = []
        while (match) {
            const [allMatched, commandName, argument] = match as any as [string, string, string]
            const startIndex = match.index
            const selfClose = allMatched.endsWith(')@_')
            const content = source.substring(lastIndex, startIndex)
            console.log({allMatched, commandName, argument, startIndex, selfClose, lastIndex, content})

            commandName == 'end' && this.commandStack.verify(argument)
            results.push(this.commandStack.apply(ctx, content))
            commandName == 'end' ? this.commandStack.pop(): this.commandStack.push(this.commandsMap.get(commandName)!, argument)
            if (commandName != 'end' && selfClose) {
                results.push(this.commandStack.apply(ctx, ''))
                this.commandStack.pop()
            }

            lastIndex = startIndex + allMatched.length
            match = this.commandsPattern.exec(source)
        }

        const remainingContent = source.substring(lastIndex)
        results.push(this.commandStack.apply(ctx, remainingContent))

        return results.join('')
    }
}

const register = new CommandRegister()

register.register(new IfCN())
        .register(new IfEN())
        .register(new Newline())
        .register(new Ctx())

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

export type TemplateContext = Context

export function render_template(source: string, ctx: TemplateContext): string {
    const transpiler = register.getTransplier()
    return transpiler.transpile(source, ctx)
}

export function test() {
    console.log(render_template(s, {'lang': 'cn'}))
}