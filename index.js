require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const pkg = require('./package.json')
const { COMMANDS } = require('./constants')

const prefix = '!'
const price = require('./commands/price')
const mute = require('./commands/mute')

// each time a message is sent
client.on('message', (message) => {
  if (!message.content.startsWith(prefix)) return

  // parse command name and everythingthat follows into
  // command and request, respectively
  const [command, ...msg] = message.content.substr(1).split(' ')
  const request = msg.join(' ').trim()

  let reply = ''

  // every command handler should have the same signature
  // accepting `message`, `command`, and `request` arguments
  switch (command) {
    case COMMANDS.PRICE:
    case COMMANDS.PRICENP:
      reply = price(message, command, request)
      break
    case COMMANDS.MUTE:
      reply = mute(message, command, request)
      break
    default:
      reply = `Unknown command: ${command}`
  }

  message.channel.send(reply)
})

client.login(process.env.BOT_TOKEN)
