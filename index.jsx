import React from 'react';
// import './index.css';
import App from './app.jsx';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const container = document.getElementById('app')
const root = createRoot(container)
root.render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>
)