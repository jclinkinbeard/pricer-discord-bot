const { COMMANDS, ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

module.exports = function (message, command, request) {
  const roles = message.guild.roles.cache
  const pricerRoleId = findRoleByName(roles, ROLES.PRICER).id
  const pitRoleId = findRoleByName(roles, ROLES.PRICER_IN_TRAINING).id

  let msg = ''
  msg += `Price request! <@${message.author.id}> wants to know `
  msg += `the price of **${request}** for Nintendo Switch.`
  if (command === COMMANDS.PRICE) {
    msg += ` <@&${pricerRoleId}> <@&${pitRoleId}>`
  }
  return msg
}
