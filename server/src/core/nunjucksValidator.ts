import { TextDocument } from "vscode-languageserver-textdocument";
import { NunjucksSettings } from "../settings/nunjucksSettings";
import { Diagnostic } from "vscode-languageserver";
import { NunjucksParser } from "./nunjucksParser";

export class NunjucksValidator {
  constructor(public parser: NunjucksParser) {}

  validate(document: TextDocument, settings: NunjucksSettings): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const content = document.getText();
    const lines = content.split('\n');

    return diagnostics
  }
}
