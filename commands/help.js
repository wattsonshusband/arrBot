module.exports = {
 name: "help",
 description: "Shows the commands that are available to use.",
 usage: "help <command name>",
 aliases: [],
 permissions: null,
 run: async (client, msg, args) => {
  if(args[0]){
   const cmd = client.commands.get(args[0]) || client.commands.find(c => c.aliases && c.aliases.includes(args[0]));
   if(!cmd){
    client.delete_msg(msg.reply(`Sorry, I couldn't find that command... `), 15000);
    return;
   }

   let reply = `**Command:** ${cmd.name}\n**Description:** ${cmd.description || "No description provided."}\n**Usage:** \`${process.env.PREFIX}${cmd.usage}\` \n**Aliases:** ${cmd.aliases && cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "No aliases provided."}`;

   const sent_msg = await msg.reply(reply);
   client.delete_msg(sent_msg, 15000);
   client.delete_msg(msg, 15000);
   return;
  }else{
   let reply = `Here are the commands you can use:\n\n`;
   const cmds = [];

   client.commands.forEach(cmd => {
    // if(!cmds.includes(cmd.name) && (!cmd.permissions || (cmd.permissions && cmd.permissions[0] != "OWNER" && !msg.member.permissions.has(cmd.permissions)))){ return; }
    if(!cmds.includes(cmd.name))cmds.push(cmd.name);
   });

   reply += cmds.map(c => `\`${c}\``).join(", ");
   reply += `\n\nYou can type \`${process.env.PREFIX}help <command name>\` to get info on a specific command.`;

   const sent_msg = await msg.reply(reply);
   client.delete_msg(sent_msg, 15000);
   client.delete_msg(msg, 15000);
   return;
  }
 }
}