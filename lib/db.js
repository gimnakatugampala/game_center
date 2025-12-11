// lib/db.js
import mysql from 'mysql2/promise';

export async function query({ query, values = [] }) {
  const dbconnection = await mysql.createConnection({
    host: 'localhost',      
    database: 'snake_game_db', 
    user: 'root',           
    password: '',            
  });

  try {
    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    return results;
  } catch (error) {
    
    console.error("DATABASE_ERROR: ", error.message);
    throw Error(error.message);
  }
}