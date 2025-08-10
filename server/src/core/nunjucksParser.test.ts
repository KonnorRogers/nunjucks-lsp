import {test} from "node:test"
import assert from 'node:assert';

import * as nodes from "nunjucks/src/nodes.js"
import { NunjucksParser } from "./nunjucksParser"

test("Should properly find a symbol", () => {
  const parser = new NunjucksParser({})
  const result = parser.parseContent(`{{ iAmVariable }}`)

  if (!result.ast) { throw result.error }

  const symbols = result.ast.findAll(nodes.Symbol)
  symbols[0]
  assert.equal(symbols[0].value, "iAmVariable")
})

// test("Should properly find a lookup target", () => {
//   const parser = new NunjucksParser({})
//   const ast = parser.parseContent(`{{ iAmVariable.foo }}`)
//   const symbols = ast.findAll(nodes.Symbol)
//   assert.equal(symbols[0].value, "iAmVariable.foo")
// })
