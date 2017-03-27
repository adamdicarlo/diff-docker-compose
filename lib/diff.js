const jsondiffpatch = require('jsondiffpatch')
const yaml = require('js-yaml')

const differ = jsondiffpatch.create({ objectHash })

module.exports = function diffJsonFromTemplate (template, content) {
  const normalizedTemplate = normalize(template)
  const normalizedContent = normalize(content)
  return differ.diff(normalizedTemplate, normalizedContent) || {}
}

function objectHash (object) {
  return object.name || object.id || JSON.stringify(object)
}

function normalize (data) {
  if (Array.isArray(data)) {
    return normalizeArray(data)
  }

  if (typeof data === 'object') {
    return normalizeObject(data)
  }
  return data
}

function normalizeArray (array) {
  return array
    .sort((left, right) => {
      const leftWeight = typeof left === 'object' ? objectHash(left, 0) : left
      const rightWeight = typeof right === 'object' ? objectHash(right, 1) : right
      if (leftWeight < rightWeight) return -1
      if (leftWeight > rightWeight) return 1
      return 0
    })
    .map((item) => normalize(item))
}

function normalizeObject (object) {
  // Transform object into array of prop names, sort prop names, and insert (in order) into a Map.
  // (Iterating a Map() is guaranteed to give the values in insertion order, unlike an Object.)
  return Object
    .getOwnPropertyNames(object)
    .sort()
    .reduce((result, prop) => {
      result[prop] = normalize(object[prop])
      return result
    }, {})
}
