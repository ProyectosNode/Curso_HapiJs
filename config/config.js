require('dotenv').config()

const config = {

  // Produccion
  dev: process.env.NODE_ENV === 'production',

  // Development
  port: process.env.PORT,
  host: process.env.HOST
}

module.exports = { config: config }
