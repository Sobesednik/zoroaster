'use strict'

const assert = require('assert')
const TestSuite = require('../../src/test_suite')
const lib = require('../lib')
const TEST_SUITE_NAME = 'test-suite'

module.exports = {
    'object context': {
        'should call _destroy method': () => {
            let destroyed = false
            const context = {
                _destroy: () => { destroyed = true },
            }
            const testSuite = new TestSuite(TEST_SUITE_NAME, {
                test: () => {},
            }, null, context)
            return testSuite.run()
                .then(() => {
                    lib.assertNoErrosInTestSuite(testSuite)
                    assert(destroyed)
                })
        },
        'should work when promise is returned': () => {
            let destroyed = false
            const context = {
                _destroy: () => new Promise(r => setTimeout(r, 50))
                    .then(() => {
                        destroyed = true
                    }),
            }
            const testSuite = new TestSuite(TEST_SUITE_NAME, {
                test: () => {},
            }, null, context)
            return testSuite.run()
                .then(() => {
                    lib.assertNoErrosInTestSuite(testSuite)
                    assert(destroyed)
                })
        },
    },
    'should call _destroy method in the end of test if provided': () => {
        let destroyed = false
        const makeContext = function Context() {
            Object.defineProperty(this, '_destroy', {
                value: () => {
                    destroyed = true
                },
            })
        }
        const testSuite = new TestSuite(TEST_SUITE_NAME, {
            test: () => {},
        }, null, makeContext)
        return testSuite.run()
            .then(() => {
                lib.assertNoErrosInTestSuite(testSuite)
                assert(destroyed)
            })
    },
    'should work when promise is returned': () => {
        let destroyed = false
        const makeContext = function Context() {
            Object.defineProperty(this, '_destroy', {
                value: () => {
                    return new Promise(r => setTimeout(r, 50))
                        .then(() => {
                            destroyed = true
                        })
                },
            })
        }
        const testSuite = new TestSuite(TEST_SUITE_NAME, {
            test: () => {},
        }, null, makeContext)
        return testSuite.run()
            .then(() => {
                lib.assertNoErrosInTestSuite(testSuite)
                assert(destroyed)
            })
    },
    'should fail a test by throwing an error': () => {
        const error = new Error('test error message')
        const makeContext = function Context() {
            Object.defineProperty(this, '_destroy', {
                value: () => {
                    throw error
                },
            })
        }
        const testSuite = new TestSuite(TEST_SUITE_NAME, {
            test: () => {},
        }, null, makeContext)
        return testSuite.run()
            .then(() => {
                assert.strictEqual(testSuite.tests[0].error, error)
            })
    },
    'should fail a test by returning a rejected promise': () => {
        const error = new Error('test error message')
        const makeContext = function Context() {
            Object.defineProperty(this, '_destroy', {
                value: () => {
                    return Promise.reject(error)
                },
            })
        }
        const testSuite = new TestSuite(TEST_SUITE_NAME, {
            test: () => {},
        }, null, makeContext)
        return testSuite.run()
            .then(() => {
                assert.strictEqual(testSuite.tests[0].error, error)
            })
    },
    'should timeout if destroy method is taking too long': () => {
        let destroyed = false
        const makeContext = function Context() {
            Object.defineProperty(this, '_destroy', {
                value: () => {
                    return new Promise(r => setTimeout(r, 500))
                        .then(() => {
                            destroyed = true
                        })
                },
            })
        }
        const testSuite = new TestSuite(TEST_SUITE_NAME, {
            'should timeout': () => {},
        }, null, makeContext, 250)
        return testSuite.run()
            .then(() => {
                assert.throws(
                    () => lib.assertNoErrosInTestSuite(testSuite),
                    /Error in test "test-suite > should timeout": Test has timed out after 250ms/
                )
                assert(!destroyed)
            })
    },
}
