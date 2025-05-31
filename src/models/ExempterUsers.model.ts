import mongoose, { Document, Model } from "mongoose";

export interface ExemptedUsersType {
  userId: string;
  expiration: Date;
}

export interface ExemptedUsersDocument extends ExemptedUsersType, Document {}
export interface ExemptedUsersModel extends Model<ExemptedUsersDocument> {}

const exemptedSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  expiration: {
    type: Number,
    required: true,
  },
});

exemptedSchema.index({ expiration: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ExemptedUsersDocument, ExemptedUsersModel>(
  "ExemptedModel",
  exemptedSchema
);
