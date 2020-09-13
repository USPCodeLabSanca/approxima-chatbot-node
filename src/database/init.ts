import { Db, MongoClient } from 'mongodb';

// Connection URL
const url = process.env.CONNECTION_STRING!;

let db: Db;

// Use connect method to connect to the server
const dbPromise = MongoClient.connect(url, { useUnifiedTopology: true }).then(client => {
  console.log('Connected successfully to MongoDB');
  db = client.db();
  return db;
}).catch(() => {
  throw new Error('Failed to connect to MongoDB.');
});

export const getDb = async () => {
  if (!db) {
    return dbPromise;
  }
  return db;
};
