export const funnyMessages = [
  "C'est le destin qui l'a voulu! 🌟",
  "C'est écrit dans les étoiles! ✨",
  "Les dieux de la gastronomie ont parlé! 🍽️",
  "Ton estomac a choisi pour toi! 🤤",
  "Le hasard fait bien les choses! 🎲",
  "C'est un signe du cosmos! 🌌",
  "Ton futur repas t'attend! 🍴",
  "La roulette culinaire a tranché! 🎰",
  "C'est parti pour l'aventure gustative! 🚀",
  "Le sort en est jeté! 🎯",
  "Ton palais va être aux anges! 😇",
  "C'est le choix de l'univers! 🌍",
  "Ta papille gustative a décidé! 👅",
  "C'est magique, non? ✨",
  "Le hasard a bon goût! 😋",
  "C'est ton restaurant du jour! ☀️",
  "La chance sourit aux affamés! 🍀",
  "C'est écrit dans ton assiette! 🍽️",
  "Le destin culinaire frappe! ⚡",
  "C'est parti pour la découverte! 🗺️"
];

export const loadingMessages = [
  "Je consulte les étoiles... ⭐",
  "Je mélange les cartes... 🃏",
  "Je lance les dés... 🎲",
  "Je tourne la roulette... 🎰",
  "Je cherche dans ma boule de cristal... 🔮",
  "Je demande à l'oracle... 🧙‍♂️",
  "Je consulte le grand livre des saveurs... 📚",
  "Je fais tourner la roue de la fortune... 🎡",
  "Je tire au sort... 🎫",
  "Je consulte mon sixième sens... 👁️"
];

export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};
