const { ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

module.exports = function (message, command, request) {
  const roles = message.guild.roles.cache
  const mutedRole = findRoleByName(roles, ROLES.MUTED)
  // message.mentions.members.first().roles.add(mutedRole)

  // make sure author is ??? role
  // console.log(message.author.roles.some((r) => r.name === ROLES.PRICER))
  const [mutee, duration] = request.split(' ')

  let msg = 'Mute is not implemented yet'
  // msg += `<@${message.author.id}> wants to mute ${mutee} for ${duration}`
  return msg
}
