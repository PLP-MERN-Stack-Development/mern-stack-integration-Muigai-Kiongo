import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreateEditPost from './pages/CreateEditPost';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import Nav from './components/Nav';

export default function App() {
  return (
    <div>
      <Nav />
      <main style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/posts/new" element={<CreateEditPost />} />
          <Route path="/posts/edit/:id" element={<CreateEditPost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}