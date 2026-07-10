import models from '../models/index.js';

//get all - returneaza toate intrebarile 
const getAllIntrebari=async(req, res, next)=>{
    try{
        const data=await models.Intrebare.findAll({
            where:{
                idProfilMate: req.params.pid,
                aiGenerated: false
            }

        });

        res.status(200).json({data, count: data.length}) //200 OK

    }catch(err)
    {
        next(err);
    }

};

//get one - returneaza o singura intrebare
const getOneIntrebare=async(req, res, next)=>{
    try{
        const intrebare=await models.Intrebare.findOne({
            where:{
                idIntrebare:req.params.iid, 
                idProfilMate:req.params.pid
            }
        })

        if(intrebare)
        {
            res.status(200).json(intrebare)
        }else{
            res.status(404).json({message: 'Intrebarea nu a fost gasita'}) //404 - not found
        }


    }catch(err)
    {
        next(err);
    }

};

//create intrebare - creeaza o intrebare 
const createOwnedIntrebare= async (req, res, next)=>{
    try{
        const intrebare= await models.Intrebare.create({
            ...req.body,
            idProfilMate:req.params.pid
        })

        res.status(201).json(intrebare) // 201 Created

    }catch(err)
    {
        next(err);
    }

};

//update intrebare - editeaza intrebarea
const updateOwnedIntrebare=async(req, res, next)=>{
    try{
        const intrebare=await models.Intrebare.findOne({
            where:{
                idIntrebare:req.params.iid,
                idProfilMate:req.params.pid
            }

        })

        if(intrebare)
        {
            await intrebare.update(req.body)
            res.status(200).json(intrebare)
        }else{
            res.status(404).json({message:'Intrebarea nu a fost gasita'})
        }
    }catch(err)
    {
        next(err);
    }

};

//delete intrebare - sterge intrebarea
const deleteOwnedIntrebare=async(req, res, next)=>{
    try{
        const intrebare=await models.Intrebare.findOne({
        where:{
            idIntrebare: req.params.iid,
            idProfilMate:req.params.pid
        }

        });

        if(intrebare)
        {
            await intrebare.destroy()
            res.status(204).end()
        }else{
            res.status(404).json({message: 'Intrebarea nu a fost gasita'})
        }
    }catch(err)
    {
        next(err);
    }

};

export default
{
    getAllIntrebari,
    getOneIntrebare,
    createOwnedIntrebare,
    updateOwnedIntrebare,
    deleteOwnedIntrebare
}