
const pool: HTMLIFrameElement[] = [];
// const CHECK_INTERVAL = 3000;
const DOWNLOAD_DELAY = 1000;
// const FLUSH_DELAY = 60000;
// let iframes: HTMLIFrameElement[] = [];
// let timer: number | null = null;
// let pending = false;
// let flushTimer: number | null = null;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export function download(url: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);
  iframe.src = url;

  pool.push(iframe);
}

// function checkDownloadReady() {
//   clearTimeout(timer);
//   timer = setTimeout(check, CHECK_INTERVAL);

//   function check() {
//     const len = pool.length;
//     for (let i = len - 1; i >= 0; i--) {
//       const iframe = pool[i];
//       const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//       if (
//         iframeDoc.readyState === "complete" ||
//         iframeDoc.readyState === "interactive"
//       ) {
//         pool.splice(i, 1);
//         cleanUpIframeWhenIdle(iframe);
//       }
//     }
//     if (pool.length) {
//       timer = setTimeout(check, CHECK_INTERVAL);
//     }
//   }
// }

// function cleanUpIframeWhenIdle(iframe: HTMLIFrameElement): void {
//   iframes.push(iframe);
//   if (pending) {
//     return;
//   }
//   pending = true;

//   clearTimeout(flushTimer);
//   flushTimer = setTimeout(() => {
//     flushIframeQueue();
//   }, FLUSH_DELAY);
// }

// function flushIframeQueue(): void {
//   pending = false;
//   iframes.forEach((iframe) => {
//     document.body.removeChild(iframe);
//   });
//   iframes = [];
// }

const multiDownload = async (urls: string[]): Promise<void> => {
  // pending = false;
  for (const [index, url] of urls.entries()) {
    await delay(index * DOWNLOAD_DELAY);
    download(url);
  }

  // checkDownloadReady();
};

export default multiDownload;
