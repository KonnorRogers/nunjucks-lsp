import { TextDocument } from "vscode-languageserver-textdocument";
import { NunjucksParser } from "./nunjucksParser";
import { Hover, MarkupKind, Position, Range } from "vscode-css-languageservice";
import { NunjucksSettings } from "../settings/nunjucksSettings";
import { getContext } from "./getContext";
import * as definitions from "./definitions"

export class NunjucksHoverProvider {
  constructor(public parser: NunjucksParser) {}

  provideHover(
    document: TextDocument,
    position: Position,
    settings: NunjucksSettings
  ): Hover | null {
    const {
      previousContent,
      currentLineContent,
      contentBeforeOffset,
    } = getContext(document, position.line, position.character);

    const word = this.getWordAtCursor(currentLineContent, position.character, position.line);

    if (!word) { return null }

    // do we need to parse??
    // const result = this.parser.parseContent(previousContent + "\n" + contentBeforeOffset.slice(0, contentBeforeOffset.length - word.word.length - 1) + word.word)
    // const tokenStack = result.tokenStack
    // if (result.error) {
    //   // Just blindly try to get a hover word
    //   const hover = this.wordToHoverDocumentation(word);
    //   return hover
    // }

    // const hover = this.wordToHoverDocumentationForToken(tokenStack, word);
    const hover = this.wordToHoverDocumentation(word);

    // Find what's at the current position
    return hover;
  }

  getWordAtCursor (lineContent: string, offset: number, lineNumber: number) {
    const charAtCursor = lineContent[offset]

    // TODO: If we encounter ".", we need to use the parser to get "context"
    const isNotSpaceRegex = /\S/

    if (!charAtCursor.match(isNotSpaceRegex)) {
      return null
    }

    // Start at the end of the string and work backwards until we hit empty space
    let word = [charAtCursor]

    let startOffset = offset
    let endOffset = offset

    for (let i = offset - 1; i > 0; i--) {
      const currentLetter = lineContent[i]
      if (!currentLetter.match(isNotSpaceRegex)) {
        break
      }

      startOffset -= 1
      word.unshift(currentLetter)
    }

    for (let i = offset + 1; i < lineContent.length; i++) {
      const currentLetter = lineContent[i]
      if (!currentLetter.match(isNotSpaceRegex)) {
        break
      }

      endOffset += 1
      word.push(currentLetter)
    }

    return {
      word: word.join(""),
      range: {
        start: { line: lineNumber, character: startOffset },
        end: { line: lineNumber, character: endOffset + 1 },
      }
    }
  }

  /**
   * Provide a more contextual hover for a token
   */
  wordToHoverDocumentationForToken(tokenStack: Token[], word: ReturnType<typeof this.getWordAtCursor>): Hover | null {
    if (word == null) { return null }

    const contents = {
      contents: {
        kind: MarkupKind.Markdown,
        value: word.word,
      },
      range: word.range
    };

    const str = word.word

    const lastToken = tokenStack[tokenStack.length - 1]

    contents.contents.value = JSON.stringify(lastToken)
    return contents


    if (lastToken.type === "Tag" && definitions.tags[str]) {
      contents.contents.value = "Tag: " + definitions.tags[str].documentation as string
      return contents
    }

    if (lastToken.type === "Filter" && definitions.filters[str]) {
      contents.contents.value = "Filter: " + definitions.filters[str].documentation as string
      return contents
    }

    if (lastToken.type === "Global" && definitions.globalFunctions[str]) {
      contents.contents.value = "Global function: " + definitions.globalFunctions[str].documentation as string
      return contents
    }

    return contents
  }

  private wordToHoverDocumentation(word: ReturnType<typeof this.getWordAtCursor>): Hover | null {
    if (word == null) { return null }

    const contents = {
      contents: {
        kind: MarkupKind.Markdown,
        value: word.word,
      },
      range: word.range
    };

    const str = word.word

    if (definitions.tags[str]) {
      contents.contents.value = "Tag: " + definitions.tags[str].documentation as string
      return contents
    }

    if (definitions.filters[str]) {
      contents.contents.value = "Filter: " + definitions.filters[str].documentation as string
      return contents
    }

    if (definitions.globalFunctions[str]) {
      contents.contents.value = "Global function: " + definitions.globalFunctions[str].documentation as string
      return contents
    }

    return contents
  }
}
