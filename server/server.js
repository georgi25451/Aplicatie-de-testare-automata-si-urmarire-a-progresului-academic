import env from "dotenv";
import app from './app.js';
import initDatabase from './config/initDB.js';

env.config();

const PORT = process.env.PORT || 8080;

async function start() {
    try{
        await initDatabase();

        app.listen(PORT, ()=>{

            console.log(`Serverul ruleaza pe portul ${PORT}`);
        });
    }catch(error)
    {
        console.error("Eroare: ", error);
    }
    
}

start();