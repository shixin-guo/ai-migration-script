
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
let keys: { [key: number]: number } = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e: Event): void {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent): boolean | void {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
  window.addEventListener(
    "test",
    null as unknown as EventListenerOrEventListenerObject,
    Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
        return null;
      },
    })
  );
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e);
}

let wheelOpt: boolean | AddEventListenerOptions = supportsPassive ? { passive: false } : false;
let wheelEvent: string = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

// call this to Disable
function disableScroll(): void {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll(): void {
  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  window.removeEventListener("touchmove", preventDefault, wheelOpt);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

export { disableScroll, enableScroll };
