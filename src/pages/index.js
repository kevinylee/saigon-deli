import * as React from "react"
import { Helmet } from "react-helmet"
import Logo from "../images/SDLogo1.svg"
import Chowmein from "../images/saigonFoodPics/saigon_deli_chowmein_with_chicken_and_vegetable.jpg"
import Chowfun from "../images/saigonFoodPics/saigon_deli_Chowfun_with_tofu_and_vegetables.jpg"
import BanhCanh from "../images/saigonFoodPics/saigon_deli_Banh_Canh_Soup.jpg"
import Bun from "../images/saigonFoodPics/saigon_deli_Bun_with_charbroiled_Pork_and_eggroll.jpg"
import Friedrice from "../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg"
import Special from "../images/saigonFoodPics/saigon_deli_Special_rice_with_pork.jpg"
import ShortRib from "../images/saigonFoodPics/saigon_deli_rice_with_short_ribs.jpg"
import Porkchop from "../images/saigonFoodPics/saigon_deli_Pork_chop_with_rice.jpg"
import RiceBeefVeg from "../images/saigonFoodPics/saigon_deli_Rice_with_Beef_and_Vegetables.jpg"
import Pho from "../images/saigonFoodPics/saigon_deli_Pho_Beef.jpg"
import BoKho from "../images/saigonFoodPics/saigon_deli_Bo_Kho.jpg"
import Combo from "../images/saigonFoodPics/saigon_deli_Combo_Sandwich_with_Wonton_soup.jpg"
import Spring from "../images/saigonFoodPics/saigon_deli_spring_roll_with_shrimp.jpg"
import Rolls from "../images/saigonFoodPics/saigon_deli_Eggroll.jpg"
import BunBoHue from "../images/saigonFoodPics/saigon_deli_Bun_Bo_Hue.jpg"
import Yelp from "../images/Yelp_Logo.svg"
import "@fontsource/ruda/600.css"
import "@fontsource/ruda/400.css"
import "./index.css"

// markup
const IndexPage = () => {
  return (
    <div className="main">
      <Helmet>
        <meta charSet="utf-8" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Saigon Deli</title>
        <meta property="og:description" content="The best and most affordable Vietnamese food in Seattle. We serve delicious banh mi, pho, and other rice dishes." />
        <meta property="description" content="The best and most affordable Vietnamese food in Seattle. We serve delicious banh mi, pho, and other rice dishes." />
        <link rel="canonical" href="http://saigondeliuw.com" />
      </Helmet>
        <header>
              <div className="small-info">
                  <p>takeout & dine-in</p>
                  <span className="seperator"></span>
                  <p>for cater: (206) 634-2866</p>
              </div>
        </header>
        <div className="title-info">
          <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
          <p className="address">4142 Brooklyn Ave NE Seattle, WA 98105</p>
          <span className="horizontal-line"></span>
          <p className="weekdays">Mon - Fri: 11am-8pm</p>
          <p className="weekends">Sat - Sun: 11am-8:30pm</p>
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
          <div className="appetizers">
            <p className="category-name" id="appetizers">Appetizers</p>
            <div className="appe-items">
              <div className="names-desc">
                <p className="appename">1. Spring Rolls - Gui Cuon</p>
                <p className="desc">Rice vermicelli & lettuce rolled in fresh rice paper with your choice of
                  Shrimp, Chicken, or Tofu. Served with peanut sauce.</p>
                <p className="appename">2. Vegetarian Egg Rolls</p>
                <p className="desc">Deep fried roll filled with tofu, noodles, onions, carrots, and taro. 
                  Served with fish sauce.</p>
                <p className="appename">3. Vietnamese Sandwich (banh mi) ⭐</p>
                <p className="desc">Fresh baguette filled with shredded carrots, cucumbers, cilantro, 
                  and your choice of BBQ Pork, Chicken, or Tofu.</p>
                <p className="desc-fade">*Add an egg for $0.75</p>
                <p className="appename">3A. COMBO: Sandwich & Wonton soup</p>
                <p className="desc">Small wonton soup with your choice of a Vietnamese Sandwich.</p>
              </div>
              <div className="appe-prices">
                <p id="appe-first">$3.95</p>
                <p id="second">$3.95</p>
                <p id="third">$5.75</p>
                <p id="last">$9.50</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Spring} className="pho-img" alt="spring-rolls"></img>
                <p className="desc">1. Spring Rolls - Gui Cuon</p>
              </div>
              <div className="img-desc">
                <img src={Rolls} className="pho-img" alt="egg-rolls"></img>
                <p className="desc">2. Vegetarian Egg Rolls</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Combo} className="pho-img" alt="sandwich-wonton"></img>
                <p className="desc">3A. COMBO: Sandwich & Wonton soup</p>
              </div>
            </div>
          </div>
          <div className="pho">
            <p className="category-name" id="pho">Pho (Noodle Soup)</p>
            <p className="description">Rice noodle soup with your choice of meat, seafood, or tofu. Served with beansprouts, basil, and lime.</p>
            <div className="phoitems">
              <div className="names">
                <p>4. Pho with beef</p>
                <p>5. Pho with chicken</p>
                <p>6. Pho with meatballs</p>
                <p>7. Pho with shrimp</p>
                <p>8. Pho with seafood</p>
                <p>9. Pho with wonton & beef</p>
                <p>10. Pho with tofu & vegetables</p>
                <p>11. Special Pho (beef and meatballs)</p>
              </div>
              <div className="large">
                <p>Large</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p id="ten-price">$9.95</p>
                <p>$10.50</p>
              </div>
              <div className="small">
                <p>Small</p>
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.25</p>
                <p id="pho-price-last">$9.95</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Pho} className="pho-img" alt="pho"></img>
                <p className="desc">11. Special Pho (beef and meatballs)</p>
              </div>
            </div>
          </div>
          <div className="bun">
            <p className="category-name" id="bun">Bun (Rice Vermicelli)</p>
            <p className="description">Vermicelli noodles topped with lettuce, bean sprouts, pickled carrots, crushed peanuts, and your choice of meat, seafood, or tofu. (optional: can add spicy lemongrass)</p>
            <div className="bunitems">
              <div className="names" id="bun-names">
                <p>12. Bun with charbroiled pork & eggrolls</p>
                <p>13. Bun with beef & eggrolls</p>
                <p>14. Bun with chicken & eggrolls</p>
                <p>15. Bun with eggrolls</p>
                <p>16. Bun with seafood & eggrolls</p>
                <p>17. Bun with shrimp & eggrolls</p>
                <p id="shorten">18. Bun with shrimp, charbroiled pork & eggrolls (can substitute meat)</p>
                <p>19. Bun with shrimp, tofu & eggrolls</p>
              </div>
              <div className="bunprices">
                <p id="bun-first-price">$9.95</p>
                <p id="bun-second-price">$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$10.95</p>
                <p className="shorten-price">$11.95</p>
                <p>$11.95</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Bun} className="pho-img" alt="bun"></img>
                <p className="desc">12. Bun with charbroiled pork & eggrolls</p>
              </div>
            </div>
          </div>
          <div className="vegetarian">
            <p className="category-name" id="vegetarian">Vegetarian Dishes</p>
            <div className="vegitems">
              <div className="names" id="vegnames">
                <p>21. Steamed rice w/ lemon grass tofu</p>
                <p>22. Fried rice w/ tofu & peas</p>
                <p>23. Steamed rice w/ special spicy tofu</p>
                <p>24. Steamed rice w/ eggplant & tofu</p>
                <p>25. Chowfun w/ tofu & vegetables</p>
                <p>26. Banh canh w/ tofu</p>
                <p>27. Rice vermicelli w/ tofu & eggrolls</p>
                <p>28. Rice noodle soup w/ vegetables & tofu</p>
                <p>29. Special vegetarian noodle soup</p>
                <p>30. Hot and sour soup w/ tofu</p>
              </div>
              <div className="bunprices" id="vegprices">
                <p>$9.95</p>
                <p>$10.50</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p id="twentyeight-price">$10.50</p>
                <p>$10.50</p>
                <p>$10.50</p> 
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Chowfun} className="pho-img" alt="Chowfun-with-tofu-and-vegetables"></img>
                <p className="desc">25. Chowfun w/ tofu & vegetables</p>
              </div>
            </div>
          </div>
          <div className="udon">
            <p className="category-name" id="banhcanh">Banh Canh (udon noodle soup)</p>
            <p className="description">Served with vegetables and your choice of the following:</p>
            <div className="vegitems">
              <div className="names" id="udon-names">
                <p>31. Banh canh w/ chicken</p>
                <p>32. Banh canh w/ beef</p>
                <p>33. Banh canh w/ pork</p>
                <p>34. Banh canh w/ shrimp</p>
                <p>35. Banh canh w/ seafood</p>
              </div>
              <div className="bunprices" id="udon-prices">
                <p>$10.50</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p>$11.50</p>
                <p>$11.50</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={BanhCanh} className="pho-img" alt="banh-canh"></img>
                <p className="desc">34. Banh canh w/ shrimp</p>
              </div>
            </div>
          </div>
          <div className="hutieu">
            <p className="category-name" id="noodlesoup">Hu Tieu (noodle soup)</p>
            <p className="description">Rice or egg noodles in a pork broth, broccoli, and your choice of meat, seafood, or tofu.</p>
            <div className="vegitems">
              <div className="names" id="hutieu-names">
                <p>36. BBQ pork & prawn rice noodle soup</p>
                <p>37. Chicken rice noodle soup</p>
                <p>38. Seafood rice noodle soup</p>
                <p>39. Shrimp rice noodle soup</p>
                <p>40. Egg noodle soup w/ wonton & BBQ pork</p>
                <p>41. Egg noodle soup w/ wonton & seafood</p>
                <p id="shorten">42. Special Egg noodle & Rice noodle (wonton, bbq pork, & seafood)</p>
              </div>
              <div className="bunprices" id="hutieu-prices">
                <p>$11.95</p>
                <p>$10.50</p>
                <p>$11.50</p>
                <p>$11.50</p>
                <p id="forty-price">$11.50</p>
                <p id="fortyone-price">$11.95</p>
                <p>$12.95</p>
              </div>
            </div>
          </div>
          <div className="stirfried">
            <p className="category-name" id="stirfried">Stir Fried Noodle</p>
            <p className="description">Rice or egg noodles stir fried with broccoli, carrot, and your choice of meat, seafood, or tofu.
              Served with a sprinkle of crushed peanut.</p>
            <div className="vegitems">
              <div className="names" id="stirfried-names">
                <p>43. Chowmein with vegetables & chicken, beef, or pork</p>
                <p>44. Chowmein with vegetables & shrimp or seafood</p>
                <p>45. Chowfun with vegetables & chicken, beef, or pork</p>
                <p>46. Chowfun with vegetables & shrimp or seafood</p>
              </div>
              <div className="bunprices" id="stirfried-prices">
                <p>$10.95</p>
                <p>$11.95</p>
                <p>$10.95</p>
                <p>$11.95</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Chowmein} className="pho-img" alt="chowmein-with-chicken-and-vegetables"></img>
                <p className="desc">43. Chowmein with vegetables & chicken</p>
              </div>
            </div>
          </div>
          <div className="ricedishes">
            <p className="category-name" id="ricedishes">Rice Dishes</p>
            <p className="description">All of our rice dishes are served with steamed rice, vegetables, and your choice of meat, seafood, or tofu.
              We cook the vegetables with our in-house special sauce.</p>
            <div className="vegitems" id="rice-items">
              <div className="names" id="rice-names">
                <p>47. Rice with beef & vegetables</p>
                <p>48. Rice with pork & vegetables</p>
                <p>49. Rice with chicken & vegetables</p>
                <p>50. Rice with shrimp & vegetables</p>
                <p>51. Rice with tofu & vegetables</p>
                <p>52. Rice with seafood & vegetables</p>
                <p>53. Rice with curry tofu & vegetables</p>
                <p>54. Rice with curry chicken & vegetables</p>
                <p>55. Rice with curry beef & vegetables</p>
                <p>56. Rice with curry seafood & vegetables</p>
                <p>57. Rice w/ sautéed lemon grass chicken</p>
                <p>58. Rice with pork chop & egg</p>
                <p>59. Rice with eggplant & beef</p>
                <p>60. Rice with eggplant & chicken</p>
                <p>61. Saigon Deli rice (short ribs)</p>
                <p id="sixtwo">62. Special rice (Choice of beef, chicken, pork, and tofu)</p>
                <p className="desc" id="rice-desc">Includes an egg and an eggroll</p>
                <p className="shorten">*63. Spicy Beef Noodle Soup (Vermicelli noodle, sliced beef, special meetball, lemongrass)</p>
              </div>
              <div className="bunprices" id="rice-prices">
                <p>$9.95</p>
                <p id="fortyeight-price">$9.95</p>
                <p id="fortynine-price">$9.95</p>
                <p>$10.95</p>
                <p>$9.95</p>
                <p id="fiftytwo-price">$10.95</p>
                <p id="fiftytwo-price">$9.95</p>
                <p id="fiftytwo-price">$9.95</p>
                <p id="fiftytwo-price">$9.95</p>
                <p id="fiftytwo-price">$10.95</p>
                <p id="fiftytwo-price">$9.95</p>
                <p>$11.50</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$14.50</p>
                <p id="sixtytwo-price">$11.95</p>
                <p>$11.50</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={RiceBeefVeg} className="pho-img" alt="rice-with-beef-and-vegetables"></img>
                <p className="desc">47. Rice with beef & vegetables</p>
              </div>
              <div className="img-desc">
                <img src={Porkchop} className="pho-img" alt="rice-with-porkchop-and-egg"></img>
                <p className="desc">58. Rice with pork chop & egg</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={ShortRib} className="pho-img" alt="specialrice-with-pork"></img>
                <p className="desc">61. Saigon Deli rice (short ribs)</p>
              </div>
              <div className="img-desc">
                <img src={Special} className="pho-img" alt="specialrice-with-pork"></img>
                <p className="desc">62. Special rice w/ pork</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={BunBoHue} className="pho-img" alt="Bun-Bo-Hue"></img>
                <p className="desc">63. Spicy Beef Noodle Soup (Bun Bo Hue)</p>
              </div>
            </div>
          </div>
          <div className="friedrice">
            <p className="category-name" id="friedrice">Fried Rice</p>
            <p className="description">Our fried rice is cooked with egg, mixed peas and your choice of meat.</p>
            <div className="vegitems">
              <div className="names" id="friedrice-names">
                <p>64. Fried rice with chicken or BBQ pork</p>
                <p>65. Fried rice with shrimp</p>
                <p>66. Fried rice with BBQ pork & shrimp</p>
              </div>
              <div className="bunprices" id="friedrice-prices">
                <p>$10.50</p>
                <p>$11.50</p>
                <p>$12.50</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Friedrice} className="pho-img" alt="friedrice-with-shrimp"></img>
                <p className="desc">65. Fried rice with shrimp</p>
              </div>
            </div>
          </div>
          <div className="hotsoup">
            <p className="category-name" id="hotsoursoups">Hot & Sour Soup</p>
            <p className="description">Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood.</p>
            <div className="vegitems">
              <div className="names" id="hotsoup-names">
                <p>67. Sour soup w/ catfish</p>
                <p>68. Sour soup w/ chicken</p>
                <p>69. Sour soup w/ beef</p>
                <p>70. Sour soup w/ shrimp</p>
                <p>71. Sour soup w/ seafood</p>
              </div>
              <div className="bunprices" id="hotsoup-prices">
                <p>$11.95</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p>$11.50</p>
                <p>$11.50</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={BoKho} className="pho-img" alt="Bo-Kho"></img>
                <p className="desc">69. Sour soup w/ beef</p>
              </div>
            </div>
          </div>
          <div className="beverage">
            <p className="category-name" id="beverages">Beverage</p>
            <div className="vegitems">
              <div className="names" id="beverage-names">
                <p>72. Canned soda</p>
                <p>73. Snapple</p>
                <p>74. Soybean milk</p>
                <p>75. Fresh lemonade</p>
                <p>76. Cocunut juice</p>
                <p className="shorten">77. Vietnamese coffee (served warm or cold with condensed milk)</p>
                <p>78. Thai iced tea</p>
              </div>
              <div className="bunprices" id="beverage-prices">
                <p>$1.25</p>
                <p>$2.50</p>
                <p>$2.50</p>
                <p>$3.75</p>
                <p>$3.50</p>
                <p id="bev-double">$4.25</p>
                <p>$3.75</p>
              </div>
            </div>
          </div>
        </div>
        <div className="catering-box">
          <p className="catering">Don't forget to ask us about our catering service</p>
          <p className="catering" id="catering2">for your event or party.</p>
          <p className="catering" id="catering3">(206) 634-2866</p>
        </div>
      <footer>
        <div className="footer-info">
          <p id="footer-saigon">Saigon Deli</p>
          <a href="https://www.google.com/maps/place/4142+Brooklyn+Ave+NE,+Seattle,+WA+98105/@47.6581627,-122.3161964,17z/data=!3m1!4b1!4m5!3m4!1s0x549014f4a024abe1:0x1738ed6050774b05!8m2!3d47.6581627!4d-122.3140077" target="_blank" rel="noreferrer">
            4142 Brooklyn Ave NE Seattle, WA 98105
          </a>
          <p id="footer-hours">Mon - Fri: 11am-8pm</p>
          <p id="footer-hours">Sat - Sun: 11am-8:30pm</p>
        </div>
        <a id="yelp-link" href="https://www.yelp.com/biz/saigon-deli-seattle-2?osq=saigon+deli" target="_blank" rel="noreferrer">
          <img src={Yelp} className="pho-img" id="yelp-img" alt="Yelp logo"></img>
        </a>
      </footer>
    </div>
  )
}

export default IndexPage
