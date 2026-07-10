import express from 'express';
import cors from 'cors';

//rutele
import routes from './routes/index.js';
import controllers from './controllers/index.js';

const app=express();

app.use(cors());
app.use(express.json());


app.use('/auth', routes.authRoutes);
app.use('/profiluri/:pid/intrebari', routes.intrebareRoutes);
app.use('/profiluri', routes.profilMateRoutes);
app.use('/raspunsuri', routes.raspunsRoutes);
app.use('/recomandari', routes.recomandareRoutes);
app.use('/teste', routes.testeRoutes);
app.use('/profiluri/:pid/templates', routes.testTemplateRoutes);
app.use('/profiluri/:pid/utilizatori', routes.utilizatorRoutes);
app.use('/provocari', routes.provocareRoutes);

import requireAuth from './middlewares/auth.js';
app.put('/utilizatori/me/profil', requireAuth, controllers.utilizatorController.updateMyProfile);

// Error handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        message: err.message || 'A apărut o eroare la server!'
    });
});

export default app;