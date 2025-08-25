import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import "./dashboard.scss"
import { DateTime } from 'luxon'
import Order from "../components/dashboard/Order"
import { BASE_URL, BASE_SOUND_URL, BUILD_HOOK_URL, IS_PROD } from "../components/utilities";

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

const DashboardPage = ({ pageContext: { business_details, open } }) => {
  const now = DateTime.now().setZone('America/Los_Angeles');

  const modalRef = useRef(null);
  const settingsModalRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadedBefore, setLoadedBefore] = useState(false);
  const [settingsModalOpen, toggleSettingsModal] = useState(false);

  // Date range for a single schedule
  const [startDate, setStartDate] = useState(now);
  const [endDate, setEndDate] = useState(now);

  const [isOpen, setIsOpen] = useState(open);

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

  useInterval(async () => {
    const now = DateTime.now().setZone('America/Los_Angeles')
    const withinHours = now.hour >= 11 && now.hour <= 19;

    if (withinHours) {
      // AND CHECK WITH CURRENT DATE RANGES ABOVE
      await fetch();
    }
  }, 30000);

  useEffect(() => {
    async function initialFetch() {
      await fetch();
    }

    initialFetch();
  }, []);

  const handleClick = () => {
    if (modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
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

  const triggerRebuild = async () => {
    const response = await axios.post(BUILD_HOOK_URL).catch(err => {
      console.log(err);
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
      await triggerRebuild();
    }
  }

  return (
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
      <div ref={modalRef} className="modal-initial-open modal">
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
          {
            isOpen ?
              <button className="default-button" onClick={toggleStoreOpening}><b>Close Orders</b></button> :
              <button className="default-button" onClick={toggleStoreOpening}><b>Open Orders</b></button>
          }
          <button className="default-button" onClick={playNotification}><b>Test Sound</b></button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
