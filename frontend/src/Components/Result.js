import React, { useState } from "react";
import "../Style/Result.css";
import axios from "axios";

const Result = ({ results, setResult }) => {
  const [selected, setSelected] = useState([]);
  const [selecteduris, setSelectedUris] = useState([]);
  const [playlistname, setPlaylistname] = useState([]);
  const handleChange = (e) => {
    setPlaylistname(e.target.value);
  };
  const handleClickAdd = (e) => {
    const data = results.filter((song) => song.id === e.target.id);
    setSelected((prev) => [...prev, ...data]);
    const uri1 = data.map((song) => song.uri);
    setSelectedUris((prev) => [...prev, ...uri1]);
    const data2 = results.filter((song) => song.id !== e.target.id);
    setResult(data2);
    console.log(selecteduris);
  };
  const handleClickDel = (e) => {
    const data = selected.filter((song) => song.id !== e.target.id);
    setSelected(data);
    const uri2 = data.map((song) => song.uri);
    setSelectedUris(uri2);
    const data2 = selected.filter((song) => song.id === e.target.id);
    setResult((prev) => [...data2, ...prev]);
    console.log(selecteduris);
  };
  const handleClickCreate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/authorize",
        {
          playlistname: playlistname,
          uriarray: selecteduris.toString(),
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(response.data);
      window.open(response.data, "_self");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="result">
      <div className="display">
        <div className="search-display">
          <h2>Search</h2>
          <div className="search-result">
            {results.map((song, i) => {
              return (
                <div key={i} className="song-result">
                  <img src={song.album.images[0].url} alt={song.album.name} />
                  <div style={{ width: "100%" }}>
                    <h2>{song.name}</h2>
                    <h3>{song.artists[0].name}</h3>
                  </div>
                  <button id={song.id} onClick={handleClickAdd}>
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="select-display">
          <h2>Selected</h2>
          <div className="select-result">
            {selected.map((song, i) => {
              return (
                <div key={i} className="song-select">
                  <img src={song.album.images[0].url} alt={song.album.name} />
                  <div style={{ width: "100%" }}>
                    <h2>{song.name}</h2>
                    <h3>{song.artists[0].name}</h3>
                  </div>
                  <button id={song.id} onClick={handleClickDel}>
                    -
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="create-playlist">
        <h3>Create Playlist</h3>
        <div className="create-input">
          <input
            onChange={handleChange}
            value={playlistname}
            type="text"
            placeholder="put your playlist name"
          />
          <button onClick={handleClickCreate}>
            <span>
              <img alt="createicon" src="./img/add.png" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
