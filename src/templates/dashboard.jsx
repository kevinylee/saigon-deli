import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import "./dashboard.scss"
import { DateTime } from 'luxon'
import Order from "../components/dashboard/Order"
import { BASE_URL, BASE_SOUND_URL, STORE_STATUS_BUILD_HOOK_URL, REBUILD_BUILD_HOOK_URL, IS_PROD } from "../components/utilities";

const playNotification = () => {
  const audio = new Audio(`${BASE_SOUND_URL}/notify_order.mp3`);

  // Play three times
  setIntervalX(() => {
    audio.play();
  }, 2500, 3);
};

// Some stackoverflow method
function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(function () {

    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const DashboardPage = ({ pageContext: { businessDetails, open } }) => {
  const introModalRef = useRef(null);
  const settingsModalRef = useRef(null);
  const passwordModalRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadedBefore, setLoadedBefore] = useState(false);
  const [settingsModalOpen, toggleSettingsModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isOpen, setIsOpen] = useState(open);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const res = await axios.post(`${BASE_URL}/.netlify/functions/auth`, {
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

  async function fetch() {
    try {
      const res = await axios.get(`${BASE_URL}/.netlify/functions/orders`);

      if (res) {
        if (orders.length && res.data.length && orders[0].id !== res.data[0].id && loadedBefore) {
          playNotification();
        }

        setOrders(res.data);

        if (!loadedBefore) {

          setLoadedBefore(true);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  const THIRTY_SECONDS = 30000;

  useInterval(async () => {
    if (!isAuthenticated) return;

    const now = DateTime.now().setZone('America/Los_Angeles')
    const withinHours = now.hour >= 11 && now.hour <= 19;

    if (withinHours) {
      // AND CHECK WITH CURRENT DATE RANGES ABOVE
      await fetch();
    }
  }, THIRTY_SECONDS);

  useEffect(() => {
    async function initialFetch() {
      if (isAuthenticated) {
        await fetch();
      }
    }

    initialFetch();
  }, [isAuthenticated]);

  const handleClick = () => {
    if (introModalRef) {
      // Hide the modal and voila!
      introModalRef.current.style.display = 'none';
    }
  }

  const toggleModal = () => {
    if (settingsModalRef && !settingsModalOpen) {
      settingsModalRef.current.style.display = 'block';
      toggleSettingsModal(true)
    } else if (settingsModalRef && settingsModalOpen) {
      settingsModalRef.current.style.display = 'none';
      toggleSettingsModal(false)
    }
  };

  const triggerRebuild = async (url) => {
    const response = await axios.post(url).catch(err => {
      console.log(err);

      alert(err);
      return;
    });
  }

  const toggleStoreOpening = async () => {
    const openStatus = isOpen;

    setIsOpen(!openStatus);

    const res = await axios.post(`${BASE_URL}/.netlify/functions/schedules`, {
      type: 'TOGGLE_OPEN',
      open: !openStatus
    });

    if (IS_PROD) {
      await triggerRebuild(STORE_STATUS_BUILD_HOOK_URL);
    }
  }

  const rebuildWebsite = async () => {
    await triggerRebuild(REBUILD_BUILD_HOOK_URL);
  }

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

  return (
    <div>
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <p>WEBSITE IS <b className={`store-status-${isOpen ? "open" : "closed"}`}>{isOpen ? "OPEN" : "CLOSED"}</b></p>
          <button className="default-button test-button" onClick={toggleModal}>Settings</button>
        </div>
        {
          orders.length === 0 ?
            <p className="noOrders">No orders.</p> :
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {
                orders.slice(0, 100).map(order =>
                  <li key={order.id}>
                    <Order {...order} />
                  </li>
                )}
            </ul>
        }
        <div ref={introModalRef} className="modal-initial-open modal">
          <div className="content" style={{ maxWidth: 500 }}>
            <h1>Turn On Sound</h1>
            <p>Please turn on sound so you can receive alerts with new orders by clicking <b>OK</b>.</p>
            <button className="default-button" onClick={handleClick}><b>OK</b></button>
          </div>
        </div>
        <div ref={settingsModalRef} className="modal-initial-closed modal">
          <div className="content">
            <div className="header-bar">
              <h1>Settings</h1>
              <button className="default-button" style={{ margin: 0 }} onClick={toggleModal}>Exit</button>
            </div>
            <div className="actions">
              {
                isOpen ?
                  <button className="default-button" onClick={toggleStoreOpening}><b>Close Orders</b></button> :
                  <button className="default-button" onClick={toggleStoreOpening}><b>Open Orders</b></button>
              }
              <button className="default-button" onClick={playNotification}><b>Test Sound</b></button>
              <button className="default-button" onClick={rebuildWebsite}><b>Rebuild Website</b></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
