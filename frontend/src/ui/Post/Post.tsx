import { useState, useEffect } from "react";
import Icons from "../../ui/Icons/Icons";
import {
  postContainer,
  postHeaderContainer,
  postAuthorPicture,
  postAuthorPicturePlaceholder,
  postAuthorLink,
  postAuthorDate,
  postTextContent,
  postMediaContainer,
  postMediaImage,
  postFooterContainer,
  likeButton,
  likeIcon,
  likeCount,
  replyFieldContainer,
  replyTextarea,
  replySubmitButton,
  repliesContainer,
  singleReply,
  replyHeader,
  replyMediaImage,
  retweetButton,
  retweetModalContainer,
  retweetModalContent,
  retweetInput,
  retweetSubmitButton,
} from "./PostStyles";

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
    .padStart(2, "0")}/${d.getFullYear()} ${d.getHours()
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

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`http://localhost:8080/api/users/${authorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAuthorProfile({ username: data.username, profilePicture: data.profilePicture || "" });
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
        setCurrentUser({ username: data.username, id: data.id, readOnlyMode: data.readOnlyMode });
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
    const response = await fetch(`http://localhost:8080/api/posts/${id}/unlike`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setLikeCountState(data.likes);
      setLiked(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !id || isBlockedByAuthor || isCensored || currentUser?.readOnlyMode) return;
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
    const response = await fetch(`http://localhost:8080/api/posts/${id}/retweet`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (response.ok) {
      console.log("Retweet réussi !");
      setShowRetweetModal(false);
      setRetweetComment("");
    }
  };

  return (
    <div className={postContainer({ hidden: isBlockedByAuthor || isCensored })}>
      <div className={postHeaderContainer()}>
        {authorProfile?.profilePicture ? (
          <img
            src={authorProfile.profilePicture}
            alt={authorProfile.username}
            className={postAuthorPicture()}
          />
        ) : (
          <div className={postAuthorPicturePlaceholder()} />
        )}
        <div>
          <a href={`/profile/${authorProfile?.username}`} className={postAuthorLink()}>
            {authorProfile?.username || "Auteur inconnu"}
          </a>
          <p className={postAuthorDate()}>{formatDate(created_at)}</p>
        </div>
      </div>

      {parent && (
        <div className="bg-gray-100 p-4 rounded-2xl my-2 border border-green-300">
          <p className="text-green-500 text-sm mb-2">🔁 {parent.authorUsername} a posté :</p>
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

      <div className={postTextContent()}>
        {isBlockedByAuthor
          ? "Ce contenu est masqué car vous êtes bloqué par l'auteur."
          : isCensored
          ? "⚠️ Ce message enfreint les conditions d’utilisation de la plateforme."
          : parseContent(content)}
      </div>

      {media && media.length > 0 && !isCensored && (
        <div className={postMediaContainer()}>
          {media.map((url, index) => (
            <img
              key={index}
              src={`http://localhost:8080${url}`}
              alt={`Post media ${index}`}
              className={postMediaImage()}
            />
          ))}
        </div>
      )}

      <div className={postFooterContainer()}>
        {!isBlockedByAuthor && !isCensored && (
          <div className="flex gap-4">
            <button onClick={liked ? handleUnlike : handleLike} className={likeButton({ liked })}>
              <Icons className={likeIcon()} />
              <span className={likeCount()}>{likeCountState}</span>
            </button>

            <button onClick={() => setShowRetweetModal(true)} className={retweetButton()}>
              🔁 Retweeter
            </button>
          </div>
        )}
      </div>

      {showReplyField && (
        <div className={replyFieldContainer()}>
          <textarea
            className={replyTextarea()}
            rows={3}
            placeholder="Votre réponse..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button onClick={handleReplySubmit} className={replySubmitButton()}>
            Publier
          </button>
        </div>
      )}

      {!isCensored && replies.length > 0 && (
        <div className={repliesContainer()}>
          {replies.map((rep) => (
            <div key={rep.id} className={singleReply()}>
              <p className={replyHeader()}>
                <strong>{rep.authorUsername}</strong> – {formatDate(rep.created_at)}
              </p>
              <p className="text-gray-800">{rep.content}</p>
              {rep.media && rep.media.length > 0 && (
                <div>
                  {rep.media.map((murl, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:8080${murl}`}
                      alt={`Reply media ${idx}`}
                      className={replyMediaImage()}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRetweetModal && (
        <div className={retweetModalContainer()}>
          <div className={retweetModalContent()}>
            <h2 className="text-lg font-bold mb-2">Retweeter ce post</h2>
            <textarea
              className={retweetInput()}
              rows={4}
              placeholder="Ajouter un commentaire (optionnel)..."
              value={retweetComment}
              onChange={(e) => setRetweetComment(e.target.value)}
            />
            <button onClick={handleRetweet} className={retweetSubmitButton()}>
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
