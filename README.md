# Draft Licență

Aplicație web full-stack (React + Node.js/Express + MySQL), cu integrare Google Gemini AI.

## Structură

- **client/** — frontend React (Vite, React Router, Axios, KaTeX)
- **server/** — backend Node.js (Express, Sequelize, MySQL, JWT, Google Gemini)

## Instalare și rulare

### Cerințe
- Node.js
- MySQL

### Backend

```bash
cd server
npm install
```

Creează un fișier `.env` în folderul `server/` după modelul din `.env.example`:

```
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
DB_DATABASE=licenta_db
DB_USERNAME=root
DB_PASSWORD=parola_ta
JWT_SECRET=un_secret_aleator
GEMINI_API_KEY=cheia_ta_gemini
```

Apoi pornește serverul:

```bash
npm test
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Aplicația rulează pe `http://localhost:5173`, iar API-ul pe `http://localhost:8080`.
