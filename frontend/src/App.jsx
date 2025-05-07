import { useState } from "react";
import suntekLogo from "/logo.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://suntek.ai" target="_blank">
          <img src={suntekLogo} className="logo" alt="Suntek logo" />
        </a>
      </div>
      <h1>
        <span className="company-name">SUNTEK AI</span> Task Management App
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p className="visit-site">
        Click on the Company Logo to visit the main site.
      </p>
    </>
  );
}

export default App;
