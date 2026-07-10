import models from '../models/index.js';

//obtine provocarea pentru ziua curenta, sau genereaza daca nu exista
const getProvocareAzi = async (req, res, next) => {
    try {
        const idUtilizator = req.user.idUtilizator;
        
        //data curenta formatata 'YYYY-MM-DD'
        const azi = new Date().toISOString().split('T')[0];

        //verificam daca exista deja o provocare pe ziua de azi pentru utilizator
        let provocare = await models.ProvocareZilnica.findOne({
            where: {
                idUtilizator,
                dataProvocare: azi
            }
        });

        //daca nu exista, o generam
        if (!provocare) {
            //obtin idProfilMate direct de pe user, fara include
            const user = await models.Utilizator.findByPk(idUtilizator);
            const idProfil = user?.idProfilMate;

            if (!idProfil) {
                return res.status(404).json({ message: "Nu ai un profil matematic selectat." });
            }

            //cautam intrebarile din banca de date pentru profilul elevului
            const intrebariBanca = await models.Intrebare.findAll({
                where: { idProfilMate: idProfil },
                order: [['idIntrebare', 'ASC']]
            });

            if (intrebariBanca.length === 0) {
                return res.status(404).json({ message: "Nu există întrebări în baza de date pentru profilul tău." });
            }

            //zi diferita = intrebare diferita
            const ziuaEpoca = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
            const q = intrebariBanca[ziuaEpoca % intrebariBanca.length];

            const challengeData = {
                intrebareGenerata: q.textIntrebare,
                varianteRaspuns: JSON.stringify({
                    "A": q.variantaA,
                    "B": q.variantaB,
                    "C": q.variantaC,
                    "D": q.variantaD
                }),
                raspunsCorect: q.raspunsCorect,
                explicatieAI: q.explicatieCorecta || "Răspunsul se regăsește în noțiunile teoretice specifice profilului.", // placeholder, suprascris la submit
            };

            //salvam in baza de date
            provocare = await models.ProvocareZilnica.create({
                idUtilizator,
                dataProvocare: azi,
                intrebareGenerata: challengeData.intrebareGenerata,
                varianteRaspuns: challengeData.varianteRaspuns, //este salvat ca string JSON
                raspunsCorect: challengeData.raspunsCorect,
                explicatieAI: challengeData.explicatieAI,
                rezolvat: false
            });
        }

       
        res.status(200).json(provocare);

    } catch (err) {
        next(err);
    }
};

//salvam raspunsul ales de utilizator
const raspundeProvocare = async (req, res, next) => {
    try {
        const { idProvocare } = req.params;
        const idUtilizator = req.user.idUtilizator;
        const { raspunsAles } = req.body; 

        const provocare = await models.ProvocareZilnica.findOne({
            where: {
                idProvocare,
                idUtilizator
            }
        });

        if (!provocare) {
            return res.status(404).json({ message: "Provocarea nu a fost găsită." });
        }

        if (provocare.rezolvat) {
            return res.status(400).json({ message: "Ai răspuns deja la această provocare!" });
        }

        const esteCorect = provocare.raspunsCorect === raspunsAles;

        const intrebare = await models.Intrebare.findOne({
            where: { textIntrebare: provocare.intrebareGenerata }
        });

        const explicatieAI = esteCorect
            ? (intrebare?.explicatieCorecta || "Răspuns corect!")
            : (intrebare?.explicatieGreseli || "Răspuns greșit.");

        await provocare.update({
            raspunsAles,
            esteCorect,
            rezolvat: true,
            explicatieAI
        });

        const provocareActualizata = await models.ProvocareZilnica.findByPk(provocare.idProvocare);
        res.status(200).json(provocareActualizata);

    } catch (err) {
        next(err);
    }
};

//get all provocari, istoricul provocarilor elevului 
const getIstoricProvocari = async (req, res, next) => {
    try {
        const idUtilizator = req.user.idUtilizator;

        const istoric = await models.ProvocareZilnica.findAll({
            where: {
                idUtilizator,
                rezolvat: true
            },
            order: [['dataProvocare', 'DESC']]
        });

        res.status(200).json({ data: istoric, count: istoric.length });

    } catch (err) {
        next(err);
    }
};

export default {
    getProvocareAzi,
    raspundeProvocare,
    getIstoricProvocari
};
