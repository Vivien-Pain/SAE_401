import { useState, useEffect } from "react";
import Icons from "../../ui/Icons/Icons";
import Icons_lock from "../../ui/Icons/icons_lock";
import Icons_unlock from "../../ui/Icons/icons_unlock";
import { Button } from "../../ui/Bouton/Bouton";

interface Reply {
  id: number;
  content: string;
  created_at: string;
  authorId: number;
  authorUsername: string;
  media?: string[];
}

interface PostProps {
  content: string;
  created_at: string;
  id: number;
  likes: number;
  isLiked: boolean;
  authorId: number;
  authorUsername: string;
  media?: string[];
  replies?: Reply[];
  isCensored: boolean;
  isLocked: boolean;
  parent?: {
    id: number;
    content: string;
    authorUsername: string;
    media?: string[];
    created_at: string;
  } | null;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const parseContent = (text: string) => {
  const parts = text.split(/(\s+)/);
  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      const tag = part.substring(1);
      return (
        <a
          key={index}
          href={`/hashtag/${tag}`}
          className="text-blue-500 hover:underline font-semibold"
        >
          {part}
        </a>
      );
    } else if (part.startsWith("@")) {
      const username = part.substring(1);
      return (
        <a
          key={index}
          href={`/profile/${username}`}
          className="text-purple-500 hover:underline font-semibold"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });
};

const Post = ({
  content,
  created_at,
  id,
  likes,
  isLiked,
  authorId,
  media,
  replies: initialReplies = [],
  isCensored,
  isLocked,
  parent = null,
}: PostProps) => {
  const [likeCountState, setLikeCountState] = useState<number>(likes ?? 0);
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [authorProfile, setAuthorProfile] = useState<{
    username: string;
    profilePicture: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    id: number;
    readOnlyMode: boolean;
  } | null>(null);
  const [isBlockedByAuthor] = useState(false);
  const [showReplyField, setShowReplyField] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [showRetweetModal, setShowRetweetModal] = useState(false);
  const [retweetComment, setRetweetComment] = useState("");
  const [lockedState, setLockedState] = useState<boolean>(isLocked);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(
        `http://localhost:8080/api/users/${authorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAuthorProfile({
          username: data.username,
          profilePicture: data.profilePicture || "",
        });
      }
    };
    fetchAuthorProfile();
  }, [authorId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("http://localhost:8080/api/current_user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          username: data.username,
          id: data.id,
          readOnlyMode: data.readOnlyMode,
        });
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLike = async () => {
    if (!id || isBlockedByAuthor || isCensored) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`http://localhost:8080/api/posts/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setLikeCountState(data.likes);
      setLiked(true);
    }
  };

  const handleUnlike = async () => {
    if (!id || isBlockedByAuthor || isCensored) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(
      `http://localhost:8080/api/posts/${id}/unlike`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setLikeCountState(data.likes);
      setLiked(false);
    }
  };
  const handleLock = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`http://localhost:8080/api/posts/${id}/lock`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setLockedState(true); // Met à jour sans reload
    }
  };

  const handleUnlock = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(
      `http://localhost:8080/api/posts/${id}/unlock`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.ok) {
      setLockedState(false); // Met à jour sans reload
    }
  };
  const handleReplySubmit = async () => {
    if (
      !replyContent.trim() ||
      !id ||
      isBlockedByAuthor ||
      isCensored ||
      isLocked ||
      currentUser?.readOnlyMode
    )
      return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("content", replyContent);
    formData.append("parent_id", id.toString());
    const response = await fetch("http://localhost:8080/api/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (response.ok) {
      setReplies((prev) => [
        ...prev,
        {
          id: Math.floor(Math.random() * 100000),
          content: replyContent,
          created_at: new Date().toISOString(),
          authorId: currentUser?.id ?? 0,
          authorUsername: currentUser?.username ?? "Moi",
          media: [],
        },
      ]);
      setReplyContent("");
      setShowReplyField(false);
    }
  };

  const handleRetweet = async () => {
    if (!id || isBlockedByAuthor || isCensored) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    if (retweetComment.trim()) {
      formData.append("comment", retweetComment);
    }
    const response = await fetch(
      `http://localhost:8080/api/posts/${id}/retweet`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (response.ok) {
      console.log("Retweet réussi !");
      setShowRetweetModal(false);
      setRetweetComment("");
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-lg mx-auto ${isBlockedByAuthor || isCensored ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Header du post */}
      <div className="flex items-center mb-4">
        {authorProfile?.profilePicture ? (
          <img
            src={authorProfile.profilePicture}
            alt={authorProfile.username}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
        )}
        <div>
          <a
            href={`/profile/${authorProfile?.username}`}
            className="text-lg font-semibold text-gray-800 hover:underline"
          >
            {authorProfile?.username || "Auteur inconnu"}
          </a>
          <p className="text-sm text-gray-500">{formatDate(created_at)}</p>
        </div>
      </div>

      {/* Si parent (retweet ou réponse à un post) */}
      {parent && (
        <div className="bg-gray-100 p-4 rounded-2xl my-2 border border-green-300">
          <p className="text-green-500 text-sm mb-2">
            🔁 {parent.authorUsername} a posté :
          </p>
          <p className="text-gray-800">{parseContent(parent.content)}</p>
          {parent.media && parent.media.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {parent.media.map((url, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:8080${url}`}
                  alt={`Parent media ${idx}`}
                  className="rounded-xl"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenu du post */}
      <div className="text-gray-700 mb-4">
        {isBlockedByAuthor
          ? "Ce contenu est masqué car vous êtes bloqué par l'auteur."
          : isCensored
            ? "⚠️ Ce message enfreint les conditions d’utilisation de la plateforme."
            : parseContent(content)}
      </div>

      {/* Post verrouillé */}
      {isLocked && (
        <p className="text-red-500 font-semibold my-2">
          🔒 Réponses verrouillées pour ce post.
        </p>
      )}

      {/* Media du post */}
      {media && media.length > 0 && !isCensored && (
        <div className="mb-4">
          {media.map((url, index) => (
            <img
              key={index}
              src={`http://localhost:8080${url}`}
              alt={`Post media ${index}`}
              className="w-full h-auto rounded-lg mb-2"
            />
          ))}
        </div>
      )}

      {/* Footer (Like bouton) */}
      <div className="flex items-center justify-between">
        {!isBlockedByAuthor && !isCensored && (
          <div className="flex gap-4 items-center">
            <button
              onClick={liked ? handleUnlike : handleLike}
              className={`flex items-center ${liked ? "text-red-500" : "text-gray-500"}`}
            >
              <Icons className="w-6 h-6" />
              <span className="ml-2">{likeCountState}</span>
            </button>
          </div>
        )}
      </div>

      {/* Répondre / Retweeter */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() => setShowReplyField(!showReplyField)}
          className="flex items-center space-x-2 text-green-500 hover:text-green-600 font-semibold"
        >
          💬 Répondre
        </button>
        <button
          onClick={() => setShowRetweetModal(true)}
          className="flex items-center space-x-2 text-green-500 hover:text-green-600 font-semibold"
        >
          🔁 Retweeter
        </button>
      </div>

      {/* Bouton verrouiller/déverrouiller */}
      {currentUser?.id === authorId && (
        <Button
          variant={lockedState ? "purple" : "cyan"}
          size="sm"
          onClick={lockedState ? handleUnlock : handleLock}
          className="flex items-center gap-2 mt-2"
        >
          {lockedState ? (
            <>
              <Icons_unlock className="w-4 h-4" />
              Déverrouiller
            </>
          ) : (
            <>
              <Icons_lock className="w-4 h-4" />
              Verrouiller
            </>
          )}
        </Button>
      )}

      {/* Affichage des réponses */}
      {!isLocked && !isCensored && replies.length > 0 && (
        <div className="mt-6 border-t pt-4 space-y-4">
          {replies.map((rep) => (
            <div key={rep.id} className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{rep.authorUsername}</strong> –{" "}
                {formatDate(rep.created_at)}
              </p>
              <p className="text-gray-800">{rep.content}</p>
              {rep.media &&
                rep.media.length > 0 &&
                rep.media.map((murl, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8080${murl}`}
                    alt="Reply media"
                    className="max-w-xs rounded-lg mt-2"
                  />
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Champ réponse */}
      {showReplyField && (
        <div className="mt-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg mb-2"
            rows={3}
            placeholder="Votre réponse..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            onClick={handleReplySubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Publier
          </button>
        </div>
      )}

      {/* Modale de retweet */}
      {showRetweetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-md flex flex-col gap-4">
            <h2 className="text-lg font-bold mb-2">Retweeter ce post</h2>
            <textarea
              className="w-full border rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={4}
              placeholder="Ajouter un commentaire (optionnel)..."
              value={retweetComment}
              onChange={(e) => setRetweetComment(e.target.value)}
            />
            <button
              onClick={handleRetweet}
              className="bg-green-500 text-white rounded-xl py-2 font-bold hover:bg-green-600"
            >
              Retweeter
            </button>
            <button
              onClick={() => setShowRetweetModal(false)}
              className="text-red-500 font-semibold mt-2"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
