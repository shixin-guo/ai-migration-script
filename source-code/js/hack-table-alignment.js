
import { debounce } from "shared/js/utils";

export default {
  data() {
    return {
      tableRef: "table",
    };
  },
  mounted() {
    window.addEventListener("scroll", this.onScrollFixedColumn);
  },
  watch: {
    tableData() {
      this.hackColumnStyle();
    },
  },
  activated() {
    this.hackColumnStyle();
    window.addEventListener("scroll", this.onScrollFixedColumn);
  },
  deactivated() {
    window.removeEventListener("scroll", this.onScrollFixedColumn);
  },
  methods: {
    onScrollFixedColumn() {
      this.hackScrollColumnStyle();
    },
    hackColumnStyle: debounce(function (this: any) {
      this.hackFixedColumnStyle();
    }, 200),
    hackScrollColumnStyle: debounce(function (this: any) {
      this.hackFixedColumnStyle();
    }, 500),
    hackFixedColumnStyle(this: any) {
      const ref = this.tableRef || "table";
      const tableEl = this.$refs[ref]?.$el as HTMLElement | undefined;
      if (!tableEl) return;
      const header = tableEl.querySelector(
        ".zm-sticky .zm-table__header-wrapper"
      ) as HTMLElement | null;
      if (!header) {
        return;
      }
      const headerHeight = header.offsetHeight || 0;
      ["zm-table__fixed", "zm-table__fixed-right"].forEach((className) => {
        const tableFixedColumn = tableEl.querySelector(
          `.${className} > .zm-sticky`
        ) as HTMLElement | null;
        if (!tableFixedColumn) return;
        const stickyHeight = tableFixedColumn.offsetHeight || 0;
        if (stickyHeight !== headerHeight) {
          tableFixedColumn.style.height = `${headerHeight}px`;
        }
        const nodeList = tableFixedColumn.querySelectorAll(
          ".zm-table__fixed-header-wrapper table.zm-table__header thead > tr"
        ) as NodeListOf<HTMLElement>;
        if (!nodeList) return;
        nodeList.forEach((tr) => {
          if (!tr) return;
          const height = tr.style?.height || "";
          if (!height || height === "0px") {
            tr.style.height = `${headerHeight}px`;
          }
        });
      });
    },
  },
};
