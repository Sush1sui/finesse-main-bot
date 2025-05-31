import mongoose, { Document, Model } from "mongoose";

export interface NicknameRequestType {
  userId: string;
  userMessageId: string;
  userChannelId: string;
  staffChannelId: string;
  staffMessageId: string;
  nickname: string;
  reactions: [
    {
      emoji: string;
    }
  ];
}

export interface NicknameRequestDocument
  extends NicknameRequestType,
    Document {}
export interface NicknameRequestModel extends Model<NicknameRequestDocument> {}

const nicknameRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userMessageId: { type: String, required: true },
  userChannelId: { type: String, required: true },
  staffChannelId: { type: String, required: true },
  staffMessageId: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  reactions: [
    {
      emoji: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model<NicknameRequestDocument, NicknameRequestModel>(
  "NicknameRequest",
  nicknameRequestSchema
);
