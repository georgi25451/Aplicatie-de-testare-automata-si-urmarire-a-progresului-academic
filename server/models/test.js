/**
 * Test - modelul repreznta instanta unui test generat pe baza sablonului utilizat
 * 
 * @property {number} idTest - id-ul unui test
 * @property {number} idUtilizator - id-ul utilizatorului care sustine testul 
 * @property {number} idTemplate - sablonul utilizat pentru generarea testului
 * @property {Date} dataTest - data cand s-a generat testul
 * @property {number} scor - rezultatul obtinut la test
 * @property {string} modelFolosit - modelul AI folosit pentru generare
 * 
 */

import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const Test=sequelize.define("Teste", {
    idTest:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    nrIntrebari:{
        type:DataTypes.INTEGER
    },
    dificultate:{
        type:DataTypes.STRING(20)
    },
    modelFolosit:{
        type:DataTypes.STRING(100)
    },
    dataTest:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    scor:{
        type:DataTypes.INTEGER
    },
    idUtilizator:{
        type:DataTypes.INTEGER,
        allowNull:false,
      
    },
    idTemplate:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps:false,
    freezeTableName:true
});

export default Test;