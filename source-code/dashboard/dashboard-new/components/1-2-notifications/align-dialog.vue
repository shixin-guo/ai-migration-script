<template>
<zm-dialog
  width="500px"
  v-model:visible="confirmAlignDialogVisible"
  append-to-body
  top="26vh"
>
  <template #title>
    <h1 style="padding-bottom: 4px">
      {{ $t("recording.playlist_viewing_request") }}
    </h1>
  </template>
  <div v-loading="confirmAlignDialogLoading" style="min-height: 56px">
    <div v-if="isAlignForEveryone">
      <span
        @click="handleAlignEveryoneClick"
        v-html="
          $t(
            'recording.user_wants_to_make_the_playlist_visible_to_everyone_in_the_account',
            { username: clickUserName, playlistName: clickPlaylistName }
          )
        "
      />
    </div>
    <div v-else>
      <div>
        <span>{{
          $t(
            "recording.user_wants_to_add_the_following_users_to_view_the_playlist",
            { username: clickUserName }
          )
        }}</span
        ><zm-button
          type="link"
          @click="goToPlaylistDetail(clickPlaylistId)"
          >{{ clickPlaylistName }}</zm-button
        >
      </div>
      <div class="mgt-md popover-wrapper">
        <zm-popover
          placement="bottom-end"
          trigger="hover"
          :visible-arrow="false"
          :offset="200"
        >
          <template #default>
            <div class="notification-pop">
              <div
                v-for="user in specifiedItems"
                :key="user.key"
                class="specified-users"
              >
                <div class="icon-container">
                  <zm-avatar-customize
                    v-if="user.type === 0"
                    :src="user.pic_url"
                    shape="square"
                    :generate-key="user.name || 'Ext'"
                    :avatar-short-name="getDisplayInitials(user.name)"
                    size="small"
                  />
                  <i v-else class="zm-icon-users-group team-icon" />
                </div>
                <span class="mgl-xs">{{ user.name }}</span>
              </div>
            </div>
          </template>
          <template #reference>
            <span class="avatar-list-wrapper avatar-wrapper-notification">
              <span
                v-if="showAttendees.length < maxDisplay + 1"
                class="avatar-wrapper-notification"
              >
                <zm-avatar-customize
                  v-for="(item, index) in showAttendees"
                  :key="index"
                  class="avatar"
                  :generate-key="item.type === 0 ? item.name : ''"
                  :avatar-short-name="
                    item.type === 0 ? getDisplayInitials(item.name) : ''
                  "
                  :src="item.pic_url"
                  size="small"
                  shape="square"
                >
                  <span v-if="item.type === 0">{{
                    getDisplayInitials(item.name)
                  }}</span>
                  <i v-else class="zm-icon-users-group team-icon" />
                </zm-avatar-customize>
              </span>
              <div v-else>
                <zm-avatar-customize
                  v-for="index in indexArrayOfAttendees"
                  :key="index"
                  class="avatar"
                  :src="showAttendees[index].pic_url"
                  :generate-key="
                    showAttendees[index].type === 0
                      ? getDisplayInitials(showAttendees[index].name)
                      : ''
                  "
                  :avatar-short-name="
                    showAttendees[index].type === 0
                      ? getDisplayInitials(showAttendees[index].name)
                      : ''
                  "
                  size="small"
                  shape="square"
                >
                  <span v-if="showAttendees[index].type === 0">{{
                    getDisplayInitials(showAttendees[index].name)
                  }}</span>
                  <i v-else class="zm-icon-users-group team-icon" />
                </zm-avatar-customize>
                <zm-avatar-customize size="small" shape="square">
                  {{ othersAttendeesLabel }}
                </zm-avatar-customize>
              </div>
            </span>
          </template>
        </zm-popover>
      </div>
    </div>
  </div>
  <template #footer>
    <zm-button
      type="danger"
      :loading="denyLoading"
      focus-first
      @click="handleDenyClick"
    >
      {{ $t("recording.deny") }}
    </zm-button>
    <zm-button
      type="primary"
      :loading="approveLoading"
      focus-first
      @click="handleApproveClick"
    >
      {{ $t("recording.approve") }}
    </zm-button>
    <zm-button @click="confirmAlignDialogVisible = false">
      {{ $t("common.cancel") }}
    </zm-button>
  </template>
</zm-dialog>
</template>
    <script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import {
  approveAlignRequest,
  denyAlignRequest,
  getAlignRequestInfo,
} from "@api/playlist";
import { ERROR_CODE } from "shared/js/error-codes";

export default defineComponent({
  name: "AlignDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    clickFolderId: {
      type: String,
      default: "",
    },
    clickPlaylistId: {
      type: String,
      default: "",
    },
    clickUserName: {
      type: String,
      default: "",
    },
    clickPlaylistName: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const confirmAlignDialogLoading = ref(false);
    const specifiedItems = ref<any[]>([]);
    const isAlignForEveryone = ref(true);
    const approveLoading = ref(false);
    const denyLoading = ref(false);
    const maxDisplay = ref(5);

    const confirmAlignDialogVisible = computed({
      get: () => props.visible,
      set: (val) => emit("update:visible", val),
    });

    const showAttendees = computed(() => specifiedItems.value);

    const indexArrayOfAttendees = computed(() =>
      Array.from({ length: maxDisplay.value }, (v, i) => i).filter(
        (index) => !!showAttendees.value[index]
      )
    );

    const othersAttendeesLabel = computed(() => {
      const length = showAttendees.value.length - maxDisplay.value || 0;
      if (length === 1) {
        getDisplayInitials(showAttendees.value[maxDisplay.value]);
      }
      return `${length > 99 ? "..." : length} `;
    });

    watch(confirmAlignDialogVisible, (val) => {
      if (val) {
        handleConfirmAlignDialogOpen(props.clickFolderId, props.clickPlaylistId);
      }
    });

    const getDisplayInitials = (name: string) => {
      return name?.[0]?.toUpperCase() || "Ext";
    };

    const handleConfirmAlignDialogOpen = (folderId: string, playlistId: string) => {
      confirmAlignDialogLoading.value = true;
      getAlignRequestInfo(folderId, playlistId)()
        .then((res) => {
          isAlignForEveryone.value = !!res.align_for_everyone;
          const userArr = res.align_for_users || [];
          const teamArr = res.align_for_teams || [];
          specifiedItems.value = [
            ...userArr.map((user) => {
              return { ...user, type: 0, key: user.zm_user_id + "0" };
            }),
            ...teamArr.map((team) => {
              return { ...team, type: 1, key: team.team_id + "1" };
            }),
          ];
        })
        .catch((err) => {
          if (err.response?.data?.errorCode === ERROR_CODE.NO_PERMISSION) {
            emit("message", {
              type: "warning",
              message: "dashboard.you_have_already_processed_the_request",
            });
            confirmAlignDialogVisible.value = false;
          } else {
            emit("message", { type: "error", message: err.errorMessage });
          }
        })
        .finally(() => (confirmAlignDialogLoading.value = false));
    };

    const handleDenyClick = () => {
      denyLoading.value = true;
      denyAlignRequest(props.clickFolderId, props.clickPlaylistId)()
        .then(() => {
          confirmAlignDialogVisible.value = false;
          emit("refresh-list");
        })
        .catch((e) => {
          emit("message", { type: "error", message: e.errorMessage });
        })
        .finally(() => {
          approveLoading.value = false;
        });
    };

    const handleApproveClick = () => {
      approveLoading.value = true;
      approveAlignRequest(props.clickFolderId, props.clickPlaylistId)()
        .then(() => {
          confirmAlignDialogVisible.value = false;
          emit("refresh-list");
          emit("message", {
            type: "success",
            message: "dashboard.request_approved",
          });
        })
        .catch((e) => {
          emit("message", { type: "error", message: e.errorMessage });
        })
        .finally(() => {
          approveLoading.value = false;
        });
    };

    const goToPlaylistDetail = (id: string) => {
      confirmAlignDialogVisible.value = false;
      emit("router-push", {
        name: "playlist-detail",
        params: { id },
      });
    };

    const handleAlignEveryoneClick = (e: Event) => {
      if ((e.target as HTMLElement).nodeName === "BUTTON") {
        emit("router-push", {
          name: "playlist-detail",
          params: { id: props.clickPlaylistId },
        });
        confirmAlignDialogVisible.value = false;
      }
    };

    return {
      confirmAlignDialogLoading,
      specifiedItems,
      isAlignForEveryone,
      approveLoading,
      denyLoading,
      maxDisplay,
      confirmAlignDialogVisible,
      indexArrayOfAttendees,
      showAttendees,
      othersAttendeesLabel,
      getDisplayInitials,
      handleConfirmAlignDialogOpen,
      handleDenyClick,
      handleApproveClick,
      goToPlaylistDetail,
      handleAlignEveryoneClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.icon-container {
  height: 24px;
  width: 24px;
  background-color: #f7f9fa;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &::v-deep .zm-avatar {
    box-sizing: content-box;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border: none;
    color: #131619;
    background-color: #f7f9fa;
  }
}
.team-icon {
  font-size: 16px;
  color: #6e7680;
}
.avatar-list-wrapper {
  &::v-deep .zm-avatar {
    box-sizing: content-box;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border: none;
    color: #131619;
    background-color: #f1f4f6;
    &:not(:last-child) {
      clip-path: path(
        "M21.7136 2.40044C20.6318 3.99811 20 5.92527 20 8V16C20 18.0747 20.6318 20.0019 21.7136 21.5996C20.2616 23.0809 18.2381 24 16 24H8C3.58172 24 0 20.4183 0 16V8C0 3.58172 3.58172 0 8 0H16C18.2381 0 20.2616 0.919091 21.7136 2.40044Z"
      );
    }
    &:not(:first-child) {
      margin-left: -2.29px;
    }
  }
}
.popover-wrapper > span:first-child {
  display: inline-block;
  height: 24px;
}
.avatar-wrapper-notification {
  display: inline-block;
  height: 24px;
}
.notification-pop {
  padding: 4px;
  .specified-users:not(:first-child) {
    margin-top: 12px;
  }
}

      </style>