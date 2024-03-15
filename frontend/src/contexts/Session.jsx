import React, { useState, useEffect, createContext } from "react";
import localforage from "localforage";
import shuffleArray from "../utils/shuffleArray";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL, uploadString } from "firebase/storage";
import firebaseConfig_data from "../firebaseConfig.json";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = firebaseConfig_data;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
const storage = getStorage(app);

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  // console.log("Google API:", gapi);
  const initialState = {
    progress: "",
    PID: "",
    setup: [],
    // agreement:false,
    background: {},
    tutorials: [],
    tasks: [],
    tasksurveys: [],
    postsurvey: [],
    logs: [],
  };

  useEffect(() => {
    localforage.getItem("session").then((state) => {
      console.log("initializing from local store", state);
      setSession(state);
    });
  }, []);
  const [session, setSession] = useState(initialState);

  const setPID = (PID) => {
    //ref? https://www.dcode.fr/partial-k-permutations
    const methods = shuffleArray(["table", "structured", "speech"]);
    const charts = shuffleArray(["bar", "line", "scatter", "map"]).slice(0, 3);
    const setup = methods.map((m, i) => ({ chart: charts[i], method: m }));
    const updated = {
      ...initialState, // start from scratch
      PID,
      setup,
      progress: "pid-provided",
      date: new Date().toISOString()
    };
    localforage.setItem("session", updated);
    console.log("session log", updated);
    setSession(updated);
  };

  // const setAgreement = (agreement)=>{
  //   const updated = {
  //     ...session,
  //     agreement,
  //     progress:"agreement"
  //   }
  //   // localforage.setItem("session", updated);
  //   console.log("session log", updated);
  //   setSession(updated);
  // }
  const setBackground = (background) => {
    const updated = {
      ...session,
      background,
      progress: "background-survey-done",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);
    setSession(updated);
  };

  const setStart = () => {
    const updated = {
      ...session,
      progress: "main-phase-started",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);
    setSession(updated);
  };
  const setTutorialResponse = (responses) => {
    const updated = {
      ...session,
      tutorials: session.tutorials.concat([responses]),
      progress: "tutorial-done",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);
    setSession(updated);
  };
  const setTaskResponse = (responses) => {
    const updated = {
      ...session,
      tasks: session.tasks.concat([responses]),
      progress: "task-done",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);
    setSession(updated);
  };
  const setTaskSurveyResponse = (responses) => {
    const updated = {
      ...session,
      tasksurveys: session.tasksurveys.concat([responses]),
      progress: "task-survey-done",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);
    setSession(updated);
  };
  const setPostSurvey = async (postsurvey) => {
    const updated = {
      ...session,
      postsurvey,
      progress: "post-survey-done",
      date: new Date().toISOString()
    };
    console.log("session log", updated);
    localforage.setItem("session", updated);

    //save data to firestore database
    // try {
    //   const docRef = await addDoc(collection(db, "sessions"), updated);
    //   console.log("Document written with ID: ", docRef.id);
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }
    uploadDataToCloud();
    setSession(updated);
  };
  const setLog = (log) => {
    setSession((session) => {
      const updated = {
        ...session,
        logs: session.logs.concat(log),
      };
      console.log("session log", updated);
      localforage.setItem("session", updated);
      return updated;
    });
  };
  const getSessionData = () => {
    return session;
  };
  const uploadDataToCloud = async (filename, jsonDataStr) => {
    const storageRef = ref(storage, filename);
    // try {
    //   const docRef = await addDoc(collection(db, "sessions"), {PID:session.PID});
    //   console.log("Document written with ID: ", docRef.id);
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }
    //return  
    return uploadString(storageRef, jsonDataStr, "data_url");
  };
  const downloadDataFromCloud =  ()=>{
    const listRef = ref(storage, 'session');

    const promise = new Promise((resolve, reject)=>{
      listAll(listRef).then(async (res)=>{
          // resolve(res.items);
          const all = res.items.map(ref=>getDownloadURL(ref));
          const urls = await Promise.all(all);
          
          const responses = await Promise.all(urls.map(url=>fetch(url)));
          // console.log("responses", responses);
          const data = await Promise.all(responses.map(d=>d.json()));
          // console.log("data", data);
          resolve(data);            
          
      }).catch((error) => {
        // Uh-oh, an error occurred!
        reject(error);
      });
    });
    return promise;
    
  }
  const context = {
    ...session,
    setPID,
    setBackground,
    setStart,
    setTutorialResponse,
    setTaskResponse,
    setTaskSurveyResponse,
    setPostSurvey,
    getSessionData,
    setLog,
    uploadDataToCloud,
    downloadDataFromCloud
  };

  return (
    <SessionContext.Provider value={context}>
      {children}
    </SessionContext.Provider>
  );
};
