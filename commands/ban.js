const { COMMANDS } = require('../constants')

module.exports = function (message, command, request) {
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

  return msg
}
