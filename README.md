## Arr Suite Whisperer
A discord bot that allows you to communicate with any server that contains Sonarr or Radarr.

I made this bot so I can talk to my Radarr and Sonarr server from anywhere since it is via discord's message encryption.<br>
Now, is it bad maybe. but we all have our ideas.<br>
This code is MID at best, so if you find any memory leaks or stuff then make a branch or raise the issue and I will look into it.

## Dependences
<a href="https://nodejs.org/en">Node.js</a> - kinda obvious.

<a href="https://www.npmjs.com/package/discord.js">discord.js</a>, <a href="https://www.npmjs.com/package/dotenv">dotenv</a>, <a href="https://www.npmjs.com/package/axios">axios</a>

## What is Radarr or Sonarr?
If you have found this and don't know what Radarr or Sonarr is then I have no clue how you got here, but if you want to know here.<br>
<a href="https://sonarr.tv/">Sonarr</a>
<a href="https://radarr.video/">Radarr</a>

## DOT ENV contents
So this script does use dotenv to hold specific variables which shouldn't be accessed normally.

<code>BOT_TOKEN=</code><br>
<code>PREFIX=r.</code><br>
<code>OWNER_ID=</code><br>
<code>BASE_URL=</code><br>
<code>RADARR_KEY=</code><br>
<code>SONARR_KEY=</code><br>
<code>TMDB_API=</code><br>

Prefix can be moved but I don't want it to be changed from me doing something stupid. so yeah.<br><br>
The only thing that is really hardcoded is the Quality Profile that Radarr and Sonarr use but this is defaulted to HD - 720p/1080p so that should be universal.

Anyway have a good day.
