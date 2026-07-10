import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';
import requireRole from '../middlewares/requireRole.js';

const router=express.Router({mergeParams:true}); 

//URL: /profiluri/:pid/intrebari

//getAll
router.get('/', requireAuth, controllers.intrebareController.getAllIntrebari);

//getOne
router.get('/:iid', requireAuth, controllers.intrebareController.getOneIntrebare);

//create - post
router.post('/', requireAuth, requireRole('ADMIN'), controllers.intrebareController.createOwnedIntrebare);

//update - put
router.put('/:iid', requireAuth, requireRole('ADMIN'), controllers.intrebareController.updateOwnedIntrebare);

//delete 
router.delete('/:iid', requireAuth, requireRole('ADMIN'), controllers.intrebareController.deleteOwnedIntrebare);


export default router;