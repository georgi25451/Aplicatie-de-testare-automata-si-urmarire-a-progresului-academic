import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';

const router=express.Router();

//URL: /teste

//get all 
router.get('/', requireAuth, controllers.testController.getAllTeste);

//get one test
router.get('/:tid', requireAuth, controllers.testController.getOneTest);

//generate test by template (AI selection)
router.post('/generate/:idTemplate', requireAuth, controllers.testController.startTestByTemplate);

//submit test
router.post('/:tid/submit', requireAuth, controllers.testController.submitTest);


export default router;
