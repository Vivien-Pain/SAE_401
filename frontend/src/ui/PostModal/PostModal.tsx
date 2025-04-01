import { useState } from "react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const PostModal = ({ isOpen, onClose, }: PostModalProps) => {
  const [content, setContent] = useState(""); // Contenu du post
  const [isSubmitting, ] = useState(false); // Pour éviter l'envoi multiple
  const [errorMessage, ] = useState(""); // Message d'erreur
  



  // Fonction pour soumettre le post à l'API
  const handleSubmit = async () => {
    const token = localStorage.getItem("token"); // Vérifie si le token est bien stocké
    if (!token) {
        console.error("Token not found");
        return;
    }

    const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Envoi du token
        },
        body: JSON.stringify({ content: content }), // Envoi du contenu du post
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Erreur lors de la création du post :", data);
    } else {
        console.log("Post créé avec succès :", data);
        onClose(); // Ferme le modal
        window.location.href = "/home"; // Redirige vers la page d'accueil
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
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
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
