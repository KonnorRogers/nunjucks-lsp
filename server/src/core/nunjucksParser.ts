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
  constructor(...args: ConstructorParameters<typeof Parser>) {
    super(...args)
  }
  pushToken (token: Token) {
    this.tokenStack.push(token)
    super.pushToken(token)
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

  parseContent (content: string): {tokenStack: Token[]} & ({ ast: nodes.NodeList, error: null } | { ast: null, error: Error & {lineno: number, colno: number} }) {
    const parser = new ExtendedParser(lexer.lex(content));
    try {
        const ast = parser.parseAsRoot();
        return { ast, tokenStack: parser.tokenStack || [], error: null }
     } catch (e) {
        // console.error(e)
        return { ast: null, tokenStack: parser.tokenStack || [], error: e as Error & { colno: number, lineno: number } }
     }
  }
}
