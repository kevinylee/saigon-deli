import * as React from "react"
import { useState } from "react"
import axios from "axios"
import "./admin.css"

const BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=triggered+by+gsheets+change";
const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1GneLscLi_f5Xc4moIaIQm5DdDALuP1JtFqOtUhy9yAo/edit#gid=0";

const runNetlifyBuild = async () => {
  const response = await axios.post(BUILD_HOOK_URL).catch(err => {
    console.log(err);
    return;
  });

  if (response.status === 200) {
    console.log("Successfully building the website!");
  }
};

const AdminPage = () => {
  const [status, setStatus] = useState("Waiting");
  const [password, setPassword] = useState(null);

  const verifyUser = async () => {
    const BASE_URL = process.env.ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999";
    const { data } = await axios.post(`${BASE_URL}/.netlify/functions/password`, 
      { password: password }
    ).catch(err => {
      console.log(err);
      return;
    });

    if (data.valid) {
      setStatus("Logged In.");      
    } else {
      setStatus("Incorrect Password.");
    }
  };

  return (
    <div id="container">
      <h1>Administrator Options</h1>
      <div id="header">
        <a href={GOOGLE_SHEETS_URL} target="_blank" rel="noreferrer">Menu</a>
        <p><b>Status:</b> {status}</p>
      </div>
      <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={verifyUser}>Login</button>
      <button  disabled={status !== "Logged In."} onClick={runNetlifyBuild}>Update Menu</button>
    </div>
  )
};

export default AdminPage;
