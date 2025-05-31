import {
  Client,
  Message,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import NicknameRequestModel from "../models/NicknameRequest.model";
import { STAFF_ROLE_IDS } from "./helpers";

export const approveEmoji = "<:Check_White_FNS:1310274014102687854>";
export const denyEmoji = "<:No:1310633209519669290>";

export async function fetchAllNicknameRequests() {
  try {
    return await NicknameRequestModel.find();
  } catch (error) {
    console.log("Error fetching Nickname Request: ", error);
    return null;
  }
}

export async function NicknameRequest_create(
  val: string,
  userId: string,
  userMessageId: string,
  userChannelId: string,
  staffChannelId: string,
  staffMessageId: string
) {
  try {
    await NicknameRequestModel.create({
      userId,
      userMessageId,
      userChannelId,
      staffMessageId,
      staffChannelId,
      nickname: val,
      reactions: [{ emoji: approveEmoji }, { emoji: denyEmoji }],
    });
  } catch (error) {
    console.log(error);
  }
}

export async function NicknameRequest_remove(messageId: string) {
  try {
    await NicknameRequestModel.findOneAndDelete({ messageId });
  } catch (error) {
    console.log(error);
  }
}

export function isValidEmoji(inputEmoji: string): boolean {
  const customEmojiRegex = /^<a?:\w+:\d+>$/; // Custom emoji
  const unicodeEmojiRegex = /\p{Extended_Pictographic}/u; // Unicode emoji
  return (
    customEmojiRegex.test(inputEmoji) || unicodeEmojiRegex.test(inputEmoji)
  );
}

export function extractEmojiId(emojiString: string) {
  // Regular expression to match custom emoji format <a:emojiName:emojiId> or <:emojiName:emojiId>
  const regex = /<a?:(\w+):(\d+)>/; // Matches both animated and non-animated custom emojis
  const match = emojiString.match(regex);

  if (match) {
    return match[2]; // Return the emoji ID
  }
  return null; // Return null if no match is found
}

export async function setupNicknameRequestCollector(
  message: Message,
  nickname: string
) {
  console.log(
    `Setting up reaction collector for nickname request: ${nickname} on message: ${message.id}`
  );

  const nicknameRequestChannel = message.guild?.channels.cache.get(
    "1310583941287379116"
  ) as TextChannel;

  if (!nicknameRequestChannel) {
    console.error(
      "Nickname request channel not found or is not a text channel."
    );
    await message.reply("An error occurred while processing your request.");
    return;
  }

  const approvedEmojiId = extractEmojiId(approveEmoji);
  const denyEmojiId = extractEmojiId(denyEmoji);

  if (!approvedEmojiId || !denyEmojiId)
    throw new Error("Error extracting emoji ID");

  const filter = async (reaction: MessageReaction, user: User) => {
    const guild = reaction.message.guild;
    if (!guild) return false;

    const member = await guild.members.fetch(user.id);
    const hasStaffRole = member.roles.cache.has(STAFF_ROLE_IDS[0]);

    return (
      !user.bot &&
      hasStaffRole &&
      (reaction.emoji.id === approvedEmojiId ||
        reaction.emoji.id === denyEmojiId)
    );
  };

  const collector = message.createReactionCollector({ filter, dispose: true });

  collector.on("collect", async (reaction, user) => {
    console.log(`Reaction collected: ${reaction.emoji.name} by ${user.tag}`);

    if (user.bot || !reaction.message.guild) return;

    const member = reaction.message.guild.members.cache.get(user.id);

    if (member) {
      try {
        if (!reaction.message.guild) throw new Error("No reactions found");

        const hasStaffRole = member.roles.cache.has(STAFF_ROLE_IDS[0]);
        if (!hasStaffRole) throw new Error("User is not a staff");

        const request = await NicknameRequestModel.findOne({
          staffMessageId: message.id,
        });
        if (request) {
          const userToChange = member.guild.members.cache.get(request.userId);
          const userMessageChannel = member.guild.channels.cache.get(
            request.userChannelId
          ) as TextChannel;

          if (!userMessageChannel)
            throw new Error("No nickname request channel found");

          const userMessage = userMessageChannel.messages.cache.get(
            request.userMessageId
          );

          if (!userMessage) throw new Error("No user message found to react");

          if (userToChange) {
            if (reaction.emoji.id === approvedEmojiId) {
              await userToChange.setNickname(nickname);
              console.log(
                `Changed nickname for ${userToChange.user.username} to ${nickname}`
              );
              // await nicknameRequestChannel.send({
              //   content: `Nickname request for <@${userToChange.user.id}> to **${nickname} is approved**`,
              //   allowedMentions: { parse: ["users"] },
              // });
              await userMessage.react(approveEmoji);
              await NicknameRequest_remove(message.id);
              collector.stop("approved");
            } else if (reaction.emoji.id === denyEmojiId) {
              await NicknameRequest_remove(message.id);
              console.log(
                `Nickname request for ${userToChange.user.username} to ${nickname} is denied`
              );
              // nicknameRequestChannel.send({
              //   content: `Nickname request for <@${userToChange.user.id}> to **${nickname} is denied**`,
              //   allowedMentions: { parse: ["users"] },
              // });
              await userMessage.react(denyEmoji);
              collector.stop("denied");
            } else {
              console.log("Not approve or deny emoji");
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export async function initializeNicknameRequests(client: Client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID!);

  if (!guild) {
    console.error("Bot is not in any guild");
    return;
  }

  try {
    const channels = await guild.channels.fetch();
    const nicknameRequests = await fetchAllNicknameRequests();

    if (!nicknameRequests) throw new Error("No nickname requests");

    for (const channel of channels.values()) {
      if (channel instanceof TextChannel) {
        const filteredNicknameRequests = nicknameRequests.filter(
          (nicknameRequest) => nicknameRequest.staffChannelId === channel.id
        );

        for (const { staffMessageId, nickname } of filteredNicknameRequests) {
          const message = channel.messages.cache.get(staffMessageId);
          if (!message) {
            console.error(
              `Message with ID ${staffMessageId} not found in channel ${channel.id}`
            );
            return;
          }

          setupNicknameRequestCollector(message, nickname);
          console.log(
            `Initialized react ${nickname} for message ${staffMessageId} in channel ${channel.id}`
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error initializing reaction roles: ${error}`);
  }
}
