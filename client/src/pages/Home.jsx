import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../services/postsService';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetchPosts({ q: query, limit: 10, page: 1 });
      setPosts(res.data || res);
      setMeta(res.meta || {});
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(q);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1>Latest Posts</h1>
        <form onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="button" type="submit">Search</button>
        </form>
      </div>

      {loading ? <div className="card">Loading...</div> : posts.length === 0 ? <div className="card">No posts yet</div> : posts.map((p) => <PostCard key={p._id || p.id} post={p} />)}
    </div>
  );
}