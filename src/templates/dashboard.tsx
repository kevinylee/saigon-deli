import React, { useEffect, useRef } from "react"
import { useState } from "react"
import axios from "axios"
import { DateTime } from 'luxon'
import Order from "../components/dashboard/Order"
import { NETLIFY_FUNCTIONS_URL } from "../components/utilities";
import { useInterval } from "../components/hooks/useInterval"

import { playNotification } from "../lib/sound"
import { Login } from "../components/dashboard/Login"
import { SettingsModal } from "../components/dashboard/SettingsModal"

import "./dashboard.scss"

interface DashboardPageProps {
  pageContext: {
    businessDetails: {
      Weekdays: string
      Weekends: string
      Phone: string
      Notice: string
      Catering: string
      Schedules: { id: number; reason: string }[]
    }
    open: boolean
  }
}

const DashboardPage = ({ pageContext: { businessDetails, open } }: DashboardPageProps) => {
  const introModalRef = useRef(null);
  const settingsModalRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadedBefore, setLoadedBefore] = useState(false);
  const [settingsModalOpen, toggleSettingsModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isOpen, setIsOpen] = useState(open);

  async function fetch() {
    try {
      const res = await axios.get(`${NETLIFY_FUNCTIONS_URL}/.netlify/functions/orders`);

      if (res) {
        const { orders: newOrders, open } = res.data;

        if (orders.length && newOrders.length && orders[0].id !== newOrders[0].id && loadedBefore) {
          playNotification();
        }

        setOrders(newOrders);
        setIsOpen(open);

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

  return (
      <Login isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <p>WEBSITE IS <b className={`store-status-${isOpen ? "open" : "closed"}`}>{isOpen ? "OPEN" : "CLOSED"}</b></p>
          <button className="default-button test-button" onClick={toggleModal}>Settings</button>
        </div>
        {
          orders.length === 0 ?
            <p className="noOrders">No orders.</p> :
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {
                orders.slice(0, 100).map((order) =>
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
        <SettingsModal isOpen={isOpen} setIsOpen={setIsOpen} toggleModal={toggleModal} settingsModalRef={settingsModalRef} />
      </Login>
  );
}

export default DashboardPage;


