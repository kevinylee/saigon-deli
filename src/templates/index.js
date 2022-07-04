import * as React from "react"
import { Helmet } from "react-helmet"
import Logo from "../images/SDLogo1.svg"
import WebsiteIcon from "../images/banhmi-icon.png"
import "@fontsource/ruda/600.css"
import "@fontsource/ruda/400.css"
import { StaticImage } from "gatsby-plugin-image"
import "./index.css"
import Section from "../components/Section"

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
          <div className="contents">
            <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
            <p className="number">{restaurant.Phone}</p>
            <p className="address">4142 Brooklyn Ave NE Seattle, WA 98105</p>
            <hr className="divider" />
            <p className="times">
            Mon - Fri: {restaurant.Weekdays}
            <br />
            Sat - Sun: {restaurant.Weekends}</p>
            <div className="anchor">
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
        <div className="menu">
          <Section reference="appetizers" items={appetizers} category="Appetizers" description="Traditional Vietnamese small eats." />
          
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

          <Section reference="pho" items={pho} twoColumn={true} category="Pho (noodle soup)" description="Rice noodle soup with your choice of meat, seafood, or tofu. Served with beansprouts, basil, and lime. Size comes in small or large." />

          <div className="pics">
            <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Pho_Beef.jpg" className="pho-img" alt="Special Pho (beef and meatballs)" />
              <p className="desc">11. Special Pho (beef and meatballs)</p>
            </div>
          </div>

          <Section reference="bun" items={bun} category="Bun (Rice Vermicelli)" description="Vermicelli noodles topped with lettuce, bean sprouts, pickled carrots, crushed peanuts, and your choice of meat, seafood, or tofu. (optional: can add spicy lemongrass)" />

          <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Bun_with_charbroiled_Pork_and_eggroll.jpg" className="pho-img" alt="Bun with charbroiled pork & eggrolls" />
            <p className="desc">12. Bun with charbroiled pork & eggrolls</p>
          </div>
          </div>

          <Section reference="vegetarian" items={vegetarian} category="Vegetarian Dishes" />

          <div className="pics">
          <div className="img-desc">
            <StaticImage src="../images/saigonFoodPics/saigon_deli_Chowfun_with_tofu_and_vegetables.jpg" className="pho-img" alt="Chowfun with tofu andvegetables" /> 
            <p className="desc">25. Chowfun w/ tofu & vegetables</p>
          </div>
          </div>

          <Section reference="banhcanh" items={banhcanh} category="Banh Canh (udon noodle soup)" description="Udon noodles served in a homemade broth with vegetables, green onions, cilantro and your choice of meat or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Banh_Canh_Soup.jpg" className="pho-img" alt="Banh canh w/ shrimp" />
              <p className="desc">34. Banh canh w/ shrimp</p>
          </div>
          </div>

          <Section reference="hutieu" items={hutieu} category="Hu Tieu (noodle soup)" description="Rice or egg noodles served in a pork broth with broccoli and your choice of meat, seafood, or tofu." />
          <Section reference="stirfried" items={stirfried} category="Stir Fried Noodles" description="Rice or egg noodles stir fried with broccoli, carrot, and your choice of meat, seafood, or tofu. Served with a sprinkle of crushed peanut." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_chowmein_with_chicken_and_vegetable.jpg" className="pho-img" alt="Chowmein with vegetables & chicken" />
              <p className="desc">43. Chowmein with vegetables & chicken</p>
          </div>
          </div>

          <Section reference="ricedishes" items={ricedishes} category="Rice Dishes" description="All of our rice dishes are served with steamed rice, vegetables, and your choice of meat, seafood, or tofu. We cook the vegetables with our in-house special sauce." />

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

          <Section reference="friedrice" items={friedrice} category="Fried Rice" description="Our fried rice is cooked with egg, mixed peas and your choice of meat or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg" className="pho-img" alt="Fried rice with shrimp" />
              <p className="desc">65. Fried rice with shrimp</p>
          </div>
          </div>

          <Section reference="hotsoursoups" items={soursoup} category="Hot & Sour Soup" description="Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood." />

          <div className="pics">
          <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Bo_Kho.jpg" className="pho-img" alt="Beef Stew Noodle Soup (Hu Tieu Bo Kho)" />
              <p className="desc">Beef Stew Noodle Soup (Hu Tieu Bo Kho)</p>
          </div>
          </div>

          <Section reference="beverages" items={beverage} category="Beverages" description="Refreshing drinks to accompany your meal." />
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
