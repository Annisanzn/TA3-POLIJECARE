import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import ArticleDetail from './components/ArticleDetail';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/artikel" element={<LandingPage />} />
            <Route path="/artikel/:slug" element={<ArticleDetail />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/user/dashboard" element={<LandingPage />} />
            <Route path="/operator/dashboard" element={<LandingPage />} />
            <Route path="/konselor/dashboard" element={<LandingPage />} />
            <Route path="/redirect" element={<LandingPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
