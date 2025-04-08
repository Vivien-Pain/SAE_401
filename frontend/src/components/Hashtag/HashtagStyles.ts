// hashtagPageStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur principal de la page (flex-col, centré, etc.)
 */
export const hashtagPageContainer = cva([
  "flex",
  "flex-col",
  "items-center",
  "p-4",
]);

/**
 * Titre (nom du hashtag)
 */
export const hashtagTitle = cva([
  "text-2xl",
  "font-bold",
  "mb-4",
  "text-blue-500",
]);

/**
 * Conteneur pour la liste des posts
 */
export const postsContainer = cva([
  "w-full",
  "max-w-md",
  "space-y-4",
]);

/**
 * Message affiché s'il n'y a aucun post
 */
export const noPostsMessage = cva([]);
