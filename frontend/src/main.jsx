import React from "react";
import ReactDOM from "react-dom/client";
import Parse from "parse/dist/parse.min.js";

import "./index.css";
import App from "./App.jsx";

// Initialize Parse SDK using the Back4app API keys
Parse.initialize(
  import.meta.env.VITE_BACK4APP_APPLICATION_ID,
  import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY,
);
Parse.serverURL = "https://parseapi.back4app.com/";

console.log(import.meta.env.VITE_BACK4APP_APPLICATION_ID);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);
