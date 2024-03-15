import './App.css';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import HomePage from './pages/HomePage';
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
          </Routes>
          </SessionProvider>
        </Router>
    </div>
  );
}

export default App;
