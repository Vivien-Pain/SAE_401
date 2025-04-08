import { cva } from "class-variance-authority";

/**
 * Definition des styles via cva()
 */
export const SignUpLogin = cva(
  // Classes de base, communes à tous les boutons
  "p-3 rounded-md font-medium transition-colors focus:outline-none",
  {
    // Définition des variantes
    variants: {
      variant: {
        purple: "bg-purple-500 text-white hover:bg-purple-600",
        // Vous pouvez ajouter d'autres variantes ici
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        // Vous pouvez ajouter d'autres tailles ici
      },
    },
    // Valeurs par défaut
    defaultVariants: {
      variant: "purple",
      size: "md",
    },
  }
);