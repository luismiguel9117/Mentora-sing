export const database = {
  units: [
    {
      id: 1,
      title: "Unidad 1: Comunicación y Éxito Profesional",
      description: "Aprende los términos clave que usan los líderes y mentores en el día a día corporativo.",
      lessons: [
        {
          id: "u1_l1",
          title: "Conceptos Clave de Comunicación",
          description: "Domina palabras como 'Feedback' y 'Breakthrough' para expresar ideas de mejora y éxito.",
          xpReward: 20,
          words: [
            {
              id: "feedback",
              word: "Feedback",
              phonetic: "/ˈfiːd.bæk/",
              meaning: "Retroalimentación / Opinión constructiva",
              explanation: "Información u opiniones sobre el trabajo de alguien, usada como base para la mejora.",
              example: "Our mentor gave us valuable feedback on our project presentation.",
              exampleTranslation: "Nuestro mentor nos dio una valiosa retroalimentación sobre la presentación de nuestro proyecto.",
              videoUrl: "https://www.youtube.com/embed/m5yCOSHeYn4?start=12&end=25&autoplay=0&mute=0",
              caption: "Bill Gates explica por qué todos necesitamos 'feedback' para mejorar.",
              audioText: "Feedback"
            },
            {
              id: "breakthrough",
              word: "Breakthrough",
              phonetic: "/ˈbreɪk.θruː/",
              meaning: "Avance crucial / Gran descubrimiento",
              explanation: "Un descubrimiento científico, tecnológico o de desarrollo personal que supera un gran obstáculo.",
              example: "Scientists made a major breakthrough in green energy technology.",
              exampleTranslation: "Los científicos lograron un avance crucial en la tecnología de energía limpia.",
              videoUrl: "https://www.youtube.com/embed/vC7q5h7JXa8?start=45&end=60&autoplay=0&mute=0",
              caption: "Demostración de un gran avance ('breakthrough') en inteligencia artificial.",
              audioText: "Breakthrough"
            }
          ],
          quizzes: [
            {
              id: "q1",
              type: "video_select",
              word: "feedback",
              question: "Escucha el video. ¿Qué término utiliza Bill Gates para referirse a la retroalimentación que nos ayuda a mejorar?",
              options: ["Feedforward", "Feedback", "Focus group"],
              correctIndex: 1,
              videoUrl: "https://www.youtube.com/embed/m5yCOSHeYn4?start=12&end=25"
            },
            {
              id: "q2",
              type: "meaning_match",
              word: "breakthrough",
              question: "¿Cuál es la traducción correcta de 'Breakthrough'?",
              options: ["Un descanso", "Un obstáculo insuperable", "Un avance crucial o descubrimiento"],
              correctIndex: 2
            },
            {
              id: "q3",
              type: "fill_blank",
              question: "Completa la oración: 'Our mentor gave us valuable ______ on our project.'",
              options: ["feedback", "breakthrough", "breakout"],
              correctIndex: 0
            }
          ]
        },
        {
          id: "u1_l2",
          title: "Colaboración y Liderazgo",
          description: "Aprende los términos clave 'Milestone', 'Synergy' y 'Empower' para liderar proyectos en equipo.",
          xpReward: 30,
          words: [
            {
              id: "milestone",
              word: "Milestone",
              phonetic: "/ˈmaɪl.stoʊn/",
              meaning: "Hito / Logro importante",
              explanation: "Un evento muy importante en el desarrollo o historia de algo o alguien.",
              example: "Reaching 1,000 active users is a major milestone for our startup.",
              exampleTranslation: "Alcanzar 1,000 usuarios activos es un hito importante para nuestra empresa.",
              videoUrl: "https://www.youtube.com/embed/wbSwFU6tY1c?start=85&end=98&autoplay=0&mute=0",
              caption: "El aterrizaje doble de SpaceX representa un hito ('milestone') en la aeroespacial.",
              audioText: "Milestone"
            },
            {
              id: "synergy",
              word: "Synergy",
              phonetic: "/ˈsɪn.ɚ.dʒi/",
              meaning: "Sinergia / Trabajo en equipo potenciado",
              explanation: "La acción combinada de dos o más organizaciones o personas para lograr un efecto mayor que la suma de sus efectos individuales.",
              example: "The synergy between the marketing and design teams created a beautiful campaign.",
              exampleTranslation: "La sinergia entre los equipos de marketing y diseño creó una hermosa campaña.",
              videoUrl: "https://www.youtube.com/embed/5a17V1h8gL8?start=35&end=50&autoplay=0&mute=0",
              caption: "Steve Jobs habla sobre la sinergia y el trabajo colaborativo en Pixar.",
              audioText: "Synergy"
            },
            {
              id: "empower",
              word: "Empower",
              phonetic: "/ɪmˈpaʊ.ɚ/",
              meaning: "Empoderar / Capacitar",
              explanation: "Dar a alguien la autoridad, libertad o poder de hacer algo, o aumentar su confianza y control.",
              example: "A good mentor aims to empower students to reach their full potential.",
              exampleTranslation: "Un buen mentor busca empoderar a los estudiantes para que alcancen su máximo potencial.",
              videoUrl: "https://www.youtube.com/embed/3rNhZu3ttIU?start=70&end=85&autoplay=0&mute=0",
              caption: "Malala en la ONU habla sobre cómo el acceso a la educación logra empoderar ('empower') a las raíces de la sociedad.",
              audioText: "Empower"
            }
          ],
          quizzes: [
            {
              id: "q4",
              type: "meaning_match",
              word: "milestone",
              question: "El término 'Milestone' hace referencia a:",
              options: ["Una piedra en el camino", "Un hito o logro muy importante", "Una meta final inalcanzable"],
              correctIndex: 1
            },
            {
              id: "q5",
              type: "video_select",
              word: "empower",
              question: "Según el video de Malala, ¿cuál es el objetivo de educar?",
              options: ["Empoderar a las personas", "Controlar la sociedad", "Crear barreras"],
              correctIndex: 0,
              videoUrl: "https://www.youtube.com/embed/3rNhZu3ttIU?start=70&end=85"
            },
            {
              id: "q6",
              type: "fill_blank",
              question: "Completa la oración: 'The combined effort created a ______ that doubled our sales.'",
              options: ["milestone", "feedback", "synergy"],
              correctIndex: 2
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Unidad 2: Estrategia y Ejecución",
      description: "Domina el vocabulario avanzado para la toma de decisiones estratégicas.",
      lessons: [
        {
          id: "u2_l1",
          title: "Optimización de Recursos",
          description: "Aprende términos como 'Leverage' y 'Outsource' para maximizar la eficiencia.",
          xpReward: 20,
          words: [
            {
              id: "leverage",
              word: "Leverage",
              phonetic: "/ˈlev.ɚ.ɪdʒ/",
              meaning: "Apalancar / Aprovechar al máximo",
              explanation: "Utilizar algo existente (recursos, contactos, tecnología) para obtener una ventaja o un mejor resultado.",
              example: "We can leverage our social media presence to attract new clients.",
              exampleTranslation: "Podemos apalancar nuestra presencia en redes sociales para atraer nuevos clientes.",
              videoUrl: "https://www.youtube.com/embed/5a17V1h8gL8?start=90&end=105&autoplay=0&mute=0",
              caption: "Steve Jobs discutiendo el apalancamiento ('leverage') en la creación de software.",
              audioText: "Leverage"
            }
          ],
          quizzes: [
            {
              id: "q7",
              type: "meaning_match",
              word: "leverage",
              question: "¿Qué significa 'Leverage' en un contexto de negocios?",
              options: ["Crear una desventaja", "Aprovechar o apalancar recursos para obtener ventaja", "Disminuir la productividad"],
              correctIndex: 1
            }
          ]
        }
      ]
    }
  ]
};
