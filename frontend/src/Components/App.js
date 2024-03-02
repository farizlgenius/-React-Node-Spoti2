import React from "react";
import Main from "./Main";
import Nav from "./Nav";
import "../Style/App.css";

const App = () => {
  return (
    <div className="body">
      <Nav />
      <Main />
    </div>
  );
};

export default App;
