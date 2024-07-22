
import { sub } from "date-fns";
import AriaUtils from "@zoom/zoom-ui-meeting/src/utils/aria-utils";

/* Users can query the data of the last 6 months */
const maxSupportMonth: number = 6;
/* Users can query up to 30 days of data at a time */
const maxSupportDays: number = 30;

const last7Days: number = 7;
const last30Days: number = 30;

/* duration option value start */
const durationOptionLast7Days: number = 0;
const durationOptionLast30Days: number = 1;
const durationOptionCustomize: number = 2;
/* duration option value end */

const pollType: { [key: string]: number } = {
  singleChoice: 0,
  multipleChoice: 1,
  matching: 2,
  rankOrder: 3,
  shortAnswer: 4,
  longAnswer: 5,
  blank: 6,
  ratingScale: 7,
};

const colors: string[] = [
  "#0E72ED",
  "#272AE4",
  "#DE793B",
  "#00A3B8",
  "#E8CF4F",
  "#FF3B38",
  "#B06CF8",
  "#6692F5",
  "#F59B5C",
  "#D75F80",
  "#C967BF",
  "#464081",
  "#F77E79",
  "#025057",
  "#0784D7",
  "#7C5305",
];

const mKey: string[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
];

const VIEW_TYPE: { [key: string]: string } = {
  ALL: "ALL",
  TEAM: "TEAM",
  SELF: "SELF",
};

const PERMISSION: { [key: string]: string } = {
  Role_Edit: "Role:Edit",
  ALL_ANALYTICS_METRICS_READ: "AllAnalyticsMetrics:Read",
  ALL_CONVERSATIONS_READ: "AllConversations:Read",
  ALL_DEALS_READ: "AllDeals:Read",
  SCORECARD_MANAGEMENT_EDIT: "ScorecardManagement:Edit",
  SCORECARD_MANAGEMENT_READ: "ScorecardManagement:Read",
  COACHING_ACTIVITY_TRACKER_READ: "IqCoachingTracker:Read",
  TEAM_ANALYTICS_METRICS_READ: "TeamAnalyticsMetrics:Read",
  TEAM_CONVERSATIONS_READ: "TeamConversations:Read",
  TEAM_MANAGEMENT_EDIT: "TeamManagement:Edit",
  TEAM_DEALS_READ: "TeamDeals:Read",
  VIRTUAL_COACHING_SCENARIOS_READ: "VirtualCoachingScenarios:Read",
  VIRTUAL_COACHING_SCENARIOS_EDIT: "VirtualCoachingScenarios:Edit",
  TEAM_COACHING_EDIT: "",
};

export {
  maxSupportMonth,
  maxSupportDays,
  last7Days,
  last30Days,
  durationOptionLast7Days,
  durationOptionLast30Days,
  durationOptionCustomize,
  mKey,
  pollType,
  colors,
  VIEW_TYPE,
  PERMISSION,
};

export const NAV_KEY: { [key: string]: string } = {
  NEXT: "next",
  PREV: "prev",
  HOME: "home",
  END: "end",
};

export const KIWI_ROLE: { [key: string]: string } = {
  KIWI_ADMIN: "20",
  KIWI_SALES_SUPERVISOR: "21",
  KIWI_SALES_MANAGER: "22",
  KIWI_SALES_REPRESENTATIVE: "23",
};

export const WHO_CAN_VIEW: { [key: string]: string } = {
  ANYONE_WITH_SHARE_LINK: "anyone_with_the_share_link",
  SIGNED_IN_USERS: "signed_in_users",
  SIGNED_IN_USER_IN_MY_ACCOUNT: "signed_in_users_in_your_account",
};

export const SHARED_VIEW: { [key: string]: string } = {
  CONVERSATION_METRICS: "conversation_metrics",
  COMMENTS: "comments",
  COACHING: "coaching",
  DEAL_INFO: "deal_info",
  DEAL_MEMO: "deal_memo",
};

export const MIN_DATE: Date = sub(new Date(), { months: 1 });
export const MAX_DATE: Date = new Date();
export const PAGE_SIZE: number = 20;

// https://www.w3.org/International/O-charset-lang.html
// https://zoomvideo.atlassian.net/wiki/spaces/COEUS/pages/2530312898/ZOOM-441262+Multilingual+support+for+ZoomIQ
export const defaultEnglish: string = "en";
export const defaultLangList: { [key: string]: string } = {
  [defaultEnglish]: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  zh: "Chinese",
  ru: "Russian",
  uk: "Ukrainian",
  ja: "Japanese",
  ko: "Korean",
  vi: "Vietnamese",
  pt: "Portuguese",
  nl: "Dutch",
  hi: "Hindi",
  pl: "Polish",
  da: "Danish",
  sv: "Swedish",
  fi: "Finnish",
  ar: "Arabic",
  // el: "Greek",
  // tr: "Turkish",
  id: "Indonesian",
};

export const USER_ACTION: { [key: string]: string } = {
  CUT_TO_THE_CHASE: "cut_to_the_chase_flag",
  VC_ONBOARDING_TOUR: "vc_training_session_flag",
  SMART_COMPOSE: "smart_compose",
  DONT_REMIND_REGENERATE_NEXT_STEPS: "dont_remind_regenerate_next_steps",
  DONT_REMIND_REGENERATE_NEXT_STEPS_SAVE:
    "dont_remind_regenerate_next_steps_save",
  DONT_REMIND_REGENERATE_SUMMARY: "dont_remind_regenerate_summary",
  DONT_REMIND_REGENERATE_SUMMARY_SAVE: "dont_remind_regenerate_summary_save",
  DONT_REMIND_REGENERATE_GOOD_QUESTIONS:
    "dont_remind_regenerate_good_questions",
  DONT_REMIND_REGENERATE_GOOD_QUESTIONS_SAVE:
    "dont_remind_regenerate_good_questions_save",
  SMART_COMPOSE_DISCLAIMER: "smart_compose_disclaimer_v3",
  SMART_COMPOSE_NO_SIGNIFICANT_CHANGE: "smart_compose_no_significant_change",
  SMART_COMPOSE_CLEAR_CONTENT: "smart_compose_clear_content",
  VIRTUAL_COACHING_DISCLAIMER: "virtual_coaching_disclaimer",
  COACHING_AUTO_ZERO_DISCLAIMER: "coaching_auto_zero_disclaimer",
  RECORD_EXTERNAL_MEETING: "record_external_meeting",
  AUTOMATED_COACHING_MARK: "automated_coaching_mark",
};

export const USER_TYPE: { [key: string]: string } = {
  INTERNAL: "rep",
  EXTERNAL: "customer",
};

export const keycodeToNavMap: { [key: string]: string } = {
  [AriaUtils.keys.enter]: NAV_KEY.NEXT,
  [AriaUtils.keys.down]: NAV_KEY.NEXT,
  [AriaUtils.keys.up]: NAV_KEY.PREV,
  [AriaUtils.keys.home]: NAV_KEY.HOME,
  [AriaUtils.keys.end]: NAV_KEY.END,
};

export const BIZ_TYPE: { [key: string]: number } = {
  NEW_FEATURE: 0, //new_feature
  COMMENT: 1, //comment
  PLAYLIST: 2, //playlist
  SMART_PLAYLIST: 3, //smart_playlist
  VIRTUAL_COACHING: 4, //virtual_coaching
  PLAYLIST_SHARE: 5, //playlist_share
  SCORECARD: 6, //scorecard
  CONVERSATION_ANALYSIS: 7, //conversation_analysis
  FOLDER: 8, //folder
  PLAYLIST_VIEW_SETTING_ALIGN: 9, //playlist_view_setting_align
  PLAYLIST_VIEW_SETTING_REQUEST_ALIGN: 10, //playlist_view_setting_request_align
  DEAL_RISK: 11, //deal_risk
  TOPIC_DISCOVERY_MONTHLY_REPORT: 12, //topic_discovery_monthly_report
  EMAIL_CERTIFICATE_EXPIRED: 17,
};

export const KPI_TYPE: { [key: string]: string } = {
  NEXT_STEPS: "next_steps",
  GOOD_QUESTIONS: "engaging_questions",
  SENTIMENT: "sentiment",
  ENGAGEMENT: "engagement",
  MY_TALK_TIME: "my_talk_time",
  TALKING_SPEED: "talk_speed",
  FILLER_WORDS: "filler_words",
  PATIENCE: "patience",
  LONGEST_SPIEL: "longest_spiel",
  TIME_ON_SLIDES: "time_on_slides",
  DURATION: "conversation_duration",
  SCORE: "score",
};

export const TypesOfCoachingQuestion: { [key: number]: { type: string; icon: string; text: string } } = {
  1: {
    type: "judgment",
    icon: "zm-icon-single",
    text: "Yes / No",
  },
  2: {
    type: "single",
    icon: "zm-icon-single",
    text: "Single Choice",
  },
  3: {
    type: "nps",
    icon: "zm-icon-NPS",
    text: "Rating Scale",
  },
};

export const RECORDING_TYPE: { [key: string]: string } = {
  MANUAL: "MANUAL",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
};

export const TypesOfAutoCoachingQuestion: { [key: number]: { type: string; icon: string; text: string } } = {
  1: {
    type: "judgment",
    icon: "zm-icon-single",
    text: "Yes / No",
  },
  3: {
    type: "nps",
    icon: "zm-icon-NPS",
    text: "Rating Scale",
  },
};

export const TypesOfAutoCoachingQuestionDisableNps: { [key: number]: { type: string; icon: string; text: string; disabled?: boolean; disabledReason?: string } } = {
  1: {
    type: "judgment",
    icon: "zm-icon-single",
    text: "Yes / No",
  },
  3: {
    type: "nps",
    icon: "zm-icon-NPS",
    text: "Rating Scale",
    disabled: true,
    disabledReason: "k_you_have_disabled_scoring",
  },
};

export const ScorecardType: { [key: string]: string } = {
  AUTOSCORING: "AUTOSCORING",
  AUTOMATED: "AUTOMATED",
  BASIC: "BASIC",
};

export const COACHING_STATUS: { [key: string]: string } = {
  PROCESSING: "PROCESSING",
  PROCESS_FAILED: "PROCESS_FAILED",
};
