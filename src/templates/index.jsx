import React, { useState } from "react"
import { Helmet } from "react-helmet"
import WebsiteIcon from "../images/banhmi-icon.png"
import "@fontsource/ruda/600.css"
import "@fontsource/ruda/400.css"
import { StaticImage } from "gatsby-plugin-image"
import "./index.scss"
import Section from "../components/Section"
import Navigation from "../components/Navigation"
import { DateTime } from 'luxon'
import CheckoutModal from "../components/CheckoutModal"
import StickyCheckoutHeader from '../components/StickyCheckoutHeader'

const IS_PROD = process.env.GATSBY_ENV === "prod";

const IndexPage = ({ pageContext: { businessDetails, open, sectionKeys, tipVariant } }) => {
  const [cart, updateCart] = useState([]);
  const [allowCheckout, _] = useState(true);
  const [restaurantOpen, __] = useState(open);
  const [checkoutModalVisible, setCheckoutModalVisibility] = useState(false);

  const canOrder = () => {
    const now = DateTime.now().setZone('America/Los_Angeles')

    if (!IS_PROD) {
      return true;
    }

    if (!restaurantOpen) {
      return false;
    }

    let withinRestrictions = false;

    if (businessDetails.Schedules) {
      // Get all regular schedules, excluding -1.
      withinRestrictions = businessDetails.Schedules.filter((sched) => sched.id !== -1).some(({ start_datetime, end_datetime, reason }) => {
        const start = DateTime.fromISO(start_datetime, { zone: 'America/Los_Angeles' });
        const end = DateTime.fromISO(end_datetime, { zone: 'America/Los_Angeles' });

        console.log(start);
        console.log(end);
        return now <= end && now >= start;
      });
    } else {
      throw new Error('Sorry! Something went wrong.')
    }

    // 11am to 8pm
    const withinHours = (now.hour >= 11 && now.hour <= 19);

    if (!withinHours) {
      return false;
    }

    return !withinRestrictions;
  }

  function removeLineItem(lineItem) {
    // remove item from cart
    const updated = cart.reduce((prev, current) => {
      return current.purchaseable.hash !== lineItem.purchaseable.hash ? [...prev, current] : prev;
    }, []);

    updateCart(updated);
  }

  function handleUpdateLineItem(lineItem) {
    const { purchaseable, quantity } = lineItem;

    const isTracked = cart.some(existingItem => existingItem.purchaseable.hash === purchaseable.hash);

    if (quantity === 0 && isTracked) {
      // remove item from cart
      removeLineItem(lineItem);
    } else if (quantity > 0 && !isTracked) {

      // append item to the cart
      updateCart([...cart, lineItem])
    } else if (quantity > 0 && isTracked) {

      // update item quantity in the cart
      updateCart(cart.map(existingItem => existingItem.purchaseable.hash === purchaseable.hash ? lineItem : existingItem))
    }
  }

  function handleQuantityUpdate(itemId) {
    // itemId is the priceId!
    return (event) => {
      const quantity = parseInt(event.target.value);

      const isTracked = cart.some(item => item.itemId === itemId);

      if (quantity === 0 && isTracked) {
        // remove item from cart
        const updated = cart.reduce((prev, current) => {
          return current.itemId !== itemId ? [...prev, current] : prev;
        }, []);

        updateCart(updated);
      } else if (quantity > 0 && !isTracked) {

        // append item to the cart
        updateCart([...cart, { itemId: itemId, quantity }])
      } else if (quantity > 0 && isTracked) {

        // update item quantity in the cart
        updateCart(cart.map(lineItem => lineItem.itemId === itemId ? { itemId: itemId, quantity } : lineItem))
      }
    };
  }

  const RestaurantStatus = () => {
    const renderOpen = (canOrder() && allowCheckout);

    if (renderOpen) {
      return (
        <div className="status-open">
          <h3>OPEN FOR ORDERS</h3>
          <p>AS OF {DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.TIME_SIMPLE)}</p>
        </div>)
    } else {
      return (<div className="status-closed"><h3>CLOSED FOR ORDERS</h3></div>)
    }
  };

  const handleCheckoutModalClose = () => {
    setCheckoutModalVisibility(false);
  }

  const handleCheckoutModalOpen = () => {
    setCheckoutModalVisibility(true);
  };

  const handleLineItemRemove = (lineItem) => {
    removeLineItem(lineItem)
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
        <script
          src="https://js.sentry-cdn.com/97d3ab25cb5d36ed52da3a3aaa75419e.min.js"
          crossorigin="anonymous"
        ></script>
      </Helmet>
      <header>
        <div className="small-info">
          <p>takeout & dine-in</p>
          <span className="seperator"></span>
          <p>for catering: {businessDetails.Phone}</p>
        </div>
      </header>
      {
        businessDetails.Notice && (
          <div className="notice">
            <p>{businessDetails.Notice}</p>
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
        <Navigation restaurant={businessDetails} />
      </div>
      <StickyCheckoutHeader tipVariant={tipVariant} cart={cart} onOpenCheckoutModal={handleCheckoutModalOpen} onTipChange={handleUpdateLineItem} />
      {checkoutModalVisible && <CheckoutModal tipVariant={tipVariant} cart={cart} onClose={handleCheckoutModalClose} onLineItemRemove={handleLineItemRemove} />}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <RestaurantStatus />
      </div>
      <p style={{ color: "#656565", textAlign: "center" }}>Thank you for ordering online with us!</p>
      <p><pre>{JSON.stringify(cart, null, 2)}</pre></p>
      <div className="menu">
        <Section reference="appetizers" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Appetizers"]} category="Appetizers" />
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

        <Section reference="pho" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Pho"]} category="Pho (noodle soup)" />

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Pho_Beef.jpg" className="pho-img" alt="Special Pho (beef and meatballs)" />
            <p className="desc">11. Special Pho (beef and meatballs)</p>
          </div>
        </div>

        <Section reference="bun" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Bun (Rice Vermicelli Noodles)"]} category="Bun (Rice Vermicelli)" />

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Bun_with_charbroiled_Pork_and_eggroll.jpg" className="pho-img" alt="Bun with charbroiled pork & eggrolls" />
            <p className="desc">12. Bun with charbroiled pork & eggrolls</p>
          </div>
        </div>

        <Section reference="vegetarian" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Vegetarian Dishes"]} category="Vegetarian Dishes" />

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Chowfun_with_tofu_and_vegetables.jpg" className="pho-img" alt="Chowfun with tofu andvegetables" />
            <p className="desc">25. Chowfun w/ tofu & vegetables</p>
          </div>
        </div>

        {/* <Section reference="banhcanh" allowOrderOnline={allowCheckout} section={banhcanh} category="Banh Canh (udon noodle soup)" description="Udon noodles served in a homemade broth with vegetables, green onions, cilantro and your choice of meat or seafood." /> */}

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Banh_Canh_Soup.jpg" className="pho-img" alt="Banh canh w/ shrimp" />
            <p className="desc">34. Banh canh w/ shrimp</p>
          </div>
        </div>

        {/* <Section reference="hutieu" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={hutieu} category="Hu Tieu (noodle soup)" description="Rice or egg noodles served in a pork broth with broccoli and your choice of meat, seafood, or tofu." /> */}
        <Section reference="stirfried" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Stir Fry Noodles"]} category="Stir Fried Noodles" />

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_chowmein_with_chicken_and_vegetable.jpg" className="pho-img" alt="Chowmein with vegetables & chicken" />
            <p className="desc">43. Chowmein with vegetables & chicken</p>
          </div>
        </div>

        <Section reference="ricedishes" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Rice Dishes"]} category="Rice Dishes" />

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
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg" className="pho-img" alt="Fried rice with shrimp" />
            <p className="desc">65. Fried rice with shrimp</p>
          </div>
        </div>

        {/* <Section reference="friedrice" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={friedrice} category="Fried Rice" description="Our fried rice is cooked with egg, mixed peas and your choice of meat or seafood." /> */}

        {/* <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg" className="pho-img" alt="Fried rice with shrimp" />
            <p className="desc">65. Fried rice with shrimp</p>
          </div>
        </div> */}

        {/* <Section reference="hotsoursoups" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={soursoup} category="Hot & Sour Soup" description="Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood." /> */}

        <Section reference="noodlesoups" onLineItemAdd={undefined} section={{ Items: [] }} category="Specialty Noodle Soups" />

        <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Bun_Bo_Hue.jpg" className="pho-img" alt="Spicy Beef Noodle Soup (Bun Bo Hue)" />
            <p className="desc">63. Spicy Beef Noodle Soup (Bun Bo Hue)</p>
          </div>
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Bo_Kho.jpg" className="pho-img" alt="Beef Stew Noodle Soup (Hu Tieu Bo Kho)" />
            <p className="desc">Beef Stew Noodle Soup (Hu Tieu Bo Kho)</p>
          </div>
        </div>

        <Section reference="beverages" onLineItemAdd={handleUpdateLineItem} allowOrderOnline={allowCheckout} section={sectionKeys["Beverages"]} category="Beverages" description="Refreshing drinks to accompany your meal." />
        <br />

        {/*allowCheckout && <button className="checkout-button" onClick={handleCheckout}>Checkout</button>*/}
      </div>
      <div className="catering-box">
        <div className="catering">
          <p>{businessDetails.Catering}</p>
          <p id="catering3">{businessDetails.Phone}</p>
        </div>
      </div>
      <footer>
        <div className="footer-info">
          <p id="footer-saigon">Saigon Deli</p>
          <a style={{ display: 'block', marginBottom: 12, marginTop: 6 }} href="https://www.yelp.com/biz/saigon-deli-seattle-2" target="_blank" rel="noreferrer">
            <StaticImage
              height={30}
              quality={100}
              src="../images/Yelp_Logo.svg"
              layout="fixed"
              alt="Yelp logo" />
          </a>
          <a href="https://www.google.com/maps/place/4142+Brooklyn+Ave+NE,+Seattle,+WA+98105/@47.6581627,-122.3161964,17z/data=!3m1!4b1!4m5!3m4!1s0x549014f4a024abe1:0x1738ed6050774b05!8m2!3d47.6581627!4d-122.3140077" target="_blank" rel="noreferrer">
            4142 Brooklyn Ave NE Seattle, WA 98105
          </a>
          <p id="footer-hours">
            Mon - Fri: {businessDetails.Weekdays}
            <br />
            Sat - Sun: {businessDetails.Weekends}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default IndexPage
