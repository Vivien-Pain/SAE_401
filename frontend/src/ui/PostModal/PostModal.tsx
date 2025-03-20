import { useState } from "react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void; // Cette fonction sera utilisée pour ajouter le post localement
}

const PostModal = ({ isOpen, onClose, onSubmit }: PostModalProps) => {
  const [content, setContent] = useState(""); // Contenu du post
  const [isSubmitting, setIsSubmitting] = useState(false); // Pour éviter l'envoi multiple

  // Fonction pour soumettre le post à l'API
  const handleSubmit = async () => {
    if (content.trim()) {
      setIsSubmitting(true);
      try {
        // Envoyer le contenu du post à l'API avec fetch
        const response = await fetch("http://localhost:8080/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Indiquer que les données envoyées sont en JSON
          },
          body: JSON.stringify({ content }), // Le corps de la requête contient le texte du post
        });

        // Vérifier si la requête a réussi
        if (response.ok) {
          // Si la requête réussit, ajouter le post en local
          onSubmit(content); // Ajouter le post localement dans le parent
          setContent(""); // Réinitialiser le contenu du textarea
          onClose(); // Fermer la modal
        } else {
          throw new Error("Erreur lors de la création du post.");
        }
      } catch (error) {
     
      } finally {
        setIsSubmitting(false); // Rétablir l'état du bouton après la soumission
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Créer un Post</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          placeholder="Quoi de neuf ?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting} // Désactiver le bouton pendant le chargement
            className={`${
              isSubmitting ? "bg-gray-400" : "bg-blue-500"
            } text-white px-4 py-2 rounded-lg`}
          >
            {isSubmitting ? "Envoi..." : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
