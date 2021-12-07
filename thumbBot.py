import discord
from discord.ext import commands
import yaml

with open("config.yaml") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)
with open("TOKEN") as f:
    TOKEN = f.read()

bot = commands.Bot(command_prefix = config["prefix"])

@bot.event
async def on_ready():
    print(f"Logged in as {bot}")

bot.run(TOKEN)