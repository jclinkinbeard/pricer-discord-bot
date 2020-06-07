require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()

client.once('ready', async () => {
  console.log('pricebot is ready!')
})

const prefix = '!'
client.on('message', (message) => {
  if (!message.content.startsWith(prefix)) return

  const [command] = message.content.substr(1).split(' ')

  switch (command) {
    case 'price':
      handlePriceRequest(command, message)
      break
    case 'pricenp':
      handlePriceRequest(command, message, false)
      break
    default:
      message.channel.send(`Unknown command: ${command}`)
  }
})

function handlePriceRequest(command, message, notify = true) {
  const args = message.content.substr(command.length + 1)
  const roles = message.guild.roles.cache
  const pricerRole = roles.find((r) => r.name === 'Pricer')
  const pitRole = roles.find((r) => r.name === 'Pricer in Training')
  let msg = ''
  msg += `Price request! <@${message.author.id}> wants to know `
  msg += `the price of **${args}** for Nintendo Switch.`
  if (notify) msg += ` <@&${pricerRole.id}> <@&${pitRole.id}>`
  message.channel.send(msg)
}

// https://discordapp.com/channels/365559264850477066/715004775300726825/715013654575054898
client.login(process.env.BOT_TOKEN)
