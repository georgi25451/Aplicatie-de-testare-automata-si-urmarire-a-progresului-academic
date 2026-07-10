//crearea tabelei ProfilMate

import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const ProfilMate=sequelize.define("profiluri_mate", {
    idProfilMate:{
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    denumireProfilMate:{
        type:DataTypes.STRING(20),
        allowNull:false,

    },
    descriere:{
        type:DataTypes.STRING(200),
        allowNull:false
    }
}, 
{
    timestamps:false,
    freezeTableName:true
})

export default ProfilMate;
