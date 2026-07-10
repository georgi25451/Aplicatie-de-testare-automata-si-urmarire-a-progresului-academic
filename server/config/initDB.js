import mysql from 'mysql2/promise';
import env from 'dotenv';
import sequelize from './database.js';
import models from '../models/index.js';

env.config();

const {ProfilMate}=models;

async function initDatabase()
{
       const connection=await mysql.createConnection({
          host:process.env.DB_HOST || "localhost",
          port:process.env.DB_PORT ||3306,
          user:process.env.DB_USERNAME,
          password:process.env.DB_PASSWORD
       });

       await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
       await connection.end();

       await sequelize.authenticate();

       await sequelize.sync({ alter: true });


       //creare de profiluri deja din cod, deoarece sunt standard, statice:
       const count=await ProfilMate.count();
       if(count===0)
       {
        await ProfilMate.bulkCreate([
        
        { denumire: "Mate-Info", descriere: "Profil real matematica-informatica" },
        { denumire: "Stiinte-Naturii", descriere: "Profil real stiinte ale naturii" },
        { denumire: "Tehnologic", descriere: "Profil tehnologic" },
        { denumire: "Pedagogic", descriere: "Profil pedagogic" },

        ]);
       }

       console.log("Baza de date este initializata");
}

export default initDatabase;