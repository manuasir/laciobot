const express = require('express')
const packageInfo = require('./package.json')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

/**
 * Devolver version
 */
app.get('/', (req, res) => {
  res.json({ version: packageInfo.version })
})

const server = app.listen(process.env.PORT, '0.0.0.0', () => {
  const host = server.address().address
  const port = server.address().port
  console.log('Web server started at http://%s:%s', host, port)
})

module.exports = (bot) => {
  app.post('/' + bot, async (req, res) => {
    try {
      console.log('info about webhook: ',await bot.getBot().getWebhookInfo())
      res.sendStatus(200)
    } catch(err) {
      res.sendStatus(404)
    }
  })
}
