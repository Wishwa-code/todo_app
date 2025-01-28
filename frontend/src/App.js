import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import LoginForm from './pages/login';
import RegisterForm from './pages/register';
import DashboardPage from './pages/home';
import Details from './pages/details';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<DashboardPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
