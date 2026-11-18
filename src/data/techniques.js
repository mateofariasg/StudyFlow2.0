/* Técnicas de estudio incluidas en la app. */

export const TECHNIQUES = [
  {
    id: 'pomodoro',
    name: 'Técnica Pomodoro',
    desc: 'Divide el estudio en bloques de 25 minutos con descansos de 5 minutos para mantener el foco.',
    icon: 'ri-timer-flash-line',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    difficulty: 1,
    steps: [
      'Elige una tarea a realizar.',
      'Configura el temporizador en 25 minutos.',
      'Trabaja en la tarea hasta que suene la alarma.',
      'Toma un descanso de 5 minutos.',
      'Cada 4 pomodoros, toma un descanso de 15-30 minutos.',
    ],
  },
  {
    id: 'feynman',
    name: 'Método Feynman',
    desc: 'Aprende explicando el concepto con tus propias palabras, como si se lo explicaras a un niño.',
    icon: 'ri-lightbulb-flash-line',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    difficulty: 2,
    steps: [
      'Elige un concepto que deseas entender.',
      'Explícalo en papel con palabras simples, sin tecnicismos.',
      'Identifica los vacíos en tu explicación.',
      'Vuelve al material original para llenar esos vacíos.',
      'Simplifica y usa analogías hasta que suene claro.',
    ],
  },
  {
    id: 'cornell',
    name: 'Apuntes Cornell',
    desc: 'Sistema de notas estructurado en columnas: ideas principales, notas detalladas y resumen final.',
    icon: 'ri-file-list-2-line',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    difficulty: 2,
    steps: [
      'Divide la página: columna izquierda (preguntas) y derecha (notas).',
      'Durante la clase escribe notas en la columna derecha.',
      'Luego formula preguntas clave en la columna izquierda.',
      'Resume la clase en la parte inferior de la hoja.',
      'Repasa cubriendo las notas y respondiendo tus preguntas.',
    ],
  },
  {
    id: 'mindmap',
    name: 'Mapas Mentales',
    desc: 'Representación visual de ideas conectadas desde un concepto central para facilitar la memorización.',
    icon: 'ri-mind-map',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    difficulty: 2,
    steps: [
      'Escribe el tema central en el medio de la hoja.',
      'Añade ramas principales con los subtemas más importantes.',
      'Añade sub-ramas con detalles, fechas o ejemplos.',
      'Usa colores, íconos o dibujos para reforzar la memoria.',
      'Revisa el mapa completado para consolidar el aprendizaje.',
    ],
  },
  {
    id: 'spaced',
    name: 'Repetición Espaciada',
    desc: 'Repasa el material en intervalos crecientes de tiempo para fortalecer la memoria a largo plazo.',
    icon: 'ri-calendar-check-line',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    difficulty: 3,
    steps: [
      'Aprende el material por primera vez.',
      'Repasa al día siguiente.',
      'Repasa a los 3 días siguientes.',
      'Repasa a la semana.',
      'Repasa al mes. Ajusta los intervalos según tu recuerdo.',
    ],
  },
  {
    id: 'recall',
    name: 'Recall Activo',
    desc: 'En lugar de releer, cierra el libro y escribe todo lo que recuerdas. Refuerza las conexiones neurales.',
    icon: 'ri-brain-line',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    difficulty: 3,
    steps: [
      'Lee una sección del material una sola vez.',
      'Cierra el libro y escribe todo lo que recuerdas.',
      'Compara tus notas con el material original.',
      'Identifica lo que olvidaste y reléelo.',
      'Repite el proceso hasta que puedas recordar todo.',
    ],
  },
];

// Técnicas que tienen plantilla interactiva.
export const TEMPLATE_IDS = TECHNIQUES.map((t) => t.id);

export const METHOD_META = {
  pomodoro: { emoji: '🍅', name: 'Técnica Pomodoro' },
  feynman: { emoji: '💡', name: 'Método Feynman' },
  cornell: { emoji: '📝', name: 'Apuntes Cornell' },
  mindmap: { emoji: '🧠', name: 'Mapa Mental' },
  spaced: { emoji: '🔄', name: 'Repetición Espaciada' },
  recall: { emoji: '🎯', name: 'Recall Activo' },
};
