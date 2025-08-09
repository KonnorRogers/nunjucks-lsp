import * as csstree from 'css-tree';
import * as https from "node:https"
import * as path from "node:path"

/**
 * Basic entrypoint for expanding a stylesheet to "inline" imports.
 */
export async function expandStylesheet (url: string) {
    const stylesheet = await fetchStylesheet(url)
    const importStatements = new CSSParser(stylesheet).importStatements
    const styles = await expandImports(url, importStatements)

    // TODO: Probably need to parse + remove all import statements now?? Luckily, what we're testing doesn't have nested imports
    return styles + stylesheet
}

export class CSSParser {
    ast: ReturnType<typeof csstree["parse"]>
    cssVariables = new Map<string, string>
    utilityClasses = new Set<string>
    importStatements: string[] = []

    cssVariablePrefix: string
    utilityClassPrefix: string

    constructor (str: string, options: Partial<{cssVarPrefix: string, utilityPrefix: string}> = {}) {
        this.cssVariablePrefix = options.cssVarPrefix || "--wa-"
        this.utilityClassPrefix = options.utilityPrefix || "wa-"
        this.ast = csstree.parse(str);
        this.walk()
    }

    walk () {
        this.cssVariables.clear()
        this.utilityClasses.clear()
        this.importStatements = []
        csstree.walk(this.ast, (node) => {
            this.visit(node)
        })
    }

    visit (node: csstree.CssNode) {
        this.findCSSVariables(node)
        this.findUtilityClasses(node)
        this.findImportStatements(node)
    }

    findUtilityClasses (node: csstree.CssNode) {
        if (node.type === "ClassSelector" && node.name.startsWith(this.utilityClassPrefix)) {
            this.utilityClasses.add(node.name)
        }
    }

    findCSSVariables (node: csstree.CssNode) {
        if (node.type === 'Declaration' && node.property.startsWith(this.cssVariablePrefix)) {
            if (node.value.type === "Raw") {
                this.cssVariables.set(node.property, node.value.value)
            } else if (node.value.type === "Value") {
                // node.value.children.some
                // No-op, not sure whats needed here.
            }
        }
    }

    findImportStatements (node: csstree.CssNode) {
        if (node.type === 'Atrule' && node.name === "import") {
            if (
                node.prelude
                && node.prelude.type === "AtrulePrelude"
                && node.prelude.children.toArray().length > 0
            ) {
                node.prelude.children.forEach((child) => {
                    if (child.type === "Url") {
                        this.importStatements.push(child.value)
                    }
                })
            }
        }
    }
}

export function fetchStylesheet(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
      try {
        const url = new URL(uri)
        https.get(url, {
            method: "GET",
            agent: false,  // Create a new agent just for this one request
        }, (res) => {
            res.setEncoding("utf-8")
            let str = ""
            res.on('data', (chunk) => {
                str += chunk
            });
            res.on('end', () => {
                resolve(str)
            });
        });
      } catch(e) {
          reject(e)
      }
  })
}

/**
 * Fetches a stylesheet based on an importpath, and uses the original stylesheet as a 'reference'
 */
export function importToPath (options: { baseURI: string, importPath: string }) {
    // 3 conditions to handle for imports:
    // "Bare" @import url("default/foo.css"); @import url("foo"); We only handle the first case and treat it as "relative" like "./default/foo.css"
    // "Relative" @import url("./default/foo.css"); @import url("../default/foo.css") -> resolves off of directory.
    // "Absolute" @import url("/default/foo.css"); -> will resolve off of the "hostname" in the case of a url.

    let finalPath = ""

    const { baseURI, importPath } = options

    const baseURL = new URL(baseURI)

    if (importPath.startsWith("/")) {
        // Absolute
        finalPath = baseURL.origin + importPath
    } else if (importPath.startsWith(".")) {
        // Relative
        // Use posix pathing so it doesnt fail on windows.
        finalPath = baseURL.origin + path.posix.join(path.posix.dirname(baseURL.pathname), importPath)
    } else {
        // Bare
        // TODO: IF this is a local file, we need to worry about checking node_module entries.
        // For now, lets just assume its relative.
        finalPath = baseURL.origin + path.posix.join(path.posix.dirname(baseURL.pathname), importPath)
    }

    return finalPath
}

export async function expandImports (baseURI: string, importStatements: string[]) {
    const finalStyles: string[] = []

    const imports: Array<{baseURI: string, importCallback: Promise<string>}> = []

    for (const importPath of importStatements) {
        const stylesheetPath = importToPath({ baseURI, importPath })
        imports.push({
            baseURI: stylesheetPath,
            importCallback: fetchStylesheet(stylesheetPath)
        })
    }

    const finalImports = await Promise.allSettled(imports.map((obj) => obj.importCallback))
    const styles: Array<{baseURI: string, style: string}> = []

    finalImports.forEach((result, index) => {
        if (result.status === "fulfilled") {
            styles.push({
                baseURI: imports[index].baseURI,
                style: result.value
            })
        }
    })

    for (const styleObj of styles) {
        const parser = new CSSParser(styleObj.style)
        const expandedImports = await expandImports(styleObj.baseURI, parser.importStatements)
        finalStyles.push(expandedImports)
        finalStyles.push(styleObj.style)
    }

    return finalStyles.join("\n")
}

;(async () => {
    // let finalSheet = await expandStylesheet("https://early.webawesome.com")
    // let parsedCSS = new CSSParser(finalSheet)
    // console.log(parsedCSS.utilityClasses)
    // console.log(parsedCSS.cssVariables)
})()


