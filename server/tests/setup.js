import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import { jest } from "@jest/globals";
import { connectDb, disconnectDb } from "../src/config/db.js";

let mongo;

process.env.MONGOMS_DOWNLOAD_DIR = path.join(process.cwd(), ".mongodb-binaries");
jest.setTimeout(180000);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDb(mongo.getUri());
});

afterEach(async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectDb();
  if (mongo) await mongo.stop();
});
