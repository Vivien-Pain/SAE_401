import { useState, useEffect } from 'react';
import Icons from '../../ui/Icons/Icons';

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
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

// Nouvelle fonction pour parser le contenu et générer liens hashtag/mention
const parseContent = (text: string) => {
  const parts = text.split(/(\s+)/); // Garde les espaces pour conserver la mise en forme
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
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
    } else if (part.startsWith('@')) {
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
}: PostProps) => {
  const [likeCount, setLikeCount] = useState<number>(likes ?? 0);
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [authorProfile, setAuthorProfile] = useState<{ username: string; profilePicture: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; id: number; readOnlyMode: boolean } | null>(null);
  const [isBlockedByAuthor] = useState(false);
  const [showReplyField, setShowReplyField] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<Reply[]>(initialReplies);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`http://localhost:8080/api/users/${authorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAuthorProfile({ username: data.username, profilePicture: data.profilePicture || '' });
      }
    };
    fetchAuthorProfile();
  }, [authorId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch('http://localhost:8080/api/current_user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setLikeCount(data.likes);
      setLiked(true);
    }
  };

  const handleUnlike = async () => {
    if (!id || isBlockedByAuthor || isCensored) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`http://localhost:8080/api/posts/${id}/unlike`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setLikeCount(data.likes);
      setLiked(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !id || isBlockedByAuthor || isCensored || currentUser?.readOnlyMode) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append('content', replyContent);
    formData.append('parent_id', id.toString());
    const response = await fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (response.ok) {
      setReplies(prev => [...prev, {
        id: Math.floor(Math.random() * 100000),
        content: replyContent,
        created_at: new Date().toISOString(),
        authorId: currentUser?.id ?? 0,
        authorUsername: currentUser?.username ?? 'Moi',
        media: [],
      }]);
      setReplyContent('');
      setShowReplyField(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-full max-w-md">
      <div className="flex items-center mb-4">
        {authorProfile?.profilePicture ? (
          <img src={authorProfile.profilePicture} alt={authorProfile.username} className="w-10 h-10 rounded-full mr-3" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
        )}
        <div>
          <a href={`/profile/${authorProfile?.username}`} className="font-semibold text-gray-800 hover:underline">
            {authorProfile?.username || "Auteur inconnu"}
          </a>
          <p className="text-sm text-gray-500">Posté le: {formatDate(created_at)}</p>
        </div>
      </div>

      <div className="mb-4 text-gray-800 break-words">
        {isBlockedByAuthor
          ? "Ce contenu est masqué car vous êtes bloqué par l'auteur."
          : isCensored
          ? "⚠️ Ce message enfreint les conditions d’utilisation de la plateforme."
          : parseContent(content)}
      </div>

      {media && media.length > 0 && !isCensored && (
        <div className="mb-4">
          {media.map((url, index) => (
            <img key={index} src={`http://localhost:8080${url}`} alt={`Post media ${index}`} className="w-full h-auto rounded-lg" />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {!isBlockedByAuthor && !isCensored && (
          <div className="flex items-center">
            {liked ? (
              <button onClick={handleUnlike} className="flex items-center mr-4">
                <Icons className="w-6 h-6 text-red-500" />
                <span className="ml-2">{likeCount ?? 0}</span>
              </button>
            ) : (
              <button onClick={handleLike} className="flex items-center mr-4">
                <Icons className="w-6 h-6 text-gray-500" />
                <span className="ml-2">{likeCount ?? 0}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isBlockedByAuthor && !isCensored && !currentUser?.readOnlyMode && (
        <>
          <button onClick={() => setShowReplyField(!showReplyField)} className="flex items-center text-blue-500 mt-3">
            💬 Répondre
          </button>
          {showReplyField && (
            <div className="mt-2">
              <textarea
                className="w-full p-2 border border-gray-300 rounded mb-2"
                rows={2}
                placeholder="Votre réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button onClick={handleReplySubmit} className="bg-blue-500 text-white px-3 py-1 rounded">
                Publier
              </button>
            </div>
          )}
        </>
      )}

      {!isCensored && replies.length > 0 && (
        <div className="mt-4 border-t pt-2 space-y-2">
          {replies.map((rep) => (
            <div key={rep.id} className="ml-4 bg-gray-100 p-2 rounded">
              <p className="text-sm text-gray-600">
                <strong>{rep.authorUsername}</strong> – {formatDate(rep.created_at)}
              </p>
              <p className="text-gray-800">{rep.content}</p>
              {rep.media && rep.media.length > 0 && (
                <div className="mt-2">
                  {rep.media.map((murl, idx) => (
                    <img key={idx} src={`http://localhost:8080${murl}`} alt={`Reply media ${idx}`} className="max-w-xs rounded" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
