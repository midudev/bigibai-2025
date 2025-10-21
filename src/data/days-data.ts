const DESCRIPTIONS = [
  "Como las 24 casillas del calendario de Adviento de Ibai",
  "Momento perfecto para decorar el árbol con más LEDs que el setup de Ander",
  "Ya puedes poner el Belén en casa",
  "Tres semanas para preparar las recetas navideñas",
  "Momento ideal para escribir la carta a los Reyes Magos",
  "Las luces de la ciudad empiezan a brillar",
  "Los mercadillos navideños abren sus puertas y el chat pregunta si se puede pagar con subs",
  "Hora de empezar con las compras de regalos",
  "Los villancicos suenan en todas partes",
  "Quince días para hornear las galletas navideñas",
  "Dos semanas para ultimar los detalles",
  "Trece días de espera, suficiente para maratonear todos los eventos de la Velada",
  "Doce días para celebrar",
  "Los calcetines ya cuelgan de la chimenea",
  "Solo diez días más",
  "Nueve renos tirando del trineo de Santa",
  "Una semana y un día: tiempo justo para suscribirte a Ibai con Prime",
  "Una semana exacta",
  "Los regalos empiezan a acumularse bajo el árbol, ¿alguno será un funko de Ibai?",
  "Cinco días nada más",
  "Las cuatro velas de la Corona de Adviento ya brillan",
  "Como los tres Reyes Magos viajando hacia Belén viendo un stream de Ibai",
  "Las últimas compras antes de la gran celebración",
  "¡Mañana es Navidad! El momento más esperado del año"
];

function getDescriptionForDay(day: number): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Calcular días hasta Navidad
  let christmas = new Date(currentYear, 11, 25);
  if (today > christmas) {
    christmas = new Date(currentYear + 1, 11, 25);
  }
  const daysUntil = Math.max(0, Math.ceil((christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Obtener día actual (0 si no estamos en diciembre)
  const currentDay = today.getMonth() === 11 ? today.getDate() : 0;
  
  // Si el día ya pasó o es hoy, descripción personalizada
  return day <= currentDay 
    ? DESCRIPTIONS[day - 1]
    : `y ${daysUntil} días para Navidad - Casilla ${day}/24`;
}

export const cells = Array.from({ length: 24 }, (_, i) => ({
  day: i + 1,
  description: getDescriptionForDay(i + 1)
}));
