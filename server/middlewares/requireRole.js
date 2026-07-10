//aici verificam rolul utilizatorului, daca s a logat adminul sau un simplu user(elev)

 const requireRole=(...roles)=>{
    return(req, res, next)=>{
        if(!req.user)
        {
            return res.status(401).json({message: 'Neautentificat'});
        }

        //daca rolul userului nu e in lista permisa pe care o primeste la inceput, de ex ('ADMIN', 'ELEV')
        if(!roles.includes(req.user.rol))
        {
            return res.status(403).json({message:'Acces interzis'});
        }

        next();
    };

};
export default requireRole