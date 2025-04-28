import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CodingInterface from './pages/CodingInterface';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp'
import RepoClone from './components/RepoClone';
import Rooms from './pages/Rooms';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp/>}/>

        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/code/:roomId" element={<CodingInterface />} />
        <Route path="/test" element={< RepoClone />} />
        <Route path='/rooms' element={<Rooms/>}/>
      </Routes>
    </Router>
  );
};

export default App;
