// Where the backend API lives.
// The public site (GitHub Pages at dwr.bc.edu/vizability) calls the API hosted on Vercel.
// When the page is served by the backend itself (Vercel, or `uvicorn main:app` on port 8000)
// it calls the same origin. Any other local server (e.g. VS Code Live Server) uses the local backend.
const PRODUCTION_API = "https://vizability-two.vercel.app";
const PRODUCTION_HOSTS = ["dwr.bc.edu", "datawithinreach.github.io"];

const { hostname, port } = window.location;

export const serverAddress = PRODUCTION_HOSTS.includes(hostname)
  ? PRODUCTION_API
  : (hostname.endsWith(".vercel.app") || port === "8000")
    ? ""
    : "http://127.0.0.1:8000";
