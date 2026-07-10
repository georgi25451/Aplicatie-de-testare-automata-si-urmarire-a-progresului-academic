/**
 * Utilizator - modelul utilizat pentru a defini structura unui cont al aplicatiei
 * 
 * @property {number} idUtilizator - id-ul utilizatorului care este unic
 * @property {string} nume - numele utilizatorului
 * @property {string} prenume - prenumele utilizatorului
 * @property {string} email - adresa de email a utilizatorului
 * @property {string} parola - parola utilizatorului care este criptata
 * @property {string} rol - rolul unui utilizator este folosit deoarece avem un admin care se ocupa cu crearea sabloanelor si un user cel care beneficiaza de aplicatie
 * @property {Date} dataInregistrare - data in care s a creat contul utilizatorului
 * @property {Date} ultimaZiTest - data in care s-a sustinut ultimul test
 * @property {number} streakCurent - streak-ul reprezinta numarul de zile consecutive active alte utilizatorului
 * @property {number} streakMaxim - reprezinta numarul maxim de zile de activitate
 * @property {boolean} activ - reprezinta un flag care ne va ajuta la soft delete 
 */


import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const Utilizator=sequelize.define("Utilizatori", {
    idUtilizator:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    },
    nume:{
        type:DataTypes.STRING(50),
        allowNull:false,

    },
    prenume:{
        type:DataTypes.STRING(50),
        allowNull:false,
        
    },
    email:{
        type:DataTypes.STRING(100),
        allowNull:false,
        unique:true
        
    },
    parola:{
        type:DataTypes.STRING(255),
        allowNull:false,
        
    },
    rol:{
        type: DataTypes.STRING(10),
        allowNull:false,
        defaultValue:'ELEV',
        validate:{
            isIn:[['ADMIN', 'ELEV']]
        }

    },
    dataInregistrare:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    ultimaZiTest:{
        type:DataTypes.DATE
    },
    streakCurent:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    streakMaxim:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    activ:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    idProfilMate:{
        type: DataTypes.INTEGER,
        allowNull:true,
        defaultValue:null
        
    },
}, {
    timestamps:false,
    freezeTableName:true
});

export default Utilizator;