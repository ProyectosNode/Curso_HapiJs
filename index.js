'use strict'

const Hapi = require('@hapi/hapi')
const inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const good = require('@hapi/good')
const crumb = require('@hapi/crumb')
const scooter = require('@hapi/scooter')
const path = require('path')
const blankie = require('blankie')

const handlebars = require('./lib/helpers')
const site = require('./controllers/site')
const methods = require('./lib/methods')
const routes = require('./routes')
const { config } = require('./config/config')

const server = Hapi.server({
  port: config.port,
  host: config.host,
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'public')
    }
  }
})

async function init () {
  try {
    await server.register(inert)
    await server.register(Vision)
    await server.register({
      plugin: good,
      options: {
        reporters: {
          console: [
            {
              module: '@hapi/good-console'
            },
            'stdout'
          ]
        }
      }
    })
    await server.register({
      plugin: require('./lib/api'),
      options: {
        prefix: 'api'
      }
    })

    await server.register({
      plugin: crumb,
      options: {
        cookieOptions: {
          isSecure: config.dev
        }
      }
    })

    await server.register([scooter, {
      plugin: blankie,
      options: {
        defaultSrc: `'self' 'unsafe-inline'`,
        styleSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com`,
        fontSrc: `'self' 'unsafe-inline' data:`,
        scriptSrc: `'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com/ https://code.jquery.com/`,
        generateNonces: false
      }
    }])

    server.method('setAnswerRight', methods.setAnswerRight)
    server.method('getLast', methods.getLast, {
      cache: {
        expiresIn: 1000 * 60,
        generateTimeout: 2000
      }
    })

    server.state('user', {
      ttl: 1000 * 60 * 60 * 24 * 7, // una semana (time to live)
      isSecure: config.dev,
      encoding: 'base64json'
    })

    server.views({
      engines: {
        hbs: handlebars
      },
      relativeTo: __dirname,
      path: 'views',
      layout: true,
      layoutPath: 'views'
    })

    server.ext('onPreResponse', site.fileNotFound)
    server.route(routes)

    await server.start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
  // console.log(`Servidor lanzado en: ${server.info.uri}`)
  server.log('info', `Servidor lanzado en: ${server.info.uri}`)
}

process.on('unhandledRejection', error => {
  // console.error('UnhandledRejection', error.message, error)
  server.log('UnhandledRejection', error)
})

process.on('unhandledException', error => {
  // console.error('unhandledException', error.message, error)
  server.log('unhandledException', error)
})

init()