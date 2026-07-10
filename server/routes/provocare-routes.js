import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';

const router = express.Router();

// URL de bază: /provocari

// Obține provocarea zilei (sau o generează)
router.get('/azi', requireAuth, controllers.provocareController.getProvocareAzi);

// Răspunde la o provocare specifică
router.post('/:idProvocare/raspunde', requireAuth, controllers.provocareController.raspundeProvocare);

// Obține istoricul provocărilor
router.get('/istoric', requireAuth, controllers.provocareController.getIstoricProvocari);

export default router;
