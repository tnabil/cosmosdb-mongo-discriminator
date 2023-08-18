import { ResumeToken } from "mongodb";
import { Schema, model, Model, connect, connection, set } from "mongoose";
import dotenv from "dotenv"

/* Main */

async function main() {
  dotenv.config();
  set('strictQuery', false);
  await connect(config("DATABASE_URL"));
  try {
    await connection.transaction(async (session) => {
      const collectionName = "collectionName";
      const eventId = "eventId";
      const operation = "operation";
      const user = "user";
      const delta = { a: 1 };
      for (let counter=0; counter < 10; ++counter) {
        const newChangeEvent = new ChangeEventModel({
          collectionName,
          eventId,
          key: `key${counter}`,
          operation,
          user: user,
          delta,
        });
        await newChangeEvent.save({ session });
        // await newChangeEvent.save();
      }  
    });
    console.info("Successfully inserted events");
  } catch (e) {
    console.error("Error while trying to insert events", e);
  } finally {
    await connection.close();
  }
}

main();

/* Interfaces */

export interface IBaseAuditLog {
  collectionName: string;
}

export interface IResumeToken extends IBaseAuditLog {
  token: Object;
}

export interface IDocumentSnapshot extends IBaseAuditLog {
  key: Object;
  snapshot: Object;
}

export interface IChangeEvent extends IBaseAuditLog {
  eventId: Object;
  key: Object;
  operation: "create" | "update";
  user: string;
  delta: Object;
}

/* Schemas */

export const baseAuditLogSchema = new Schema<IBaseAuditLog>(
  {
    collectionName: { type: String, required: true },
  },
  {
    timestamps: true,
  });

export const resumeTokenSchema = new Schema<ResumeToken>({
  token: { type: Object, required: true },
});

export const documentSnapshotSchema = new Schema<IDocumentSnapshot>({
  key: { type: Object, required: true },
  snapshot: { type: Object, required: true },
});

export const changeEventSchema = new Schema<IChangeEvent>({
  eventId: { type: Object, required: true },
  key: { type: Object, required: true },
  operation: { type: String, required: true },
  user: { type: String, required: true },
  delta: { type: Object, required: true },
});

/* Mongoose Models */

export const AuditLogModel: Model<IBaseAuditLog> = model<IBaseAuditLog>("AuditLog", baseAuditLogSchema);
export const ResumeTokenModel = AuditLogModel.discriminator<IResumeToken>("ResumeToken", resumeTokenSchema);
export const DocumentSnapshotModel = AuditLogModel.discriminator<IDocumentSnapshot>("DocumentSnapshot", documentSnapshotSchema);
export const ChangeEventModel = AuditLogModel.discriminator<IChangeEvent>("ChangeEvent", changeEventSchema);

/* Utilities */

function config(key: string): string {
  return process.env[key];
}
