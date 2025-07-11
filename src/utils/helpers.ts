import "dotenv/config";
import fs from "fs";
import util from "util";
import stream, { Readable } from "stream";
import path from "path";
import crypto from "crypto";
import { JSDOM } from "jsdom";
import { Request, Response } from "express";
import { isBotOnline, startBot } from "../bot";

const pipeline = util.promisify(stream.pipeline);

export const STAFF_ROLE_IDS = [
  "1310186525606154340", // staff role
  "1292484470502461581", // 1 star
  "1292484421454135296", // 2 stars
  "1292423461725278290", // 3 stars
  "1303928426914381854", // mod role
  "1303928422824939662", // admin role
  "1292418236108902470", // dev role
  "1292417488323215441", // exe role
];

export const CHANNEL_EXCEPTION = [
  "1292412679402815662", // selfies
  "1292421531753906279", // talent
  "1292421689010946119", // images
  "1292421879617028167", // pets
  "1292412946672128050", // clips
  "1292412825293160469", // memes
  "1310961229468143638", // music-taste
  "1317412899597320243", // promotion
];

export const PRIVILEGED_ROLES = [
  "1303932364132454421", // rssc_id
  "1292420325002448930", // booster
  "1303916681692839956", // pioneer
  "1303924607555997776", // supporter
  "1303998295911436309",
  "1303998297538560060",
  "1303998299031736393",
  "1303998300671709186",
  "1303998302785900544",
  "1303998304710819940",
];

export const BOOST_CHANNEL_ID = "1292544143318454302";
export const SERVER_LOGS_CHANNEL_ID = "1292442914487795772";
export const welcomeChannelId = "1292411347220435006";
export const communityRoleId = "1292473360114122784";
export const supporterRoleId = "1303924607555997776";
export const supporterRoleId2 = "1312957178356699146";
export const supporterLink = "discord.gg/finesseph";
export const supporterChannelId = "1310442561126535179";

// timer = 15s
export let kakClaimTimer = 15000;

export const changeTimer = (val: number) => {
  kakClaimTimer = val * 1000;
};

export const kakClaimCommands = ["$kak claim", "$kc", "$tc", "$trash claim"];
export const mudaeChannelId = "1310429477548982363";

export const kakClaimTimeoutMap = new Map<string, NodeJS.Timeout>();
export const kakClaimIntervalMap = new Map<string, NodeJS.Timeout>();

const SERVER_LINK = process.env.SERVER_LINK;
let timeoutId: NodeJS.Timeout;

export const pingBot = () => {
  if (!SERVER_LINK) return;

  const attemptPing = () => {
    fetch(SERVER_LINK)
      .then((res) => res.text())
      .then((text) => {
        console.log(`Ping successful: ${text}`);
        if (!isBotOnline) startBot();
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.log(`Ping failed, retrying: ${err}`);
        timeoutId = setTimeout(attemptPing, 5000);
      });
  };

  attemptPing();
};

export async function downloadFile(url: string, destination: string) {
  try {
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const fileStream = fs.createWriteStream(destination);

    if (!response.body) throw new Error("No response.body");

    const nodeStream = Readable.fromWeb(response.body as any);

    await pipeline(nodeStream, fileStream);

    console.log(`File downloaded successfully: ${destination}`);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

export const verifyGitHubSignature = (
  req: Request,
  _res: Response,
  buf: Buffer
) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const payload = buf.toString();

  if (!signature) {
    console.log("Signature missing");
    throw new Error("Signature missing");
  }

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET!);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  if (signature !== expectedSignature) {
    console.log("Signature mismatch");
    throw new Error("Signature mismatch");
  }
};

export async function getOpenGraphImage(url: string) {
  try {
    const response = await fetch(url);
    const body = await response.text();

    const dom = new JSDOM(body);
    const ogImage = dom.window.document.querySelector(
      'meta[property="og:image"]'
    );

    return ogImage ? ogImage.getAttribute("content") : null;
  } catch (error) {
    console.error("Error fetching Open Graph image:", error);
    return null;
  }
}
