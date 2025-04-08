// profilePageStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur global de la page de profil.
 */
export const profilePageContainer = cva([
  "bg-slate-50",
  "min-h-screen",
]);

/**
 * Conteneur principal (centrage, spacing, etc.).
 */
export const profileMainWrapper = cva([
  "max-w-3xl",
  "mx-auto",
  "pb-8",
]);

/**
 * Conteneur de la bannière (image) et de la photo de profil.
 */
export const bannerContainer = cva([
  "relative",
]);

/**
 * Classes pour la bannière (image).
 */
export const bannerImage = cva([
  "w-full",
  "h-48",
  "object-cover",
  "shadow-sm",
]);

/**
 * Classe pour la photo de profil (image).
 */
export const profilePicture = cva([
  "w-24",
  "h-24",
  "rounded-full",
  "border-4",
  "border-white",
  "shadow-md",
  "absolute",
  "-bottom-12",
  "left-6",
]);

/**
 * Conteneur des infos utilisateur.
 */
export const profileInfoContainer = cva([
  "bg-white",
  "shadow-md",
  "rounded",
  "mt-16",
  "p-4",
]);

/**
 * Nom d'utilisateur (username).
 */
export const profileUsername = cva([
  "text-2xl",
  "font-bold",
]);

/**
 * Wrapper regroupant la bio et les boutons d'action.
 */
export const profileInfoRow = cva([
  "flex",
  "flex-col",
  "sm:flex-row",
  "sm:items-center",
  "sm:justify-between",
  "mt-2",
]);

/**
 * Conteneur des informations textuelles (bio, location, website).
 */
export const profileTextInfo = cva([
  "text-gray-700",
  "space-y-1",
]);

/**
 * Classe pour le site web / location, etc.
 */
export const profileLocationWebsite = cva([
  "text-sm",
  "text-gray-500",
]);

/**
 * Conteneur pour les boutons d'action.
 */
export const actionButtonsContainer = cva([
  "mt-4",
  "sm:mt-0",
  "space-x-2",
]);

/**
 * Style générique pour les boutons.
 * Vous pourriez créer plus de variants selon le rôle (primaire, danger, etc.)
 */
export const actionButton = cva(
  [
    "px-4",
    "py-2",
    "text-white",
    "rounded",
    "hover:opacity-90",
  ],
  {
    variants: {
      color: {
        cyan: "bg-cyan-500 hover:bg-cyan-600",
        purple: "bg-purple-500 hover:bg-purple-600",
        red: "bg-red-500",
        green: "bg-green-500",
        gray: "bg-gray-500",
        yellow: "bg-yellow-500 hover:bg-yellow-600",
      },
    },
    defaultVariants: {
      color: "cyan",
    },
  }
);

/**
 * Conteneur du formulaire de modification de profil.
 */
export const editProfileFormContainer = cva([
  "bg-white",
  "shadow-md",
  "rounded",
  "mt-4",
  "p-4",
  "space-y-4",
]);

/**
 * Style pour les champs de saisie (input / textarea) du formulaire de profil.
 */
export const editProfileInput = cva([
  "border",
  "p-2",
  "rounded",
  "w-full",
]);

/**
 * Conteneur du Post "épinglé".
 */
export const pinnedPostContainer = cva([
  "mt-6",
  "bg-white",
  "shadow-md",
  "rounded",
  "p-4",
]);

/**
 * Titre de la section "Post épinglé".
 */
export const pinnedPostTitle = cva([
  "text-lg",
  "font-bold",
  "mb-2",
]);

/**
 * Conteneur de la liste des posts.
 */
export const postsListContainer = cva([
  "mt-6",
]);

/**
 * Titre de la section "Posts".
 */
export const postsListTitle = cva([
  "text-xl",
  "font-semibold",
  "mb-4",
]);

/**
 * Conteneur d'un post (carte).
 */
export const singlePostContainer = cva([
  "mb-6",
  "bg-white",
  "shadow",
  "rounded",
  "p-4",
]);

/**
 * Textes "Aucun post trouvé"
 */
export const noPostText = cva([
  "text-gray-500",
]);

/**
 * Zone d'édition du post
 */
export const editPostTextarea = cva([
  "w-full",
  "border",
  "p-2",
  "rounded",
]);

/**
 * Conteneur des boutons d'action sur un post.
 */
export const postActionButtonsContainer = cva([
  "flex",
  "gap-2",
  "mt-2",
]);
