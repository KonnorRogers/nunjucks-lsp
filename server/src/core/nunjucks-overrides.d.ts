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
  value: string,
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
  export const lex: (src: string, opts?: Partial<LexerOptions>) => Tokenizer
  export const BLOCK_START = '{%';
  export const BLOCK_END = '%}';
  export const VARIABLE_START = '{{';
  export const VARIABLE_END = '}}';
  export const COMMENT_START = '{#';
  export const COMMENT_END = '#}';

  export const TOKEN_STRING = 'string';
  export const TOKEN_WHITESPACE = 'whitespace';
  export const TOKEN_DATA = 'data';
  export const TOKEN_BLOCK_START = 'block-start';
  export const TOKEN_BLOCK_END = 'block-end';
  export const TOKEN_VARIABLE_START = 'variable-start';
  export const TOKEN_VARIABLE_END = 'variable-end';
  export const TOKEN_COMMENT = 'comment';
  export const TOKEN_LEFT_PAREN = 'left-paren';
  export const TOKEN_RIGHT_PAREN = 'right-paren';
  export const TOKEN_LEFT_BRACKET = 'left-bracket';
  export const TOKEN_RIGHT_BRACKET = 'right-bracket';
  export const TOKEN_LEFT_CURLY = 'left-curly';
  export const TOKEN_RIGHT_CURLY = 'right-curly';
  export const TOKEN_OPERATOR = 'operator';
  export const TOKEN_COMMA = 'comma';
  export const TOKEN_COLON = 'colon';
  export const TOKEN_TILDE = 'tilde';
  export const TOKEN_PIPE = 'pipe';
  export const TOKEN_INT = 'int';
  export const TOKEN_FLOAT = 'float';
  export const TOKEN_BOOLEAN = 'boolean';
  export const TOKEN_NONE = 'none';
  export const TOKEN_SYMBOL = 'symbol';
  export const TOKEN_SPECIAL = 'special';
  export const TOKEN_REGEX = 'regex';
}

declare module 'nunjucks/src/parser.js' {
  import { InlineIf, NodeList, Node } from 'nunjucks/src/nodes.js'

  class Parser {
    tokens: _Tokenizer
    peeked: boolean | null;
    breakOnBlocks: boolean | null;
    dropLeadingWhitespace: boolean
    extensions: Object[];
    constructor (tokenizer: _Tokenizer)
    init (tokenizer: _Tokenizer): void
    nextToken (withWhitespace?: boolean): Token
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
    parseAsRoot (...args: any[]): NodeList
    // TODO: these are incomplete
    parseFor(): void
    parseMacro(): void
    parseCall(): void
    parseWithContext(): void
    parseImport(): void
    parseFrom(): void
    parseBlock(): void
    parseExtends(): void
    parseInclude(): void
    parseIf(): void
    parseSet(): void
    parseSwitch(): void
    parseStatement(): Node
    parseRaw(): void
    parsePostfix(): void
    parseExpression(): InlineIf
    parseOr(): void
    parseAnd(): void
    parseNot(): void
    parseIn(): void
    parseIs(): void
    parseCompare(): void
    parseConcat(): void
    parseAdd(): void
    parseSub(): void
    parseMul(): void
    parseDiv(): void
    parseFloorDiv(): void
    parseMod(): void
    parsePow(): void
    parseUnary(): void
    parsePrimary(): void
    parseFilterName(): void
    parseFilterArgs(): void
    parseFilter(): void
    parseFilterStatement(): void
    parseAggregate(): void
    parseSignature(): void
    parseUntilBlocks(): void
    parseNodes(): void
    parse(): void
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
      constructor(lineno: number, colno: number, ...args: any[])
      findAll<T extends {new (...args: any[]): any}>(type: T, results?: (InstanceType<T>)[]): InstanceType<T>[]
      iterFields(callback: (value: this[keyof this], field: keyof this) => void): void
  }
  class NodeList extends Node {
    init<T extends typeof Node>(this: T, lineno: number, colno: number, nodes?: Array<AnyNode>): T
    constructor(lineno: number, colno: number, nodes?: Array<AnyNode>)
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
  class Output extends NodeList {}
  class Capture extends Node {}
  class TemplateData extends Literal {}
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

  /**
   * Theses types aren't supported by nunjucks, but added to cover all possible nodes which can be needed for some call sites.
   */
  export type AnyNode = AllNodes[keyof AllNodes]
  export type AllNodes = [
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
  ]

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
