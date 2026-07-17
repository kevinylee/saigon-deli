import { APP_URL } from "../components/utilities";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const playNotification = async () => {
  const audio = new Audio(`${APP_URL}/notify_order.mp3`);

  for (let i = 0; i < 3; i++) {
    audio.play();
    await sleep(2500);
  }
};