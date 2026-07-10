/**
 * Raspuns - modelul reprezinta raspunsul dat de utilizator pentru o  intrebare
 * 
 * @property {number} idRaspuns - id-ul raspunsului oferit
 * @property {string} variantaAleasa - varianta care a fost selectata
 * @property {boolean} esteCorect - indica daca raspunsul este corect sau nu
 * @property {string} explicatieAI - explicatia care a fost generata de AI
 * @property {number} idTest - id-ul testului in care apare intrebarea
 * @property {number} idIntrebare - id-ul intrebarii asociate raspunsului
 * @property {number} idUtilizator - id-ul utilizatorului care a raspuns
 */


import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const Raspuns=sequelize.define("Raspunsuri_elev", {
     idRaspuns:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
     },
     variantaAleasa:{
        type:DataTypes.CHAR(1),
        validate:{
            isIn:[['A', 'B', 'C', 'D']]
        },
        allowNull:false
     },
     esteCorect:{
        type:DataTypes.BOOLEAN,
        allowNull:false
     },
     explicatieAI:{
        type:DataTypes.TEXT
     },
    idIntrebare:{
        type:DataTypes.INTEGER,
        allowNull:false,
       
    },
      idUtilizator:{
        type:DataTypes.INTEGER,
        allowNull:false,
       
    },
    idTest:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
}, 
{
    timestamps:false,
    freezeTableName:true,
    indexes:[
        {unique:true, fields:["idTest", "idIntrebare", "idUtilizator"]}
    ]
    //indexul unic il folosesc pt ca un utilizator poate avea un singur raspuns la o intrebare, fiind grila, in mod contrar ar exista duplicate
});

export default Raspuns;