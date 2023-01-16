import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import "./dashboard.scss"
import { DateTime } from 'luxon'
import TextField from '@mui/material/TextField';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");
const BASE_SOUND_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:8000");

const BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=triggered+by+store+status+change";

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

const DashboardPage = ({ pageContext: { restaurant, open } }) => {
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
        if (orders.length < res.data.length && loadedBefore) {
          playNotification();
        }

        setOrders(res.data);

        if (!loadedBefore) {
          setLoadedBefore(true);
          console.log('Set loaded before to: ' + loadedBefore)
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
    if(modalRef) {
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

  const toggleStoreOpening = async () => {
    const openStatus = isOpen;

    setIsOpen(!openStatus);

    const res = await axios.post(`${BASE_URL}/.netlify/functions/schedules`, {
      type: 'TOGGLE_OPEN',
      open: !openStatus
    });

    const response = await axios.post(BUILD_HOOK_URL).catch(err => {
      console.log(err);
      return;
    });
  
    if (response.status === 200) {
      console.log("Successfully building the website!");
    }
  }

  return (
    <div>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
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
            {/*
            <DatePicker
              className="date-picker"
              label="Start Date"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <span>to</span>
            <DatePicker
              className="date-picker"
              label="End Date"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <h2>Date</h2>
            <ul>
              {restaurant.Schedules.map((schedule) => 
                <li key={schedule.id}>
                  {DateTime.fromISO(schedule.start_datetime).toLocaleString(DateTime.DATE_FULL)} → {DateTime.fromISO(schedule.end_datetime).toLocaleString(DateTime.DATE_FULL)}
                </li>
              )}
            </ul>*/}
            {
              isOpen ? 
                <button className="default-button" onClick={toggleStoreOpening}><b>Close Orders</b></button> : 
                <button className="default-button" onClick={toggleStoreOpening}><b>Open Orders</b></button>
            }
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
}

function Order({ id, phone_number: phoneNumber, customer_name: title, array_line_items: lineItems, total_amount, created_at: createdAt, acknowledged }) {

  const [isRead, markAsRead] = useState(acknowledged);

  const isAcknowledged = () => {
    return isRead ? "acknowledged" : "alert"
  };

  const onCheck = async (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      markAsRead(true);

      const res = await axios.post(`${BASE_URL}/.netlify/functions/orders`, {
        id: id
      });

      console.log(res);
    }
  }

  const getTipAmount = () => {
    const found = lineItems.find((item) => item.title == 'Tip Jar');

    if (!found) {
      return -1;
    }

    return found.quantity;
  };

  return (
    <div className={`card-${isAcknowledged()}`}>
      <div className="order">
        <div className="timestamp">
          <p className="date">{formatDate(createdAt).toLocaleDateString('en-US')}</p>
          <p className="time">{formatDate(createdAt).toLocaleTimeString('en-US')}</p>
        </div>
        {
          title && <p className="orderTitle">{title} ({totalNumItems(lineItems)} items)</p>
        }
        {
          phoneNumber && <p style={{ fontSize: "1.75rem" }}>{phoneNumber}</p>
        }
        <label htmlFor="read">
          <input onChange={onCheck} type="checkbox" name="read" checked={isRead} />
          Mark as Read
        </label>
        <br />
        <br />
        <ul>
          {lineItems.map(lineItem =>  (
            <li key={`${lineItem.quantity}-${lineItem.title}`}>
            {
              !lineItem.title.includes('Tip Jar') && 
                <p><b>{lineItem.quantity}</b> {formatItemTitle(lineItem.title)}</p>
            }
            </li>))}
          <li key="price" className="price">
            <p>
              {(getTipAmount() > 0) && <span>Tip: ${getTipAmount()}<br/></span>}
              Total: ${(total_amount / 100).toFixed(2)}
            </p>
          </li>
        </ul>
        <br />
        <p className="badge">
          AUTHORIZED
        </p>
      </div>
    </div>
  )
}

function formatItemTitle(title) {
  if (title.indexOf(".") !== -1) {
    const parts = title.split(".");
  
    return parts[1];
  } else {
    return title;
  }
}

function totalNumItems(lineItems) {
  return lineItems.reduce((curr, item) => curr + item.quantity, 0)
}

const formatDate = (timestamp) => (new Date(timestamp));


export default DashboardPage;
