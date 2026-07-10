import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TesteIntrebari=sequelize.define("Test_intrebari", {
    idTest:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,

    },
     idIntrebare:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
       
    },
    ordine:{
        type:DataTypes.INTEGER
    }
}, 
{
    timestamps:false,
    freezeTableName:true
});

export default TesteIntrebari;