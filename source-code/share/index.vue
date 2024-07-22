<template>
<div class="iq-share-wrapper">
  <div v-if="showErrorPopup" class="share-container">
    <div class="centered-element">
      <p class="perm-conv">
        {{ $t("share.you_no_permission") }}
      </p>
      <p class="error-message">
        {{ showErrorMessage }}
      </p>
    </div>
  </div>
  <div v-else-if="showPassPopup">
    <div class="inside-container">
      <h1 class="passcode-heading">
        {{ $t("share.enter_passcode") }} {{ meetingTopic }}
      </h1>
      <zm-set-password
        v-model="password"
        :rules-map="rulesMap"
        inline-label
        input-label="Passcode"
        :show-confirm="false"
        style="width: 320px"
      />
      <zm-button
        :loading="validatePasswordLoading"
        type="primary"
        size="large"
        @click="viewConvClicked"
      >
        {{ $t("share.view_conv_ra") }}
      </zm-button>
    </div>
  </div>
  <div v-else-if="showRecordingDetail">
    <recording-detail />
  </div>
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { setJwtToken } from "@api/helpers";
import { getJwtTokenFromWebShare, userAuthentication, valPass } from "@api/web";
import RecordingDetail from "@views/recording-detail/detail";
import * as ShareMutationTypes from "@store/share/mutation-types";

export default defineComponent({
  name: "ShareClipPage",
  components: {
    RecordingDetail,
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    const meetingTopic = ref("");
    const showErrorMessage = ref("");
    const showErrorPopup = ref(false);
    const showPassPopup = ref(false);
    const showRecordingDetail = ref(false);
    const meetingID = ref(route.params.id);
    const jwtToken = ref("");
    const password = ref("");
    const enablePassword = ref(false);
    const isUserInMyAccount = ref(false);
    const isUserSignedIn = ref(false);
    const rulesMap = ref({});
    const validatePasswordLoading = ref(false);
    const isPasswordValidated = ref(false);

    const setShareInfo = (info: any) => store.commit(`share/${ShareMutationTypes.SET_SHARE_INFO}`, info);
    const setShared = (shared: boolean) => store.commit(`share/${ShareMutationTypes.SET_SHARED}`, shared);

    const isValidJwtToken = () => {
      getJwtTokenFromWebShare(route.params.id, route.query?.moment_id || "")
        .then((result) => {
          jwtToken.value = result;
          setJwtToken(jwtToken.value);
        })
        .catch(() => {})
        .finally(() => {
          let param = {
            encryptMeetingId: route.params.id,
            encryptMomentId: route.query?.moment_id || "",
          };
          if (!isPasswordValidated.value) {
            userAuthentication(param)
              .then((result) => {
                const { enable_passwd, is_same_account, login_status } = result;
                enablePassword.value = enable_passwd;
                isUserInMyAccount.value = is_same_account;
                isUserSignedIn.value = login_status;
                if (result.enable_passwd) {
                  showPassPopup.value = true;
                  meetingTopic.value = result.validateContext.topic;
                } else {
                  openDetailsPage();
                }
              })
              .catch((e) => {
                if (e.errorCode === 201) {
                  window.location.href = "/signin";
                } else if (e.errorMessage) {
                  showErrorPopup.value = true;
                  showErrorMessage.value = e.errorMessage;
                }
              });
          } else {
            validatePasswordLoading.value = false;
            openDetailsPage();
          }
        });
    };

    const viewConvClicked = () => {
      let param = {
        meeting_id: meetingID.value,
        passwd: password.value,
        moment_id: route.query?.moment_id || "",
      };
      validatePasswordLoading.value = true;
      valPass(param)
        .then(() => {
          isPasswordValidated.value = true;
          isValidJwtToken();
        })
        .catch((e) => {
          validatePasswordLoading.value = false;
          password.value = "";
          // Assuming $message is a global method or imported from a library
          // this.$message.error(e.errorMessage);
        });
    };

    const openDetailsPage = () => {
      setShared(true);
      setShareInfo({
        isShared: true,
        encryptedMeetingId: meetingID.value,
        momentId: route.query.moment_id,
        isUserSignedIn: isUserSignedIn.value,
        isUserInMyAccount: isUserInMyAccount.value,
      });
      showErrorPopup.value = false;
      showPassPopup.value = false;
      showRecordingDetail.value = true;
    };

    onMounted(() => {
      isValidJwtToken();
    });

    return {
      meetingTopic,
      showErrorMessage,
      showErrorPopup,
      showPassPopup,
      showRecordingDetail,
      meetingID,
      jwtToken,
      password,
      enablePassword,
      isUserInMyAccount,
      isUserSignedIn,
      rulesMap,
      validatePasswordLoading,
      isPasswordValidated,
      viewConvClicked,
      openDetailsPage,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.share-container {
  position: relative;
  height: 400px;
  background-color: black;
  scroll-behavior: unset;
}
.outside-container {
  position: relative;
  height: 400px;
  scroll-behavior: unset;
}

.centered-element {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.inside-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}
.perm-conv {
  font-weight: 700;
  font-size: 24px;
  color: white;
}
.error-message {
  font-weight: 500;
  font-size: 20px;
  color: white;
  text-align: center;
}
.passcode-heading {
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 40px;
}

::v-deep .zm-icon-right {
  margin-right: -15px;
  margin-left: -5px;
  margin-top: 7px;
}

::v-deep .cell {
  display: flex;
}

      </style>
<style lang="scss" >
        
.mini-layout {
  background-color: #fff;
  min-height: 1100px;
  margin-top: 64px;
}
// only used in local env
.local-container {
  padding: 32px 48px;
  margin-top: 32px;
  position: relative;
  background-color: #fff;
  top: 120px;
  min-height: 1100px;
}
#header_container {
  background-color: white;
}
#footer {
  margin-top: 0;
}

      </style>