import {
  CompletionItem,
  CompletionItemKind,
  Position,
  InsertTextFormat,
  MarkupKind
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NunjucksParser } from './nunjucksParser';
import { NunjucksSettings } from '../settings/nunjucksSettings';

export class NunjucksCompletionProvider {
  constructor(private parser: NunjucksParser) {}

  provideCompletions(
    document: TextDocument,
    position: Position,
    settings: NunjucksSettings
  ): CompletionItem[] {
    const line = this.getLineAt(document, position.line);
    const beforeCursor = line.substring(0, position.character);
    // const context = this.getCompletionContext(beforeCursor);
    const context = {type: ""}

    switch (context.type) {
      // case 'filter':
      //   return this.getFilterCompletions();
      // case 'variable':
      //   return this.getVariableCompletions(document);
      // case 'tag':
      //   return this.getTagCompletions();
      // case 'block':
      //   return this.getBlockCompletions(document);
      // case 'macro':
      //   return this.getMacroCompletions(document);
      default:
        return this.getGeneralCompletions(document);
    }
  }

  resolveCompletion(item: CompletionItem): CompletionItem {
    // Add detailed documentation for specific items
    if (item.data === 'filter') {
      item.documentation = {
        kind: MarkupKind.Markdown,
        value: this.getFilterDocumentation(item.label)
      };
    }
    return item;
  }

  private getLineAt(document: TextDocument, lineNumber: number): string {
    const lines = document.getText().split('\n');
    return lines[lineNumber] || '';
  }

  private getGeneralCompletions(document: TextDocument): CompletionItem[] {
    // Return common Nunjucks constructs
    return [
      {
        label: '{{ }}',
        kind: CompletionItemKind.Snippet,
        documentation: 'Variable expression',
        insertText: '{{ $1 }}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: '{% %}',
        kind: CompletionItemKind.Snippet,
        documentation: 'Template tag',
        insertText: '{% $1 %}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: '{# #}',
        kind: CompletionItemKind.Snippet,
        documentation: 'Comment',
        insertText: '{# $1 #}',
        insertTextFormat: InsertTextFormat.Snippet
      }
    ];
  }

  private getFilterDocumentation(filterName: string): string {
    const filterDocs: Record<string, string> = {
      'default': 'If the value is undefined it will return the passed default value, otherwise the value of the variable.',
      'escape': 'Convert the characters &, <, >, \', and " in string s to HTML-safe sequences.',
      'safe': 'Mark the value as safe which means that in an environment with automatic escaping enabled this variable will not be escaped.',
      'upper': 'Convert a value to uppercase.',
      'lower': 'Convert a value to lowercase.',
      'title': 'Return a titlecased version of the value.',
      'capitalize': 'Capitalize the first character of a value.',
      'trim': 'Strip leading and trailing whitespace.',
      'length': 'Return the length of the value.',
      'first': 'Return the first item of a sequence.',
      'last': 'Return the last item of a sequence.',
      'join': 'Return a string which is the concatenation of the strings in the sequence.',
      'reverse': 'Reverse the object or return an iterator that iterates over it the other way round.',
      'sort': 'Sort an iterable.',
      'replace': 'Return a copy of the value with all occurrences of a substring replaced with a new one.'
    };

    return filterDocs[filterName] || `Nunjucks filter: ${filterName}`;
  }
}
