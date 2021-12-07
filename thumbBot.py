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
    print("Message Recieved")
    if type(message.channel) == DMChannel and getMemberGuilds(message.author):
        print(message.content)
        channel = bot.get_channel(config["channel"])
        await channel.send(message.content)#TODO Format this message so its clear who sent it

def getMemberGuilds(user):
    commonGuilds = []
    for guild in bot.guilds:
        if user in guild.members:
            member = guild.get_member(user.id)
            role = guild.get_role(config['role'])
            if role in member.roles:
                commonGuilds.append(guild)
    return commonGuilds


bot.run(TOKEN)