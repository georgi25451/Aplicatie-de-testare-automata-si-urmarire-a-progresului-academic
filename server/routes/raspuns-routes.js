import express from 'express';
import requireAuth from '../middlewares/auth.js';
import controllers from '../controllers/index.js';

const router=express.Router();

//URL: /raspunsuri

//get - raspunsurile unui test
router.get('/teste/:tid/raspunsuri', requireAuth, controllers.raspunsController.getRaspunsuriByTest);

//get - raspunsurile unui utilizator(elev)
router.get('/user', requireAuth, controllers.raspunsController.getRaspunsuriByUser);

//create - post - trimiterea unui raspuns
router.post('/', requireAuth, controllers.raspunsController.createRaspuns);

export default router;