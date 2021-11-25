#!/usr/bin/env node

const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

function showUsage () {
  const usage = commandLineUsage([
    {
      header: 'Description',
      content: 'A simple HTTP static resource server with latency for testing purpose.'
    },
    {
      header: 'Usage',
      content: 'slow-http-server [options]'
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'help',
          description: 'Display this usage guide.',
          alias: 'h',
          type: Boolean
        },
        {
          name: 'speed',
          description: 'Transfer speed in `speed` KB per second [8192]',
          type: Number,
          alias: 's'
        },
        {
          name: 'port',
          description: 'Port to use [8080]',
          type: Number,
          alias: 'p'
        },
        {
          name: 'root-dir',
          description: 'Root directory [./]',
          type: String,
          alias: 'r'
        }
      ]
    }
  ])
  console.log(usage)
}

const optionDefinitions = [
  { name: 'speed', alias: 's', type: Number, defaultValue: 8 },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8080 },
  { name: 'root-dir', alias: 'r', type: String, defaultValue: './' }
]

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
if (options._unknown) {
  showUsage()
  process.exit(-1)
}

const fs = require('fs')
const http = require('http')
const path = require('path')

async function sleep (t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}

console.log(`Listening ${options.port}. Root directory: ${options['root-dir']}.`)
http.createServer(function (req, res) {
  let url = req.url
  const p = url.indexOf('?')
  if (p >= 0) {
    url = url.substring(0, p)
  }
  fs.readFile(path.join(options['root-dir'], url), async function (err, data) {
    if (err) {
      res.writeHead(404)
      res.end(JSON.stringify(err))
      return
    }
    res.writeHead(200)

    const step = Math.floor(options.speed * 1024 * 0.1)
    let transferred = 0
    while (transferred < data.length) {
      await sleep(100)
      const size = Math.min(step, data.length - transferred)
      const d = data.slice(transferred, transferred + size)
      transferred += size

      if (transferred >= data.length) {
        res.end(d)
      } else {
        res.write(d)
      }
    }
  })
}).listen(options.port)
