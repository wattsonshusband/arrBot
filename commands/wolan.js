const wol = require('wol');

module.exports = {
 name: "wolan",
 description: "Sends the magic packet to the Server to wake it up.",
 usage: "wolan",
 aliases: ['wol', 'wakeonlan', 'wolpacket'],
 permissions: null,
 run: async (client, msg, args) => {
  try{
   if(!process.env.WOL_MAC || !process.env.WOL_IP || !process.env.WOL_PORT){
    client.delete_msg(msg.reply("Sorry, the Wake-on-LAN feature is not configured properly. Please supply WOL_MAC, WOL_IP and WOL_PORT in the environment variables."), 15000);
    client.delete_msg(msg, 15000);
    return;
   }

   wol.wake(process.env.WOL_MAC, { address: process.env.WOL_IP, port: parseInt(process.env.WOL_PORT) }, function(error) {
    if(error){
     console.log(`[WOL] Error sending magic packet: ${error}`);
     client.delete_msg(msg.reply("Sorry, there was an error sending the magic packet. Please ensure the configuration is correct."), 15000);
     return;
    }

    client.delete_msg(msg.reply("Magic packet sent! The should be waking up now."), 15000);
    client.delete_msg(msg, 15000);
    return;
   });
  }
  catch(err){
   console.log(`[WOL] Exception: ${err}`);
   client.delete_msg(msg.reply("Sorry, something big broke when trying to send the magic packet."), 15000);
   client.delete_msg(msg, 15000);
   return;
  }
 }
}