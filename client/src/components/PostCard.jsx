import React from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <article className="card">
      <div className="meta">{new Date(post.createdAt).toLocaleDateString()} • {post.category?.name || 'Uncategorized'}</div>
      <h2 style={{ margin: '0 0 .5rem 0' }}>
        <Link to={`/posts/${post._id || post.slug}`}>{post.title}</Link>
      </h2>
      <p style={{ color: '#374151' }}>{post.excerpt || (post.content && post.content.slice(0, 180) + '...')}</p>
    </article>
  );
}