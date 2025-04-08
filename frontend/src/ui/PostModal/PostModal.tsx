import { useState } from "react";
import { Button } from "../Bouton/Bouton";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
}

const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      setErrorMessage("Utilisateur non authentifié.");
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      setErrorMessage("Le contenu ou un média est requis.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("content", content);
    mediaFiles.forEach((file) => {
      formData.append("mediaFiles[]", file);
    });

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur API :", data);
        setErrorMessage(data.error || "Erreur lors de la création du post.");
      } else {
        console.log("Post créé :", data);
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setErrorMessage("Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">Créer un Post</h2>

        {/* Zone de texte */}
        <textarea
          className="w-full h-24 p-2 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Quoi de neuf ?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Input fichier */}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMediaChange}
          className="mb-4"
        />

        {/* Previews */}
        <div className="flex flex-wrap gap-2 mb-4">
          {previews.map((src, idx) => (
            <div key={idx} className="w-24 h-24 relative group">
              {src.match(/video/i) ? (
                <video
                  src={src}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
              ) : (
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              <button
                onClick={() => handleRemoveMedia(idx)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hidden group-hover:block"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Liste des fichiers */}
        {mediaFiles.length > 0 && (
          <ul className="text-xs mb-4 space-y-1">
            {mediaFiles.map((file, idx) => (
              <li key={idx} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
        )}

        {/* Boutons */}
        <div className="flex justify-between items-center">
          <Button variant="gray" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="purple"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publication..." : "Publier"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
