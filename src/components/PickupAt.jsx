import React from 'react';
import { DateTime, Duration } from 'luxon';

export default function PickupAt({ minDateTime, time, onTimeChange }) {

    return <div className="pickup">
        <label for="pickup_at">Pickup At:</label>
        <p style={{ margin: 0, color: "gray", fontSize: "0.8rem" }}>(Default to pick up in ~15 minutes)</p>
        <input
            type="datetime-local"
            id="pickup_at"
            name="pickup_at"
            value={time}
            onChange={(event) => {
                onTimeChange(event.target.value);
            }}
            min={minDateTime}
        />
        <span class="validity"></span>
    </div>
}