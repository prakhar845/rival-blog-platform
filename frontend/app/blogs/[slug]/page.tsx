"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    email: string;
  };
}


interface SingleBlog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

export default function SingleBlogPage() {
  const params = useParams();
  const router = useRouter();
  
 
  const [blog, setBlog] = useState<SingleBlog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        
        const blogRes = await fetch(`${API_URL}/blogs/public/${params.slug}`);
        if (!blogRes.ok) throw new Error("Blog not found");
        const blogData = await blogRes.json();
        setBlog(blogData);

        
        const commentsRes = await fetch(`${API_URL}/blogs/${blogData.id}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error(error);
        router.push("/"); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [params.slug, router]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You must be logged in to comment.");
      router.push("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/blogs/${blog?.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const postedComment = await res.json();
        
        setComments((prev) => [postedComment, ...prev]);
        setNewComment(""); 
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!blog) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      {}
      <h1 className="text-4xl font-extrabold mb-4">{blog.title}</h1>
      <p className="text-gray-500 mb-8">
        By {blog.user?.email || "Unknown"} • {new Date(blog.createdAt).toLocaleDateString()}
      </p>
      <div className="prose max-w-none mb-12 text-gray-800">
        {blog.content}
      </div>

      <hr className="my-8" />

      {}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>
        
        {}
        <form onSubmit={handlePostComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="Share your thoughts..."
          />
          <button 
            type="submit" 
            className="mt-3 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            Post Comment
          </button>
        </form>

        {}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          ) : (
            
            comments.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-bold text-gray-800">{c.user?.email}</span> • {new Date(c.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-800">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}