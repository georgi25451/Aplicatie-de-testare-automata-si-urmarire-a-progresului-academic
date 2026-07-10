import models from '../models/index.js';

//get - returneaza toate raspunsuile pentru un test
const getRaspunsuriByTest=async(req, res, next)=>{
    try{
        const data=await models.Raspuns.findAll({
           where:{idTest:req.params.tid}
        });

        res.status(200).json({data, count:data.length});

    }catch(err)
    {
        next(err);
    }

};

//get  - returneaza raspunsurile pentru un utilizator
const getRaspunsuriByUser=async(req, res, next)=>{
    try{
        const data=await models.Raspuns.findAll({
           where:{idUtilizator:req.user.idUtilizator}
        });

        res.status(200).json({data, count:data.length});

    }catch(err)
    {
        next(err);
    }

};

//create raspuns - creeaza rasounsul pe care il trimite utilizatorul
const createRaspuns=async(req, res, next)=>{
    try{

        const { idTest, idIntrebare}=req.body;
        const idUtilizator=req.user.idUtilizator; //il luam din JWT

        if(!idTest||!idIntrebare)
        {
            return res.status(400).json({message:'Id-urile pentru test si intrebare sunt obligatorii'});
        }

        const raspuns=await models.Raspuns.create({
            ...req.body,
            idUtilizator});
        res.status(201).json(raspuns);

    }catch(err)
    {
        next(err);
    }

};
export default {
   getRaspunsuriByTest,
   getRaspunsuriByUser,
   createRaspuns
}