// postModalStyles.ts
import { cva } from "class-variance-authority";

/**
 * Overlay de la modal (fond semi-transparent, centré, etc.)
 */
export const modalOverlay = cva([
  "fixed",
  "inset-0",
  "flex",
  "justify-center",
  "items-center",
  "bg-gray-800",
  "bg-opacity-60",
  "z-50",
]);

/**
 * Conteneur principal de la modal
 */
export const modalContainer = cva([
  "bg-white",
  "p-6",
  "rounded-2xl",
  "w-96",
  "shadow-xl",
  "relative",
]);

/**
 * Titre de la modal ("Créer un Post")
 */
export const modalTitle = cva([
  "text-xl",
  "font-bold",
  "mb-4",
]);

/**
 * Zone de texte pour le contenu du post
 */
export const contentTextarea = cva([
  "w-full",
  "h-24",
  "p-2",
  "border",
  "border-gray-300",
  "rounded-lg",
  "mb-4",
  "resize-none",
]);

/**
 * Input pour sélectionner les fichiers
 */
export const fileInput = cva([
  "mb-4",
]);

/**
 * Conteneur pour l'affichage des previews (images / vidéos)
 */
export const previewsContainer = cva([
  "flex",
  "flex-wrap",
  "gap-2",
  "mb-4",
]);

/**
 * Wrapper pour chaque média (image ou vidéo) + bouton de suppression
 */
export const singlePreviewWrapper = cva([
  "w-24",
  "h-24",
  "relative",
  "group",
]);

/**
 * Style de l'image / vidéo (ici `object-cover`, `rounded-lg`)
 */
export const previewMedia = cva([
  "w-full",
  "h-full",
  "object-cover",
  "rounded-lg",
]);

/**
 * Bouton de suppression sur chaque média (croix rouge)
 */
export const removeMediaButton = cva([
  "absolute",
  "top-0",
  "right-0",
  "bg-red-500",
  "text-white",
  "rounded-full",
  "p-1",
  "text-xs",
  "hidden",
  "group-hover:block",
]);

/**
 * Liste des noms de fichiers sélectionnés
 */
export const fileNamesList = cva([
  "text-xs",
  "mb-4",
]);

/**
 * Message d'erreur
 */
export const errorMessageText = cva([
  "text-red-500",
  "text-sm",
  "mb-2",
]);

/**
 * Conteneur des boutons "Annuler" / "Publier"
 */
export const modalButtonsContainer = cva([
  "flex",
  "justify-between",
  "items-center",
]);

/**
 * Bouton "Annuler"
 */
export const cancelButton = cva([
  "bg-gray-300",
  "text-gray-700",
  "px-4",
  "py-2",
  "rounded-lg",
  "hover:opacity-90",
]);

/**
 * Bouton "Publier" (avec un état "disabled" / "isSubmitting" ?)
 */
export const publishButton = cva(
  [
    "text-white",
    "px-4",
    "py-2",
    "rounded-lg",
    "transition",
  ],
  {
    variants: {
      isSubmitting: {
        true: "bg-gray-400",
        false: "bg-purple-600 hover:bg-purple-700",
      },
    },
    defaultVariants: {
      isSubmitting: false,
    },
  }
);
