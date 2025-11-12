import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory } from '../services/postsService';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchCategories();
      const cats = Array.isArray(res) ? res : (res.data || []);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCategory({ name: name.trim() });
      setName('');
      await load();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Categories</h1>

      <form onSubmit={add} style={{ display: 'flex', gap: 8, marginBottom: 12, maxWidth: 480 }}>
        <input className="input" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {loading ? (
        <div className="card">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="card">No categories yet</div>
      ) : (
        categories.map((c) => (
          <div key={c._id || c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{c.name}</strong>
                <div className="meta">{c.slug || ''}</div>
              </div>
              <div style={{ color: '#6b7280' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}