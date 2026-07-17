import React from 'react';
import axios from "axios";
import { triggerRebuild } from "../../lib/netlify";
import { playNotification } from "../../lib/sound";
import { IS_PROD, NETLIFY_FUNCTIONS_URL } from "../utilities";

export function SettingsModal({
    isOpen,
    setIsOpen,
    settingsModalRef,
    toggleModal
} : {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    settingsModalRef: React.RefObject<HTMLDivElement>,
    toggleModal: () => void
}) {
    const toggleStoreOpening = async () => {
        setIsOpen(!isOpen);

        await axios.post(`${NETLIFY_FUNCTIONS_URL}/.netlify/functions/schedules`, {
            type: 'TOGGLE_OPEN',
            open: !isOpen
        });

        if (IS_PROD) {
            const status = !isOpen ? "open" : "closed";
            await triggerRebuild({ trigger_title: `store+${status}` });
        }
    }

    return (
        <div ref={settingsModalRef} className="modal-initial-closed modal">
            <div className="content">
                <div className="header-bar">
                    <h1>Settings</h1>
                    <button className="default-button" style={{ margin: 0 }} onClick={toggleModal}>Exit</button>
                </div>
                <div className="actions">
                    {
                        isOpen ?
                            <button className="default-button" onClick={toggleStoreOpening}><b>Close Orders</b></button> :
                            <button className="default-button" onClick={toggleStoreOpening}><b>Open Orders</b></button>
                    }
                    <button className="default-button" onClick={playNotification}><b>Test Sound</b></button>
                    <button className="default-button" onClick={triggerRebuild}><b>Rebuild Website</b></button>
                </div>
            </div>
        </div>
    )
}