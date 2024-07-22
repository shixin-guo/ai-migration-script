
let el: HTMLElement | null = null;

createAlertEl();

function createAlertEl(): void {
  el = document.createElement("p");
  el.setAttribute("role", "alert");
  el.className = "aria-alert-hidden";
  document.body.appendChild(el);
}

export function readAria(text: string): void {
  if (el) {
    el.style.display = "none";
    el.innerText = text;
    el.style.display = "block";
  }
}
