const { Command } = require("discord.js-commando")

module.exports = class setname extends Command { 
  constructor(client) { 
    super(client, {
      name: "setname", 
      description: "change the client's name", 
      ownerOnly: true, 
      guildOnly: true, 
      memberName: "setname", 
      group: "owner", 
      args: [{
        type: "string", 
        prompt: "What's the new name?", 
        key: "name"
      }]
    })
  }
  async run(msg, { name }) {

    await this.client.user.setUsername(name).catch(err => {
    if(err){
      console.log(err)
      msg.say(`Error changing client's name`)
    }else{
      msg.say(`Changed`)
    }
    })

  }
}