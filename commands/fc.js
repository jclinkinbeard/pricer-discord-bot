const { COMMANDS } = require('../constants')
const { fcStorage } = require('../storage')

module.exports = async function (message, command, request) {
  const authorId = message.author.id

  if (command === COMMANDS.SETFC) {
    const stored = await fcStorage.set(authorId, request)
    const msg = stored ? `${request} saved as FC` : 'Could not save'
    message.channel.send(msg)
  } else {
    const stored = await fcStorage.get(authorId)
    const msg = `FC for <@${authorId}> is **${stored}**` || 'No FC found'
    message.channel.send(msg)
  }
}
