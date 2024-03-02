import express, { query } from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

let client_id = process.env.SPOTIFY_CLIENT_ID;
let client_secret = process.env.SPOTIFY_CLIENT_SECRET;
let redirect_uri = "http://localhost:3001/createplaylist";
let frontend_url = "http://localhost:3000";
let client_token = "";
let authorize_token = "";
let refresh_token = "";
let playlistName = "";
let trackArray = [];
let userId = "";

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const valuearray = new Array(length);
  for (let i = 0; i < valuearray.length; i++) {
    valuearray[i] = possible[Math.floor(Math.random() * possible.length)];
  }
  return valuearray.reduce((a, b) => a + b);
};

console.log(generateRandomString(43));

const corsOptions = {
  origin: frontend_url,
  Credential: true,
};

const querystring = {
  response_type: "code",
  client_id: client_id,
  state: generateRandomString(43),
  scope: "playlist-modify-public playlist-modify-private",
};

const port = process.env.BACK_END_PORT;
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.redirect(redirect_uri);
});

//#######################################################Search Tracks Section#######################################################//
app.get("/search", async (req, res) => {
  console.log("get search -----> 1");
  try {
    const data = JSON.parse(req.query.data);
    const search_result = await axios.get(
      "https://api.spotify.com/v1/search?" +
        new URLSearchParams(data).toString(),
      {
        headers: {
          Authorization: "Bearer " + client_token,
        },
      }
    );
    console.log("search success");
    res.json(search_result.data);
  } catch (err) {
    console.log(err.response.data);
    if (err.response.data.error.status === 400) {
      const data = encodeURIComponent(req.query.data);
      res.redirect("/client_token?data=" + data);
    }
  }
});

app.get("/client_token", async (req, res) => {
  console.log("Generate Token");
  console.log(req.query.data);
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "client_credentials",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            new Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = encodeURIComponent(response.data.access_token);
    client_token = response.data.access_token;
    res.redirect("/search?data=" + req.query.data);
  } catch (err) {
    console.log(err);
  }
});

//########################################################Create Playlist Section#######################################################//

app.post("/authorize", (req, res) => {
  console.log("#######################Authorize##################");
  const myArray = req.body.uriarray.split(",");
  playlistName = req.body.playlistname;
  trackArray = myArray;
  console.log(trackArray);
  res.send(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams(querystring).toString() +
      "&redirect_uri=" +
      redirect_uri
  );
});

app.get("/createplaylist", (req, res) => {
  let code = req.query.code;
  let state = req.query.state;
  if (state === null) {
    res.render("state is mismath");
  } else {
    axios
      .post(
        "http://localhost:3001/getcurrentuser",
        {
          code: code,
          state: state,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        axios
          .post(
            "http://localhost:3001/addplaylist",
            {
              userId: response.data,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((response) => {
            axios
              .post(
                "http://localhost:3001/addtrack",
                {
                  playlistId: response.data.id,
                },
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              )
              .then((response) => console.log(response));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
    res.redirect(frontend_url);
  }
});

app.post("/getcurrentuser", (req, res) => {
  const getcurrentuser = async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${authorize_token}`,
        },
      });
      const data = JSON.stringify(response.data.id);
      console.log(data);
      res.send(data);
    } catch (err) {
      console.log(`error from get currentuserProfile = ` + err);
      if (
        err.response.data.error.status === 400 ||
        err.response.data.error.status === 401
      ) {
        console.log("request Author Token for User");
        const getAuthorizeToken = async () => {
          try {
            const response = await axios.post(
              "https://accounts.spotify.com/api/token",
              {
                grant_type: "authorization_code",
                code: `${req.body.code}`,
                redirect_uri: redirect_uri,
              },
              {
                headers: {
                  "Content-type": "application/x-www-form-urlencoded",
                  Authorization:
                    `Basic ` +
                    new Buffer.from(client_id + ":" + client_secret).toString(
                      "base64"
                    ),
                },
              }
            );
            authorize_token = response.data.access_token;
            refresh_token = response.data.refresh_token;
            getcurrentuser();
          } catch (err) {
            console.log(err);
          }
        };
        getAuthorizeToken();
      } else {
        console.log(err.response.data.error);
      }
    }
  };
  getcurrentuser();
});

app.post("/addplaylist", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${req.body.userId}/playlists`,
      {
        name: playlistName,
        description: `${playlistName} is created from Spoti Web application by Farizl@2024`,
        public: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authorize_token}`,
        },
      }
    );
    //console.log(response.data);
    res.send(response.data);
  } catch (err) {
    console.log(err);
  }
});

app.post("/addtrack", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${req.body.playlistId}/tracks`,
      {
        uris: trackArray,
        position: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authorize_token}`,
        },
      }
    );
    res.send(response.data);
  } catch (err) {
    console.log(err.response.data);
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
