const { ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

module.exports = function (message) {
  const roles = message.guild.roles.cache
  const mmRoleId = findRoleByName(roles, ROLES.MIDDLEMAN).id

  if (message.channel.name !== 'middleman-call') {
    const channelId = message.guild.channels.cache.find((c) => {
      if (c.name === 'middleman-call') return c.id
    })
    return `This command can only be used in ${channelId}`
  }

  let msg = ''
  msg += `<@${message.author.id}> needs a middleman, who's available?`
  msg += ` <@&${mmRoleId}>`
  return msg
}
