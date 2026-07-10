import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './MathText.css';

// Componenta care randeaza text normal amestecat cu formule matematice LaTeX
const MathText = ({ text = "", style = {} }) => {
  // ref catre elementul div din DOM unde scriem continutul
  const containerRef = useRef(null);

  useEffect(() => {
    // daca containerul nu exista inca, nu face nimic
    if (!containerRef.current) return;

    // imparte textul in bucati: text normal si formule matematice ($...$ sau $$...$$)
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    // sterge continutul vechi inainte de a rescrie
    containerRef.current.innerHTML = "";

    parts.forEach(part => {
      const span = document.createElement('span');

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // formula mare (bloc separat) - ex: $$x^2 + 1$$
        const math = part.slice(2, -2);
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch (e) {
          // daca KaTeX nu poate randa, afiseaza textul brut
          span.textContent = part;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // formula mica (inline, in linie cu textul) - ex: $x^2$
        const math = part.slice(1, -1);
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.textContent = part;
        }
      } else {
        // text normal - suporta **bold** si randuri noi
        const textParts = part.split(/(\*\*[\s\S]+?\*\*)/g);
        textParts.forEach(tp => {
          if (tp.startsWith('**') && tp.endsWith('**')) {
            // text intre ** devine bold
            const subSpan = document.createElement('span');
            subSpan.style.fontWeight = 'bold';
            subSpan.textContent = tp.slice(2, -2);
            span.appendChild(subSpan);
          } else {
            // doua randuri goale = paragraf nou (2 x <br>)
            const paragraphs = tp.split(/\n\n+/);
            paragraphs.forEach((para, i) => {
              if (i > 0) {
                span.appendChild(document.createElement('br'));
                span.appendChild(document.createElement('br'));
              }
              // un rand nou = <br>
              const lines = para.split('\n');
              lines.forEach((line, j) => {
                if (j > 0) span.appendChild(document.createElement('br'));
                const lineSpan = document.createElement('span');
                lineSpan.textContent = line;
                span.appendChild(lineSpan);
              });
            });
          }
        });
      }

      containerRef.current.appendChild(span);
    });
  }, [text]); // ruleaza din nou doar cand se schimba textul

  return (
    <div ref={containerRef} className="math-text-container" style={style}></div>
  );
};

export default MathText;
