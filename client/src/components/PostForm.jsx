import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory } from '../services/postsService';

export default function PostForm({ initial = {}, onSubmit }) {
  const safeInitial = initial || {};

  const [title, setTitle] = useState(safeInitial.title || '');
  const [content, setContent] = useState(safeInitial.content || '');
  const [category, setCategory] = useState(
    (safeInitial.category && (safeInitial.category._id || safeInitial.category)) || ''
  );
  const [categories, setCategories] = useState([]);

  // New category input
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    const init = initial || {};
    setTitle(init.title || '');
    setContent(init.content || '');
    setCategory((init.category && (init.category._id || init.category)) || '');
  }, [initial]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      // res might be an array or an object with data, handle both
      const cats = Array.isArray(res) ? res : (res.data || []);
      setCategories(cats);
    } catch (err) {
      setCategories([]);
      console.error('Failed to load categories', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    setCategoryError(null);
    try {
      const created = await createCategory({ name: newCategoryName.trim() });
      // created may be object or created.data depending on server; try to standardize
      const cat = created && created._id ? created : (created.data || created);
      // reload list and select the newly created category
      await loadCategories();
      setCategory(cat._id || cat.id || cat._id);
      setNewCategoryName('');
    } catch (err) {
      console.error('Failed to create category', err);
      setCategoryError(err?.response?.data?.error || err.message || 'Failed to create category');
    } finally {
      setAddingCategory(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, category });
  };

  return (
    <form className="card" onSubmit={submit}>
      <label>
        Title
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label style={{ marginTop: 8 }}>
        Category
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ flex: 1 }}>
            <option value="">Select category</option>
            {categories && categories.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
          </select>

          {/* Inline add category */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              className="input"
              placeholder="New category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ width: 160 }}
              disabled={addingCategory}
            />
            <button
              onClick={handleAddCategory}
              type="button"
              className="button"
              disabled={addingCategory}
              style={{ padding: '0.4rem 0.6rem' }}
            >
              {addingCategory ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
        {categoryError && <div style={{ color: 'red', marginTop: 6 }}>{categoryError}</div>}
      </label>

      <label style={{ marginTop: 8 }}>
        Content
        <textarea className="input" rows="8" value={content} onChange={(e) => setContent(e.target.value)} required />
      </label>

      <div style={{ marginTop: 10 }}>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  );
}