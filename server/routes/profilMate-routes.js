import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';

const router=express.Router();

//URL: /profiluri

//getAll (PUBLIC - so we can use it on register page)
router.get('/', controllers.profilMateController.getAllProfiluriMate);

//getOne
router.get('/:pid', requireAuth, controllers.profilMateController.getOneProfilMate);

export default router;