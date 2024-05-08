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
import PostSurvey from './pages/PostSurvey.jsx';
import Debrief from './pages/Debrief.jsx';

import NavBar from './components/NavBar';

import { SessionProvider } from './contexts/Session.jsx'

function App() {
  return (
    <div className="App">
      <Router>
        <SessionProvider>
        <NavBar/>
          <Routes>
              <Route path="/vizability" element={<HomePage/>} />
              <Route path="/vizability/data" element={<DataCollectionHome/>} />
              <Route path="/vizability/data/informedconsent" element={<InformedConsent/>} />
              <Route path="/vizability/data/ready" element={<Ready/>} />
              <Route path="/vizability/data/presurvey" element={<Presurvey/>} />
              <Route path="/vizability/data/main" element={<Main/>} />
              <Route path="/vizability/data/tutorial/:stage" element={<Tutorial/>} />
              <Route path="/vizability/data/task/:stage" element={<Task/>} />
              <Route path="/vizability/data/tasksurvey/:stage" element={<TaskSurvey/>} />
              <Route path="/vizability/data/postsurvey" element={<PostSurvey/>} />
              <Route path="/vizability/data/debrief" element={<Debrief/>} />
          </Routes>
          </SessionProvider>
        </Router>
    </div>
  );
}

export default App;
