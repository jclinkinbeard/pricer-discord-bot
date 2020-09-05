const { ROLES, COMMANDS } = require('../constants')
const { muteStorage } = require('../storage')
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

module.exports = async function (message, command, request) {
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
  let muteReason
  if (isMuterAdmin) {
    if (!mutee) return 'Mute who?!'
    const isMuteeOwner = findRoleByName(mutee.roles.cache, ROLES.OWNER)
    if (isMuteeOwner) return snarks[Math.round(Math.random() * snarks.length)]
    if (isMuteeAdmin) return "Haha, nice try. (You can't mute a muter.)"

    if (command === COMMANDS.UNMUTE) {
      await muteStorage.delete(mutee.id)
      mutee.roles.remove(mutedRole)
    } else {
      const mention = `<@!${mutee.id}>`
      const msg = request.substr(mention.length + 1).trim()
      const duration = msg.substr(0, msg.indexOf(' '))
      if (!duration.length) {
        return message.channel.send('You must provide a duration and reason')
      }
      const unit = duration.substr(-1)
      const num = parseInt(duration.substr(0, duration.indexOf(unit)))
      if (!['m', 'h', 'd'].includes(unit)) {
        return message.channel.send('Duration must end in "m", "h", or "d"')
      }
      if (isNaN(num)) {
        return message.channel.send('Could not parse number from duration')
      }
      const reason = msg.substr(duration.length + 1)
      if (!reason.length) {
        return message.channel.send('You must provide a reason')
      }
      let ms
      switch (unit) {
        case 'm':
          ms = 1e3 * 60
          break
        case 'h':
          ms = 1e3 * 60 * 60
          break
        case 'd':
          ms = 1e3 * 60 * 60 * 24
          break
      }
      muteReason = reason
      await muteStorage.set(mutee.id, reason, ms * num)
      mutee.roles.add(mutedRole)
    }

    msg += `${mutee} was ${command}d by <@${message.author.id}> for ${muteReason}`
    logChannel.send(msg)
  } else {
    msg += `<@${message.author.id}> is not allowed to mute other users`
  }
  message.channel.send(msg)
}
