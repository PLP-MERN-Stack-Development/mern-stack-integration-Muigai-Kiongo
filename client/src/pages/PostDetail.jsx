import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPost, deletePost } from '../services/postsService';

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPost(id).then((res) => setPost(res)).catch(() => setPost(null));
  }, [id]);

  const onDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post._id || id);
      nav('/');
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (!post) return <div className="card">Post not found or loading...</div>;

  return (
    <article className="card">
      <div className="meta">{new Date(post.createdAt).toLocaleString()}</div>
      <h1>{post.title}</h1>
      <div style={{ marginTop: 8, color: '#374151' }} dangerouslySetInnerHTML={{ __html: post.content }} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Link to={`/posts/edit/${post._id || id}`} className="button">Edit</Link>
        <button className="button" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}