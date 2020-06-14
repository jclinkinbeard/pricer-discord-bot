const Keyv = require('keyv')

const { LOCAL, MONGODB_URI } = process.env
const env = LOCAL ? 'local:' : ''

exports.fcStorage = new Keyv(MONGODB_URI, { namespace: `${env}fc` })
exports.fcStorage.on('error', (err) => {
  console.error('Keyv connection error:', err)
})
exports.repStorage = new Keyv(MONGODB_URI, { namespace: `${env}rep` })
