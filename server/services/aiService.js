import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

//initializam clientul Gemini
//avem nevoie de GEMINI_API_KEY în fișierul .env
const getKey = () => process.env.GEMINI_API_KEY || 'MISSING_KEY';
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const generateWithFallback = async (ai, params) => {
    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({ ...params, model });
            return response;
        } catch (err) {
            const isRetryable = err.status === 503 || err.status === 429 || err.status === 404 ||
                err.message?.includes('UNAVAILABLE') || err.message?.includes('overloaded') ||
                err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') ||
                err.message?.includes('NOT_FOUND');
            if (isRetryable) {
                console.warn(`Modelul ${model} ocupat (${err.status}), încerc ${MODELS[MODELS.indexOf(model) + 1] || 'nimic'}...`);
                await sleep(2000);
                continue;
            }
            throw err;
        }
    }
    throw new Error('Toate modelele Gemini sunt la limită momentan. Încearcă mai târziu.');
};

/**
 * selectia intrebarilor din baza de date folosind Gemini AI
 * @param {Array} availableQuestions lista de obiecte cu intrebari din BD
 * @param {number} requiredAmount cate intrebari trebuie selectate
 * @param {Array} wrongHistory istoricul subiectelor/conceptelor greșite de elev
 */

// TEORIA PERSONALIZATA
export const generateTheory = async (wrongAnswersPayload, numeProfil) => {
     try {
         if (!process.env.GEMINI_API_KEY) {
             return `**1. Geometrie Analitică**\n\nAi greșit ecuația dreptei care trece prin două puncte. Formula corectă este: $$ \\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1} $$\n\n**2. Matrice și Determinanți**\n\nNu uita proprietatea fundamentală: dacă două linii sau coloane sunt egale, determinantul este $0$. $$ \\det \\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix} = 0 $$`;
         }

         const ai = new GoogleGenAI({ apiKey: getKey() });
         const profilCurent = numeProfil || 'Matematică Generală';

         const prompt = `Ești un profesor de matematică expert care predă unui elev de la profilul: ${profilCurent}.
         Elevul tău tocmai a terminat un test și a greșit următoarele probleme/concepte:
         ${JSON.stringify(wrongAnswersPayload)}

         Generează o teorie detaliată și educativă bazată pe greșelile de mai sus, adaptată la nivelul profilului (${profilCurent}).

         REGULI STRICTE DE FORMATARE — respectă-le exact:
         1. NU folosi sintaxă Markdown: fără ###, fără ##, fără ---, fără *, fără -, fără > la început de rând.
         2. Separă capitolele cu o linie goală între ele.
         3. Titlul fiecărui capitol se scrie cu **text** (bold), de exemplu: **1. Ecuații de gradul II**
         4. Textul explicativ e scris normal, în propoziții clare.
         5. Formulele matematice se scriu OBLIGATORIU în LaTeX: inline între $ $ și pe rând separat între $$ $$.
         6. Fii încurajator și clar.`;

         const response = await generateWithFallback(ai, { contents: prompt });

         return response.text;
     } catch(error) {
         console.error("Eroare la apelarea Gemini API (generateTheory):", error.message);
         throw error;
     }
};


//functie in cazul in care AI pica 
const fallbackRandomSelect = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(q => q.idIntrebare);
};

// GENERARE TEST UTILIZAND SABLOANELE 
export const generateSyntheticQuestions = async (baseQuestions) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Nu s-a găsit GEMINI_API_KEY. Se va folosi fallback: testul va conține întrebările șablon nemodificate.");
            //ca fallback,returnăm clone ale intrebarilor primite, fara a le modifica.
            return baseQuestions.map(q => ({
                textIntrebare: q.textIntrebare,
                variantaA: q.variantaA,
                variantaB: q.variantaB,
                variantaC: q.variantaC,
                variantaD: q.variantaD,
                raspunsCorect: q.raspunsCorect,
                explicatieCorecta: q.explicatieCorecta || "Corect!",
                explicatieGreseli: q.explicatieGreseli || "Răspuns greșit.",
                idProfilMate: q.idProfilMate,
                nivel: q.nivel
            }));
        }

        const ai = new GoogleGenAI({ apiKey: getKey() });

        const questionsPayload = baseQuestions.map(q => ({
            id: q.idIntrebare,
            text: q.textIntrebare,
            vA: q.variantaA,
            vB: q.variantaB,
            vC: q.variantaC,
            vD: q.variantaD,
            raspunsCorect: q.raspunsCorect,
            explicatieCorecta: q.explicatieCorecta || "",
            explicatieGreseli: q.explicatieGreseli || ""
        }));

        const prompt = `Ești un profesor de matematică expert.
Cerință: Mai jos ai un set de ${baseQuestions.length} întrebări șablon din baza de date.
Pentru FIECARE întrebare, trebuie să creezi o VARIAȚIE care respectă STRICT aceste reguli:
1. Păstrează IDENTIC structura frazei, cuvintele, tipul de problemă și ordinea logică.
2. Schimbă DOAR valorile numerice (cifre, constante, coeficienți). De exemplu: dacă șablonul are "f(x) = x + 2, calculați f(3)", tu poți da "f(x) = x + 5, calculați f(7)".
3. NU schimba ce concept matematic se testează, NU adăuga/elimina termeni sau operații noi.
4. Recalculează corect care variantă (A/B/C/D) este răspunsul corect după schimbarea numerelor.
5. Actualizează variantele de răspuns cu valorile noi corespunzătoare.
6. Păstrează EXACT același stil de formatare ca originalul: dacă textul original nu conține markeri LaTeX ($...$), NU adăuga markeri LaTeX în varianta generată. Dacă originalul are LaTeX, păstrează-l.

Setul de șabloane:
${JSON.stringify(questionsPayload)}

Returnează DOAR un JSON fără markdown cu un ARRAY de ${baseQuestions.length} obiecte în ACEEAȘI ORDINE ca șabloanele primite:
{
  "textIntrebare": "Textul cu numerele noi. Păstrează EXACT același stil de formatare ca originalul — dacă originalul nu are LaTeX, nu adăuga $ ... $; dacă are, păstrează-l.",
  "variantaA": "...",
  "variantaB": "...",
  "variantaC": "...",
  "variantaD": "...",
  "raspunsCorect": "A, B, C sau D",
  "explicatieCorecta": "Explicația originală adaptată cu noile numere (nu rescrie de la zero, doar actualizează valorile numerice)",
  "explicatieGreseli": "Explicația originală de greșeli adaptată cu noile numere (nu rescrie de la zero, doar actualizează valorile numerice)"
}`;

        const response = await generateWithFallback(ai, {
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        let textOutput = response.text;
        let generatedQuestions = [];
        
        try {
            generatedQuestions = JSON.parse(textOutput);
            if (!Array.isArray(generatedQuestions)) throw new Error("Output is not an array");
        } catch(e) {
            console.error("Eroare la parsarea JSON-ului AI:", textOutput);
            //curatare fallback
            const match = textOutput.match(/\[[\s\S]*\]/);
            if(match) {
                 generatedQuestions = JSON.parse(match[0]);
            } else {
                 throw new Error("Cannot extract JSON array");
            }
        }

        //adaugam idProfilMate si nivel de la intrebarile sursa
        return generatedQuestions.map((q, idx) => ({
            textIntrebare: q.textIntrebare,
            variantaA: q.variantaA,
            variantaB: q.variantaB,
            variantaC: q.variantaC,
            variantaD: q.variantaD,
            raspunsCorect: q.raspunsCorect,
            explicatieCorecta: q.explicatieCorecta,
            explicatieGreseli: q.explicatieGreseli,
            idProfilMate: baseQuestions[idx] ? baseQuestions[idx].idProfilMate : baseQuestions[0].idProfilMate,
            nivel: baseQuestions[idx] ? baseQuestions[idx].nivel : baseQuestions[0].nivel
        }));

    } catch (error) {
        console.error("Eroare la generarea sintetică (AI FAILED):", error.message);
        //fallback la intrebarile de baza nemodificate 
        return baseQuestions.map(q => ({
            textIntrebare: q.textIntrebare,
            variantaA: q.variantaA,
            variantaB: q.variantaB,
            variantaC: q.variantaC,
            variantaD: q.variantaD,
            raspunsCorect: q.raspunsCorect,
            explicatieCorecta: q.explicatieCorecta || "Corect!",
            explicatieGreseli: q.explicatieGreseli || "Greșit.",
            idProfilMate: q.idProfilMate,
            nivel: q.nivel
        }));
    }
};
