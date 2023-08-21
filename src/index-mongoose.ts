import { Schema, model, Model, connect, connection, set } from "mongoose";
import dotenv from "dotenv"

/* Main */

async function main() {
  dotenv.config();
  set('strictQuery', false);
  console.info("Connecting to DB...");
  await connect(config("DATABASE_URL"));
  console.info("Connected to DB");
  try {
    console.info("Starting transaction");
    await connection.transaction(async (session) => {
      for (let counter=0; counter < 10; ++counter) {
        const newAuditLog = new AuditLogModel({
          key: `key${counter}`,
        });
        console.info(`Saving document number ${counter}`);
        await newAuditLog.save({ session });
        console.info(`Saved document number ${counter}`);
      }  
    });
    console.info("Successfully inserted documents");
  } catch (e) {
    console.error("Error while trying to insert documents", e);
  } finally {
    console.info("Closing DB connection");
    await connection.close();
    console.info("Closed DB connection");
  }
}

main().catch((e) => console.error(e));

/* Interfaces */

export interface AuditLog {
  key: string;
}

/* Schemas */

export const auditLogSchema = new Schema<AuditLog>(
  {
    key: { type: String, required: true },
  },
  {
    timestamps: true,
  });

/* Mongoose Models */

export const AuditLogModel: Model<AuditLog> = model<AuditLog>("AuditLog", auditLogSchema);

/* Utilities */

function config(key: string): string {
  return process.env[key];
}
