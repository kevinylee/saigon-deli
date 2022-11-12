import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import "./dashboard.scss"

const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

const playNotification = () => {
  const audio = new Audio('notify_order.mp3');
  audio.play();
};

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
  }, 3000);

  const handleClick = () => {
    if(modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
    }
  }

  return (
    <div>
      {
        orders.length === 0 ? 
        <p className="noOrders">No orders.</p> :
        orders.slice(0, 100).map(order => 
          <li key={order.id} className="card">
            <Order {...order} />
          </li>
      )}
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

function Order({ id, customer_name: title, array_line_items: lineItems, total_amount, created_at: createdAt }) {
  return (
    <div className="order">
      <div className="timestamp">
        <p className="date">{formatDate(createdAt).toLocaleDateString('en-US')}</p>
        <p className="time">{formatDate(createdAt).toLocaleTimeString('en-US')}</p>
      </div>
      {
        title && <p className="orderTitle">{title}</p>
      }
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


const formatDate = (timestamp) => (new Date(timestamp));


export default DashboardPage;
