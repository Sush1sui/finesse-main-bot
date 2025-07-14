import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { supporterChannelId, supporterLink, supporterRoleId } from "./helpers";
import ExempterUsersModel from "../models/ExempterUsers.model";

const rainbowTransition = [
  "#FF0000", // 0° Red
  "#FF7F00", // 15° Orange
  "#FFBF00", // 30° Golden yellow
  "#FFFF00", // 45° Yellow
  "#BFFF00", // 60° Yellow-green
  "#7FFF00", // 75° Lime
  "#3FFF00", // 90° Spring green
  "#00FF00", // 105° Green
  "#00FF3F", // 120° Green-cyan
  "#00FF7F", // 135° Aqua-green
  "#00FFBF", // 150° Turquoise
  "#00FFFF", // 165° Cyan
  "#00BFFF", // 180° Sky blue
  "#007FFF", // 195° Azure
  "#003FFF", // 210° Blue
  "#0000FF", // 225° Deep blue
  "#3F00FF", // 240° Indigo
  "#7F00FF", // 255° Violet
  "#BF00FF", // 270° Purple
  "#FF00FF", // 285° Magenta
  "#FF00BF", // 300° Hot pink
  "#FF007F", // 315° Rose
  "#FF003F", // 330° Scarlet
  "#FF0000", // 345° Back to Red
];

export async function checkSupporterStatus(guild: Guild) {
  try {
    console.log("scanning for vanity links");

    // Fetch all members in the guild
    const members = guild.members.cache;
    const exemptedUsers = await getAllExemptedUsersVanity();
    let exemptedUserIds: string[] = [];
    if (exemptedUsers) {
      exemptedUserIds = exemptedUsers.map((user) => user.userId);
    }

    // Get the role object from the role ID
    const supporterRole = guild.roles.cache.get(supporterRoleId);

    if (!supporterRole) {
      console.error(`Supporter role not found with ID: ${supporterRoleId}`);
      return;
    }

    const colorIndex = 0;
    let currentColor = rainbowTransition[0];

    const supporterChannel = guild.channels.cache.get(
      supporterChannelId
    ) as TextChannel;

    for (const member of members.values()) {
      // Skip bots
      if (member.user.bot || exemptedUserIds.includes(member.id)) continue;

      // Get the custom status from the presence activities
      const customStatus = member.presence?.activities.find(
        (activity) => activity.state === supporterLink
      )?.state;

      // Check if the custom status contains the supporter link
      const includesSupporterLink =
        customStatus?.includes(supporterLink) ||
        exemptedUserIds.includes(member.id);

      // Check if the user already has the role
      const hasSupporterRole = member.roles.cache.has(supporterRoleId);

      if (includesSupporterLink && hasSupporterRole) {
        // Skip if the user already has the role and the correct status
        console.log(`${member.user.tag} already has the role and status.`);
        continue;
      }

      // Add or remove the role based on the link
      if (includesSupporterLink && !hasSupporterRole) {
        await member.roles.add(supporterRoleId);
        // console.log(`Added supporter role to ${member.user.tag}`);

        // Send the formatted message to the supporter channel

        if (supporterChannel) {
          const embed = new EmbedBuilder();

          embed
            .setTitle(`Thank you for supporting **Finesse!**`)
            .setDescription(
              `<@${member.id}> updated their status with our vanity link \`discord.gg/finesseph\` and earned the ${supporterRole} role!\n
> Perks:
- Image & Embed Link Perms
- 1.5x Level Boost
- Color Name <#1310451488975224973>
            `
            )
            .setImage(
              "https://cdn.discordapp.com/attachments/1293239740404994109/1310449852349681704/image.png"
            )
            .setColor(parseInt(currentColor.replace("#", "0x"), 16))
            .setFooter({
              text: "*Note: Perks will be revoked if you remove the status.*",
            }); // Convert hex to number

          await supporterChannel.send({
            content: ``,
            embeds: [embed],
            allowedMentions: { parse: ["users"] },
          });

          // Update the color index in the database
          const nextColorIndex = (colorIndex + 1) % rainbowTransition.length;
          currentColor = rainbowTransition[nextColorIndex];
        }
      } else if (!includesSupporterLink && hasSupporterRole) {
        await member.roles.remove(supporterRoleId);
        await member.roles.remove("1312957178356699146"); // remove bio role if it exists
        // console.log(`Removed supporter role from ${member.user.tag}`);
      }
    }
  } catch (error) {
    console.error(`Error checking supporter statuses: ${error}`);
  } finally {
    console.log("scanning for vanity links done");
  }
}

export async function exemptUserVanity(userId: string) {
  try {
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 3 * 24 * 60 * 60); // Add 3 days
    const exemptedUser = await ExempterUsersModel.findOneAndUpdate(
      { userId },
      { userId, expiration: expirationDate },
      { upsert: true, new: true }
    );

    return exemptedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function removeUserVanity(userId: string) {
  try {
    const removedUser = await ExempterUsersModel.findOneAndDelete({
      userId,
    });
    return removedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getAllExemptedUsersVanity() {
  try {
    return await ExempterUsersModel.find();
  } catch (error) {
    console.log(error);
    return null;
  }
}
