import * as React from 'react';

// A two-column desktop view that collapses into a single column on mobile
const Section = (props) => {

  const items = props.items;

  return (
    <section id={`${props.reference}`}>
      <h2 className="category-name">{props.category}</h2>
      { 
        (props.description) && <p className="category-description">{`${props.description}`}</p> 
      }
      <div className="menu-items">
        {
          items.map((item, index) => {
            return (
              <div key={`${index}-${item.Title}`} className="menu-item">
                <div className="content">
                  <PriceColumn 
                    twoColumn={props.twoColumn} 
                    price={item.Price} 
                    smallPrice={item.SmallPrice} 
                    largePrice={item.LargePrice}  
                  />
                  <h4>{item.Title}</h4>
                  {
                    (item.Description) && <p>{item.Description}</p>
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </section>
  )
};

const PriceColumn = ({ twoColumn = false, price, smallPrice, largePrice }) => {

  if (twoColumn) {
    return (
      <React.Fragment>
        <span className="large-price"> <span style={{ color: '#CCC' }}>/</span> <b><u>L</u></b> {largePrice}</span>
        <span className="small-price"><b><u>S</u></b> {smallPrice}</span>
      </React.Fragment>
    )
  }

  return (
    <span className="price">{price}</span>
  )
};

export default Section;