import { mountDialog } from "@common/js/mount-vm";
import { getI18nText } from "@common/js/i18n-utils";
import ReassignDialog from "./reassign-dialog.vue";

// 0 代表查user, 1代表查team  3代表查profile
export const ASSIGNEES_TYPE = {
  user: "0",
  team: "1",
  profile: "2",
};

export function openReassignDialog({ originConsentProfileId, userId }) {
  return new Promise((resolve, reject) => {
    let markAsSuccess = false;
    mountDialog({
      title: getI18nText("l_assign_consent_profile"),
      width: "600px",
      component: ReassignDialog,
      props: {
        originConsentProfileId,
        userId,
        targetType: ASSIGNEES_TYPE.user,
      },
      on: {
        success(data) {
          markAsSuccess = true;
          resolve(data);
        },
      },
      onClosed() {
        if (markAsSuccess) {
          return;
        }
        reject(new Error("cancel"));
      },
    });
  });
}
