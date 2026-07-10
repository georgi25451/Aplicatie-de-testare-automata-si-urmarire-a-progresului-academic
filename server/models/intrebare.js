/**
 * Intrebare - este modelul care defineste proprietatiile unei intrebari dintr-un test
 * 
 * @property {number} idIntrebare - identificatorul unic al intrebarii
 * @property {string} textIntrebare - textul intrebarii
 * @property {string} variantaA - continutul intrebarii A
 * @property {string} variantaB - continutul intrebarii B
 * @property {string} variantaC - continutul intrebarii C
 * @property {string} variantaD - continutul intrebarii D
 * @property {string} raspunsCorect - reprezinta varianta care este corecta: A, B, C sau D
 * @property {string} explicatieCorecta - explicatia corecta in urma raspunsului dat de user
 * @property {string} explicatieGreseli - explicatia data in urma raspunsului dat de user care a fost gresit
 * @property {number} idProfilMate - profilul care este asociat intrebarii
 */


import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';


const Intrebare=sequelize.define("Intrebari", {
    idIntrebare:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    textIntrebare:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    variantaA:{
        type:DataTypes.STRING(500)
    },
     variantaB:{
        type:DataTypes.STRING(500)
    },
     variantaC:{
        type:DataTypes.STRING(500)
    },
     variantaD:{
        type:DataTypes.STRING(500)
    },
    raspunsCorect:{
        type:DataTypes.CHAR(1),
        allowNull:false,
        validate:{
            isIn:[['A', 'B', 'C', 'D']]
        }
    },
    explicatieCorecta:{
        type:DataTypes.TEXT
    },
    explicatieGreseli:{
        type:DataTypes.TEXT
    },
    idProfilMate:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    nivel: {
        type: DataTypes.ENUM("usor", "mediu", "greu"),
        allowNull: false,
        defaultValue: "usor"
    },
    aiGenerated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

},
{
    timestamps:false,
    freezeTableName:true
});

export default Intrebare;