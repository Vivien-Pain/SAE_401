// signUpStyles.ts
import { cva } from "class-variance-authority";

/**
 * Conteneur principal du formulaire d'inscription
 */
export const signUpContainer = cva(["space-y-4"]);

/**
 * Style générique pour le formulaire (flex-col, spacing...)
 */

export const SignUpTitle = cva([
  "text-2xl",
  "font-bold",
  "mb-4",
  "text-center",
  "ml-10"
]);

export const signUpForm = cva(["flex", "flex-col", "space-y-4"]);

/**
 * Input générique (email, username, password)
 */
export const signUpInput = cva([
  "w-full",
  "p-3",
  "border",
  "border-gray-300",
  "rounded-md",
]);

/**
 * Paragraphe pour la force du mot de passe
 */
export const passwordStrengthText = cva([
  "text-sm",
  "text-gray-600",
  "mt-1",
]);

/**
 * Liste des erreurs du mot de passe
 */
export const passwordErrorsList = cva([
  "text-sm",
  "text-red-500",
  "mt-2",
]);

/**
 * Message d'erreur global
 */
export const errorMessageText = cva([
  "text-red-500",
  "text-sm",
]);

/**
 * Bouton d'inscription
 */
export const submitButton = cva([
  "bg-blue-500",
  "text-white",
  "p-3",
  "rounded-md",
  "mt-4",
  "hover:opacity-90",
]);

/**
 * Conteneur pour la phrase "Vous avez déjà un compte ?"
 */
export const signUpFooter = cva(["text-center"]);

/**
 * Bouton pour passer à la connexion
 */
export const switchToLoginButton = cva([
  "text-purple-500",
  "font-normal",
  "hover:underline",
]);
