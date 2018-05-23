import { equal, strictEqual } from 'assert'
import Test from '../../../../src/lib/Test'
import context, { Context } from '../../../context' // eslint-disable-line no-unused-vars

/** @type {Object.<string, (ctx: Context)>} */
const T = {
  context,
  'creates a test with a context'({ createObjectContext, TEST_NAME, tests: { test } }) {
    const ctx = createObjectContext()
    const t = new Test(TEST_NAME, test, null, ctx)
    strictEqual(t.context, ctx)
  },
  async 'passes context as the first argument to function'({ createObjectContext, TEST_NAME }) {
    const ctx = createObjectContext()
    const t = (c) => {
      equal(c, ctx)
    }
    const test = new Test(TEST_NAME, t, null, ctx)
    await test.run()
    equal(test.error, null)
  },
}

export default T
