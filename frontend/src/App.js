import './App.css';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

// pages
import HomePage from './pages/HomePage';
import DataCollectionHome from './pages/DataCollectionHome.js';
import InformedConsent from './pages/InformedConsent.js';
import Ready from './pages/Ready.js';

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
              <Route path="/VizAbility/data/informedconsent" element={<InformedConsent/>} />
              <Route path="/VizAbility/data/ready" element={<Ready/>} />
              
          </Routes>
          </SessionProvider>
        </Router>
    </div>
  );
}

export default App;
