import './App.css';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import HomePage from './pages/HomePage';
import DataCollectionHome from './pages/DataCollectionHome.js';

import NavBar from './components/NavBar';

import { SessionProvider } from './contexts/Session.jsx'

function App() {
  return (
    <div className="App">
      <Router>
        <SessionProvider>
        <NavBar/>
          <Routes>
              <Route path="/VizAbility" element={<HomePage/>} />
              <Route path="/VizAbility/data" element={<DataCollectionHome/>} />
          </Routes>
          </SessionProvider>
        </Router>
    </div>
  );
}

export default App;
