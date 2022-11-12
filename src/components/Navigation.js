import React from "react";
import Logo from "../images/SDLogo1.svg"

export default function NavigationPage({ restaurant }) {
  return (
    <div className="contents">
    <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
    <p className="number">{restaurant.Phone}</p>
    <a className="address" href="https://www.google.com/maps/place/4142+Brooklyn+Ave+NE,+Seattle,+WA+98105/@47.6581627,-122.3161964,17z/data=!3m1!4b1!4m5!3m4!1s0x549014f4a024abe1:0x1738ed6050774b05!8m2!3d47.6581627!4d-122.3140077" target="_blank" rel="noreferrer">
      4142 Brooklyn Ave NE Seattle, WA 98105
    </a>
    <br />
    <a className="real-menu-link" href="https://drive.google.com/file/d/1plO_JfiofpCCu1gr1PayHl3s5vsQOuQm/view?usp=sharing" target="_blank" rel="noreferrer"><span style={{ textDecoration: "underline" }}>Menu</span> →</a> {/* Fill in the link here. */}
    <hr className="divider" />
    <p className="times">
    Mon - Fri: {restaurant.Weekdays}
    <br />
    Sat - Sun: {restaurant.Weekends}</p>
    <div className="anchor">
      <div className="navigation-categories">
        <div className="online-order-header">        
          <h2>Order Online</h2>
        </div>
        <div className="links">
          <div className="top-categories">
            <a href="#appetizers">Appetizers</a>
            <span className="seperator"></span>
            <a href="#pho">Pho</a>
            <span className="seperator"></span>
            <a href="#bun">Rice Vermicelli</a>
            <span className="seperator"></span>
            <a href="#vegetarian">Vegetarian</a>
            <span className="seperator"></span>
            <a href="#banhcanh">Banh Canh</a>
            <span className="seperator"></span>
            <a href="#hutieu">Hu Tieu</a>
          </div>
          <div className="bottom-categories">
            <a href="#stirfried">Stir Fried Noodles</a>
            <span className="seperator"></span>
            <a href="#ricedishes">Rice Dishes</a>
            <span className="seperator"></span>
            <a href="#friedrice">Fried Rice</a>
            <span className="seperator"></span>
            <a href="#hotsoursoups">Soup</a>
            <span className="seperator"></span>
            <a href="#beverages">Beverage</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
};