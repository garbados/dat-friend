const async = require('async')
const tap = require('tap')
const Archiver = require('.')
const rimraf = require('rimraf')

const TEST_KEY = 'dat://95a964430e5a5c5203dde674a1873e51f2e8e78995855c1481020f405ee9a772/'
const FIXT_DIR = 'test-fixtures'

const OPTIONS = {
  dat: {
    live: false
  }
}

tap.test((t) => {
  t.beforeEach((done) => {
    rimraf(FIXT_DIR, done)
  })

  t.afterEach((done) => {
    rimraf(FIXT_DIR, done)
  })

  t.test({
    bail: true
  }, (test) => {
    const archiver = Archiver.create(FIXT_DIR, OPTIONS)

    async.series([
      archiver.start.bind(archiver),
      archiver.add.bind(archiver, TEST_KEY),
      (done) => {
        archiver.list((err, dirNames) => {
          test.error(err)
          test.equal(dirNames.length, 1)
          test.ok(TEST_KEY.indexOf(dirNames[0]) > -1)
          done()
        })
      },
      (done) => {
        archiver.get(TEST_KEY, (err, dat) => {
          test.error(err)
          test.ok(TEST_KEY.indexOf(dat.key.toString('hex')) > -1)
          done()
        })
      },
      archiver.remove.bind(archiver, TEST_KEY),
      archiver.stop.bind(archiver)
    ], (err) => {
      test.error(err)
      test.end()
    })
  })

  t.test((test) => {
    const archiver = Archiver.create(FIXT_DIR, OPTIONS)

    async.series([
      archiver.add.bind(archiver, TEST_KEY),
      archiver.start.bind(archiver),
      (done) => {
        archiver.add(TEST_KEY, (err) => {
          test.ok(err)
          test.ok(err.message.indexOf('already being peered') > -1)
          done()
        })
      },
      archiver.stop.bind(archiver)
    ], (err) => {
      test.error(err)
      test.end()
    })
  })

  t.end()
})
