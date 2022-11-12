import React, { useState } from "react"
import { Helmet } from "react-helmet"
import WebsiteIcon from "../images/banhmi-icon.png"
import "@fontsource/ruda/600.css"
import "@fontsource/ruda/400.css"
import { StaticImage } from "gatsby-plugin-image"
import "./index.scss"
import Section from "../components/Section"
import Navigation from "../components/Navigation"
import { loadStripe } from '@stripe/stripe-js'
import axios from "axios"
import { DateTime } from 'luxon'

const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

// markup
const IndexPage = ({ pageContext: { restaurant, appetizers, pho, bun, vegetarian, banhcanh, hutieu, stirfried, ricedishes, friedrice, soursoup, beverage } }) => {

  const [cart, updateCart] = useState([]);
  const [allowCheckout, updateAllowCheckout] = useState(false);

// Create dates assuming default time zone is UST
const restrictedRanges = [
  [DateTime.fromISO("2022-09-05T00:00:00Z", { zone: 'America/Los_Angeles' }), DateTime.fromISO("2022-09-07T00:00:00Z", { zone: 'America/Los_Angeles' })],
  [DateTime.fromISO("2022-09-30T00:00:00Z", { zone: 'America/Los_Angeles' }), DateTime.fromISO("2022-10-03T00:00:00Z", { zone: 'America/Los_Angeles' })]
];

const canOrder = () => {

  if (process.env.GATSBY_ENV !== 'prod') {
    return true;
  }
  
  const now = DateTime.now().setZone('America/Los_Angeles')

  const withinRestrictions = restrictedRanges.some(([start, end]) => { 
    return now <= end && now >= start;
  });

  // 11am to 7pm
  const withinHours = now.hour >= 11 && now.hour <= 19;

  if (!withinHours) { 
    return false;
  }

  return !withinRestrictions;
}

  async function handleCheckout(_) {
    console.log(process.env.GATSBY_STRIPE_PUBLIC_KEY)
    const stripe = await loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY);
    // TODO: add canOrder?

    if(cart.length > 0 && canOrder()) {
      const response = await axios.post(`${BASE_URL}/.netlify/functions/checkout`, {
        lineItems: cart
      })

      console.log(response.data)
      if(response.data) {
        // When the customer clicks on the button, redirect them to Checkout.
        const result = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId
        });
    
        if (result.error) {
          console.log(result.error.message);
          alert(result.error.message)
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
        }
      }
    }else{
      // TODO: Update this. 
      alert("Error: Please check your order and that Saigon Deli is open at this time.");
    }
  }

  function handleQuantityUpdate(itemId) {
    // itemId is the priceId!
    return (event) => {
      const quantity = parseInt(event.target.value);

      const isTracked = cart.some(item => item.itemId === itemId);

      if(quantity === 0 && isTracked) {
        // remove item from cart
        const updated = cart.reduce((prev, current) => {
          return current.itemId !== itemId ? [...prev, current] : prev;
        }, []);

        updateCart(updated);
      }else if (quantity > 0 && !isTracked) {

        // append item to the cart
        updateCart([...cart, { itemId: itemId, quantity }])
      }else if (quantity > 0 && isTracked) {

        // update item quantity in the cart
        updateCart(cart.map(lineItem => lineItem.itemId === itemId ? { itemId: itemId, quantity } : lineItem))
      }
    };
  }

  return (
    <div className="main">
      <Helmet>
        <meta charSet="utf-8" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Saigon Deli - The Best Vietnamese Food in Seattle</title>
        <meta property="og:title" content="Saigon Deli - The Best Vietnamese Food in Seattle" />
        <meta property="og:description" content="Serving delicious Vietnamese food in the University District. We serve banh mi, pho, bun bo hue, and other specialiy dishes all made in-house with love." />
        <meta property="og:url" content="https://www.saigondeliuw.com" />
        <meta name="description" content="Serving delicious Vietnamese food in the University District. We serve banh mi, pho, bun bo hue, and other specialty dishes all made in-house with love." />
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
        <div className="title-container">
          <StaticImage
            className="backdrop"
            placeholder="blurred"
            src="../images/background_large.jpeg" 
            alt="Backdrop with food"
            layout="fullWidth"
            quality={85}
          />
          <Navigation restaurant={restaurant} />
        </div>
        <div className="menu">
          <Section reference="appetizers" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={appetizers} category="Appetizers" description="Traditional Vietnamese small eats." />
          
          <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_spring_roll_with_shrimp.jpg" className="pho-img" alt="Spring Rolls" />
            <p className="desc">1. Spring Rolls - Goi Cuon</p>
          </div>
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Eggroll.jpg" className="pho-img" alt="Vegetarian Egg Rolls" />
            <p className="desc">2. Vegetarian Egg Rolls</p>
          </div>
          </div>
          <div className="pics">
            <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Combo_Sandwich_with_Wonton_soup.jpg" className="pho-img" alt="Banh Mi & Wonton Soup" />
            <p className="desc">3A. COMBO: Sandwich & Wonton soup</p>
            </div>
          </div>

          <Section reference="pho" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={pho} twoColumn={true} category="Pho (noodle soup)" description="Rice noodle soup with your choice of meat, seafood, or tofu. Served with beansprouts, basil, and lime. Size comes in small or large." />

          <div className="pics">
            <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Pho_Beef.jpg" className="pho-img" alt="Special Pho (beef and meatballs)" />
              <p className="desc">11. Special Pho (beef and meatballs)</p>
            </div>
          </div>

          <Section reference="bun" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={bun} category="Bun (Rice Vermicelli)" description="Vermicelli noodles topped with lettuce, bean sprouts, pickled carrots, crushed peanuts, and your choice of meat, seafood, or tofu. (optional: can add spicy lemongrass)" />

          <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Bun_with_charbroiled_Pork_and_eggroll.jpg" className="pho-img" alt="Bun with charbroiled pork & eggrolls" />
            <p className="desc">12. Bun with charbroiled pork & eggrolls</p>
          </div>
          </div>

          <Section reference="vegetarian" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={vegetarian} category="Vegetarian Dishes" />

          <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Chowfun_with_tofu_and_vegetables.jpg" className="pho-img" alt="Chowfun with tofu andvegetables" /> 
            <p className="desc">25. Chowfun w/ tofu & vegetables</p>
          </div>
          </div>

          <Section reference="banhcanh" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={banhcanh} category="Banh Canh (udon noodle soup)" description="Udon noodles served in a homemade broth with vegetables, green onions, cilantro and your choice of meat or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Banh_Canh_Soup.jpg" className="pho-img" alt="Banh canh w/ shrimp" />
              <p className="desc">34. Banh canh w/ shrimp</p>
          </div>
          </div>

          <Section reference="hutieu" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={hutieu} category="Hu Tieu (noodle soup)" description="Rice or egg noodles served in a pork broth with broccoli and your choice of meat, seafood, or tofu." />
          <Section reference="stirfried" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={stirfried} category="Stir Fried Noodles" description="Rice or egg noodles stir fried with broccoli, carrot, and your choice of meat, seafood, or tofu. Served with a sprinkle of crushed peanut." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_chowmein_with_chicken_and_vegetable.jpg" className="pho-img" alt="Chowmein with vegetables & chicken" />
              <p className="desc">43. Chowmein with vegetables & chicken</p>
          </div>
          </div>

          <Section reference="ricedishes" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={ricedishes} category="Rice Dishes" description="All of our rice dishes are served with steamed rice, vegetables, and your choice of meat, seafood, or tofu. We cook the vegetables with our in-house special sauce." />

          <div className="pics">
            <div className="img-desc">
                <StaticImage src="../images/saigonFoodPics/saigon_deli_Rice_with_Beef_and_Vegetables.jpg" className="pho-img" alt="Rice with beef & vegetables" />
                <p className="desc">47. Rice with beef & vegetables</p>
            </div>
            <div className="img-desc">
                <StaticImage src="../images/saigonFoodPics/saigon_deli_Pork_chop_with_rice.jpg" className="pho-img" alt="Rice with pork chop & egg" />
                <p className="desc">58. Rice with pork chop & egg</p>
            </div>
          </div>
          <div className="pics">
              <div className="img-desc">
                  <StaticImage src="../images/saigonFoodPics/saigon_deli_rice_with_short_ribs.jpg" className="pho-img" alt="Saigon Deli rice (short ribs)" />
                  <p className="desc">61. Saigon Deli rice (short ribs)</p>
              </div>
              <div className="img-desc">
                  <StaticImage src="../images/saigonFoodPics/saigon_deli_Special_rice_with_pork.jpg" className="pho-img" alt="Special rice w/ pork" />
                  <p className="desc">62. Special rice w/ pork</p>
              </div>
          </div>
          <div className="pics">
              <div className="img-desc">
                  <StaticImage src="../images/saigonFoodPics/saigon_deli_Bun_Bo_Hue.jpg" className="pho-img" alt="Spicy Beef Noodle Soup (Bun Bo Hue)" />
                  <p className="desc">63. Spicy Beef Noodle Soup (Bun Bo Hue)</p>
              </div>
          </div>

          <Section reference="friedrice" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={friedrice} category="Fried Rice" description="Our fried rice is cooked with egg, mixed peas and your choice of meat or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg" className="pho-img" alt="Fried rice with shrimp" />
              <p className="desc">65. Fried rice with shrimp</p>
          </div>
          </div>

          <Section reference="hotsoursoups" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={soursoup} category="Hot & Sour Soup" description="Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Bo_Kho.jpg" className="pho-img" alt="Beef Stew Noodle Soup (Hu Tieu Bo Kho)" />
              <p className="desc">Beef Stew Noodle Soup (Hu Tieu Bo Kho)</p>
          </div>
          </div>

          <Section reference="beverages" onQuantityUpdate={handleQuantityUpdate} allowOrderOnline={allowCheckout} items={beverage} category="Beverages" description="Refreshing drinks to accompany your meal." />
          <br />
          {allowCheckout && <button id="checkout" onClick={handleCheckout}>Checkout</button>}
        </div>
        <div className="catering-box">
          <div className="catering">
            <p>{restaurant.Catering}</p>
            <p id="catering3">{restaurant.Phone}</p>
          </div>
        </div>
      <footer>
        <div className="footer-info">
          <p id="footer-saigon">Saigon Deli</p>
          <a style={{ display: 'block', marginBottom: 12, marginTop: 6 }}href="https://www.yelp.com/biz/saigon-deli-seattle-2" target="_blank" rel="noreferrer">
            <StaticImage 
              height={30} 
              quality={100}
              src="../images/Yelp_Logo.svg" 
              layout="fixed" 
              alt="Yelp logo"/>
          </a>
          <a href="https://www.google.com/maps/place/4142+Brooklyn+Ave+NE,+Seattle,+WA+98105/@47.6581627,-122.3161964,17z/data=!3m1!4b1!4m5!3m4!1s0x549014f4a024abe1:0x1738ed6050774b05!8m2!3d47.6581627!4d-122.3140077" target="_blank" rel="noreferrer">
            4142 Brooklyn Ave NE Seattle, WA 98105
          </a>
          <p id="footer-hours">
            Mon - Fri: {restaurant.Weekdays}
            <br />
            Sat - Sun: {restaurant.Weekends}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default IndexPage
