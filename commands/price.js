const { COMMANDS, ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

module.exports = function (message, command, request) {
  const roles = message.guild.roles.cache
  const pricerRoleId = findRoleByName(roles, ROLES.PRICER).id
  const pitRoleId = findRoleByName(roles, ROLES.PRICER_IN_TRAINING).id
  const logChannel = message.guild.channels.cache.find((c) => {
    if (c.name === 'price-logs') return c
  })

  let msg = ''
  msg += `Price request! <@${message.author.id}> wants to know `
  msg += `the price of **${request}** for Nintendo Switch.`

  if (message.channel.name !== 'trading-chat') {
    const channelId = message.guild.channels.cache.find((c) => {
      if (c.name === 'trading-chat') return c.id
    })
    return `This command can only be used in ${channelId}`
  }

  logChannel.send(msg)

  if (command === COMMANDS.PRICE) {
    msg += ` <@&${pricerRoleId}> <@&${pitRoleId}>`
  }

  return msg
}
