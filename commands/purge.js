module.exports = {
 name: "purge",
 description: "Deletes a specified amount of message from a channel.",
 usage: "purge <amount>",
 aliases: [],
 permissions: null,
 run: async (client, msg, args) => {
  let amount = parseInt(args[0]);

  if(isNaN(amount) || amount < 1 || amount > 100){
   return msg.reply(`please provide a valid number between 1 and 100...`).then(msg2 => { msg2.delete({ timeout: 15000 }) });
  }

  msg.channel.sendTyping();

  msg.delete({ timeout: 1000 });

  msg.channel.bulkDelete(amount, true).then(deleted => {
   msg.channel.send(`🧹 Deleted \`${deleted.size}\` messages...`).then(msg2 => { msg2.delete({ timeout: 15000 }) });''
  }).catch(err => {
   console.error(err);
   return msg.reply(`sorry, I couldn't delete messages...`).then(msg2 => { msg2.delete({ timeout: 15000 }) });
  })
 }
}