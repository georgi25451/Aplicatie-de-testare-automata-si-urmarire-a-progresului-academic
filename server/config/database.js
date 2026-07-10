//in acest fiser facem conexiunea la baza de date

import {Sequelize} from 'sequelize';
import env from 'dotenv';

env.config();

const sequelize=new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host:process.env.DB_HOST || "localhost",
        port:process.env.DB_PORT || 3306,
        dialect:process.env.DB_DIALECT,
        logging:false,
        define:{
            timestamps:false,
            freezeTableName:true
        }

    }

);

export default sequelize;

