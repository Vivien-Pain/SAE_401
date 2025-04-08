// navBarStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur principal de la NavBar
 */
export const navBarContainer = cva(
  [
    "fixed",
    "bottom-0",
    "w-full",
    "bg-white",
    "py-4",
    "px-6",
    "shadow-xl",
    "flex",
    "justify-center",
    "items-center",
  ],
  {
    variants: {
      // Exemple : on pourrait vouloir gérer la position (bottom ou top)
      position: {
        bottom: ["bottom-0"],
        top: ["top-0"],
      },
      // Exemple : gérer un thème color (light / dark)
      theme: {
        light: "bg-white",
        dark: "bg-gray-800 text-white",
      },
    },
    defaultVariants: {
      position: "bottom",
      theme: "light",
    },
  }
);

/**
 * Conteneur interne (pour les icônes, etc.)
 */
export const navBarContent = cva(["flex", "justify-between", "items-center", "w-full", "max-w-md"]);

/**
 * Style des liens / boutons génériques
 */
export const navBarButton = cva(["flex", "flex-col", "items-center"], {
  variants: {
    // Exemple : on pourrait gérer un état "disabled"
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "",
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

/**
 * Style d’une image de profil (si présente)
 */
export const navBarProfileImage = cva(["w-8", "h-8", "cursor-pointer", "rounded-full", "border-2", "border-cyan-400"]);

/**
 * Style d’une icône (pour la taille par défaut)
 */
export const navBarIcon = cva(["w-8", "h-8", "cursor-pointer"]);
