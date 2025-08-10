import { TextDocument } from "vscode-languageserver-textdocument";
import * as util from "node:util"
import * as lexer from 'nunjucks/src/lexer.js'
// @ts-expect-error
import * as nodes from 'nunjucks/src/nodes.js'
import { Parser } from "nunjucks/src/parser.js";

interface NunjucksTemplateInfo {
}

interface NunjucksParserSettings {
}

export class NunjucksParser {
	constructor (public settings: NunjucksParserSettings) {
		this.settings = settings
	}
	parseDocument(document: TextDocument): NunjucksTemplateInfo {
		const content = document.getText();

		return this.parseContent(content)
	}

	parseContent (content: string): NunjucksTemplateInfo {
		// var l = lexer.lex('{%- if x -%}\n hello {% endif %}');
		// var t;
		// while((t = l.nextToken())) {
		//     console.log(util.inspect(t));
		// }
    		var p = new Parser(lexer.lex(content));
    		var n = p.parseAsRoot();
    		nodes.printNodes(n);
		return {
		}
	}
}
