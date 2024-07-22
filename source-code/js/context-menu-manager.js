
const contextMenus: any[] = [];

export function addMenu(menu: any): void {
  contextMenus.push(menu);

  addEvents(menu);
}

export function removeMenu(menu: any): void {
  contextMenus.splice(contextMenus.indexOf(menu), 1);
}

function addEvents(menu: any): void {
  menu.$on("show", () => {
    contextMenus.forEach((contextMenu) => {
      if (contextMenu !== menu) {
        contextMenu.hide();
      }
    });
  });
}
