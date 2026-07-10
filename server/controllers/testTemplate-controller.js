import models from '../models/index.js';

const getAllTestTemplates=async(req, res, next)=>{
    try{
        let whereClause = { activ: true };
        if (req.params.pid && req.params.pid !== 'all') {
            whereClause.idProfilMate = req.params.pid;
        }
    
        const data=await models.TestTemplate.findAll({
            where: whereClause,
            order:[['idTemplate', 'ASC']]
        });

        res.status(200).json({data, count: data.length}) //200 OK

    }catch(err)
    {
        next(err);
    }

};

//get one - returneaza un singur sablon
const getOneTestTemplates=async(req, res, next)=>{
    try{
        const template=await models.TestTemplate.findOne({
            where:{
                idTemplate:req.params.ttid, 
                idProfilMate:req.params.pid,
                activ:true
            }
        });

        if(template)
        {
            res.status(200).json(template)
        }else{
            res.status(404).json({message: 'Sablonul nu a fost gasit'}) //404 - not found
        }


    }catch(err)
    {
        next(err);
    }

};

//create sablon - creeaza un sbalon 
const createTestTemplate= async (req, res, next)=>{
    try{
        const template= await models.TestTemplate.create({
            ...req.body,
            idProfilMate:req.params.pid
        })

        res.status(201).json(template) // 201 Created

    }catch(err)
    {
        next(err);
    }

};

//update sablon - editeaza sablonul
const updateTestTemplate=async(req, res, next)=>{
    try{
        const template=await models.TestTemplate.findOne({
            where:{
                idTemplate:req.params.ttid,
                idProfilMate:req.params.pid
            }

        });

        if(template)
        {
            await template.update(req.body)
            res.status(200).json(template)
        }else{
            res.status(404).json({message:'Sablonul nu a fost gasit'})
        }
    }catch(err)
    {
        next(err);
    }

};

//delete sablon - sterge sablonul
const deleteTestTemplate=async(req, res, next)=>{
    try{
        const template=await models.TestTemplate.findOne({
        where:{
            idTemplate: req.params.ttid,
            idProfilMate:req.params.pid
        }

        });

        if(!template)
        {
            return res.status(404).json({message:'Sablonul nu a fost gasit'});
        }

        //in cazul in care avem teste care deriva din sablonul pe care dorim sa il stergem, o sa aruncam o exceptie
        //deoarece deja avem create o multime de teste pe baza acelui sablon, iar asta ar insemna ca rupem tot istoricul de teste, raspunsuri, recomanadri, iar asta sugereaza ca mai bine il editam
        //astfel, implementam un soft delete, il vom dezactiva

        await template.update({activ:false});

        res.status(200).json({message:'Sablonul a fost dezactivat'});

    }catch(err)
    {
        next(err);
    }

};

export default
{
   getAllTestTemplates,
   getOneTestTemplates,
   createTestTemplate,
   updateTestTemplate,
   deleteTestTemplate
}