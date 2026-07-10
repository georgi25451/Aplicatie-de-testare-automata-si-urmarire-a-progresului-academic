import models from '../models/index.js';

//get all - returneaza toate profilurile 
const getAllProfiluriMate=async(req, res, next)=>{
    try{
        const data=await models.ProfilMate.findAll({
            order:[['idProfilMate', 'ASC']]
        });

        res.status(200).json({data, count:data.length});

    }catch(err)
    {
        next(err);
    }

};

//get one - returneaza un singur profil
const getOneProfilMate=async(req, res, next)=>{
    try{

        const profil=await models.ProfilMate.findOne({
            where:{idProfilMate: req.params.pid}
        });

        if(!profil)
        {
            return res.status(404).json({message:'Profilul nu a fost gasit'});
        }

        res.status(200).json(profil);

    }catch(err)
    {
        next(err);
    }

};

//deoarece profilurile sunt deja create standard in baza de date si nu sunt dinamice sa pot fi modificate,
//am decis sa pastrez doar operatiile de GET

export default {
    getAllProfiluriMate,
    getOneProfilMate
}