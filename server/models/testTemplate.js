/**
 * TestTemplate reprezinta sablonul unui test ce urmeaza a fi generat (un sablon pentru fiecare profil)
 * 
 * @property {number} idTemplate - id-ul fiecarui sablon, unic
 * @property {string} numeTemplate - denumirea unui sablon
 * @property {number} nrIntrebari - numarul de intrebari ce vor fi generate
 * @property {string} nivel - nivelul de dificultate al sablonului (ex: usor, mediu, greu)
 * @property {number} idProfilMate - profilul asociat sablonului (avem relatie de 1 la 1)
 * @property {boolean} activ - este o flag care are legatura cu stergerea unui test template, deoarece am implementat mecanisul de soft delete
 
 * 
 */



import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TestTemplate=sequelize.define("Test_template", {
    idTemplate:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    numeTemplate:{
        type:DataTypes.STRING(60),
        allowNull:false
    },
    nrIntrebari:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    nivel:{
        type:DataTypes.ENUM("usor", "mediu", "greu"),
        allowNull:false
    },  
    activ:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    idProfilMate:{
        type:DataTypes.INTEGER,
        allowNull:false,
       
    }
}, {
    indexes: [
    {
      unique: false,
      fields: ["idProfilMate", "nivel"]
    }
  ],
    timestamps:false,
    freezeTableName:true
});

export default TestTemplate;