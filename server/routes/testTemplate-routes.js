import express from 'express';
import controllers from '../controllers/index.js';
import requireAuth from '../middlewares/auth.js';
import requireRole from '../middlewares/requireRole.js';

const router=express.Router({mergeParams:true});

//URL: /profiluri/:pid/templates

//get all templates pentru profil
router.get('/', requireAuth, controllers.testTemplateController.getAllTestTemplates)

//get one template
router.get('/:ttid', requireAuth, controllers.testTemplateController.getOneTestTemplates)

//create template de catre admin
router.post('/', requireAuth, requireRole('ADMIN'), controllers.testTemplateController.createTestTemplate)

//update template de catre admin
router.put('/:ttid', requireAuth, requireRole('ADMIN'), controllers.testTemplateController.updateTestTemplate)

//delete template de catre admin - soft delete in controller (activ=false)
router.delete('/:ttid', requireAuth, requireRole('ADMIN'), controllers.testTemplateController.deleteTestTemplate)

export default router