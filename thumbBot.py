import discord
from discord.channel import DMChannel
from discord.ext import commands
import yaml

with open("config.yaml") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)
with open("TOKEN") as f:
    TOKEN = f.read()

intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix = config["prefix"],intents = intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    print(f"Message Recieved from {message.author.id}")
    if type(message.channel) == DMChannel and getMemberGuilds(message.author):
        channel = bot.get_channel(config["channel"])
        res = f"<@{message.author.id}> **Sent:** ```{message.content}``` **With Attachments**:\n"
        if not message.attachments:
            res += "*None*"
        else:
            for attachment in message.attachments:
                res += f"{attachment}\n"
        msg = await channel.send(res)
        await msg.add_reaction("👍")

@bot.event
async def on_raw_reaction_add(payload):
    if payload.channel_id != config["channel"] or str(payload.emoji) != "👍" or payload.user_id == bot.user.id:
        return
    channel = bot.get_channel(payload.channel_id)
    message = await channel.fetch_message(payload.message_id)
    user = message.mentions[0]
    await user.send(f"Your Submission created at *{message.created_at}* has been verified.")

def getMemberGuilds(user):#TODO rewrite this for single guild use
    commonGuilds = []
    for guild in bot.guilds:
        if user in guild.members:
            member = guild.get_member(user.id)
            role = guild.get_role(config['role'])
            if role in member.roles:
                commonGuilds.append(guild)
    return commonGuilds


bot.run(TOKEN)