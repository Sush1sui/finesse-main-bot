import mongoose, { Document, Model } from "mongoose";

export interface StickyChannelType {
  channelId: string;
  recentPostMessageId: string | null;
  lastStickyMessageId: string | null;
  stickyMessage: string;
}

export interface StickyChannelDocument extends StickyChannelType, Document {}
export interface StickyChannelModel extends Model<StickyChannelDocument> {}

const stickyChannelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  recentPostMessageId: {
    type: String,
    required: false,
    default: null,
  },
  lastStickyMessageId: {
    type: String,
    required: false,
    default: null,
  },
  stickyMessage: {
    type: String,
    required: false,
    default:
      "Kindly avoid chatting or flood replies. Just use the **Thread** to avoid spamming or you will be **Timed out**",
  },
});

export default mongoose.model<StickyChannelDocument, StickyChannelModel>(
  "StickyChannel",
  stickyChannelSchema
);
