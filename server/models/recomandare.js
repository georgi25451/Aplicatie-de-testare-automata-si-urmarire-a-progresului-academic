import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const Recomandare=sequelize.define("Recomandari", {
  idRecomandare:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  },
  textRecomandare:{
    type:DataTypes.TEXT,
    allowNull:false
  },
  dataGenerare:{
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW,
    allowNull:false
  },
    idUtilizator:{
        type:DataTypes.INTEGER,
        allowNull:false,
       
    },
}, 
{
    timestamps:false,
    freezeTableName:true
});

export default Recomandare;