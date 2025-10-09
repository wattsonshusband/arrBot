require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
   GatewayIntentBits.Guilds,
   GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent,
   GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

client.radarr_url = process.env.BASE_URL + "7878";
client.radarr_api = process.env.RADARR_KEY;

client.sonarr_url = process.env.BASE_URL + "8989";
client.sonarr_api = process.env.SONARR_KEY;

client.react_emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

client.delete_msg = async (msg, timeout) => {
  if(!timeout || timeout == null || timeout == undefined)timeout = 1000;
  setTimeout(() => msg.delete().catch(() => {}), timeout);
}

async function server_health() {
  const url = process.env.BASE_URL + "9443";
  try {
    const response = await fetch(url, { method: "GET" });

    if (response.ok) {
    return true;
    } else {
    return true; 
    }
  } catch (error) {
    return false;
  }
}

async function change_presence(){
  let is_on = await server_health() ? "Sarai II & Callum playing" : "Sarai II & Callum sleeping";
  client.user.setPresence({ activities: [{ name: is_on, type: 3}], status: 'idle'})
  let randomise_time = Math.floor(Math.random() * 8000) + 7000; 
  setTimeout(change_presence, randomise_time);
}

client.once('clientReady', () => {
  console.log(`*sigh* I am online now...`);
  change_presence();

  const command_path = path.join(__dirname, 'commands'), command_files = fs.readdirSync(command_path).filter(file => file.endsWith('.js'));
  for(const file of command_files){
    const cmd = require(path.join(command_path, file));
    if(cmd.name && cmd.run){
      client.commands.set(cmd.name, cmd);

      if(cmd.aliases){
        for(const alias of cmd.aliases){
          client.commands.set(alias, cmd);
        }
      }
    }
  }
})

client.on('messageCreate', async (msg) => {
  if(msg.mentions.users.each(user => user.id == client.user.id).length > 0)return msg.reply(`Hey there! My prefix is \`${process.env.PREFIX}\``);

  if(msg.author.bot || !msg.guild || !msg.content.startsWith(process.env.PREFIX))return;
  const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/), cmd_name = args.shift().toLowerCase();

  const cmd = client.commands.get(cmd_name) || client.commands.find(c => c.aliases && c.aliases.includes(cmd_name));

  if(!cmd)return msg.reply(`sorry, I am not programmed to do that...`);
  if(cmd.permissions && !msg.member.permissions.has(cmd.permissions) || (cmd.permissions && cmd.permissions[0] == "OWNER" && msg.author.id != process.env.OWNER_ID))return msg.reply(`uhh you literally do not have permissions to do that...`);

  try {
    await cmd.run(client, msg, args);
  }
  catch (err) {
    console.error(err);
    return msg.reply(`I am sorry, I can't seem to do that...`)
  }
})

client.login(process.env.BOT_TOKEN);
