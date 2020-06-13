const { COMMANDS } = require('../constants')
const { fcStorage } = require('../storage')

module.exports = async function (message, command, request) {
  const authorId = message.author.id
  const mentioned = message.mentions?.members?.first()
  let msg

  if (command === COMMANDS.SETFC) {
    const stored = await fcStorage.set(authorId, request)
    if (stored) {
      msg = `FC for <@${authorId}> saved as **${request}**`
    } else {
      msg = 'Could not save'
    }
  } else {
    if (mentioned) {
      const menId = mentioned.user.id
      const stored = await fcStorage.get(menId)
      msg = stored
        ? `FC for <@${menId}> is **${stored}**`
        : `No FC found for <@${menId}>`
    } else {
      const stored = await fcStorage.get(authorId)
      msg = stored
        ? `FC for <@${authorId}> is **${stored}**`
        : `No FC found for <@${menId}>`
    }
  }
  message.channel.send(msg)
}
