import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";

const HashtagPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPostsByHashtag = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/hashtag/${hashtag}`
        );
        if (!response.ok) {
          throw new Error(
            `Erreur ${response.status}: ${await response.text()}`
          );
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des posts par hashtag",
          error
        );
      }
    };

    if (hashtag) {
      fetchPostsByHashtag();
    }
  }, [hashtag]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        #{hashtag}
      </h1>

      <div className="flex-1 space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              content={post.content}
              created_at={post.created_at}
              likes={post.likes}
              isLiked={post.isLiked}
              id={post.id}
              authorId={post.authorId}
              authorUsername={post.authorUsername}
              media={post.media}
              replies={post.replies}
              isCensored={post.isCensored}
              isLocked={post.isLocked}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center mt-10">
            Aucun post trouvé pour ce hashtag.
          </p>
        )}
      </div>
    </div>
  );
};

export default HashtagPage;
