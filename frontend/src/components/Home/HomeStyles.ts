// homeStyles.ts
import { cva } from "class-variance-authority";

// Conteneur général de la page Home
export const homeContainer = cva([
  "flex",
  "flex-col",
  "min-h-screen",
  "items-center",
  "bg-white",
]);

// Conteneur où s'affichent les posts (zone scrollable, etc.)
export const postsContainer = cva([
  "flex-grow",
  "w-full",
  "max-w-md",
  "space-y-6",
  "p-4",
  "overflow-auto",
]);

// Conteneur pour afficher un message "Aucun post disponible"
export const noPostsContainer = cva([
  "flex",
  "justify-center",
  "items-center",
  "h-64",
]);

// Conteneur pour la NavBar (fixé en bas)
export const navBarContainer = cva(["fixed", "bottom-0", "w-full"]);
