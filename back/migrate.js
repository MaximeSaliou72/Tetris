import pg from "pg";

import "dotenv/config";

const { Pool } = pg;

const { DATABASE, PASSWORD, PORT, USERNAME } = process.env;
const dbConfig = {
  database: DATABASE,
  password: PASSWORD,
  port: PORT,
  user: USERNAME,
};

// Chargement de la configuration de la base de données

const pool = new Pool(dbConfig);
const createDatabase = async () => {
  try {
    await pool.query(`CREATE DATABASE ${DATABASE}`);
    console.log("database created");
  } catch (error) {
    console.log(error);
  }
};

const createTables = async () => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS users (user_id BIGSERIAL PRIMARY KEY, user_name VARCHAR(255) NOT NULL, hashed_password VARCHAR(255) NOT NULL, user_email VARCHAR(255) NOT NULL)",
    [],
  );
  console.log("table created");
};
createDatabase();
createTables();
