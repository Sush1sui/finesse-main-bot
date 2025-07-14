import { Message } from "discord.js";
import {
  kakClaimCommands,
  kakClaimIntervalMap,
  kakClaimTimeoutMap,
  kakClaimTimer,
  mudaeChannelId,
} from "../utils/helpers";

export default {
  name: "messageCreate",
  async execute(message: Message) {
    if (
      kakClaimCommands.includes(message.content.toLowerCase()) &&
      message.channelId === mudaeChannelId
    ) {
      const userId = message.author.id;
      if (kakClaimTimeoutMap.has(userId)) {
        clearTimeout(kakClaimTimeoutMap.get(userId) as NodeJS.Timeout);
        clearInterval(kakClaimIntervalMap.get(userId) as NodeJS.Timeout);
        kakClaimTimeoutMap.delete(userId);
        kakClaimIntervalMap.delete(userId);
      }

      // convert to 15s from 15000ms
      let remainingTime = kakClaimTimer / 1000;

      const replyMessage = await message.reply(
        `**<@${userId}> can kak/trash claim in ${remainingTime} seconds!**`
      );

      // Only update the message every 5 seconds, and at the last second
      const intervalId = setInterval(async () => {
        remainingTime--;
        if (remainingTime % 5 === 0 || remainingTime === 0) {
          await replyMessage
            .edit(
              `**<@${userId}> can kak/trash claim in ${remainingTime} seconds!**`
            )
            .catch((error) => {
              console.log("Error updating countdown message: ", error);
            });
        }
      }, 1000);

      const timeoutId = setTimeout(async () => {
        clearInterval(intervalId);
        try {
          await replyMessage.delete();
          await message.reply(`**You can kak/trash claim now <@${userId}>!**`);
        } catch (error) {
          console.error("Error sending claim message:", error);
        } finally {
          kakClaimTimeoutMap.delete(userId);
          kakClaimIntervalMap.delete(userId);
        }
      }, kakClaimTimer);
      kakClaimTimeoutMap.set(userId, timeoutId);
      kakClaimIntervalMap.set(userId, intervalId);
    }
  },
};
