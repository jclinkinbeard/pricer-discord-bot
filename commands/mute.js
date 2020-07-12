const { ROLES, COMMANDS } = require('../constants')
const { findRoleByName } = require('../utils')

const adminRoleNames = [
  ROLES.ADMINISTRATOR,
  ROLES.HELPER,
  ROLES.MODERATOR,
  ROLES.OWNER,
]

const snarks = [
  'What?! That dude runs this place.',
  'Easy now.',
  'You come at the king, you best not miss.',
  "Pffft! You can't mute the owner.",
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
  const mutedRole = findRoleByName(guildRoles, ROLES.MUTED)
  const logChannel = message.guild.channels.cache.find((c) => {
    if (c.name === 'user-commands') return c
  })

  let msg = ''
  if (isMuterAdmin) {
    if (!mutee) return 'Mute who?!'
    const isMuteeOwner = findRoleByName(mutee.roles.cache, ROLES.OWNER)
    if (isMuteeOwner) return snarks[Math.round(Math.random() * snarks.length)]
    if (isMuteeAdmin) return "Haha, nice try. (You can't mute a muter.)"

    if (command === COMMANDS.UNMUTE) {
      mutee.roles.remove(mutedRole)
    } else {
      mutee.roles.add(mutedRole)
    }

    msg += `${mutee} was ${command}d by <@${message.author.id}>`
    logChannel.send(msg)
  } else {
    msg += `<@${message.author.id}> is not allowed to mute other users`
  }
  return msg
}
