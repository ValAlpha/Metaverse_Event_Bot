const { Command } = require("discord.js-commando")

module.exports = class setavatar extends Command { 
  constructor(client) { 
    super(client, {
      name: "setavatar", 
      description: "change the client's name", 
      ownerOnly: true, 
      guildOnly: true, 
      memberName: "setavatar", 
      group: "owner", 
      args: [{
        type: "string", 
        prompt: "What's the new avatar?", 
        key: "url",
        default: m => m.attachments.first().url
      }]
    })
  }
  async run(msg, { url }) {

    await this.client.user.setAvatar(url).catch(err => {
    if(err){
      console.log(err)
      msg.say(`Error changing client's avatar`)
    }else{
      msg.say(`Changed`)
    }
    })

  }
}