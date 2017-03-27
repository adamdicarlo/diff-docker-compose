import test from 'ava'
import deepFreeze from 'deep-freeze-strict'
import diff from '../lib/diff.js'

const noDelta = Object.freeze({})


function diffAdd (data) {
  return [ data ]
}

function diffRemove (data) {
  return [ data, 0, 0 ]
}


test('gives no differences for two blank objects', (t) => {
  t.deepEqual(diff({}, {}), noDelta)
})

test('gives one difference when one object has been added', (t) => {
  t.deepEqual(diff({}, { a: 'hi' }), { a: diffAdd('hi') })
})

test('ignores object key order', (t) => {
  t.deepEqual(diff({ a: 1, b: 2 }, { b: 2, a: 1 }), noDelta)
})

test('ignores array order', (t) => {
  t.deepEqual(diff([ 1, 5, 10 ], [ 1, 10, 5 ]), noDelta)
})

test('ignores array order with named objects', (t) => {
  const alice = { name: 'alice' }
  const bob = { name: 'bob' }
  t.deepEqual(diff([ alice, bob ], [ bob, alice ]), noDelta)
})

test('ignores array order with unnamed objects', (t) => {
  const alice = { foobaz: 'alice' }
  const bob = { foobar: 'bob' }
  t.deepEqual(diff([ alice, bob ], [ bob, alice ]), noDelta)
})

test('gives two differences for removing one top-level object, and adding one', (t) => {
  const app     = deepFreeze({ build: 'app',      env: { KEY: 'app' } })
  const service = deepFreeze({ build: 'service',  env: { KEY: 'secret' } })
  const goner   = deepFreeze({ build: 'goner',    env: { KEY: 'goner' } })
  const newbie  = deepFreeze({ build: 'newthing', env: { KEY: 'newbie' } })

  const template = deepFreeze({
    app,
    service,
    goner
  })

  const content = deepFreeze({
    app,
    service,
    newbie
  })

  t.deepEqual(diff(template, content), {
    goner: diffRemove(goner),
    newbie: diffAdd(newbie)
  })
})
