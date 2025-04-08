// postStyles.ts
import { cva } from "class-variance-authority";

export const postContainer = cva(
  [
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-lg",
    "shadow-lg",
    "p-6",
    "max-w-lg",
    "mx-auto",
  ],
  {
    variants: {
      // Exemple : variant "hidden" pour un post censuré ou bloqué
      hidden: {
        true: "opacity-50 pointer-events-none", // ou styles de censure 
        false: "",
      },
    },
    defaultVariants: {
      hidden: false,
    },
  }
);

export const postHeaderContainer = cva(["flex", "items-center", "mb-4"]);
export const postAuthorPicture = cva(["w-12", "h-12", "rounded-full", "mr-4"]);
export const postAuthorPicturePlaceholder = cva([
  "w-12",
  "h-12",
  "rounded-full",
  "bg-gray-300",
  "mr-4",
]);

export const postAuthorLink = cva([
  "text-lg",
  "font-semibold",
  "text-gray-800",
  "hover:underline",
]);

export const postAuthorDate = cva(["text-sm", "text-gray-500"]);

export const postTextContent = cva(["text-gray-700", "mb-4"]);

export const postMediaContainer = cva(["mb-4"]);
export const postMediaImage = cva(["w-full", "h-auto", "rounded-lg", "mb-2"]);

export const postFooterContainer = cva(["flex", "items-center", "justify-between"]);

export const likeButton = cva(["flex", "items-center"], {
  variants: {
    liked: {
      true: "text-red-500",
      false: "text-gray-500",
    },
  },
  defaultVariants: {
    liked: false,
  },
});

export const likeIcon = cva(["w-6", "h-6"]);
export const likeCount = cva(["ml-2"]);

export const retweetButton = cva(
  "flex items-center space-x-2 text-green-500 hover:text-green-600 font-semibold mt-2"
);

export const retweetModalContainer = cva(
  "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
);

export const retweetModalContent = cva(
  "bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-md flex flex-col gap-4"
);

export const retweetInput = cva(
  "w-full border rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
);

export const retweetSubmitButton = cva(
  "bg-green-500 text-white rounded-xl py-2 font-bold hover:bg-green-600"
);

export const replyButton = cva(["text-blue-500", "hover:underline", "mt-4"]);
export const replyFieldContainer = cva(["mt-4"]);
export const replyTextarea = cva([
  "w-full",
  "p-3",
  "border",
  "border-gray-300",
  "rounded-lg",
  "mb-2",
]);
export const replySubmitButton = cva([
  "bg-blue-500",
  "hover:bg-blue-600",
  "text-white",
  "px-4",
  "py-2",
  "rounded-lg",
]);

export const repliesContainer = cva(["mt-6", "border-t", "pt-4", "space-y-4"]);
export const singleReply = cva(["bg-gray-100", "p-4", "rounded-lg"]);
export const replyHeader = cva(["text-sm", "text-gray-600"]);
export const replyMediaImage = cva(["max-w-xs", "rounded-lg", "mt-2"]);
