

interface PostProps {

  content: string;
  created_at: string;  // Date de création du post
  id?: number; // ID du post, optionnel
 
}
const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const Post = ({content,  created_at }: PostProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-full max-w-md">
     
      {/* Post Content */}
      <p className="text-gray-800 mb-2">{content}</p>

      {/* Post Date */}
      <p className="text-sm text-gray-500">
        Posté le: {formatDate( created_at)} {/* Formater la date sans date-fns */}
      </p>
    </div>
  );
};

export default Post;
