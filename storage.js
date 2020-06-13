const Keyv = require('keyv')

exports.fcStorage = new Keyv(process.env.MONGODB_URI, { namespace: 'fc' })
exports.fcStorage.on('error', (err) => {
  console.error('Keyv connection error:', err)
})
