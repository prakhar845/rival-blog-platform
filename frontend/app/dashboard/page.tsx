"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import BlogCard from "../../components/BlogCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Blog {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  user?: { email: string };
  _count?: { likes: number; comments: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null); // NEW: Track what we are editing
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const fetchMyBlogs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/blogs/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMyBlogs();
  }, [fetchMyBlogs]);

  // FIXED: A smart save function that handles both Create and Edit!
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      // If we have an editing ID, use PATCH. Otherwise, use POST.
      const url = editingBlogId ? `${API_URL}/blogs/${editingBlogId}` : `${API_URL}/blogs`;
      const method = editingBlogId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, isPublished }),
      });
      
      if (res.ok) {
        resetForm();
        fetchMyBlogs(); 
      } else {
        alert(`Failed to ${editingBlogId ? 'update' : 'create'} post.`);
      }
    } catch (error) {
      console.error("Failed to save post", error);
    }
  };

  const handleEditClick = (blog: Blog) => {
    setIsCreating(true);
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    setIsPublished(blog.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up to the form!
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingBlogId(null);
    setTitle("");
    setContent("");
    setIsPublished(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchMyBlogs(); 
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !currentStatus }), 
      });
      if (res.ok) fetchMyBlogs(); 
    } catch (error) {
      console.error("Failed to toggle publish", error);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Dashboard</h1>
        <button 
          onClick={isCreating ? resetForm : () => setIsCreating(true)}
          className={`px-4 py-2 font-bold rounded-lg transition ${
            isCreating ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isCreating ? "Cancel" : "+ Create New Post"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingBlogId ? "Edit Post" : "Create a New Post"}</h2>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <textarea
            placeholder="Write your post content here (Markdown allowed)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="publish"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600"
            />
            <label htmlFor="publish" className="text-gray-700 font-medium">Publish immediately?</label>
          </div>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition w-full sm:w-auto">
            {editingBlogId ? "Update Post" : "Save Post"}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {blogs.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-gray-50">
            <p className="text-gray-500">You have not written any posts yet. Click the button above to get started!</p>
          </div>
        ) : (
          blogs.map(blog => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              isDashboard={true} 
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              onEdit={handleEditClick}
            />
          ))
        )}
      </div>
    </div>
  );
}