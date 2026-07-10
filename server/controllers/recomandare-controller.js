import models from '../models/index.js';


//get recomandari - returneaza recomandarile pentru un utilizator
const getRecomandariByUser=async(req, res, next)=>{
    try{
        const data=await models.Recomandare.findAll({
           where:{idUtilizator:req.user.idUtilizator}
        });

        res.status(200).json({data, count:data.length});

    }catch(err)
    {
        next(err);
    }

};


import { generateTheory } from '../services/aiService.js';

//generate theory (AI)
const generatePersonalizedTheory = async(req, res, next)=>{
    try{
        const idUtilizator = req.user.idUtilizator;
        const { greseli } = req.body; 
        
        //daca nu ne trimite greseli explicite, folosim ceva generic 
        const istoricGreseli = greseli || ["Mai are de lucrat la algebră de bază."];
        
        const userWithProfile = await models.Utilizator.findByPk(idUtilizator);
        let numeProfil = 'Matematică Generală';
        if (userWithProfile && userWithProfile.idProfilMate) {
            const profil = await models.ProfilMate.findByPk(userWithProfile.idProfilMate);
            if (profil) {
                numeProfil = profil.denumire || profil.denumireProfilMate || 'Matematică Generală';
            }
        }

        //apelam serviciul AI
        const textRecomandare = await generateTheory(istoricGreseli, numeProfil);
        
        //salvam in bd
        const recomandare = await models.Recomandare.create({
            idUtilizator,
            textRecomandare,
            dataGenerare: new Date()
        });

        res.status(201).json(recomandare);
    }catch(err){
        next(err);
    }
}

export default 
{
   
    getRecomandariByUser,
    generatePersonalizedTheory
}