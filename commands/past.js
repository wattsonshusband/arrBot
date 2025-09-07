const { get_history_radarr, get_history_sonarr } = require('../utils/history');

module.exports = {
 name: "history",
 description: "Displays the past activity within Sonarr and Radarr combined.",
 usage: "history <all|sonarr|radarr>",
 aliases: ['past', 'recent'],
 permissions: null,
 run: async (client, msg, args) => {
  try{
   if(!args[0] || (args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'sonarr' && args[0].toLowerCase() != 'radarr')){
    const error_msg = await msg.reply('Please specify which activity you want to see: `all`, `sonarr` or `radarr`.');
    client.delete_msg(error_msg, 15000);
    client.delete_msg(msg, 15000);
    return;
   }

   let reply_msg = '';
   if(args[0].toLowerCase() == 'all' || args[0].toLowerCase() == 'sonarr'){
    const sonarr_history = await get_history_sonarr(client, 1, 5);
    if(sonarr_history.length == 0){
     reply_msg += '**Sonarr**\n_No Current Activity_\n\n';
    }else{
     reply_msg += '**Sonarr**\n';
     sonarr_history.forEach(item => {
      const date = new Date(item.date).toLocaleString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      reply_msg += `- ${item.episode.title} from ${item.series.title}\n`;
     });
    }
   }

   if(args[0].toLowerCase() == 'all' || args[0].toLowerCase() == 'radarr'){
    const radarr_history = await get_history_radarr(client, 1, 5);
    if(radarr_history.length == 0){
     reply_msg += '**Radarr**\n_No Current Activity_\n\n';
    }else{
     reply_msg += '**Radarr**\n';
     radarr_history.forEach(item => {
      const date = new Date(item.date).toLocaleString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      reply_msg += `- ${item.movie.title} (${item.movie.year})\n`;
     });
    }
   }

   const final_msg = await msg.reply(reply_msg.trim());
   client.delete_msg(final_msg, 30000);
   client.delete_msg(msg, 30000);
   return;
  }
  catch(err){
   console.log(`Sonarr/Radarr Activity Exception: ${err}`);
   const error_msg = await msg.reply("Sorry, something big broke when trying to collect activity.")
   client.delete_msg(error_msg, 15000);
   client.delete_msg(msg, 15100);
   return;
  }
 }
}