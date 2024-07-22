<template>
<div v-slot:title>
  <zm-row v-show="meeting.eventId" type="flex" class="meeting-header">
    <zm-col :span="0.5" class="mgr-sm">
      <i class="arrow zm-icon-right" />
    </zm-col>
    <zm-col :span="14">
      <div>
        <div class="meeting-topic">{{ meeting.topic }}</div>
        <div class="upcoming-time">
          {{ formatMeetingTime(meeting) }}
          <span
            v-if="meeting.platform === 'microsoft_teams'"
            class="external-label"
          >
            <zm-icon style="width: 16px" size="mini">
              <use href="#icon-ms-teams" xlink:href="#icon-ms-teams" />
            </zm-icon>
            <span class="mgl-xs">{{ $t("microsoft_teams") }}</span>
          </span>
        </div>
        <avatar-list
          :attendees="getMeetingAttendees(meeting)"
          :host="getMeetingHost(meeting)"
          :max-display="5"
          placement="bottom"
          class="avatar-list"
        />
      </div>
    </zm-col>
    <zm-col :span="9" class="col-start-rec-with-iq mgl-md">
      <template v-if="isEnableZraListener">
        <!-- host cares about auto recording -->
        <template v-if="isInternalMeetingAndHost">
          {{ $t("record") }}
          <zm-tooltip
            class="item"
            :disabled="meetingExtInfo.canModifyRecordWithIQ"
            :content="
              meetingExtInfo.isHost
                ? $t('this_setting_is_locked_by_your_admin')
                : $t('only_host_can_update_this_setting')
            "
            placement="bottom"
          >
            <zm-switch
              v-model:checked="recordWithIQ"
              label-by="title"
              :disabled="
                !meetingExtInfo.canModifyRecordWithIQ ||
                meetingExtInfo.status !== 'not started'
              "
              class="mgl-sm mgr-md"
              @click.stop
              @update:checked="(newValue) => changeSwitchOfRecordWithIQ(newValue, meeting)"
            />
          </zm-tooltip>
          <zm-button
            v-if="isNotInClient && meeting.startLink"
            :type="meetingIndex === 0 ? 'primary' : ''"
            :disabled="meetingExtInfo.status !== 'not started'"
            size="mini"
            @click.stop="() => startMeeting(meeting.startLink)"
          >
            {{
              meetingExtInfo.isHost ? $t("common.start") : $t("join_meeting")
            }}
          </zm-button>
        </template>
        <!-- participants care about bot -->
        <template v-else>
          <template v-if="meeting.show_toggle">
            {{ $t("record") }}
            <zm-switch
              v-model:checked="recordWithIQ"
              label-by="title"
              :disabled="isRecordDisabled"
              class="mgl-sm"
              @click="handleRecordClick"
              @update:checked="(newValue) => changeSwitchOfRecordWithBot(newValue)"
            />
            <zm-tooltip
              v-if="isAlreadyHaveBot"
              class="item"
              placement="bottom"
              :content="$t('k_already_have_bot')"
            >
              <i
                v-if="isAlreadyHaveBot"
                class="zm-icon-info-outline mgl-sm"
              />
            </zm-tooltip>
          </template>
          <zm-button
            v-if="isNotInClient && meeting.startLink"
            class="mgl-md"
            :type="meetingIndex === 0 ? 'primary' : ''"
            :disabled="isStartJoinButtonDisabled"
            size="mini"
            @click.stop="() => startMeeting(meeting.startLink)"
          >
            {{ isShowStart ? $t("common.start") : $t("join_meeting") }}
          </zm-button>
        </template>
      </template>
      <template v-else>
        {{ $t("record") }}
        <zm-tooltip
          class="item"
          :disabled="meetingExtInfo.canModifyRecordWithIQ"
          :content="
            meetingExtInfo.isHost
              ? $t('this_setting_is_locked_by_your_admin')
              : $t('only_host_can_update_this_setting')
          "
          placement="bottom"
        >
          <zm-switch
            v-model:checked="recordWithIQ"
            label-by="title"
            :disabled="
              !meetingExtInfo.canModifyRecordWithIQ ||
              meetingExtInfo.status !== 'not started'
            "
            class="mgl-sm mgr-md"
            @click.stop
            @update:checked="(newValue) => changeSwitchOfRecordWithIQ(newValue, meeting)"
          />
        </zm-tooltip>
        <zm-button
          v-if="isNotInClient && meeting.startLink"
          :type="meetingIndex === 0 ? 'primary' : ''"
          :disabled="meetingExtInfo.status !== 'not started'"
          size="mini"
          @click.stop="() => startMeeting(meeting.startLink)"
        >
          {{
            meetingExtInfo.isHost ? $t("common.start") : $t("join_meeting")
          }}
        </zm-button>
      </template>
    </zm-col>
  </zm-row>
  <zm-dialog
    :visible="recordConfirmVisible"
    width="500px"
    top="30vh"
    @click.stop
    @open="isDoNotRemind = false"
  >
    <template #title>
      <h1 class="dialog-title">
        {{ $t("k_record_this_meeting") }}
      </h1>
    </template>
    <span style="font-size: 14px">
      {{ $t("k_record_this_meeting_tip") }}
    </span>
    <template #footer>
      <div class="dialog-footer">
        <zm-checkbox v-model:checked="isDoNotRemind">{{
          $t("do_not_remind_me_again")
        }}</zm-checkbox>
        <div>
          <zm-button
            :loading="isConfirmLoading"
            type="primary"
            @click="handleConfirmClick"
          >
            {{ $t("common.btn_confirm") }}
          </zm-button>
          <zm-button @click="hideConfirm">
            {{ $t("common.cancel") }}
          </zm-button>
        </div>
      </div>
    </template>
  </zm-dialog>
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import AvatarList from "@components/avatar-list";
import { isSameDay, isToday } from "date-fns";
import { formatInTimeZone } from "shared/js/format-date";
import {
  updateRecordingOptionApi,
  getUpcomingMeetingInfoApi,
  startRecordWithBot,
  stopRecordWithBot,
} from "@api/dashboard-new";
import { openLink } from "@common/js/client";
import { USER_ACTION } from "shared/js/constant";
import { updateUserAction } from "@api/settings";

export default defineComponent({
  name: "UpcomingMeetingHeader",
  components: { AvatarList },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    meetingIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const isNotInClient = ref(window.__kiwi__.from !== "client");
    const recordWithIQ = ref(false);
    const meetingExtInfo = ref({});
    const recordConfirmVisible = ref(false);
    const isDoNotRemind = ref(false);
    const isConfirmLoading = ref(false);

    const currentUser = computed(() => store.state.currentUser);

    const isEnableZraListener = computed(() => {
      return currentUser.value?.features?.enable_zra_listener || false;
    });

    const isAlreadyHaveBot = computed(() => {
      return (
        props.meeting?.have_bot &&
        props.meeting?.bot_invite_user !== currentUser.value?.zm_user_id
      );
    });

    const isRecordDisabled = computed(() => {
      return isAlreadyHaveBot.value || isConfirmLoading.value;
    });

    const isHideRecordConfirmDialog = computed(() => {
      return (currentUser.value.user_actions || []).some(
        ({ action }) => action === USER_ACTION.RECORD_EXTERNAL_MEETING
      );
    });

    const isInternalMeetingAndHost = computed(() => {
      return props.meeting.isHost && props.meeting.platform !== "microsoft_teams";
    });

    const isStartJoinButtonDisabled = computed(() => {
      return props.meeting.platform === "microsoft_teams"
        ? props.meeting.status !== "not started" && props.meeting.status !== "started"
        : meetingExtInfo.value.status !== "not started" && meetingExtInfo.value.status !== "started";
    });

    const isShowStart = computed(() => {
      return props.meeting.platform === "microsoft_teams"
        ? props.meeting.status === "not started" && props.meeting.isHost
        : meetingExtInfo.value.status === "not started" && meetingExtInfo.value.isHost;
    });

    onMounted(() => {
      if (props.meeting.meetingId) {
        getUpcomingMeetingInfoApi({
          meeting_id: props.meeting.meetingId,
        }).then((res = {}) => {
          const {
            recordWithIQ = false,
            canModifyRecordWithIQ = false,
            isHost = false,
            status = "",
            hostUserId = "",
          } = res;
          meetingExtInfo.value = {
            canModifyRecordWithIQ,
            isHost,
            status,
            hostUserId,
          };
          if (!isEnableZraListener.value || isInternalMeetingAndHost.value)
            recordWithIQ.value = recordWithIQ;
        });
      }
      if (isEnableZraListener.value) {
        recordWithIQ.value = props.meeting.have_bot || false;
      }
    });

    const hideConfirm = () => {
      recordConfirmVisible.value = false;
    };

    const startMeeting = (startLink: string) => {
      startLink && openLink(startLink);
    };

    const getMeetingAttendees = (meeting: any) => {
      const { attendees = [] } = meeting;
      return attendees
        ?.map((item: any) => {
          return {
            email: item.email,
            name: item.name || item.email,
            not_joined: false,
            zm_user_id: item.user_id,
            pic_url: item.avatar,
            type: "rep",
          };
        })
        .filter((item: any) => item.name);
    };

    const getMeetingHost = () => {
      const { hostUserId = "" } = meetingExtInfo.value;
      if (
        !hostUserId &&
        isEnableZraListener.value &&
        props.meeting.platform === "microsoft_teams"
      ) {
        return {
          zm_user_id: props.meeting?.hostUserId || "",
        };
      }
      return {
        zm_user_id: hostUserId,
      };
    };

    const formatMeetingTime = (meeting: any = {}) => {
      const { startTime, endTime } = meeting;
      if (!startTime || !endTime) {
        return "";
      }
      const start = new Date(startTime);
      const end = new Date(endTime);
      const isSameDayMeeting = isSameDay(start, end);
      const isTodayMeeting = isToday(start);
      const startHour = formatInTimeZone(start, "hh:mm aa");
      const endHour = formatInTimeZone(end, "hh:mm aa");
      const startDay = formatInTimeZone(start, "iii");
      if (isTodayMeeting) {
        return `${this.$t("common.today")} ${startHour} - ${endHour}`;
      } else if (isSameDayMeeting) {
        return `${startDay} ${startHour} - ${endHour}`;
      } else {
        const endDay = formatInTimeZone(end, "iii");
        return `${startDay} ${startHour} - ${endDay} ${endHour}`;
      }
    };

    const changeSwitchOfRecordWithIQ = (newValue: boolean, meeting: any) => {
      updateRecordingOptionApi({
        meetingNumber: meeting.meetingId,
        autoRecordCheckEnum: newValue ? 1 : 2,
      });
    };

    const handleRecordClick = (e: Event) => {
      e.stopPropagation();
      if (!recordWithIQ.value && !isHideRecordConfirmDialog.value) {
        e.preventDefault();
        recordConfirmVisible.value = true;
      }
    };

    const changeSwitchOfRecordWithBot = (newValue: boolean) => {
      if (newValue) {
        isConfirmLoading.value = true;
        startRecordWithBot({
          event_id: props.meeting.eventId,
          i_calendar_uid: props.meeting.i_calendar_uid,
        })
          .then((res) => {
            props.meeting.bot_id = res || "";
            if (props.meeting.status === "started")
              this.$message.success(this.$t("k_recording_request_sent"));
            if (isDoNotRemind.value) {
              updateUserAction({ action: USER_ACTION.RECORD_EXTERNAL_MEETING });
              store.commit("setCurrentUser", {
                ...currentUser.value,
                user_actions: [
                  ...currentUser.value.user_actions,
                  { action: USER_ACTION.RECORD_EXTERNAL_MEETING },
                ],
              });
            }
          })
          .catch((err) => {
            this.$message.error(err.message);
          })
          .finally(() => {
            isConfirmLoading.value = false;
          });
      } else if (props.meeting.bot_id) {
        isConfirmLoading.value = true;
        stopRecordWithBot({
          bot_id: props.meeting.bot_id,
          i_calendar_uid: props.meeting.i_calendar_uid,
        })
          .then(() => {
            if (props.meeting.status === "started")
              this.$message.success(this.$t("k_recording_stopped"));
          })
          .catch((err) => {
            this.$message.error(err.message);
          })
          .finally(() => {
            isConfirmLoading.value = false;
          });
      }
    };

    const handleConfirmClick = () => {
      recordWithIQ.value = true;
      recordConfirmVisible.value = false;
      changeSwitchOfRecordWithBot(true);
    };

    return {
      isNotInClient,
      recordWithIQ,
      meetingExtInfo,
      recordConfirmVisible,
      isDoNotRemind,
      isConfirmLoading,
      currentUser,
      isEnableZraListener,
      isAlreadyHaveBot,
      isRecordDisabled,
      isHideRecordConfirmDialog,
      isInternalMeetingAndHost,
      isStartJoinButtonDisabled,
      isShowStart,
      hideConfirm,
      startMeeting,
      getMeetingAttendees,
      getMeetingHost,
      formatMeetingTime,
      changeSwitchOfRecordWithIQ,
      handleRecordClick,
      changeSwitchOfRecordWithBot,
      handleConfirmClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.col-start-rec-with-iq {
  display: flex;
  align-items: center;
  font-size: 14px;
  justify-content: flex-end;
}
.meeting-header {
  margin: 8px 0;
  padding: 8px;
  border-radius: 12px;
  &:hover {
    background-color: #f1f4f6;
  }
  .upcoming-time {
    font-size: 12px;
    padding: 4px 0;
    line-height: 16px;
    color: #6e7680;
    display: flex;
    align-items: center;
    height: 24px;
    .external-label {
      &:before {
        content: "\00B7";
        margin: 0 4px;
      }
      display: inline-flex;
      align-items: center;
    }
  }
  .meeting-topic {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
    width: 100%;
    color: #131619;
  }
}
.dialog-footer {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

      </style>