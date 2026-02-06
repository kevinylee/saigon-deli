import React from 'react';

export default function PickupAt({ minDateTime, time, onTimeChange }) {

    return <div className="pickup">
        <p style={{ color: '#262626', fontSize: '0.9rem' }}>Default pickup time is in 30 minutes. You can select a different future time if needed.</p>
        <label for="pickup_at">Pickup At:</label>
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