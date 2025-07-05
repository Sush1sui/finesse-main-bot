import { Collection, GuildMember, Message, TextChannel } from "discord.js";
import { welcomeChannelId } from "../utils/helpers";

export default {
  name: "guildMemberRemove",
  async execute(member: GuildMember) {
    if (member.user.bot) return;

    try {
      const welcomeChannel = member.guild.channels.cache.get(
        welcomeChannelId
      ) as TextChannel;

      if (!welcomeChannel) throw new Error("Welcome channel not found");

      let lastId;

      while (true) {
        const messages: Collection<string, Message> =
          await welcomeChannel.messages.fetch({
            limit: 100,
            before: lastId,
          });

        const messageToDelete = messages.find(
          (m: Message) =>
            m.author.id === member.client.user?.id &&
            m.embeds[0]?.description?.includes(`<@${member.id}>`)
        );

        if (messageToDelete) {
          await messageToDelete.delete();
          break;
        }

        if (messages.size === 0) {
          break;
        }

        lastId = messages.last()!.id;
      }
    } catch (error) {
      console.error("Error sending leave message:", error);
    }
  },
};
