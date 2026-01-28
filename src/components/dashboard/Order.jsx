import React, { useState } from 'react';
import axios from "axios"
import "../../templates/dashboard.scss"
import { BASE_URL, toPrice } from "../utilities";
import { DateTime } from 'luxon';

const filterTip = (lineItem) => lineItem.title !== 'Tip';

function isToday(comparisonDate) {
    return comparisonDate.toISODate() === DateTime.local().toISODate();
}

export default function Order({ id, phone_number: phoneNumber, customer_name: title, array_line_items: lineItems, total_amount, created_at: createdAt, acknowledged, pickup_at: pickupAt }) {
    const [isRead, markAsRead] = useState(acknowledged);
    const isAcknowledged = () => {
        return isRead ? "acknowledged" : "alert"
    };

    const handleCheck = async (event) => {
        const isChecked = event.target.checked;

        if (isChecked) {
            markAsRead(true);

            await axios.post(`${BASE_URL}/.netlify/functions/orders`, {
                id: id
            }).catch((err) => {
                alert("Something went wrong! Please contact the owner for more information.")
            });
        }
    }

    const tipLineItem = lineItems.find((item) => item.title === 'Tip');

    const pickupAtIso = DateTime.fromISO(pickupAt, { zone: "America/Los_Angeles" });
    const pickupFormatToday = pickupAtIso.toLocaleString(DateTime.TIME_SIMPLE);
    const pickupFormatAfterToday = pickupAtIso.toLocaleString({ ...DateTime.DATETIME_MED_WITH_WEEKDAY, year: undefined });

    return (
        <div className={`card-${isAcknowledged()}`}>
            <div className="order">
                <div className="timestamp">
                    <span>
                        <p className="date">{DateTime.fromISO(createdAt).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)} |</p>
                        <p className="phone-number">Customer Phone Number: {phoneNumber}</p>
                    </span>
                    <p className="time">{DateTime.fromISO(createdAt).toLocaleString(DateTime.TIME_SIMPLE)}</p>
                </div>
                <div className="titleRow">
                    <p className="orderTitle">{title ? title : "No Title"} ({totalNumItems(lineItems)} items)</p>
                    <label htmlFor="read">
                        Mark as Read
                        <input onChange={handleCheck} type="checkbox" name="read" checked={isRead} />
                    </label>
                </div>
                {pickupAt && <p style={{ fontSize: "1.5rem" }}><b>Picking up at {isToday(pickupAtIso) ? pickupFormatToday : pickupFormatAfterToday}</b></p>}
                <br />
                <br />
                <ul>
                    {lineItems.filter(filterTip).map(lineItem => (
                        <li key={`${lineItem.quantity}-${lineItem.title}`}>
                            {
                                <div className="item-name">
                                    <span className="quantity"><b>{lineItem.quantity}</b></span>
                                    <span>{formatItemTitle(lineItem.title)}<br /><span className="add-ons"><i>{lineItem.addOns}</i></span></span>
                                </div>
                            }
                        </li>))}
                    <li key="price" className="price">
                        <p>
                            {tipLineItem && <span>Tip: ${tipLineItem.quantity}<br /></span>}
                            Total: {toPrice(total_amount)}
                        </p>
                    </li>
                </ul>
                <br />
                <p className="badge">
                    AUTHORIZED
                </p>
            </div>
        </div>
    )
}

// To strip the menu item number for those that have a number infront of them, eg. 1. Vegetarian Egg Rolls
function formatItemTitle(title) {
    if (title.indexOf(".") !== -1) {
        const parts = title.split(".");

        return parts[1];
    } else {
        return title;
    }
}

function totalNumItems(lineItems) {
    return lineItems.filter(filterTip).reduce((curr, item) => curr + item.quantity, 0)
}
