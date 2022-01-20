import * as React from "react"
import { Link } from "gatsby"
import Logo from "../images/SDlogo.svg"
import Pho from "../images/photest.jpg"
import Banh from "../images/banhmitest.jpg"
import Spring from "../images/springrolltest.jpg"
import "./index.css"

// markup
const IndexPage = () => {
  return (
    <main>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Ruda&display=swap');
      </style>    
      <title>Saigon Deli</title>
      <body>
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
          <p className="weekdays">Mon - Fri: 11am-8pm</p>
          <p className="weekends">Sat - Sun: 11am-8:30pm</p>
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
            <span className="seperator"></span>
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
                <p className="appename">3A. Vietnamese Sandwich and Wonton Soup Combo</p>
                <p className="desc">Small wonton soup with your choice of a Vietnamese Sandwich.</p>
              </div>
              <div className="appe-prices">
                <p>$3.75</p>
                <p id="second">$3.75</p>
                <p id="third">$3.75</p>
                <p id="last">$3.75</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Spring} className="pho-img" alt="spring-rolls"></img>
                <p className="desc">2. Vegetarian Egg Rolls</p>
              </div>
              <div className="img-desc">
                <img src={Banh} className="pho-img" alt="banh-mi"></img>
                <p className="desc">3. Vietnamese Sandwich (banh mi) ⭐</p>
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
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.25</p>
                <p>$9.95</p>
              </div>
              <div className="small">
                <p>Small</p>
                <p>$8.50</p>
                <p>$8.50</p>
                <p>$8.50</p>
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$9.25</p>
                <p>$8.50</p>
                <p>$9.25</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Pho} className="pho-img" alt="pho"></img>
                <p className="desc">11. Special Pho (beef and meatballs)</p>
              </div>
              <div className="img-desc">
                <img src={Pho} className="pho-img" alt="pho"></img>
                <p className="desc">6. Pho with meatballs</p>
              </div>
            </div>
          </div>
          <div className="bun">
            <p className="category-name" id="bun">Bun (Rice Vermicelli)</p>
            <p className="description">Vermicelli noodles topped with lettuce, bean sprouts, pickled carrots, crushed peanuts, and your choice of meat, seafood, or tofu. (optional: can add spicy lemongrass)</p>
            <div className="bunitems">
              <div className="names">
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
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$10.95</p>
                <p>$11.95</p>
                <p>$11.95</p>
              </div>
            </div>
          </div>
          <div className="vegetarian">
            <p className="category-name" id="vegetarian">Vegetarian Dishes</p>
            <div className="vegitems">
              <div className="names">
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
              <div className="bunprices">
                <p>$9.50</p>
                <p>$9.95</p>
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$10.50</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p> 
              </div>
            </div>
          </div>
          <div className="udon">
            <p className="category-name" id="banhcanh">Banh Canh (udon noodle soup)</p>
            <p className="description">Served with vegetables and your choice of the following:</p>
            <div className="vegitems">
              <div className="names">
                <p>31. Banh canh w/ chicken</p>
                <p>32. Banh canh w/ beef</p>
                <p>33. Banh canh w/ pork</p>
                <p>34. Banh canh w/ shrimp</p>
                <p>35. Banh canh w/ seafood</p>
              </div>
              <div className="bunprices">
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$10.95</p>
              </div>
            </div>
          </div>
          <div className="hutieu">
            <p className="category-name" id="noodlesoup">Hu Tieu (noodle soup)</p>
            <p className="description">Rice or egg noodles in a pork broth, broccoli, and your choice of meat, seafood, or tofu.</p>
            <div className="vegitems">
              <div className="names">
                <p>36. BBQ pork & prawn rice noodle soup</p>
                <p>37. Chicke rice noodle soup</p>
                <p>38. Seafood rice noodle soup</p>
                <p>39. Shrimp rice noodle soup</p>
                <p>40. Egg noodle soup w/ wonton & BBQ pork</p>
                <p>41. Egg noodle soup w/ wonton & seafood</p>
                <p>42. Special Egg noodle & Rice noodle (wonton, bbq pork, & seafood)</p>
              </div>
              <div className="bunprices">
                <p>$11.50</p>
                <p>$9.50</p>
                <p>$10.50</p>
                <p>$10.50</p>
                <p>$10.95</p>
                <p>$11.50</p>
                <p>$12.50</p>
              </div>
            </div>
          </div>
          <div className="stirfried">
            <p className="category-name" id="stirfried">Stir Fried Noodle</p>
            <p className="description">Rice or egg noodles stir fried with broccoli, carrot, and your choice of meat, seafood, or tofu.
              Served with a sprinkle of crushed peanut.</p>
            <div className="vegitems">
              <div className="names">
                <p>43. Chowmein with vegetables & chicken, beef, or pork</p>
                <p>44. Chowmein with vegetables & shrimp or seafood</p>
                <p>45. Chowfun with vegetables &</p>
              </div>
              <div className="bunprices">
                <p>$10.50</p>
                <p>$10.95</p>
                <p>$10.50</p>
              </div>
            </div>
          </div>
          <div className="ricedishes">
            <p className="category-name" id="ricedishes">Rice Dishes</p>
            <p className="description">All of our rice dishes are served with steamed rice, vegetables, and your choice of meat, seafood, or tofu.
              We cook the vegetables with an in house special sauce.</p>
            <div className="vegitems">
              <div className="names">
                <p>47. Rice with beef & vegetables</p>
                <p>48. Rice with pork & vegetanbles</p>
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
                <p>62. Special rice (Choice of beef, chicken, pork, and tofu)</p>
                <p>*63. Spicy Beef Noodle Soup (Vermicelli noodle, sliced beef, special meetball, lemongrass)</p>
              </div>
              <div className="bunprices">
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$10.50</p>
                <p>$9.50</p>
                <p>$10.50</p>
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$10.50</p>
                <p>$9.50</p>
                <p>$10.95</p>
                <p>$9.50</p>
                <p>$9.50</p>
                <p>$13.50</p>
                <p>$11.50</p>
                <p>$10.95</p>
              </div>
            </div>
          </div>
          <div className="friedrice">
            <p className="category-name" id="friedrice">Fried Rice</p>
            <p className="description">Our fried rice is cooked with egg, mixed peas and your choice of meat.</p>
            <div className="vegitems">
              <div className="names">
                <p>64. Fried rice with chicken or BBQ pork</p>
                <p>65. Fried rice with shrimp</p>
                <p>66. Fried rice with BBQ pork & shrimp</p>
              </div>
              <div className="bunprices">
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$11.95</p>
              </div>
            </div>
          </div>
          <div className="hotsoup">
            <p className="category-name" id="hotsoursoups">Hot & Sour Soup</p>
            <p className="description">Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood.</p>
            <div className="vegitems">
              <div className="names">
                <p>67. Sour soup w/ catfish</p>
                <p>68. Sour soup w/ chicken</p>
                <p>69. Sour soup w/ beef</p>
                <p>70. Sour soup w/ shrimp</p>
                <p>71. Sour soup w/ seafood</p>
              </div>
              <div className="bunprices">
                <p>$11.50</p>
                <p>$9.95</p>
                <p>$9.95</p>
                <p>$10.95</p>
                <p>$10.95</p>
              </div>
            </div>
          </div>
          <div className="beverage">
            <p className="category-name" id="beverages">Beverage</p>
            <div className="vegitems">
              <div className="names">
                <p>72. Canned soda</p>
                <p>73. Snapple</p>
                <p>74. Soybean milk</p>
                <p>75. Fresh lemonade</p>
                <p>76. Cocunut juice</p>
                <p>77. Vietnamese coffee (served warm or cold with condensed milk)</p>
                <p>78. Thai iced tea</p>
              </div>
              <div className="bunprices">
                <p>$1.00</p>
                <p>$2.50</p>
                <p>$2.50</p>
                <p>$3.50</p>
                <p>$2.95</p>
                <p>$3.95</p>
                <p>$3.50</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </main>
  )
}

export default IndexPage
