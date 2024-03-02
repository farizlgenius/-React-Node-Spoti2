import React, { useState } from "react";
import "../Style/Search.css";

const Search = (props) => {
  const [search, setSearch] = useState("");
  const handleChange = (e) => {
    setSearch(e.target.value);
    console.log(search);
  };
  const handleClick = () => {
    props.handleClick(search);
    setSearch("");
  };
  return (
    <div className="search">
      <h3>Search your favorite song here</h3>
      <div className="search-input">
        <input
          value={search}
          onChange={handleChange}
          type="text"
          placeholder="search something here"
        />
        <button onClick={handleClick}>
          <span>
            <img alt="searchicon" src="./img/search.png" />
          </span>
        </button>
      </div>
      <div className="search-setting">
        <label>
          <input type="radio" />
          Song
        </label>
        <label>
          <input type="radio" />
          Artist
        </label>
        <label>
          <input type="radio" />
          Album
        </label>
      </div>
      <h6>select type for searching</h6>
    </div>
  );
};

export default Search;
