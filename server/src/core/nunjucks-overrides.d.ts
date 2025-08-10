// import { NunjucksSettings } from '../settings/nunjucksSettings';

interface LexerOptions {
  trimBlock: boolean
  lstripBlocks: boolean
  tags: {
    BLOCK_START: string
    BLOCK_END: string
    VARIABLE_START: string
    VARIABLE_END: string
    COMMENT_START: string
    COMMENT_END: string
  };
}

interface Token {
  type: string,
  value: unknown,
  lineno: number,
  colno: number
}

declare class _Tokenizer implements LexerOptions {
  str: string
  len: number
  index: number
  lineno: number
  colno: number

  trimBlock: boolean
  lstripBlocks: boolean
  tags: {
    BLOCK_START: string
    BLOCK_END: string
    VARIABLE_START: string
    VARIABLE_END: string
    COMMENT_START: string
    COMMENT_END: string
  };

  nextToken: () => Token
}


declare module 'nunjucks/src/lexer.js' {
  class Tokenizer extends _Tokenizer {}
  const lex: (src: string, opts?: Partial<LexerOptions>) => Tokenizer

  export {
    lex
  };
}

declare module 'nunjucks/src/parser.js' {
  import { NodeList } from 'nunjucks/src/nodes.js'

  class Parser {
    constructor (tokenizer: _Tokenizer)
    init (tokenizer: _Tokenizer): void
    nextToken (withWhitespace: boolean): Token
    peekToken (): Token
    pushToken (token: Token): void
    error (msg: string, lineno: number, colno: number): any // TemplateError
    fail (msg: string, lineno: number, colno: number): void
    skip (type: Token["type"]): boolean
    expect (type: Token["type"]): Token
    skipValue (type: Token["type"], val: Token["value"]): boolean
    skipSymbol (val: Token["value"]): boolean
    advanceAfterBlockEnd (name?: Token["type"]): Token
    advanceAfterVariableEnd (): void
    // TODO: Get all nodes.
    // parseFor
    // parseMacro
    // parseCall
    // parseWithContext
    // parseImport
    // parseFrom
    // parseBlock
    // parseExtends
    // parseInclude
    // parseIf
    // parseSet
    // parseSwitch
    // parseStatement
    // parseRaw
    // parsePostfix
    // parseExpression
    // parseOr
    // parseAnd
    // parseNot
    // parseIn
    // parseIs
    // parseCompare
    // parseConcat
    // parseAdd
    // parseSub
    // parseMul
    // parseDiv
    // parseFloorDiv
    // parseMod
    // parsePow
    // parseUnary
    // parsePrimary
    // parseFilterName
    // parseFilterArgs
    // parseFilter
    // parseFilterStatement
    // parseAggregate
    // parseSignature
    // parseUntilBlocks
    // parseNodes
    // parse
    parseAsRoot (...args: any[]): NodeList
  }

  function parse(src: string, extensions: any, opts: LexerOptions): any
  export {
    parse,
    Parser
  }
}

declare module 'nunjucks/src/nodes.js' {
  class Node extends Object {
      get typename(): string
      get fields(): string[]
      init<T extends typeof Node>(this: T, lineno: number, colno: number, ...args: any[]): T
      findAll<T extends {new (...args: any[]): any}>(type: T, results?: (InstanceType<T>)[]): InstanceType<T>[]
      iterFields(callback: (value: this[keyof this], field: keyof this) => void): void
  }
  class NodeList extends Node {
    init<T extends typeof Node>(this: T, lineno: number, colno: number, nodes?: Node[]): T
    get fields(): ["children"]
    addChild(node: Node): void
  }
  class Root extends NodeList {}
  class Value extends Node {
    get fields(): ["value"]
    get value(): string
  }
  class Literal extends Value {}
  class Symbol extends Value {}
  class Group extends NodeList {}
  class ArrayNode extends NodeList {}
  class Pair extends Node {
    get fields(): ["key", "value"]
  }
  class Dict extends NodeList {}
  class Output extends Node {}
  class Capture extends Node {}
  class TemplateData extends Node {}
  class If extends Node {
    get fields(): ['cond', 'body', 'else_']
  }
  class IfAsync extends If {}
  class InlineIf extends Node {}
  class For extends Node {
    get fields(): ['arr', 'name', 'body', 'else_']
  }
  class AsyncEach extends For {}
  class AsyncAll extends For {}
  class Macro extends Node {
    get fields(): ['name', 'args', 'body']
  }
  class Caller extends Macro {}
  class Import extends Node {
    get fields(): ['template', 'target', 'withContext']
  }
  class FromImport extends Node {
    get typename(): "FromImport"
    get fields(): ['template', 'names', 'withContext']
    init<T extends typeof Node, U extends NodeList = NodeList>(lineno: number, colno: number, template: string, names: U | undefined, withContext: any): T
  }
  class FunCall extends Node {
    get fields(): ['name', 'args']
  }
  class Filter extends FunCall {}
  class FilterAsync extends Node {
    get fields(): ['name', 'args', 'symbol']
  }
  class KeywordArgs extends Dict {}
  class Block extends Node {
    get fields(): ['name', 'body']
  }
  class Super extends Node {
    get fields(): ['blockName', 'symbol']
  }
  class TemplateRef extends Node {
    get fields(): ['template']
  }
  class Extends extends TemplateRef {}
  class Include extends Node {}
  class Set extends Node {}
  class Switch extends Node {}
  class Case extends Node {}
  class LookupVal extends Node {
    get fields(): ['target', 'val']
  }
  class BinOp extends Node {}
  class In extends Node {}
  class Is extends Node {}
  class Or extends Node {}
  class And extends Node {}
  class Not extends Node {}
  class Add extends Node {}
  class Concat extends Node {}
  class Sub extends Node {}
  class Mul extends Node {}
  class Div extends Node {}
  class FloorDiv extends Node {}
  class Mod extends Node {}
  class Pow extends Node {}
  class Neg extends Node {}
  class Pos extends Node {}
  class Compare extends Node {}
  class CompareOperand extends Node {}
  class CallExtension extends Node {}
  class CallExtensionAsync extends Node {}
  function print(str: string, indent: string, line: number): void
  function printNodes(node: NodeList, indent?: string): void

  export {
    Node,
    Root,
    NodeList,
    Value,
    Literal,
    Symbol,
    Group,
    ArrayNode,
    Pair,
    Dict,
    Output,
    Capture,
    TemplateData,
    If,
    IfAsync,
    InlineIf,
    For,
    AsyncEach,
    AsyncAll,
    Macro,
    Caller,
    Import,
    FromImport,
    FunCall,
    Filter,
    FilterAsync,
    KeywordArgs,
    Block,
    Super,
    TemplateRef,
    Extends,
    Include,
    Set,
    Switch,
    Case,
    LookupVal,
    BinOp,
    In,
    Is,
    Or,
    And,
    Not,
    Add,
    Concat,
    Sub,
    Mul,
    Div,
    FloorDiv,
    Mod,
    Pow,
    Neg,
    Pos,
    Compare,
    CompareOperand,
    CallExtension,
    CallExtensionAsync,
    print,
    printNodes
  }
}

declare module "nunjucks/src/environment.js" {
  class Template {
    constructor(content: string, env?: Partial<{}>, path?: string, eagerCompile?: boolean)
  }
  export {
    Template
  }
}
