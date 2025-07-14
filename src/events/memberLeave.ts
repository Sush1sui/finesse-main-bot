import { Collection, GuildMember, Message, TextChannel } from "discord.js";
import { welcomeChannelId } from "../utils/helpers";

const maxFetches = 10; // Maximum number of fetch attempts to avoid infinite loops

export default {
  name: "guildMemberRemove",
  async execute(member: GuildMember) {
    if (member.user.bot) return;

    let lastId;
    const botId = member.client.user?.id;
    let fetchCount = 0;

    try {
      const welcomeChannel = member.guild.channels.cache.get(
        welcomeChannelId
      ) as TextChannel;

      if (!welcomeChannel) throw new Error("Welcome channel not found");

      while (fetchCount < maxFetches) {
        const messages: Collection<string, Message> =
          await welcomeChannel.messages.fetch({
            limit: 100,
            before: lastId,
          });

        const messageToDelete = messages.find(
          (m) =>
            m.author.id === botId &&
            m.embeds[0]?.description?.includes(`<@${member.id}>`)
        );

        if (messageToDelete) {
          await messageToDelete.delete();
          break;
        }

        if (messages.size === 0) break;
        lastId = messages.last()?.id;
        fetchCount++;
      }
    } catch (error) {
      console.error("Error sending leave message:", error);
    }
  },
};
