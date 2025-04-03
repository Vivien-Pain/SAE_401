import { useState } from "react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const [content, setContent] = useState(""); // Contenu du post
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Liste des fichiers médias
  const [previews, setPreviews] = useState<string[]>([]); // Prévisualisations des fichiers
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicateur d'envoi
  const [errorMessage, setErrorMessage] = useState(""); // Message d'erreur

  // Gère la sélection des fichiers médias (images, vidéos, etc.)
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(files);

      // Créer les prévisualisations pour chaque fichier sélectionné
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  // Fonction pour soumettre le post à l'API
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    setIsSubmitting(true);

    // Création de FormData pour envoyer à la fois le contenu et les fichiers
    const formData = new FormData();
    formData.append("content", content);

    // Ajouter chaque fichier média à FormData
    mediaFiles.forEach((file) => {
      formData.append("mediaFiles[]", file);
    });

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // Ajout du token d'authentification
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Erreur lors de la création du post :", data);
        setErrorMessage("Erreur lors de la création du post");
      } else {
        console.log("Post créé avec succès :", data);
        onClose();
        window.location.reload(); // Recharge la page après la création du post
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      setErrorMessage("Une erreur est survenue lors de la création du post");
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Créer un Post</h2>
        
        {/* Zone de texte pour entrer le contenu du post */}
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          placeholder="Quoi de neuf ?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Sélection de fichiers (images, vidéos) */}
        <input
          type="file"
          accept="image/*, video/*"
          multiple
          onChange={handleMediaChange}
          className="mb-4"
        />

        {/* Affichage des prévisualisations des fichiers */}
        <div className="flex flex-wrap gap-2 mb-4">
          {previews.map((src, idx) => (
            <div key={idx} className="w-24 h-24 relative">
              {src.match(/video/i) ? (
                <video src={src} className="w-full h-full object-cover" controls />
              ) : (
                <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>

        {/* Affichage du message d'erreur s'il y en a */}
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}

        {/* Boutons pour annuler ou publier le post */}
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
