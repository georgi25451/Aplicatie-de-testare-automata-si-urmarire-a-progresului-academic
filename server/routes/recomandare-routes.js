import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';

const router=express.Router();

//URL: /recomandari

//get recomandarile utilizatorului
router.get('/user', requireAuth, controllers.recomandareController.getRecomandariByUser);

//generate personalized theory AI
router.post('/generate-theory', requireAuth, controllers.recomandareController.generatePersonalizedTheory);

export default router;