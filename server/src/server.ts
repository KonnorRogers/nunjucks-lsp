import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  CompletionItem,
  // CompletionItemKind,
  DocumentDiagnosticReportKind,
  DocumentDiagnosticReport,
  DidChangeConfigurationNotification,
  TextDocumentPositionParams,
  TextDocumentIdentifier,
  DidChangeWatchedFilesNotification,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
    CompletionList,
    Hover,
    LanguageMode,
  // CompletionList,
  // LanguageMode,
  LanguageModes,
  getLanguageModes
} from "./languageModes";

import {
  // appendFileSync,
  writeFileSync
} from "fs";
import { NunjucksSettings } from "./settings/nunjucksSettings";
import { NunjucksParser } from "./core/nunjucksParser";
import { NunjucksCompletionProvider } from "./core/nunjucksCompletion";
import { NunjucksValidator } from "./core/nunjucksValidator";
import { NunjucksHoverProvider } from "./core/nunjucksHover";

const debugFile = "/Users/konnorrogers/debug.log"
writeFileSync(debugFile, "")

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let languageModes: LanguageModes;

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;


// Default settings
const defaultSettings: NunjucksSettings = {
  maxNumberOfProblems: 1000,
  templatePaths: ['./templates', './views'],
  enabledFeatures: {
    completion: true,
    diagnostics: true,
    hover: true
  }
};

let globalSettings: NunjucksSettings = defaultSettings;

// Initialize analyzers
const parser = new NunjucksParser(defaultSettings);
const nunjucksCompletionProvider = new NunjucksCompletionProvider(parser);
const nunjucksValidator = new NunjucksValidator(parser);
const nunjucksHoverProvider = new NunjucksHoverProvider(parser)


// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<NunjucksSettings>> = new Map();

connection.onInitialize((params: InitializeParams) => {
  languageModes = getLanguageModes();

  documents.onDidClose(e => {
	  languageModes.onDocumentRemoved(e.document);
          documentSettings.delete(e.document.uri);
  });
  connection.onShutdown(() => {
	  languageModes.dispose();
  });
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        // TODO: update to use the lexer completion chars.
        triggerCharacters: ['.', '|', '{', '%', '#']
      },
      hoverProvider: true,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: false
      }
    },
    serverInfo: {
      name: "nunjucks-lsp",
      version: "0.1.0"
    }
  };

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
  connection.client.register(DidChangeWatchedFilesNotification.type, {
    watchers: [
      { globPattern: `**/**/*.md` },
      { globPattern: `**/**/*.njk` },
    ],
  })
});

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <NunjucksSettings>(
      (change.settings.nunjucksLsp || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(sendDiagnostics);
});

// The content of a text document has changed
documents.onDidChangeContent(change => {
  sendDiagnostics(change.document);
});

async function getTextDocumentDiagnostics (textDocument: TextDocumentIdentifier) {
  const document = documents.get(textDocument.uri);
  if (document !== undefined) {
    const settings = await getDocumentSettings(document.uri);

    if (!settings.enabledFeatures.diagnostics) {
      return {
        kind: DocumentDiagnosticReportKind.Full,
        items: []
      } satisfies DocumentDiagnosticReport;
    }

    const diagnostics = nunjucksValidator.validate(document, settings);

    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: diagnostics
    } satisfies DocumentDiagnosticReport;
  } else {
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: []
    } satisfies DocumentDiagnosticReport;
  }
}

async function sendDiagnostics(textDocument: TextDocument): Promise<void> {
  try {
    const diagnostics = await getTextDocumentDiagnostics(textDocument)
    // Send the computed diagnostics to VSCode
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics.items });
  } catch (error) {
    connection.console.error(`Error validating document ${textDocument.uri}: ${error}`);
    // Send empty diagnostics on error to clear any existing ones
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
  }
}


// Hover provider
connection.onHover(async (params): Promise<Hover | null> => {
  try {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const settings = await getDocumentSettings(document.uri);

    if (!settings.enabledFeatures?.hover) {
      return null;
    }

    return nunjucksHoverProvider.provideHover(document, params.position, settings);
  } catch (error) {
    connection.console.error(`Error in hover provider: ${error}`);
    return null;
  }

})


function getDocumentSettings(resource: string): Thenable<NunjucksSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'nunjucksLsp'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Completion provider
connection.onCompletion(async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) {
    return [];
  }

  const settings = await getDocumentSettings(document.uri);

  if (!settings.enabledFeatures.completion) {
    return [];
  }

  return nunjucksCompletionProvider.provideCompletions(document, textDocumentPosition.position, settings);
});

// Completion resolve provider
// This handler resolves additional information for the item selected in
// the completion list.
// Required by VSCode.
// Completion resolve provider
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return nunjucksCompletionProvider.resolveCompletion(item);
});

// Diagnostic provider
connection.languages.diagnostics.on(async (params) => {
  const diagnostics = await getTextDocumentDiagnostics(params.textDocument)
  return diagnostics
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
