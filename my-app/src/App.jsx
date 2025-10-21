import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Pages from './Pages';
import SignUp from './assets/Components/Signup';
import Login from './assets/Components/Login';
import Dashboard from './assets/Components/Dashboard';
import CreateQuiz from './assets/Components/CreateQuiz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;