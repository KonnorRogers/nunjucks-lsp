import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  TextDocumentPositionParams,
  CompletionItem,
  CompletionItemKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import {CSSParser, expandStylesheet} from "../../core/out/index.js"
import { CompletionList, LanguageMode, LanguageModes, getLanguageModes } from "./languageModes";
import { getCSSMode } from "./modes/cssMode";
import { getCSSLanguageService } from "vscode-css-languageservice";
import { appendFileSync, writeFileSync } from "fs";

let parsedStylesheets: CSSParser[] = []
let cssVariableCompletions: CompletionItem[] = []
let cssUtilityClasses: CompletionItem[] = []
let waStylesheet = ""

const debugFile = "/Users/konnorrogers/debug.log"
writeFileSync(debugFile, "")


expandStylesheet("https://early.webawesome.com/webawesome@3.0.0-alpha.7/dist/styles/webawesome.css")
  .then((stylesheet) => {
    // appendFileSync(debugFile, "quiet.css -> " + stylesheet)

    const parsedCSS = new CSSParser(stylesheet)
    parsedStylesheets.push(parsedCSS)
    waStylesheet = stylesheet

    ;[...parsedCSS.utilityClasses].forEach((selector) => {
      const obj: CompletionItem =  {
        label: selector,
        // detail: value,
        // documentation,
        kind: CompletionItemKind.Class
      }

      cssUtilityClasses.push(obj)
    })

    ;[...parsedCSS.cssVariables].forEach(([variable, value]) => {
      let documentation = ""
      if (variable.includes("-space-")) {
        documentation = "Web Awesome Spacing Token"
      } else if (variable.includes("-color-")) {
        documentation = "Web Awesome Color Token"
      } else if (variable.includes("-shadow-")) {
        documentation = "Web Awesome Box Shadow Token"
      } else {
        documentation = "Web Awesome Token"
      }

      const obj: CompletionItem =  {
        label: variable,
        detail: value,
        documentation,
        kind: CompletionItemKind.Property
      }

      const withVarObj = {...obj, label: "var(" + obj.label + ")"}

      cssVariableCompletions.push(obj, withVarObj)
    })
  })
  .catch((e) => {
    appendFileSync(debugFile, "Error: " + e.toString())
  })


// TODO: Should probably cache this call to "expandStylesheet"
expandStylesheet("https://early.webawesome.com/webawesome@3.0.0-alpha.7/dist/styles/themes/default.css")
  .then((stylesheet) => {
    // appendFileSync(debugFile, "restyle.css -> " + stylesheet)
    const parsedCSS = new CSSParser(stylesheet)
    parsedStylesheets.push(parsedCSS)
    waStylesheet = stylesheet

    ;[...parsedCSS.utilityClasses].forEach((selector) => {
      const obj: CompletionItem =  {
        label: selector,
        // detail: value,
        // documentation,
        kind: CompletionItemKind.Class
      }

      cssUtilityClasses.push(obj)
    })

    ;[...parsedCSS.cssVariables].forEach(([variable, value]) => {
      let documentation = ""
      if (variable.includes("-space-")) {
        documentation = "Web Awesome Spacing Token"
      } else if (variable.includes("-color-")) {
        documentation = "Web Awesome Color Token"
      } else if (variable.includes("-shadow-")) {
        documentation = "Web Awesome Box Shadow Token"
      } else {
        documentation = "Web Awesome Token"
      }

      const obj: CompletionItem =  {
        label: variable,
        detail: value,
        documentation,
        kind: CompletionItemKind.Property
      }

      const withVarObj = {...obj, label: "var(" + obj.label + ")"}

      cssVariableCompletions.push(obj, withVarObj)
    })
  })
  .catch((e) => {
    appendFileSync(debugFile, "Error: " + e.toString())
  })

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let languageModes: LanguageModes;

connection.onInitialize((params: InitializeParams) => {
	languageModes = getLanguageModes();

	documents.onDidClose(e => {
		languageModes.onDocumentRemoved(e.document);
	});
	connection.onShutdown(() => {
		languageModes.dispose();
	});

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
         resolveProvider: true
      },
    },
  };

  return result;
});

// documents.onDidChangeContent((change) => {
//   connection.window.showInformationMessage(
//     "onDidChangeContent: " + change.document.uri
//   );
// });

connection.onCompletion(async (textDocumentPosition, token) => {
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) {
    return null;
  }

  // TODO: Always returning true.
  let mode: LanguageMode | null | undefined = null

  switch (document.languageId) {
    // CSS does not accept nested languages.
    case "css": {
      mode = languageModes.getMode("css")
      break;
    }
    default: {
      mode = languageModes.getModeAtPosition(document, textDocumentPosition.position);
    }
  }

  // appendFileSync(debugFile, "mode: " + (mode?.getId() || ""))
  // appendFileSync(debugFile, waStylesheet)

  if (!mode || !mode.doComplete) {
    return CompletionList.create();
  }

  const doComplete = mode.doComplete;

  let completionList = CompletionList.create()
  completionList = doComplete?.(document, textDocumentPosition.position);

  if (mode.getId() === "css" && cssVariableCompletions.length > 0) {
    completionList.items = completionList.items.concat(cssVariableCompletions)
    completionList.items = completionList.items.concat(cssUtilityClasses)
  }

  return completionList
});

// This handler resolves additional information for the item selected in
// the completion list.
// Required by VSCode.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
