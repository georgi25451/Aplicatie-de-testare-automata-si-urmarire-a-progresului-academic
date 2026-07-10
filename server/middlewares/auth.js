import jwt from 'jsonwebtoken';

//aici verificam tokenul 

 const requireAuth=(req, res, next)=>{
    try{

        //luam headerul authorization 
        const authHeader=req.headers.authorization; //format: Bearer<token>

        //verificam daca lipseste sau daca nu are formatul corect
        if(!authHeader || !authHeader.startsWith('Bearer'))
        {
            return res.status(401).json({message:'Lipseste token-ul'});
        }

        //il extragem 
        const token=authHeader.split(' ')[1];

        //verificam tokenul cu jwt_secret din env
        const decoded=jwt.verify(token, process.env.JWT_SECRET);

        //decodam userul pentru a l putea folosi in requesturi
        req.user=decoded;
        next();

    }catch(err)
    {
       return res.status(401).json({message:'Token invalid sau expirat!'});
    }
};

export default requireAuth;