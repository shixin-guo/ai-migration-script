// 0. Upon entering ZRA, record entry time and page path.
// 1. When changing the page router, send previous page's stay time to the server.
// 2. When leaving ZRA, parse the record and save it to localStorage. Upon reentering ZRA, send path and dwell time to the server.
// 3. When visibility is false, parse the record . When visibility becomes true, start the timer.
// 4. When opening multiple tabs, the previous tab's visibility is set to false, the record is parsed . In the new tab, visibility is set to true, and the timer starts.

// so only when changing router , over idle max time or find existing unsent localStorage when opened APP  we will send data to server
// write to localStorage only when page closed
// visibilitychange will keep state in memory

import { tracking, trackingList } from "shared/js/monitor/tracking";
import storage from "@zoom/storage";
import { debounce } from "lodash-es";
import { toInt } from "shared/js/utils";

interface Config {
  unsentDataQueueKey: string;
  timerIncrementDuration: number;
  idleDuration: number;
  idleTimeMax: number;
}

interface UnsentData {
  path: string;
  stayTime: number;
}

const config: Config = {
  unsentDataQueueKey: "unsentDwellTimeDataQueue",
  timerIncrementDuration: 60_000, // 30s
  idleDuration: 10_000, // 10 seconds
  idleTimeMax: 3, // 3 * timerIncrementDuration = 3 minutes
};

let enterPageTimeKeyMaps: { [key: string]: number | null } = {};
(window as any).enterPageTimeKeyMaps = enterPageTimeKeyMaps;
let fromPath = "";
let toPath = "";
let intervalTimer: NodeJS.Timeout | null = null;

function sendDataToAPI(): void {
  const now = Date.now();
  const duration = toInt(
    (now - (enterPageTimeKeyMaps[fromPath] || now)) / 1000
  );
  if (!enterPageTimeKeyMaps[fromPath]) {
    return;
  }
  if (duration <= 3) {
    return;
  }

  tracking({
    ...trackingList.view_iq4s,
    to: toPath,
    from: fromPath,
    duration,
  });
  if (fromPath !== toPath) enterPageTimeKeyMaps[fromPath] = null;
}

// Function to save unsent data to local storage
function saveToUnsentDataQueue(path: string, stayTime: number): void {
  let unsentDataQueue: UnsentData[] = storage.get(config.unsentDataQueueKey) || [];
  unsentDataQueue.push({ path, stayTime });
  storage.set(config.unsentDataQueueKey, unsentDataQueue);
}

// Function to remove data from the unsent data queue
function removeFromUnsentDataQueue(path: string): void {
  let unsentDataQueue: UnsentData[] = storage.get(config.unsentDataQueueKey) || [];
  unsentDataQueue = unsentDataQueue.filter((item) => item.path !== path);
  storage.set(config.unsentDataQueueKey, unsentDataQueue);
}

let idleTime = 0;
function timerIncrement(): void {
  idleTime = idleTime + 1;
  if (idleTime > config.idleTimeMax) {
    sendDataToAPI();
    idleTime = 0;
    enterPageTimeKeyMaps[fromPath] = null;
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
  }
}

async function init(router: any): Promise<void> {
  // Listen for route changes
  router.afterEach((to: any, from: any) => {
    fromPath = from?.matched.slice(-1)?.[0]?.path || fromPath || "";
    toPath = to?.matched.slice(-1)?.[0]?.path || "";
    enterPageTimeKeyMaps[toPath] = Date.now();
    fromPath !== "/" && sendDataToAPI();
  });

  // Listen for visibility change events
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      // If the page is visible, start the timer
      enterPageTimeKeyMaps[toPath] = Date.now();
    } else {
      // Send the data to the API
      setTimeout(() => {
        sendDataToAPI();
      }, 1000);
    }
  });

  // On page load, check for unsent data in local storage and send it
  document.addEventListener("DOMContentLoaded", function () {
    // Increment the idle time counter every minute.
    intervalTimer = setInterval(timerIncrement, config.timerIncrementDuration); // 1 minute

    // Zero the idle timer on mouse movement.
    function resetIdleTimer(): void {
      idleTime = 0;
      if (!intervalTimer) {
        intervalTimer = setInterval(
          timerIncrement,
          config.timerIncrementDuration
        );
        enterPageTimeKeyMaps[fromPath] = Date.now();
      }
    }
    document.addEventListener(
      "mousemove",
      debounce(resetIdleTimer, config.idleDuration)
    );

    document.addEventListener(
      "keypress",
      debounce(resetIdleTimer, config.idleDuration)
    );
    const unsentDataQueue: UnsentData[] = storage.get(config.unsentDataQueueKey) || [];
    unsentDataQueue.forEach((item) => {
      const { path, stayTime } = item;
      // reload no from so from change to path
      fromPath = path;
      toPath = path;
      enterPageTimeKeyMaps[toPath] = Date.now() - stayTime;
      sendDataToAPI();
      removeFromUnsentDataQueue(item.path);
    });
    enterPageTimeKeyMaps[toPath] = Date.now();
  });
  window.addEventListener("pagehide", function () {
    saveToUnsentDataQueue(toPath, Date.now() - enterPageTimeKeyMaps[toPath]!);
    fromPath = "";
    toPath = "";
  });
}

export { init };
