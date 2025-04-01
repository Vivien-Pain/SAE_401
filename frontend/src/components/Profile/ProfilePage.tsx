import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";

interface Post {
  id: number;
  content: string;
  created_at: string;
  authorUsername: string; // Ajout de la propriété authorUsername
  likes: number; // Ajout de la propriété likes
  isLiked: boolean; // Ajout de la propriété isLiked
  authorId: number; // Ajout de la propriété authorId
  isFollowed: boolean; // Ajout de la propriété isFollowed
}

interface UserProfile {
  id: number; // Ajout de la propriété id
  username: string;
  bio: string;
  profilePicture: string;
  banner: string;
  location: string;
  website: string;
  posts: Post[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!username) {
      console.error("Nom d'utilisateur invalide.");
      return;
    }

    fetch(`http://localhost:8080/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profil non trouvé");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((error) => console.error("Erreur lors de la récupération du profil:", error));
  }, [username]);

  if (!profile) return <p>Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative">
        <img src={profile.banner} alt="Bannière" className="w-full h-40 object-cover" />
        <img
          src={profile.profilePicture}
          alt="Profil"
          className="w-24 h-24 rounded-full border-4 border-white absolute -bottom-12 left-4"
        />
      </div>

      <div className="mt-12 p-4">
        <h1 className="text-2xl font-bold">{profile.username}</h1>
        <p className="text-gray-600">{profile.bio}</p>
        <p className="text-gray-500">{profile.location}</p>
        <a href={profile.website} className="text-blue-500">
          {profile.website}
        </a>
      </div>

      <hr className="my-4" />

      <div>
        <h2 className="text-xl font-semibold">Posts</h2>
        {profile.posts.length === 0 ? (
          <p>Aucun post trouvé.</p>
        ) : (
          profile.posts.map((post) => (
            <Post
            key={post.id}
            content={post.content}
            created_at={post.created_at}
            likes={post.likes}
            isLiked={post.isLiked}
            id={post.id}
            authorId={post.authorId}
            authorUsername={post.authorUsername}
            isFollowed={post.isFollowed}
            />
          ))
        )}
      </div>
    </div>
  );
}
