let mismatch = require('mismatch'); if (mismatch && mismatch.__esModule) mismatch = mismatch.default;
const { readFileSync } = require('fs');

const makeRegex = (keys = []) => {
  const m = /[\s\S]+?/
  const ms = m.source
  const n = '\\n'
  const titleAndBody = `^// (.+?)${n}(${ms})${n.repeat(2)}`
  const vals = keys.map(k => {
    const s = `(?:/\\* *${k} *\\*/${n}(${ms})${n}/\\*\\*/)?`
    return s
  })
  const allVals = vals.join('\\s*')
  const regex = new RegExp(`${titleAndBody}${allVals}`, 'gm')
  return regex
}

/**
 * A function to construct tests from a mask file.
 * @param {string} path Path to the mask file.
 * @param {string[]} [keys] Properties of each test to extract. Default `['expected']`.
 */
const getTests = (path, keys = ['expected']) => {
  const m = `${readFileSync(path)}`
  const re = makeRegex(keys)
  const tests = mismatch(
    re,
    m,
    ['name', 'input', ...keys],
  )
  const lines = m.split('\n')
  /**
   * A function to be called on error in a test.
   * @param {string} name
   * @param {Error} error
   * @throws {Error} An error with a stack trace pointing at the line in the mask file.
   */
  const onError = (name, error) => {
    const lineRe = new RegExp(`^// +${name}`)
    const lineNumber = lines.reduce((acc, current, index) => {
      if (acc) return acc // found
      if (lineRe.test(current)) return index + 1
      return acc
    }, null)
    const err = new Error(error.message)
    // possibly also remember custom test stack later
    const stack = makeStack(error.message, name, path, lineNumber)
    err.stack = stack
    throw err
  }
  const testsWithOnError = tests.map(({ name, ...rest }) => {
    /**
     * @type {function}
     * @param {Error} error An error with a stack trace pointing at the line in the mask file.
     */
    const boundOnError = onError.bind(null, name)
    return {
      ...rest,
      name,
      onError: boundOnError,
    }
  })
  return testsWithOnError
}

const makeStack = (message, name, path, lineNumber) => {
  return `Error: ${message}\n    at ${name} (${path}:${lineNumber}:1)`
}

module.exports=getTests
//# sourceMappingURL=mask.js.map