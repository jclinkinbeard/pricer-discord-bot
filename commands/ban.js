const { ROLES, COMMANDS } = require('../constants')

const adminRoleNames = [ROLES.ADMINISTRATOR, ROLES.OWNER]

module.exports = function (message, command, request) {
  const isBannerAdmin = message.member.roles.cache.some((r) => {
    return adminRoleNames.includes(r.name)
  })

  if (!isBannerAdmin) {
    return 'You tried to do a bad thing and you should feel bad.'
  }

  let msg = ''
  if (command == COMMANDS.BAN) {
    const toBan = message.mentions.members.first().id
    if (!toBan) return 'Who do you want to ban, man?'
    message.guild.members.ban(toBan)
    msg += `<@${toBan}> has been banished for all eternity.`
  } else {
    message.guild.fetchBans().then((bans) => {
      bans.forEach((snowflake) => {
        if (message.content.includes(snowflake.user.id)) {
          message.guild.members.unban(snowflake.user.id)
        }
      })
    })
    msg += `${request} is back!`
  }

  const logChannel = message.guild.channels.cache.find((c) => {
    if (c.name === 'user-commands') return c
  })
  const log = msg + ` thanks to ${message.member.id}`
  logChannel.send(log)

  return msg
}
