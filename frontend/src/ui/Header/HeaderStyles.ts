// headerStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur principal du Header
 */
export const headerContainer = cva(
  [
    "flex",
    "flex-col",
    "items-center",
    "w-full",
    "border-b",
    "bg-white",
    "shadow-md",
  ],
  {
    variants: {
      // Exemple de variable pour la couleur de bordure
      borderColor: {
        teal: "border-teal-100",
        gray: "border-gray-200",
      },
    },
    defaultVariants: {
      borderColor: "teal",
    },
  }
);

/**
 * Conteneur du logo / svg
 */
export const svgContainer = cva([
  "flex",
  "w-full",
  "justify-center",
  "items-center",
  "py-3",
]);

/**
 * Conteneur pour la partie texte sous le logo
 */
export const textContainer = cva(["mt-4"]);

/**
 * Style du paragraphe "Bienvenue ..."
 */
export const welcomeText = cva(
  [
    "text-xl",
    "text-gray-600",
    "font-medium",
    "-mt-6",
    "mb-2",
    "tracking-wide",
  ],
  {
    variants: {
      // Exemple de variable pour la couleur de surlignage
      highlightColor: {
        purple: "text-purple-500",
        teal: "text-teal-500",
      },
    },
    defaultVariants: {
      highlightColor: "purple",
    },
  }
);

/**
 * Style du nom d'utilisateur
 */
export const usernameText = cva([], {
  variants: {
    color: {
      purple: "text-purple-500",
      teal: "text-teal-500",
      pink: "text-pink-500",
    },
  },
  defaultVariants: {
    color: "purple",
  },
});
