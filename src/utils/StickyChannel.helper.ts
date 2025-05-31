import StickyChannelModel, {
  StickyChannelDocument,
} from "../models/StickyChannel.model";

// STICKY CHANNELS
export async function getAllStickyChannels(): Promise<StickyChannelDocument[]> {
  try {
    return await StickyChannelModel.find();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function initializeStickyChannels() {
  try {
    const existingChannels = (await getAllStickyChannels()).map(
      (c) => c.channelId
    );

    // if no channels exist, insert predefined channels
    if (existingChannels.length === 0) {
      const initializedStickyChannels = await StickyChannelModel.insertMany(
        existingChannels.map((channelId) => ({ channelId }))
      );
      console.log("Initialized sticky channels:", initializedStickyChannels);
    } else {
      console.log("Sticky channels already initialized");
    }
  } catch (error) {
    console.error("Failed to initialize sticky channels", error);
  }
}

export async function STICKYCHANNEL_create(
  channelId: string,
  stickyMessage:
    | string = "Kindly avoid chatting or flood replies. Just use the **Thread** to avoid spamming or you will be **Timed out**"
) {
  try {
    const stickyChannel = await StickyChannelModel.findOne({ channelId });
    if (stickyChannel)
      throw new Error(
        `Channel: ${channelId} is already set to have sticky message`
      );

    const newStickyChannel = await StickyChannelModel.create({
      channelId,
      stickyMessage,
    });
    console.log(
      `Sticky Message for channel: ${newStickyChannel.channelId} has been set`
    );
    return true;
  } catch (error) {
    console.error(
      `Failed to create sticky message for sticky channel id: ${channelId}, error: `,
      error
    );
    return false;
  }
}

export async function STICKYCHANNEL_delete(channelId: string) {
  try {
    const deletedStickyChannel = await StickyChannelModel.findOneAndDelete({
      channelId,
    });

    if (!deletedStickyChannel) return "sticky not found";
    console.log(
      `Sticky Channel has been unset for channel ${deletedStickyChannel?.channelId}`
    );
    return "success";
  } catch (error) {
    console.error(error);
    return "error";
  }
}

export async function STICKYCHANNEL_deleteAll() {
  try {
    const deletedStickyChannels = await StickyChannelModel.deleteMany();
    if (!deletedStickyChannels) {
      return "sticky not found";
    }
    console.log(`All Sticky Channels has been unset: ${deletedStickyChannels}`);
    return "success";
  } catch (error) {
    console.log(error);
    return "error";
  }
}

export async function STICKYCHANNEL_getLastMessageId(channelId: string) {
  try {
    const stickyMessage = await StickyChannelModel.findOne({ channelId });

    if (stickyMessage && stickyMessage.lastStickyMessageId)
      return stickyMessage.lastStickyMessageId;

    console.log(`No sticky message ID found for channel ID: ${channelId}`);
    return null;
  } catch (error) {
    console.error("Error retrieving sticky message ID:", error);
    throw new Error("Failed to retrieve sticky message ID");
  }
}

export async function STICKYCHANNEL_getRecentPostMessageId(channelId: string) {
  try {
    const stickyMessage = await StickyChannelModel.findOne({ channelId });

    if (stickyMessage && stickyMessage.recentPostMessageId) {
      return stickyMessage.recentPostMessageId;
    }

    console.log(`No recent message ID found for channel ID: ${channelId}`);
    return null;
  } catch (error) {
    console.error("Error retrieving recent message ID:", error);
    throw new Error("Failed to retrieve recent message ID");
  }
}

export async function STICKYCHANNEL_updateStickyMessageId(
  channelId: string,
  recentPostMessageId: string | null,
  lastStickyMessageId: string | null
) {
  try {
    const updatedStickyMessage = await StickyChannelModel.findOneAndUpdate(
      { channelId }, // find channel
      {
        recentPostMessageId, // updated recentPostMessageId to new value
        lastStickyMessageId, // updated lastStickyMessageId to new value
      },
      { new: true } // return the newly updated document
    );

    if (updatedStickyMessage) {
      console.log(
        `Updated sticky and recent message IDs for channel ${channelId}: recentPostMessageId: ${recentPostMessageId}, lastStickyMessageId: ${lastStickyMessageId}`
      );
      return updatedStickyMessage; // Return the updated document
    } else {
      console.log(`No sticky channel found for channel ID: ${channelId}`);
      return null; // Handle the case when no document is found
    }
  } catch (error) {
    console.error("Error updating sticky and recent message IDs:", error);
    throw error; // Rethrow the error for further handling if needed
  }
}

export async function STICKYCHANNEL_setStickyMessageId(
  channelId: string,
  stickyMessage:
    | string = "Kindly avoid chatting or flood replies. Just use the **Thread** to avoid spamming or you will be **Timed out**"
) {
  try {
    const updatedStickyMessage = await StickyChannelModel.findOneAndUpdate(
      { channelId }, // find channel
      {
        stickyMessage, // set new sticky message
      },
      { new: true } // return the newly updated document
    );

    if (updatedStickyMessage) {
      console.log(
        `Updated sticky message for channel ${channelId}: sticky message: ${stickyMessage}`
      );
      return updatedStickyMessage;
    }

    console.log(`No sticky channel found for channel ID: ${channelId}`);
    return null;
  } catch (error) {
    console.error("Error updating sticky message:", error);
    return null;
  }
}
