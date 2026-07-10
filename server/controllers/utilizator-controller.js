import models from '../models/index.js';

//get all - returneaza toti utilizatorii unui profil
const getAllUtilizatori=async(req, res, next)=>{
    try{
        const data=await models.Utilizator.findAll({
            where:{
                idProfilMate: req.params.pid
            },
            attributes:{exclude:['parola']}, //nu trimitem parola
            order:[['idUtilizator', 'ASC']]
        })

        res.status(200).json({data, count: data.length}) //200 OK

    }catch(err)
    {
        next(err);
    }

};

//get one - returneaza un singur utilizator
const getOneUtilizator=async(req, res, next)=>{
    try{
        const user=await models.Utilizator.findOne({
            where:{
                idUtilizator:req.params.uid, 
                idProfilMate:req.params.pid
            },
               attributes:{exclude:['parola']},
        })

        if(user)
        {
            res.status(200).json(user)
        }else{
            res.status(404).json({message: 'Utilizatorul nu a fost gasit'}) //404 - not found
        }


    }catch(err)
    {
        next(err);
    }

};


//update utilizator - editeaza utilizator
const updateUtilizator=async(req, res, next)=>{
    try{
        const user=await models.Utilizator.findOne({
            where:{
                idUtilizator:req.params.uid,
                idProfilMate:req.params.pid
            }

        })

        if(!user)
        {
            return res.status(404).json({message:'Utilizatorul nu a fost gasit'});
        }else{
             await user.update(req.body);
             res.status(200).json(user);
        }

       
    }catch(err)
    {
        next(err);
    }

};

//delete utilizator - soft delete, dezactiveaza utilizatorul
const deleteUtilizator=async(req, res, next)=>{
    try{
        const user=await models.Utilizator.findOne({
        where:{
            idUtilizator: req.params.uid,
            idProfilMate:req.params.pid
        }

        });
        if(!user)
        {
            return res.status(404).json({message:'Utilizatorul nu a fost gasit'});
        }

        await user.update({activ:false});
        res.status(200).json({message:'Utilizator dezactivat'});

     
    }catch(err)
    {
        next(err);
    }

};

// update my profile
const updateMyProfile = async (req, res, next) => {
    try {
        const idUtilizator = req.user.idUtilizator;
        const { idProfilMate } = req.body;

        const user = await models.Utilizator.findByPk(idUtilizator);
        if (!user) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
        }

        await user.update({ idProfilMate });

        res.status(200).json({
            message: 'Profil actualizat cu succes!',
            user: {
                idUtilizator: user.idUtilizator,
                email: user.email,
                rol: user.rol,
                idProfilMate: user.idProfilMate,
                activ: user.activ
            }
        });
    } catch (err) {
        next(err);
    }
};

//aici nu avem create deoarece utilizatorii se creeaza prin ruta auth/register
export default
{
   getAllUtilizatori,
   getOneUtilizator,
   updateUtilizator,
   deleteUtilizator,
   updateMyProfile
}