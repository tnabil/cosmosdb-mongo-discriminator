import { ClientSession, MongoClient } from "mongodb";
import dotenv from "dotenv"

/* Main */

async function main() {
  dotenv.config();
  const client = new MongoClient(config("DATABASE_URL"));
  const db = client.db('applications');
  let session: ClientSession;
  try {
    console.info("Connecting to DB...");
    db.command(
      {
        ping: 1
      }
    );
    console.info("Connected to DB");
    const auditlogs = db.collection('auditlogs');
    console.info("Starting transaction");
    session = client.startSession();
    session.startTransaction();
    for (let counter=0; counter < 10; ++counter) {
      console.info(`Inserting document number ${counter}`);
      await auditlogs.insertOne(
        {
          key: `key${counter}`,
        },
        {
          session
        });
      console.info(`Inserted document number ${counter}`);
    }
    await session.commitTransaction();
    console.info("Successfully inserted documents");
  } catch (e) {
    console.error("Error while trying to insert documents", e);
    if (session) await session.abortTransaction();
  } finally {
    console.info("Closing DB connection");
    await session.endSession();
    await client.close();
    console.info("Closed DB connection");
  }
}

main();

/* Utilities */

function config(key: string): string {
  return process.env[key];
}
