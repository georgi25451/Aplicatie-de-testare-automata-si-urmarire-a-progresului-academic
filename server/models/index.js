import ProfilMate from './profilMate.js';
import Utilizator from './utilizator.js';
import Test from './test.js';
import Intrebare from './intrebare.js'
import Raspuns from './raspuns.js';
import Recomandare from './recomandare.js';
import TestTemplate from './testTemplate.js';
import TesteIntrebari from './testeIntrebari.js';
import ProvocareZilnica from './provocareZilnica.js';

//relatiile dintre tabele 

//profil mate cu utilizator: relatie de 1 la n, un elev are un singur profil, iar un profil poate fi avut de mai multi elevi
ProfilMate.hasMany(Utilizator, {foreignKey:"idProfilMate"});
Utilizator.belongsTo(ProfilMate, {foreignKey:"idProfilMate"});

//utilizator cu test: relatie de 1 la n, un utilizator poate avea mai multe teste, iar un test aparinte unui singur utilizator
Utilizator.hasMany(Test, {foreignKey:"idUtilizator"});
Test.belongsTo(Utilizator, {foreignKey:"idUtilizator"});

//profil mate cu test: relatie de 1 la n, un profil de mate are mai multe teste generate, iar un test are asociat un singur profil
ProfilMate.hasMany(Test, {foreignKey:"idProfilMate"});
Test.belongsTo(ProfilMate, {foreignKey:"idProfilMate"});

//profil mate cu template: relatie de 1 la n, un profil are asociat un template, iar un template este asociat mai multe profiluri in functie de nivelul de dificultate
ProfilMate.hasMany(TestTemplate, { foreignKey: "idProfilMate" });
TestTemplate.belongsTo(ProfilMate, { foreignKey: "idProfilMate" });

//template cu test: relatie de 1 la n, un template are mai multe teste, iar mai multor teste generate le este asociat un singur template
TestTemplate.hasMany(Test, {foreignKey:"idTemplate"});
Test.belongsTo(TestTemplate, {foreignKey:"idTemplate"});

//profil cu intrebari: relatie de 1 la n, un profil are asociate mai multe intrebari, iar mai multe intrebari generate sunt asociate unui singur profil
ProfilMate.hasMany(Intrebare, {foreignKey:"idProfilMate"});
Intrebare.belongsTo(ProfilMate, {foreignKey:"idProfilMate"});

//test cu intrebare: relatie de n la n, mai multe teste au asociate mai multe intrebari, iar mai multe intrebari pot fi si ele asociate mai multor teste
Test.belongsToMany(Intrebare, {
    through: TesteIntrebari,
    foreignKey:"idTest",
    otherKey:"idIntrebare"
});
Intrebare.belongsToMany(Test, {
    through:TesteIntrebari,
    foreignKey:"idIntrebare",
    otherKey:"idTest"
});

//intrebare cu raspuns: relatie de 1 la n
//aici e vorba de raspunsurile elevului
Intrebare.hasMany(Raspuns, {foreignKey:"idIntrebare"});
Raspuns.belongsTo(Intrebare, {foreignKey:"idIntrebare"});

//test cu raspuns: relatie de 1 la n
Test.hasMany(Raspuns, {foreignKey:"idTest"});
Raspuns.belongsTo(Test, {foreignKey:"idTest"});

//utilizator cu raspuns: relatie de 1 la n 
Utilizator.hasMany(Raspuns, {foreignKey:"idUtilizator"});
Raspuns.belongsTo(Utilizator, {foreignKey:"idUtilizator"});

//utilizator cu recomandare: relatie de 1 la n 
Utilizator.hasMany(Recomandare, {foreignKey:"idUtilizator"});
Recomandare.belongsTo(Utilizator, {foreignKey:"idUtilizator"});

//utilizator cu provocare zilnica: relatie de 1 la n
Utilizator.hasMany(ProvocareZilnica, {foreignKey:"idUtilizator"});
ProvocareZilnica.belongsTo(Utilizator, {foreignKey:"idUtilizator"});

const models=
{
   ProfilMate,
    Utilizator,
    Test,
    Intrebare,
    Raspuns,
    Recomandare,
    TestTemplate,
    TesteIntrebari,
    ProvocareZilnica
}
  
export default models