const { ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

const adminRoleNames = [
  ROLES.ADMINISTRATOR,
  ROLES.MODERATOR,
  ROLES.OWNER,
  ROLES.PRICER,
]

module.exports = function (message, command, request) {
  const roles = message.guild.roles.cache
  const mutedRole = findRoleByName(roles, ROLES.MUTED)
  const authorMember = message.guild.members.cache.get(message.author.id)
  const isAdmin = authorMember.roles.cache.some((r) => {
    return adminRoleNames.includes(r.name)
  })
  const mutee = message.mentions.members.first()

  let msg = ''
  if (isAdmin) {
    if (!mutee) return 'Mute who?!'
    mutee.roles.add(mutedRole)
    msg += `${mutee} was muted by <@${message.author.id}>`
  } else {
    msg += `<@${message.author.id}> is not allowed to mute other users`
  }
  return msg
}
