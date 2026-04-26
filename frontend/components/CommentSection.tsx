"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function CommentSection({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/blogs/${blogId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to comment.");
      return;
    }

    setIsSubmitting(true);
    
    try {
     const res = await fetch(`${API_URL}/blogs/${blogId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment(""); 
        toast.success("Comment posted!");
        fetchComments();
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        toast.error("Your session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to post comment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while posting your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3 transition"
          rows={3}
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">{comment.user.email}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}