import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//REGISTER - aici vom crea utilizatorul si hashuim parola 
const register=async(req, res, next)=>{
    try{

        const{email, parola, rol, ...rest}=req.body;

        //validarile necesare pe campuri
        if(!email || !parola)
        {
            return res.status(400).json({message:'Email-ul si parola sunt campuri obligatorii'});

        }

        //parola trebuie sa aiba minim 4 caractere
        if(parola.length < 4)
        {
            return res.status(400).json({message:'Parola trebuie să aibă minim 4 caractere'});
        }

        //verificam daca deja exista emailul respectiv 
        const exista=await models.Utilizator.findOne({where: {email}});
        if(exista)
        {
            return res.status(409).json({message:'Exista deja un utilizator cu acest email'});
        }

        //hashuim parola
        const parolaHash=await bcrypt.hash(parola, 10);

        //cream utilizator in baza de date
        const user= await models.Utilizator.create({
            ...rest,
            email,
            parola: parolaHash,
            rol: rol || 'ELEV',
            activ:true
        });

        res.status(201).json({ message:'Cont creat cu succes!',
            user:{
                idUtilizator:user.idUtilizator,
                email:user.email,
                nume:user.nume,
                prenume:user.prenume,
                rol:user.rol,
                idProfilMate:user.idProfilMate,
                activ:user.activ
            }
        });
    }catch(err)
    {
        next(err);
    }
};

//LOGIN - se verifica email, parola si se genereaza JWT 
const login=async(req, res, next)=>{
    try{
        const {email, parola}=req.body;

        //validari pe campuri
        if(!email || !parola)
        {
            return res.status(400).json({message:'Email-ul si parola sunt campuri obligatorii '});
        }

        //cautare user dupa email
        const user=await models.Utilizator.findOne({where: {email}});
        if(!user)
        {
            return res.status(401).json({message:'Email-ul sau parola incorecta'});

        }

        //verificam daca este dezactivat
        if(user.activ==false)
        {
            return res.status(403).json({message:'Contul este dezactivat'});

        }

        //se compara parolele, cea hash si cea din baza de date
        const ok=await bcrypt.compare(parola, user.parola);
        if(!ok)
        {
            return res.status(401).json({message:'Email-ul sau parola incorecta'});
        }

        //generam token
       const token = jwt.sign(
        {  idUtilizator: user.idUtilizator, 
            rol: user.rol
        },

        process.env.JWT_SECRET,
        { 
             expiresIn: '7d'
        });

        res.status(200).json({
            token,
            user:{
                idUtilizator:user.idUtilizator,
                email:user.email,
                nume:user.nume,
                prenume:user.prenume,
                rol:user.rol,
                idProfilMate:user.idProfilMate
            }
        });

    }catch(err)
    {
        next(err);
    }

};

export default 
{
    register,
    login
}