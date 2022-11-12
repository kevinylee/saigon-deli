import React, { useState, useEffect } from 'react';
import axios from "axios";
import Logo from "../images/SDLogo1.svg"
import "./receipt.scss";

const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

const ReceiptPage = (props) => {
  const [order, setOrder] = useState({ lineItems: [], loading: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    async function fetch() {
      const sessionId = params.get('id');

      if(sessionId) {
        try {
          const response = await axios.get(`${BASE_URL}/.netlify/functions/receipt?sessionId=${sessionId}`)

          setOrder({
            lineItems: response.data.lineItems,
            loading: false
          });

        }catch(err) {
          console.log(err)

          setOrder({
            lineItems: [],
            loading: false
          });
        } 
      }
    }

    fetch();
  }, []);

  return (
    <div className="container">
      <div className="order">
        <div className="logo">
          <a href="/">
            <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
          </a>
        </div>
        { 
          order.loading ? 
            <Loading /> : 
            (order.lineItems.length === 0 ? <Error /> : <Success order={order.lineItems} />)
        }
      </div>
    </div>
  )
}

function Success({ order }) {
  const totalPrice = order.reduce((prev, cur) => {
    return prev + (cur.amount_total);
  }, 0);

  return (
    <React.Fragment>
      <h1 className="summaryTitle">Thank you for supporting!</h1>
      <hr />
      <p className="restaurantNote">We <b>sincerely</b> appreciate you taking the time to order from us. <br /> Instructions for picking up your order can be found below.</p>
      <div className="receipt">
        <h2>Order Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {
              order.length > 0 && order.map((el, i) =>  
                <tr key={i}>
                  <td className="itemName"><span className="quantity"><b>{el.quantity}</b></span> {formatItemTitle(el.description)}</td>
                  <td className="amountTotal">${(el.amount_total / 100).toFixed(2)}</td>
                </tr>
              )
            }
          </tbody>
          <tfoot>
            <tr>
              <td><b>Total:</b></td>
              <td className="amountTotal"><b>${(totalPrice / 100).toFixed(2)}</b></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Instructions />
    </React.Fragment>
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

function Error() {
  return (
    <React.Fragment>
      <h1>Whoops!</h1>
      <p>Something strange happened. <br /> Text 206-522-6047 for help or swing by Saigon Deli!</p>
    </React.Fragment>
  )
}

function Loading() {
  return (
    <React.Fragment>
      <h1>Loading...</h1>
      <p>This might take a little longer than usual. Thank you for being patient!</p>
    </React.Fragment>
  );
}

function Instructions() {
  return (
    <div className="instructions">
      <h1>Instructions:</h1>
      <p>Orders are approximately finished in <b>15</b> minutes. <br /> <br /> Please pick up your order at Saigon Deli.</p> 
      <div className="contactRow">
        <a href="https://goo.gl/maps/g3WZGRRgnPMeJ6rz7" target="_blank" rel="noopener noreferrer">4142 Brooklyn Ave NE Seattle, WA 98105</a>
      </div>
      <br />
      <div className="contactRow">
        <a href="tel:206-634-2866">(206) 634-2866</a>
      </div>
      <p><b>When you arrive, tell the cashier your name and order and enjoy!</b></p>
      <p>You can go back to the restaurant website here:</p>
      <a href="/">https://saigondeliuw.com/</a>
    </div>
  )
}

export default ReceiptPage;
