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
          description: 'Transfer speed in `speed` KB per second [8]',
          type: Number,
          alias: 's'
        },
        {
          name: 'interval',
          description: 'Transfer interval in milliseconds [100]',
          type: Number,
          alias: 'i'
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
        },
        {
          name: 'cors',
          description: 'Enable CORS via the Access-Control-Allow-Origin header [false]',
          type: Boolean,
          alias: 'c'
        }
      ]
    }
  ])
  console.log(usage)
}

const optionDefinitions = [
  { name: 'speed', alias: 's', type: Number, defaultValue: 8 },
  { name: 'interval', alias: 'i', type: Number, defaultValue: 100 },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8080 },
  { name: 'root-dir', alias: 'r', type: String, defaultValue: './' },
  { name: 'cors', alias: 'c', type: Boolean, defaultValue: false }
]

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
if (options._unknown) {
  showUsage()
  process.exit(-1)
}

const fs = require('fs')
const http = require('http')
const path = require('path')
const mime = require('mime-types')

async function sleep (t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}

console.log(`Listening http://localhost:${options.port}. Root directory: ${options['root-dir']}.`)
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
    res.writeHead(200, {
      'Content-Type': mime.lookup(url),
      'Content-Length': data.length
    })

    if (options.cors) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range'
      })
    }

    const step = Math.floor(options.speed * 1024 * options.interval / 1000)
    let transferred = 0
    while (transferred < data.length) {
      await sleep(options.interval)
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
