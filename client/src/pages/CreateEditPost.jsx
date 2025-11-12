import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { createPost, fetchPost, updatePost } from '../services/postsService';
import { AuthContext } from '../context/AuthContext';

export default function CreateEditPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  // If creating new post initialize to empty; if editing start as null to show loading state
  const [initial, setInitial] = useState(id ? null : {});

  useEffect(() => {
    if (id) {
      fetchPost(id)
        .then((p) => setInitial(p))
        .catch((err) => {
          console.error('Failed to fetch post for edit', err);
          setInitial({});
        });
    }
  }, [id]);

  // While editing and data not yet loaded show loading state
  if (id && initial === null) return <div className="card">Loading...</div>;

  const onSubmit = async (data) => {
    try {
      // ensure required fields present
      if (!data.title || !data.content) {
        return alert('Title and content are required.');
      }

      // ensure user (author) exists
      const authorId = user?.id || user?._id;
      if (!authorId) {
        // better UX: prompt login / redirect
        alert('You must be logged in to create or edit posts.');
        return nav('/login');
      }

      const payload = { ...data, author: authorId };

      // Debug: log payload so you can inspect Network tab
      console.log('Creating/updating post payload:', payload);

      if (id) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }

      nav('/');
    } catch (err) {
      // Show full error info — server response is usually in err.response.data
      console.error('Create/Update post error', err);
      if (err?.response) {
        console.error('Status:', err.response.status);
        console.error('Response data:', err.response.data);
        // show friendly message but include server details for debugging
        const friendly = err.response.data?.error || (err.response.data?.errors ? err.response.data.errors.map(e=>e.msg).join(', ') : null);
        alert('Failed to save post: ' + (friendly || JSON.stringify(err.response.data)));
      } else if (err?.message) {
        alert('Failed to save post: ' + err.message);
      } else {
        alert('Failed to save post');
      }
    }
  };

  return <PostForm initial={initial} onSubmit={onSubmit} />;
}