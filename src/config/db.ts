//PostgreSQL connection with pg

//imports
import { Pool } from "pg";
import dotnev from "dotenv";

//load evironment variables
dotnev.config();

//configure the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, //reads the PostgreSQL connection string from .en
  max: 10, //Limits the number of clients in the pool
  idleTimeoutMillis: 30000, //closes idle clients after 30 seconds
  connectionTimeoutMillis: 2000, //timeout if connection takes longer than 2 seconds
});

//export the connection pool
export default pool;
