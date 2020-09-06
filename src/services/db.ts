import MongoDb from 'mongodb';

// Connection URL
const url = process.env.CONNECTION_STRING!;

// Database Name
const dbName = process.env.DATABASE_NAME!;

let db: MongoDb.Db;

// Use connect method to connect to the server
MongoDb.MongoClient.connect(url, { useUnifiedTopology: true }).then(client => {
  console.log('Connected successfully to mongoDb');
  db = client.db(dbName);
}).catch(() => {
  throw new Error('Erro ao se conectar com o banco');
});


export const getDb = () => db;
