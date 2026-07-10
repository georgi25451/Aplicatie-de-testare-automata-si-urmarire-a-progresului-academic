import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';

const ProvocareZilnica = sequelize.define("ProvocariZilnice", {
    idProvocare: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    idUtilizator: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dataProvocare: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    intrebareGenerata: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    varianteRaspuns: {
        type: DataTypes.JSON,
        allowNull: false
    },
    raspunsCorect: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    raspunsAles: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    explicatieAI: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    esteCorect: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    rezolvat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default ProvocareZilnica;
