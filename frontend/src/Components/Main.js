import React, { useState } from "react";
import Search from "./Search";
import Result from "./Result";
import "../Style/Main.css";
import Footer from "./Footer";
import axios from "axios";

const Main = () => {
  const [result, setResult] = useState([]);
  const Searching = async (search) => {
    try {
      const data = {
        q: `remaster%20track:${search}`,
        type: "track",
        limit: 10,
      };
      const data2 = JSON.stringify(data);
      const data3 = encodeURIComponent(data2);
      const response = await axios.get(
        "http://localhost:3001/search?data=" + data3
      );
      const result = response.data.tracks.items;
      console.log(result);
      if (result.length === 0) {
        alert("Not found!! Please put something more specific");
      } else {
        setResult(response.data.tracks.items);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="main">
      <Search handleClick={Searching} />
      <Result results={result} setResult={setResult} />
      <Footer />
    </div>
  );
};

export default Main;
