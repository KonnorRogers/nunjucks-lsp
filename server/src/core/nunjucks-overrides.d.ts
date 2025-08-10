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
  class Parser {
    constructor (tokenizer: _Tokenizer)
    init: (tokenizer: _Tokenizer) => void
    nextToken: (withWhitespace: boolean) => Token
    peekToken: () => Token
    pushToken: (token: Token) => void
    error: (msg: string, lineno: number, colno: number) => any // TemplateError
    fail: (msg: string, lineno: number, colno: number) => void
    skip: (type: Token["type"]) => boolean
    expect: (type: Token["type"]) => Token
    skipValue: (type: Token["type"], val: Token["value"]) => boolean
    skipSymbol: (val: Token["value"]) => boolean
    advanceAfterBlockEnd: (name?: Token["type"]) => Token
    advanceAfterVariableEnd: () => void
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
    parseAsRoot: (...args: any[]) => any
  }

  function parse(src: string, extensions: any, opts: LexerOptions): any
  export {
    parse,
    Parser
  }
}
