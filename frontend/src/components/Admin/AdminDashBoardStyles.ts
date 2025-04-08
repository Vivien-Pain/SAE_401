// adminDashboardStyles.ts

import { cva } from "class-variance-authority";

/**
 * Conteneur principal de la page d'administration
 */
export const adminDashboardContainer = cva([
  "p-4",
  "md:p-6",
]);

/**
 * Titre principal (Dashboard Admin)
 */
export const adminDashboardTitle = cva([
  "text-2xl",
  "font-bold",
  "mb-6",
  "text-center",
]);

/**
 * Conteneur de la section de gestion des utilisateurs
 */
export const usersSectionContainer = cva([
  "mb-10",
]);

/**
 * Sous-titre (Gestion des utilisateurs / Modération des contenus)
 */
export const sectionSubtitle = cva([
  "text-xl",
  "font-semibold",
  "mb-4",
]);

/**
 * Tableau des utilisateurs
 */
export const usersTable = cva([
  "w-full",
  "border-collapse",
  "border",
  "border-gray-300",
]);

/**
 * Ligne d'en-tête du tableau des utilisateurs
 */
export const usersTableHeaderRow = cva([
  "bg-gray-200",
]);

/**
 * Cellules d'en-tête (th)
 */
export const usersTableHeaderCell = cva([
  "border",
  "border-gray-300",
  "p-2",
]);

/**
 * Cellules de données (td)
 */
export const usersTableDataCell = cva([
  "border",
  "border-gray-300",
  "p-2",
  "text-center",
]);

/**
 * Bouton pour bloquer/débloquer un utilisateur
 */
export const blockToggleButton = cva(
  [
    "px-4",
    "py-1",
    "rounded",
    "text-white",
  ],
  {
    variants: {
      blocked: {
        true: "bg-red-500",
        false: "bg-green-500",
      },
    },
    defaultVariants: {
      blocked: false,
    },
  }
);

/**
 * Liste de modération des posts
 */
export const postsList = cva([
  "space-y-4",
]);

/**
 * Card (liste) pour chaque post
 */
export const singlePostItem = cva([
  "p-4",
  "border",
  "rounded",
  "shadow",
]);

/**
 * Métadonnées du post (Posté par ...)
 */
export const postMeta = cva([
  "text-sm",
  "text-gray-500",
]);

/**
 * Contenu du post
 */
export const postContentText = cva([
  "text-md",
  "my-2",
]);

/**
 * Conteneur des boutons (Censurer / Supprimer)
 */
export const postButtonsContainer = cva([
  "flex",
  "space-x-2",
]);

/**
 * Bouton "Censurer" (rouge)
 */
export const censorButton = cva([
  "bg-red-500",
  "text-white",
  "px-3",
  "py-1",
  "rounded",
]);

/**
 * Bouton "Supprimer" (gris)
 */
export const deleteButton = cva([
  "bg-gray-700",
  "text-white",
  "px-3",
  "py-1",
  "rounded",
]);
