import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import "./dashboard.scss"

const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");
const BASE_SOUND_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:8000");

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

const DashboardPage = () => {
  const modalRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadedBefore, setLoadedBefore] = useState(false);

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
    await fetch();
  }, 30000);

  const handleClick = () => {
    if(modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
    }
  }

  return (
    <div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button className="test-button" onClick={playNotification}>Test Sound</button>
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
      <div ref={modalRef} className="modal">
        <div className="content">
          <h1>Turn On Sound</h1>
          <p>Please turn on sound so you can receive alerts with new orders by clicking <b>OK</b>.</p>
          <button onClick={handleClick}><b>OK</b></button>
        </div>
      </div>
    </div>
  );
}

function Order({ id, customer_name: title, array_line_items: lineItems, total_amount, created_at: createdAt, acknowledged }) {

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
        <label htmlFor="read">
        <input onChange={onCheck} type="checkbox" name="read" checked={isRead} />
        Mark as Read
        </label>
        <br />
        <br />
        <ul>
          {lineItems.map(lineItem =>  (
            <li key={`${lineItem.quantity}-${lineItem.title}`}>
              <p><b>{lineItem.quantity}</b> {formatItemTitle(lineItem.title)}</p>
            </li>))}
          <li key="price" className="price">
            <p>${(total_amount / 100).toFixed(2)}</p>
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
