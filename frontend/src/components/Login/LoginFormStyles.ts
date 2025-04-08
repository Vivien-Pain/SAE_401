// loginStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur principal (pour centrer verticalement/horizontalement).
 */
export const loginContainer = cva([
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "w-full",
   "h-96", 
]);

/**
 * Titre de la page (h1).
 */
export const loginTitle = cva([
  "text-2xl",
  "font-bold",
  "mb-4",
]);

/**
 * Formulaire de connexion (largeur 80, espacement vertical).
 */
export const loginForm = cva([
  "w-80",
  "space-y-4",
]);

/**
 * Champs de saisie (email, password).
 */
export const loginInput = cva([
  "w-full",
  "p-3",
  "border",
  "rounded-md",
]);

/**
 * Message d’erreur.
 */
export const errorMessageText = cva([
  "text-red-500",
]);

/**
 * Bouton de connexion.
 */
export const loginButton = cva([
  "w-full",
  "bg-blue-500",
  "text-white",
  "p-3",
  "rounded-md",
  "hover:opacity-90",
]);

/**
 * Texte "Pas encore de compte ?"
 */
export const signupText = cva([
  "mt-4",
]);

/**
 * Bouton pour passer à l’inscription.
 */
export const switchSignupButton = cva([
  "text-purple-500",
  "hover:underline",
]);
