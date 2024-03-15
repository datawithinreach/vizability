import './App.css';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

// pages
import HomePage from './pages/HomePage';
import DataCollectionHome from './pages/DataCollectionHome.jsx';
import InformedConsent from './pages/InformedConsent.jsx';
import Ready from './pages/Ready.jsx';
import Presurvey from './pages/Presurvey.jsx';
import Main from './pages/Main.jsx';
import Tutorial from './pages/Tutorial.jsx';
import Task from './pages/Task.jsx';
import TaskSurvey from './pages/TaskSurvey.jsx';


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
              <Route path="/VizAbility/data/presurvey" element={<Presurvey/>} />
              <Route path="/VizAbility/data/main" element={<Main/>} />
              <Route path="/VizAbility/data/tutorial/:stage" element={<Tutorial/>} />
              <Route path="/VizAbility/data/task/:stage" element={<Task/>} />
              <Route path="/VizAbility/data/tasksurvey/:stage" element={<TaskSurvey/>} />
          </Routes>
          </SessionProvider>
        </Router>
    </div>
  );
}

export default App;
