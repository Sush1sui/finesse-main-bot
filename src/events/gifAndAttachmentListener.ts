import { GuildMember, Message } from "discord.js";
import {
  CHANNEL_EXCEPTION,
  PRIVILEGED_ROLES,
  STAFF_ROLE_IDS,
} from "../utils/helpers";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (
        message.author.bot ||
        CHANNEL_EXCEPTION.includes(message.channel.id)
      ) {
        return;
      }

      const member = message.member as GuildMember;
      if (!member) return;

      const hasAuthorizedRole = [...PRIVILEGED_ROLES, ...STAFF_ROLE_IDS].some(
        (id) => member.roles.cache.has(id)
      );

      if (hasAuthorizedRole) return;

      const hasAttachments = message.attachments.size > 0;

      const includesLinks = ["http", "www.", "discord.gg/"].some((keyword) =>
        message.content.includes(keyword)
      );

      if (hasAttachments || includesLinks) {
        await message.delete();
        console.log(
          `Deleted a message from ${message.author.tag} in ${message.channel}`
        );
      }
    } catch (error) {
      console.error(`Failed to delete message: ${error}`);
    }
  },
};
