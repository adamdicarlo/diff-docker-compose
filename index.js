#!/usr/bin/env node

const fs = require('fs')
const argv = require('yargs').argv
const chalk = require('chalk')
const groupBy = require('lodash.groupby')
const yaml = require('js-yaml')
const diff = require('./lib/diff.js')

const composeTemplateFilename = argv._[0] || 'docker-compose.yml.template'
const composeActualFilename = argv._[1] || 'docker-compose.yml'

const composeTemplate = loadYaml(composeTemplateFilename)
const composeActual = loadYaml(composeActualFilename)

if (!(composeTemplate && composeActual)) {
  console.error('Cannot continue without loading both files')
  console.log(`Usage: ${argv['$0']} [template file] [actual file]\n`)
  console.log('  [template file] defaults to `docker-compose.yml.template`')
  console.log('    [actual file] defaults to `docker-compose.yml`')
  process.exit(1)
}

console.log(formatDiff(diff(composeTemplate, composeActual)))


function loadYaml (filename) {
  let data
  try {
    data = yaml.safeLoad(fs.readFileSync(filename))
  } catch (error) {
    console.error(chalk.red(error.message))
    data = false
  }
  return data
}

function isRemoval (delta) {
  return delta[1] === 0 && delta[2] === 0
}

function isAddition (delta) {
  return delta.length === 1
}

function formatDiff (delta) {
  const groupedDeltas = groupBy(Object.keys(delta), (serviceName) => {
    const serviceDelta = delta[serviceName]
    if (isAddition(serviceDelta)) {
      return 'added'
    } else if (isRemoval(serviceDelta)) {
      return 'removed'
    }
    return 'modified'
  })

  return [
    formatGroupSummary(groupedDeltas.removed, 'removed/disabled', 'red'),
    formatGroupSummary(groupedDeltas.added, 'added/enabled', 'green'),
    formatGroupSummary(groupedDeltas.modified, 'modified', 'yellow')
  ].join('\n\n')
}

function formatGroupSummary (services, difference, color) {
  const header = 'Services locally ' + chalk[color](difference) + ':\n'
  return header + (services ? formatBulletsInColor(services, color) : '(none)')
}

function formatBulletsInColor (strings, color) {
  return strings.map((string) => chalk[color](`• ${string}`)).join('\n')
}
