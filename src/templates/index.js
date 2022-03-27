import * as React from "react"
import { Helmet } from "react-helmet"
import Logo from "../images/SDLogo1.svg"
import Yelp from "../images/Yelp_Logo.svg"
import WebsiteIcon from "../images/banhmi-icon.png"
import "@fontsource/ruda/600.css"
import "@fontsource/ruda/400.css"
import "./index.css"
import Appetizers from "../components/appetizers"
import Pho from "../components/pho"
import Bun from "../components/bun"
import Vegetarian from "../components/vegetarian"
import BanhCanh from "../components/banhcanh"
import HuTieu from "../components/hutieu"
import StirFried from "../components/stirfried"
import RiceDishes from "../components/ricedishes"
import FriedRice from "../components/friedrice"
import SourSoup from "../components/soursoup"
import Beverage from "../components/beverage"

// markup
const IndexPage = ({ pageContext: { restaurant, appetizers, pho, bun, vegetarian, banhcanh, hutieu, stirfried, ricedishes, friedrice, soursoup, beverage } }) => {
  return (
    <div className="main">
      <Helmet>
        <meta charSet="utf-8" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Saigon Deli - The Best Vietnamese Food in Seattle</title>
        <meta property="og:title" content="Saigon Deli - The Best Vietnamese Food in Seattle" />
        <meta property="og:description" content="The best and most affordable Vietnamese food in Seattle. We serve delicious banh mi, pho, and other rice dishes." />
        <meta property="og:url" content="https://www.saigondeliuw.com" />
        <meta name="description" content="The best and most affordable Vietnamese food in Seattle. We serve delicious banh mi, pho, and other rice dishes." />
        <meta name="keywords" content="banh mi, pho, vietnamese, bun bo hue, pho seattle, vietnamese food" />
        <meta name="author" content="Kevin Lee" />
        <link rel="icon" type="image/png" href={WebsiteIcon} sizes="64x64" />
      </Helmet>
        <header>
              <div className="small-info">
                  <p>takeout & dine-in</p>
                  <span className="seperator"></span>
                  <p>for cater: {restaurant.Phone}</p>
              </div>
        </header>
        {
          restaurant.Notice && (
            <div className="notice">
             <p>{restaurant.Notice}</p>
            </div>
          )
        }
        <div className="title-info">
          <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
          <p className="number">{restaurant.Phone}</p>
          <p className="address">4142 Brooklyn Ave NE Seattle, WA 98105</p>
          <span className="horizontal-line"></span>
          <p className="weekdays">Mon - Fri: {restaurant.Weekdays}</p>
          <p className="weekends">Sat - Sun: {restaurant.Weekends}</p>
          <div className="categories">
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
              <a href="#noodlesoup">Noodle Soup</a>
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
        <div className="menu">
          <Appetizers a={ appetizers }/>
          <Pho pho={ pho }/>
          <Bun bun={ bun }/>
          <Vegetarian vegetarian={ vegetarian }/>
          <BanhCanh banhcanh={ banhcanh }/>
          <HuTieu hutieu={ hutieu }/>
          <StirFried stirfried={ stirfried }/>
          <RiceDishes ricedishes={ ricedishes }/>
          <FriedRice friedrice={ friedrice }/>
          <SourSoup soursoup={ soursoup }/>
          <Beverage beverage={ beverage }/>
        </div>
        <div className="catering-box">
          <p className="catering">Don't forget to ask us about our catering service</p>
          <p className="catering" id="catering2">for your event or party.</p>
          <p className="catering" id="catering3">{restaurant.Phone}</p>
        </div>
      <footer>
        <div className="footer-info">
          <p id="footer-saigon">Saigon Deli</p>
          <a href="https://www.google.com/maps/place/4142+Brooklyn+Ave+NE,+Seattle,+WA+98105/@47.6581627,-122.3161964,17z/data=!3m1!4b1!4m5!3m4!1s0x549014f4a024abe1:0x1738ed6050774b05!8m2!3d47.6581627!4d-122.3140077" target="_blank" rel="noreferrer">
            4142 Brooklyn Ave NE Seattle, WA 98105
          </a>
          <p id="footer-hours">Mon - Fri: {restaurant.Weekdays}</p>
          <p id="footer-hours">Sat - Sun: {restaurant.Weekends}</p>
        </div>
        <a id="yelp-link" href="https://www.yelp.com/biz/saigon-deli-seattle-2?osq=saigon+deli" target="_blank" rel="noreferrer">
          <img src={Yelp} className="pho-img" id="yelp-img" alt="Yelp logo"></img>
        </a>
      </footer>
    </div>
  )
}

export default IndexPage
