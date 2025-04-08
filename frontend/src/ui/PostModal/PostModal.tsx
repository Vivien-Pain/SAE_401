// PostModal.tsx
import { useState } from "react";
import {
  modalOverlay,
  modalContainer,
  modalTitle,
  contentTextarea,
  fileInput,
  previewsContainer,
  singlePreviewWrapper,
  previewMedia,
  removeMediaButton,
  fileNamesList,
  errorMessageText,
  modalButtonsContainer,
  // cancelButton,      <-- plus nécessaire
  // publishButton,     <-- plus nécessaire
} from "./PostModalStyles";
import { Button } from "../Bouton/Bouton"; // <-- Import du composant Button

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
}

const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const [content, setContent] = useState(""); // Contenu du post
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Liste des fichiers médias
  const [previews, setPreviews] = useState<string[]>([]); // Prévisualisations
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicateur d'envoi
  const [errorMessage, setErrorMessage] = useState(""); // Message d'erreur

  // Gestion de la sélection des fichiers médias
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Supprimer un fichier sélectionné
  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Soumission du post
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
        window.location.reload(); // Recharger la page
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
    <div className={modalOverlay()}>
      <div className={modalContainer()}>
        <h2 className={modalTitle()}>Créer un Post</h2>

        {/* Zone de texte */}
        <textarea
          className={contentTextarea()}
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
          className={fileInput()}
        />

        {/* Previews */}
        <div className={previewsContainer()}>
          {previews.map((src, idx) => (
            <div key={idx} className={singlePreviewWrapper()}>
              {src.match(/video/i) ? (
                <video src={src} className={previewMedia()} controls />
              ) : (
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className={previewMedia()}
                />
              )}
              <button
                onClick={() => handleRemoveMedia(idx)}
                className={removeMediaButton()}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Liste noms des fichiers */}
        {mediaFiles.length > 0 && (
          <ul className={fileNamesList()}>
            {mediaFiles.map((file, idx) => (
              <li key={idx} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>
        )}

        {/* Erreur */}
        {errorMessage && (
          <p className={errorMessageText()}>{errorMessage}</p>
        )}

        {/* Boutons */}
        <div className={modalButtonsContainer()}>
          {/* Remplacement par <Button> */}
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
