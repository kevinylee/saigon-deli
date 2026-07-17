import axios from "axios";
import React, { useRef, useState } from "react";
import { NETLIFY_FUNCTIONS_URL } from "../utilities";

export function Login({
  isAuthenticated,
  setIsAuthenticated,
  children
} : {
  isAuthenticated: boolean,
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  children: React.ReactNode
}) {

  const passwordModalRef = useRef(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const res = await axios.post(`${NETLIFY_FUNCTIONS_URL}/.netlify/functions/auth`, {
        password: passwordInput
      });

      if (res.data.success) {
        setIsAuthenticated(true);
        if (passwordModalRef.current) {
          passwordModalRef.current.style.display = 'none';
        }
      } else {
        setPasswordError('Incorrect password. Access denied.');
      }
    } catch (e) {
      setPasswordError('Incorrect password. Access denied.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div ref={passwordModalRef} className="modal">
        <div className="content" style={{ maxWidth: 400 }}>
          <h1>Dashboard Access</h1>
          <p>Please enter the password to access the dashboard.</p>
          <form onSubmit={handlePasswordSubmit}>
            <div id="password-wrapper">
              <input
                id="password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (<p id="login-error">{passwordError}</p>)}
            </div>
            <button type="submit" className="default-button">
              <b>Submit</b>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}