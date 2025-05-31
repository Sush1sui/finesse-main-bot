import { Request, Response } from "express";
import { getOpenGraphImage } from "../utils/helpers";
import { client } from "../bot";
import { EmbedBuilder, TextChannel } from "discord.js";

export const sendNotification = async (req: Request, res: Response) => {
  const payload = req.body;

  if (payload.ref === "refs/heads/master") {
    const commit = payload.head_commit;
    const openGraphImage = await getOpenGraphImage(commit.url);

    const discordChannel = client.channels.cache.get(
      "1361899829982134433"
    ) as TextChannel;
    if (discordChannel) {
      const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle("New Commit in Finesse Tickets Repository")
        .addFields(
          { name: "Author", value: commit.author.username, inline: true },
          { name: "Commit Message", value: commit.message, inline: false },
          {
            name: "Commit URL",
            value: `[View Commit](${commit.url})`,
            inline: false,
          }
        )
        .setTimestamp()
        .setImage(openGraphImage || "");

      await discordChannel.send({
        content: `**Hello <@&1292418236108902470>! There is a new commit in Finesse-Tickets Repo**`,
        embeds: [embed],
        allowedMentions: { parse: ["roles"] },
      });
    } else {
      console.log("Discord channel not found");
    }
  }
  res.status(200).send("Webhook received!");
  return;
};
