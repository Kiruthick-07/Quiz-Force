import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Pages from './Pages';
import SignUp from './assets/Components/Signup';
import Login from './assets/Components/Login';
import Dashboard from './assets/Components/Dashboard';
import CreateQuiz from './assets/Components/CreateQuiz';
import TakeQuiz from './assets/Components/TakeQuiz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;