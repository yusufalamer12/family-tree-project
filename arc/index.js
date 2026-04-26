import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// هذا الكود يربط ملف App.js بصفحة الـ HTML اللي سويناها في مجلد public
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
