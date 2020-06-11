const { ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

const adminRoleNames = [
  ROLES.ADMINISTRATOR,
  ROLES.MODERATOR,
  ROLES.OWNER,
  ROLES.PRICER,
]

module.exports = function (message, command, request) {
  const guildRoles = message.guild.roles.cache
  const isMuterAdmin = message.member.roles.cache.some((r) => {
    return adminRoleNames.includes(r.name)
  })
  const mutee = message.mentions.members.first()
  const isMuteeAdmin =
    mutee &&
    mutee.roles.cache.some((r) => {
      return adminRoleNames.includes(r.name)
    })

  let msg = ''
  if (isMuterAdmin) {
    if (!mutee) return 'Mute who?!'
    if (isMuteeAdmin) return "Haha, nice try. (You can't mute a muter.)"

    mutee.roles.add(findRoleByName(guildRoles, ROLES.MUTED))
    msg += `${mutee} was muted by <@${message.author.id}>`
  } else {
    msg += `<@${message.author.id}> is not allowed to mute other users`
  }
  return msg
}
