import * as React from "react"
import { Link } from "gatsby"
import Logo from "../images/SDlogo.svg"
import "./index.css"

// markup
const IndexPage = () => {
  return (
    <main>
      <title>Saigon Deli</title>
      <header>
            <div className="small-info">
                <p>takeout & dine-in</p>
                <span className="seperator"></span>
                <p>for cater: (206) 634-2866</p>
            </div>
      </header>
      <div className="title-info">
        <img src={Logo} className="main-logo" alt="Saigon Deli Logo"></img>
        <p className="address">4142 Brooklyn Ave NE Seattle, WA</p>
        <p className="weekdays">Mon - Fri: 11am-8pm</p>
        <p className="weekends">Sat - Sun: 11am-8:30pm</p>
      </div>
      <div className="top-categories">
        <p><Link>Appetizers</Link></p>
      </div>
    </main>
  )
}

export default IndexPage
