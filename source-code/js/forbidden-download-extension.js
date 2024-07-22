
let i: number = 0;
export default function forbiddenDownloadExtension(): void {
  const targetEl: HTMLElement | null = document.getElementById("download-link");
  if (targetEl) {
    targetEl.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault();
    });
    targetEl.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
    });
  } else if (i < 30) {
    window.setTimeout(forbiddenDownloadExtension, 1000);
    i++;
  }
}
