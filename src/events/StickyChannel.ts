import {
  Colors,
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import {
  getAllStickyChannels,
  STICKYCHANNEL_getLastMessageId,
  STICKYCHANNEL_updateStickyMessageId,
} from "../utils/StickyChannel.helper";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      if (
        (message.author.bot && message.author.id !== "712011923176030229") ||
        !(message.member as GuildMember)
      )
        return;

      const stickyChannels = await getAllStickyChannels();

      // check if message is sent in a sticky channel
      const stickyChannel = stickyChannels.find(
        (c) => c.channelId === message.channelId
      );
      if (stickyChannel && message.channel instanceof TextChannel) {
        const lastStickyMessageId = await STICKYCHANNEL_getLastMessageId(
          message.channelId
        );

        // if there is a last sticky message, delete it
        if (lastStickyMessageId) {
          const existingMessage = await message.channel.messages.fetch(
            lastStickyMessageId
          );
          if (!existingMessage) {
            console.warn(
              `Failed to fetch or delete message with ID ${lastStickyMessageId}. It may have already been deleted.`
            );
          }
          await existingMessage.delete();
          console.log(
            `Deleted existing sticky message with ID: ${lastStickyMessageId}`
          );
        }

        // fetch last 2 messages sent in channel (if any)
        const messages = await message.channel.messages.fetch({ limit: 2 });
        const recentMessage = messages.last();

        let recentMessageId: string | null = null;
        if (recentMessage && recentMessage.id !== message.id) {
          recentMessageId = recentMessage.id;
        }

        const embed = new EmbedBuilder()
          .setTitle("Stickied Message")
          .setDescription(stickyChannel.stickyMessage)
          .setColor(Colors.White);

        // send the new sticky message and store the id in db
        const newStickyMessage = await message.channel.send({
          embeds: [embed],
        });

        await STICKYCHANNEL_updateStickyMessageId(
          message.channelId,
          recentMessageId,
          newStickyMessage.id
        );

        console.log(`Sent new sticky message in ${message.channel.name}`);
      }
    } catch (error) {
      console.error(`Failed to send embed message: ${error}`);
    }
  },
};
