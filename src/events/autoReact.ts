import { Message } from "discord.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (message.author.bot) return;

      if (
        message.channel.id === "1292412679402815662" &&
        message.attachments.size > 0
      ) {
        await message.react("Check_White_FNS:1310274014102687854");
        await message.react("pixelheart:1310424521421099113");
      }

      if (message.content.toLowerCase().includes("hahaha")) {
        await message.react("😆");
      }

      if (message.content.toLowerCase().includes("sushi")) {
        const rng = Math.floor(Math.random() * 10) + 1;

        if (rng >= 1 && rng <= 5)
          await message.react("SushiRolling:1293411594621157458");
      }
      return;
    } catch (error) {
      console.error(`Failed to add reaction: ${(error as Error).message}`);
    }
  },
};
