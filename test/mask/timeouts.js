import makeTestSuite from '@zoroaster/mask'
import Context from '../context'

const { BIN, getSnapshot } = Context

export default makeTestSuite('test/result/timeouts', {
  fork: BIN,
  mapActual({ stdout }) {
    const s = getSnapshot(stdout)
    return s
  },
})