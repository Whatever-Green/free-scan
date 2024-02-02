import { Workbox } from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-window.dev.mjs";

const register = () => {
  const workbox = new Workbox("/service-worker.js");

  workbox.addEventListener("installed", () => {
    workbox.messageSkipWaiting();
  });

  workbox.register();

  return workbox;
};

const workbox = register();

window.workbox = workbox;
export { workbox };
