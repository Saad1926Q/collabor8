import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CodingInterface from './pages/CodingInterface';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp'
import RepoClone from './components/RepoClone';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp/>}/>

        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/code" element={<CodingInterface />} />
        <Route path="/test" element={< RepoClone />} />
      </Routes>
    </Router>
  );
};

export default App;