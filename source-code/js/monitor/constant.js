
// should sync with Monitor SDK
// https://dayone.zoomdev.us/docs/en-us/frontendCommon/monitorjs.html#user-behaviour-tracking-log-v2-0

// interface TrackingEvent {
//     label: string,
//     module?: string,
//     num?: number,
//     desc?: string,
//     from?: string,
//     to?: string
//   }

// pls remember update this document to record status
// https://docs.google.com/spreadsheets/d/1fn-yjb9DMTLQMQBZtPHjoq9j4D8KQRy6eAhkrgR1RGQ/edit#gid=0

export const ActionEnum = {
  click: "click",
  view: "view",
  scroll: "scroll",
  hover: "hover",
  stay: "stay",
  input: "input",
  load: "load",
  download: "download",
} as const;

type ActionEnum = typeof ActionEnum[keyof typeof ActionEnum];

// packages/web/src/router/index.js recommend use router name
const SalesModuleName = {
  Global: "global",
  ConversationDetail: "conv_detail",
  AnalysePage: "analyse_page",
} as const;

type SalesModuleName = typeof SalesModuleName[keyof typeof SalesModuleName];

interface TrackingEvent {
  label: string;
  action: ActionEnum;
  module?: SalesModuleName;
  num?: number;
  desc?: string;
  from?: string;
  to?: string;
}

export const trackingListConstant: Record<string, TrackingEvent> = {
  click_good_question: {
    label: "click_good_question",
    action: ActionEnum.click,
    module: SalesModuleName.ConversationDetail,
  },
  click_next_step: {
    label: "click_next_step",
    action: ActionEnum.click,
    module: SalesModuleName.ConversationDetail,
  },
  click_callouts: {
    label: "click_callouts",
    action: ActionEnum.click,
    module: SalesModuleName.ConversationDetail,
  },
  view_iq4s: {
    label: "iq4s_dwell",
    action: ActionEnum.click,
    module: "",
    from: "",
  },
  click_analytic_metrics: {
    label: "click_analytic_metrics",
    action: ActionEnum.click,
    module: SalesModuleName.AnalysePage,
    from: "",
    desc: "",
  },
  download_analytics_csv: {
    label: "download_analytics_csv",
    action: ActionEnum.download,
    module: SalesModuleName.AnalysePage,
    from: "",
    desc: "",
  },
};
