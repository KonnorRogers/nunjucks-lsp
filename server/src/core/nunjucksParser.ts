import { TextDocument } from "vscode-languageserver-textdocument";
import * as util from "node:util"
import * as lexer from 'nunjucks/src/lexer.js'
import * as nodes from 'nunjucks/src/nodes.js'
import { Parser } from "nunjucks/src/parser.js";

import {Template} from "nunjucks/src/environment.js"

// interface NunjucksTemplateInfo {
//   error: {
//   }
// }

interface NunjucksParserSettings {
}

class ExtendedParser extends Parser {
  tokenStack: Token[] = []
  buf!: nodes.AnyNode[]
  constructor(...args: ConstructorParameters<typeof Parser>) {
    super(...args)
  }
  pushToken (token: Token) {
    this.tokenStack.push(token)
    super.pushToken(token)
  }

  safeParseAsRoot (): { ast: nodes.NodeList } | { error: Error & { lineno: number, colno: number }, ast: nodes.NodeList }   {
    let parsedNodes: nodes.AnyNode[] = []
    try {
      parsedNodes = this.parseNodes()
    } catch (error) {
      // Catch the error and still try to give us _something_
      // TODO: Not sure if this should `structuredClone()` or not. Don't know if parseAsRoot is by ref or by value.
      parsedNodes = this.buf

      return {
        error: error as Error,
        ast: this.parseAsRoot(parsedNodes)
      }
    }

    return {
      ast: this.parseAsRoot(parsedNodes)
    }
  }
  parseAsRoot (parsedNodes = this.parseNodes()) {
    return new nodes.Root(0, 0, parsedNodes);
  }

  parseNodes() {
    let tok;
    const buf: nodes.AnyNode[] = [];

    // This is a hack to get the latest AST from a failure without overriding all fail call sites.
    this.buf = buf

    while ((tok = this.nextToken())) {
      if (tok.type === lexer.TOKEN_DATA) {
        let data = tok.value;
        const nextToken = this.peekToken();
        const nextVal = nextToken && nextToken.value;

        // If the last token has "-" we need to trim the
        // leading whitespace of the data. This is marked with
        // the `dropLeadingWhitespace` variable.
        if (this.dropLeadingWhitespace) {
          // TODO: this could be optimized (don't use regex)
          data = data.replace(/^\s*/, '');
          this.dropLeadingWhitespace = false;
        }

        // Same for the succeeding block start token
        if (nextToken &&
          ((nextToken.type === lexer.TOKEN_BLOCK_START &&
          nextVal.charAt(nextVal.length - 1) === '-') ||
          (nextToken.type === lexer.TOKEN_VARIABLE_START &&
          nextVal.charAt(this.tokens.tags.VARIABLE_START.length)
          === '-') ||
          (nextToken.type === lexer.TOKEN_COMMENT &&
          nextVal.charAt(this.tokens.tags.COMMENT_START.length)
          === '-'))) {
          // TODO: this could be optimized (don't use regex)
          data = data.replace(/\s*$/, '');
        }

        buf.push(new nodes.Output(tok.lineno,
          tok.colno,
          [new nodes.TemplateData(tok.lineno,
            tok.colno,
            data)]));
      } else if (tok.type === lexer.TOKEN_BLOCK_START) {
        this.dropLeadingWhitespace = false;
        const n = this.parseStatement();
        if (!n) {
          break;
        }
        buf.push(n);
      } else if (tok.type === lexer.TOKEN_VARIABLE_START) {
        const e = this.parseExpression();
        this.dropLeadingWhitespace = false;
        this.advanceAfterVariableEnd();
        buf.push(new nodes.Output(tok.lineno, tok.colno, [e]));
      } else if (tok.type === lexer.TOKEN_COMMENT) {
        this.dropLeadingWhitespace = tok.value.charAt(
          tok.value.length - this.tokens.tags.COMMENT_END.length - 1
        ) === '-';
      } else {
        // Ignore comments, otherwise this should be an error
        this.fail('Unexpected token at top-level: ' +
          tok.type, tok.lineno, tok.colno);
      }
    }

    return buf;
  }
}


export class NunjucksParser {
  constructor (public settings: NunjucksParserSettings) {
    this.settings = settings
  }
  parseDocument(document: TextDocument): ReturnType<typeof this.parseContent> {
     const content = document.getText();

     return this.parseContent(content)
  }

  parseContent (content: string) {
    const parser = new ExtendedParser(lexer.lex(content));
    return parser.safeParseAsRoot()
  }
}
