import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Pages from './Pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;