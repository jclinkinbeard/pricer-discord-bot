require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const pkg = require('./package.json')
const { COMMANDS } = require('./constants')

const prefix = '!'
const ban = require('./commands/ban')
const price = require('./commands/price')
const middleman = require('./commands/middleman')
const mute = require('./commands/mute')

// on startup, announce ourselves in each text channel
client.once('ready', async () => {
  if (process.env.LOCAL) return
  const msg = `${pkg.name} v${pkg.version} connected and ready!`
  client.guilds.cache.forEach((g) => {
    g.channels.cache.forEach((c) => {
      if (c.name === 'bot-operations') c.send(msg)
    })
  })
})

// each time a message is sent
client.on('message', (message) => {
  if (!message.content.startsWith(prefix)) return
  if (process.env.LOCAL && message.guild.name !== 'Lab Assistant Lab') return
  if (!process.env.LOCAL && message.guild.name === 'Lab Assistant Lab') return

  // parse command name and everythingthat follows into
  // command and request, respectively
  const [command, ...msg] = message.content.substr(1).split(' ')
  const request = msg.join(' ').trim()

  let reply = ''

  // every command handler should have the same signature
  // accepting `message`, `command`, and `request` arguments
  switch (command) {
    case COMMANDS.BAN:
    case COMMANDS.UNBAN:
      reply = ban(message, command, request)
      break
    case COMMANDS.PRICE:
    case COMMANDS.PRICENP:
      reply = price(message, command, request)
      break
    case COMMANDS.MIDDLEMAN:
      reply = middleman(message)
      break
    case COMMANDS.MUTE:
    case COMMANDS.UNMUTE:
      reply = mute(message, command, request)
      break
    default:
      reply = `Unknown command: ${command}`
  }

  message.channel.send(reply)
})

client.login(process.env.BOT_TOKEN)
