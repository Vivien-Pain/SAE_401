// searchStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur du formulaire de recherche
 */
export const searchForm = cva([
  "w-full",
  "flex",
  "items-center",
  "p-2",
]);

/**
 * Champ de saisie (input)
 */
export const searchInput = cva([
  "flex-grow",
  "p-2",
  "rounded-l-lg",
  "border",
  "border-gray-300",
  "focus:outline-none",
]);

/**
 * Bouton de recherche
 */
export const searchButton = cva([
  "bg-blue-500",
  "text-white",
  "p-2",
  "rounded-r-lg",
  "hover:bg-blue-600",
]);
