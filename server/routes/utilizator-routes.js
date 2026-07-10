import express from 'express'
import controllers from '../controllers/index.js'
import requireAuth from '../middlewares/auth.js'
import requireRole from '../middlewares/requireRole.js'

const router = express.Router({ mergeParams: true })


//URL:  /profiluri/:pid/utilizatori

//get all utilizatori dintr-un profil (ADMIN)
router.get('/', requireAuth, requireRole('ADMIN'), controllers.utilizatorController.getAllUtilizatori)

//get one utilizator dintr-un profil (ADMIN)
router.get('/:uid', requireAuth, requireRole('ADMIN'), controllers.utilizatorController.getOneUtilizator)

// update my profile (ELEV/ADMIN)
router.put('/me/profil', requireAuth, controllers.utilizatorController.updateMyProfile)

//update utilizator (ADMIN)
router.put('/:uid', requireAuth, requireRole('ADMIN'),controllers.utilizatorController.updateUtilizator)

//delete utilizator (soft) (ADMIN)
router.delete('/:uid', requireAuth, requireRole('ADMIN'), controllers.utilizatorController.deleteUtilizator)


export default router