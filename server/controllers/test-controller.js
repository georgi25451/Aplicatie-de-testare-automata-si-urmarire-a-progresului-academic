import models from '../models/index.js';

//get all - returneaza toate testele 
const getAllTeste=async(req, res, next)=>{
    try{
        const data=await models.Test.findAll({
            where:{
                idUtilizator: req.user.idUtilizator
            },
            include:[{
                model: models.TestTemplate, required:false
            }], //am inclus test template pentru a vedea nivelul de dificultate
            order:[['idTest', 'DESC']]
        })

        res.status(200).json({data, count: data.length}) //200 OK

    }catch(err)
    {
        next(err);
    }

};

//get one - returneaza un singur test
const getOneTest=async(req, res, next)=>{
    try{
        const test=await models.Test.findOne({
            where:{
                idTest:req.params.tid, 
                idUtilizator:req.user.idUtilizator
            }, 
             include:[{
                model: models.TestTemplate, required:false
            }, {
                model: models.Intrebare,
                required: false
            }],
        });

        if(test)
        {
            //ordonam intrebarile pe baza 'ordine' din tabela de legatura daca exista
            if (test.Intrebaris && test.Intrebaris.length > 0) {
                 test.Intrebaris.sort((a, b) => a.Test_intrebari.ordine - b.Test_intrebari.ordine);
            }
            res.status(200).json(test)
        }else{
            res.status(404).json({message: 'Testul nu a fost gasit'}) //404 - not found
        }
    }catch(err)
    {
        next(err);
    }
};

import { generateTheory } from '../services/aiService.js';

//submit test - elevul trimite raspunsurile
const submitTest = async (req, res, next) => {
    try {
        const idTest = req.params.tid;
        const idUtilizator = req.user.idUtilizator;
        const { raspunsuri } = req.body; 

        //gasim testul si intrebarile lui 
        const test = await models.Test.findOne({
            where: { idTest, idUtilizator },
            include: [{ model: models.Intrebare }]
        });

        if (!test) return res.status(404).json({ message: 'Test invalid' });

        //blocam re-submisia (scor != null inseamna ca testul a fost deja trimis)
        if (test.scor !== null && test.scor !== undefined) {
            return res.status(409).json({ message: 'Testul a fost deja susținut.' });
        }

        let scorTotal = 0;
        let greseliPentruAI = [];

        //evaluam fiecare intrebare din test
        for (let intrebare of test.Intrebaris) {
            const variantaAleasa = raspunsuri[intrebare.idIntrebare];
            const esteCorect = variantaAleasa === intrebare.raspunsCorect;
            
            if (esteCorect) {
                scorTotal += 10; // 10 XP pentru raspuns corect
            } else if (variantaAleasa) {
                //daca a raspuns dar a gresit
                greseliPentruAI.push(`Concept greșit: ${intrebare.textIntrebare} (a ales ${variantaAleasa} în loc de ${intrebare.raspunsCorect})`);
            } else {
                 greseliPentruAI.push(`Nu a știut să răspundă la: ${intrebare.textIntrebare}`);
            }

            if (variantaAleasa) {
                await models.Raspuns.findOrCreate({
                    where: { idIntrebare: intrebare.idIntrebare, idTest: test.idTest, idUtilizator },
                    defaults: { variantaAleasa, esteCorect }
                });
            }
        }

        //actualizam scorul testului
        await test.update({ scor: scorTotal });

        //raspundem imediat elevului — generarea teoriei se face in background
        res.status(200).json({
             message: 'Test finalizat cu succes!',
             scor: scorTotal
        });

        //generam teoria in background (nu blochează răspunsul)
        setImmediate(async () => {
            try {
                const pastMistakes = await models.Raspuns.findAll({
                    where: { idUtilizator, esteCorect: false },
                    include: [{ model: models.Intrebare }],
                    order: [['idRaspuns', 'DESC']],
                    limit: 10
                });

                const istoricGreseli = pastMistakes.map(r => {
                    const questionText = r.Intrebari ? r.Intrebari.textIntrebare : (r.Intrebare ? r.Intrebare.textIntrebare : 'Exercițiu matematic');
                    const corect = r.Intrebari ? r.Intrebari.raspunsCorect : (r.Intrebare ? r.Intrebare.raspunsCorect : '');
                    return `A greșit: ${questionText} (ales ${r.variantaAleasa}, corect: ${corect})`;
                });

                const greseliUnice = [...new Set([...greseliPentruAI, ...istoricGreseli])].slice(0, 10);

                const userWithProfile = await models.Utilizator.findByPk(idUtilizator);
                let numeProfil = 'Matematică Generală';
                if (userWithProfile?.idProfilMate) {
                    const profil = await models.ProfilMate.findByPk(userWithProfile.idProfilMate);
                    if (profil) numeProfil = profil.denumire || profil.denumireProfilMate || 'Matematică Generală';
                }

                if (greseliUnice.length > 0) {
                    const textRecomandare = await generateTheory(greseliUnice, numeProfil);
                    await models.Recomandare.create({ idUtilizator, textRecomandare, dataGenerare: new Date() });
                    console.log(`Teorie generată cu succes pentru utilizatorul ${idUtilizator}`);
                }
            } catch (errAI) {
                console.warn("Generarea teoriei a eșuat (AI indisponibil):", errAI.message);
            }
        });

    } catch (err) {
        next(err);
    }
};



import { generateSyntheticQuestions } from '../services/aiService.js';


const startTestByTemplate = async (req, res, next) => {
    try {
        const idTemplate = req.params.idTemplate;
        const idUtilizator = req.user.idUtilizator;

        //facem fetch pe template
        const template = await models.TestTemplate.findOne({ where: { idTemplate } });
        if (!template) {
            return res.status(404).json({ message: 'Acel șablon nu există.' });
        }

        //fetch only original (non-AI) questions in fixed order
        const availableQuestions = await models.Intrebare.findAll({
            where: {
                idProfilMate: template.idProfilMate,
                nivel: template.nivel,
                aiGenerated: false
            },
            order: [['idIntrebare', 'ASC']]
        });

        if (availableQuestions.length < template.nrIntrebari) {
             return res.status(400).json({ message: `Nu există suficiente întrebări (avem ${availableQuestions.length}, necesare ${template.nrIntrebari}) pentru acest nivel și profil în baza de date.` });
        }

        //amestecam intrebarile si luam nrIntrebari ca baza pentru AI
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        const baseQuestions = shuffled.slice(0, template.nrIntrebari);

        // AI genereaza variante cu cifre schimbate, daca pica, folosim intrebarile originale amestecate
        let selectedIds;
        let modelFolosit = 'random-shuffle';
        try {
            const newQuestionsData = await generateSyntheticQuestions(baseQuestions);
            const insertedQuestions = await models.Intrebare.bulkCreate(
                newQuestionsData.map(q => ({ ...q, aiGenerated: true }))
            );
            selectedIds = insertedQuestions.map(q => q.idIntrebare);
            modelFolosit = 'gemini-synthetic';
        } catch (aiErr) {
            console.warn("AI indisponibil pentru variante sintetice, folosesc originale:", aiErr.message);
            selectedIds = baseQuestions.map(q => q.idIntrebare);
        }

        //cream inregistrarea testului (scor: null = nesubmis)
        const testNou = await models.Test.create({
            idUtilizator,
            idTemplate: template.idTemplate,
            nrIntrebari: template.nrIntrebari,
            dificultate: template.nivel,
            modelFolosit,
            scor: null
        });

        //conectam intrebarile la acest Test
        const testeIntrebariData = selectedIds.map((idIntrebare, index) => ({
            idTest: testNou.idTest,
            idIntrebare,
            ordine: index + 1
        }));

        await models.TesteIntrebari.bulkCreate(testeIntrebariData);

        res.status(201).json({
             message: 'Test generat cu succes de asistentul AI!',
             testId: testNou.idTest
        });
    } catch (err) {
        next(err);
    }
};

export default {
    getAllTeste,
    getOneTest,
    startTestByTemplate,
    submitTest
}