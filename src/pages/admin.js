import * as React from "react"
import { useState } from "react"
import axios from "axios"

const runNetlifyBuild = async () => {
  // const response = await axios.post("https://api.netlify.com/build_hooks/5c23354f454e1350f8543e78");
  console.log("running!");
};

const AdminPage = () => {
  const [status, setStatus] = useState("Waiting");
  const [password, setPassword] = useState(null);

  const verifyUser = async () => {
    const response = await axios.post("/.netlify/functions/password", { password: password });
    console.log(response);
  };

  const onTest = async () => {
    await axios.get("/.netlify/functions/gsheets").then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  };

  return (
    <div>
      <h1>Admin</h1>
      <p>Status: {status}</p>
      <input onChange={(e) => setPassword(e.target.value)} />
      <button onClick={verifyUser}>Login</button>
      <button onClick={runNetlifyBuild}>Update Website</button>
      <button onClick={onTest}>TEST</button>
    </div>
  )
};

export default AdminPage;
