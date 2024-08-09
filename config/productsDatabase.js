const { MongoClient } = require('mongodb')
const dotenve = require('dotenv');
const url = process.env.MONGODB_PRODUCTSDB_CONNECTION_STRING;
const dbName = 'productsDatabase';

const client = new MongoClient(url);
module.exports = client;