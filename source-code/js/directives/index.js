
import Vue from "vue";
import clickoutside from "@zoom/zoom-ui-meeting/src/utils/clickoutside";
import uid from "shared/js/directives/uid";
import focusinput from "./focusinput";
import focuserror from "./focuserror";

const directives: { [key: string]: any } = {
  clickoutside,
  uid,
  focusinput,
  focuserror,
};

Object.keys(directives).forEach((name) =>
  Vue.directive(name, directives[name])
);
