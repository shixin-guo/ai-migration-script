<template>
<div v-loading="loadingDeal">
  <div
    v-show="!hasDealViewPermission"
    class="meeting-info meeting-info-short content-tip"
  >
    <span>
      {{ $t("recording.deal_no_permission_ra") }}
    </span>
  </div>

  <div v-show="hasDealViewPermission">
    <div v-if="getMeetingDealAccountExist" class="meeting-info">
      <zm-row type="flex" class="row-bg" justify="space-around">
        <zm-col :span="6">
          <label>
            {{ !isExistCurrentMeetingDealLead ? $t("deal.customer") : $t('recording.company') }}</label
          >
        </zm-col>
        <zm-col :span="18">
          {{ meetingDealAccountName }}
        </zm-col>
      </zm-row>
      <zm-row type="flex" class="row-bg" justify="space-around">
        <zm-col :span="6">
          {{ !isExistCurrentMeetingDealLead ? $t("analytics.tab_deal") : $t('recording.lead') }}
        </zm-col>
        <zm-col :span="18">
          <template v-if="getMeetingDealInfo.id">
            <router-link
              :to="{
                name: 'deal-detail',
                params: { id: getMeetingDealInfo.id },
              }"
            >
              {{ getMeetingDealInfo.name }}
            </router-link>
            <span v-show="getMeetingDealInfo.stage" class="deal-stage">{{
              getMeetingDealInfo.stage
            }}</span>
            <zm-button
              v-show="hasDealEditPermission"
              icon="zm-icon-edit"
              class="edit-button mgl-sm"
              ghost
              @click="openImportDealDialog"
            />
          </template>
          <template v-else>
            <zm-button
              v-if="hasDealEditPermission"
              type="link"
              style="padding: 0"
              @click="openImportDealDialog"
            >
              {{ $t("update_deal") }}
            </zm-button>
            <span v-else class="gray">
              {{ $t("not_found") }}
            </span>
          </template>
        </zm-col>
      </zm-row>
      <zm-row type="flex" class="row-bg" justify="space-around">
        <zm-col :span="6">
          {{ $t("last_conversation") }}
        </zm-col>
        <zm-col :span="18" class="last-activity-content">
          <template
            v-if="dealInfo.last_activity && dealInfo.last_activity.meeting_id"
          >
            <router-link
              :to="{
                name: 'recording-detail',
                query: {
                  meetingId: dealInfo.last_activity.meeting_id,
                },
              }"
            >
              <span>
                {{ dealInfo.last_activity.topic }}
              </span>
            </router-link>
            <zm-icon
              name="video-on"
              size="mini"
              class="mgl-sm video-on-icon"
            />
            <span class="duration mgl-sm">
              {{ dealInfo.last_activity.duration + $t("minute") }}
            </span>
          </template>
          <template v-else>
            <span class="gray">
              {{ $t("not_found") }}
            </span>
          </template>
        </zm-col>
      </zm-row>
      <zm-row
        v-if="
          dealInfo.last_activity && dealInfo.last_activity.next_steps.length
        "
        type="flex"
        class="row-bg"
        justify="space-around"
      >
        <zm-col :span="6">
          {{ $t("analytics.next_steps") }}
        </zm-col>
        <zm-col :span="18">
          <ul ref="next-step-list" class="next-step-list">
            <li
              v-for="(item, index) in dealInfo.last_activity.next_steps"
              :key="index + String(item.item_id)"
            >
              {{ index + 1 }}.
              {{ item.rephrased_text || item.text }}
            </li>
          </ul>
          <router-link
            v-show="isViewMore"
            class="view-more"
            :to="{
              name: 'recording-detail',
              query: {
                meetingId: dealInfo.last_activity.meeting_id,
              },
            }"
          >
            {{ $t("common.view_more") }}
          </router-link>
        </zm-col>
      </zm-row>
    </div>
    <div v-else class="meeting-info meeting-info-short content-tip">
      <div>
        <p>{{ $t("recording.no_deal_info_tip") }}</p>
        <p style="text-align: center">
          <zm-button
            v-show="hasDealEditPermission"
            type="link"
            @click="openImportDealDialog"
          >
            {{ $t("common.btn_update") }}
          </zm-button>
        </p>
      </div>
    </div>
  </div>
</div>
</template>
    <script lang="ts">
import { isEmpty } from "lodash-es";
import { defineComponent, ref, computed, watch, nextTick } from "vue";

export default defineComponent({
  name: "UpcomingDealInfo",
  props: {
    meeting: {
      type: Object as () => Record<string, any>,
      required: true,
    },
    dealInfo: {
      type: Object as () => Record<string, any>,
      default: () => ({}),
    },
    loadingDeal: {
      type: Boolean,
      default: false,
    },
    meetingIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const isViewMore = ref(false);

    const hasDealViewPermission = computed(() => {
      const { read_status, isHost } = props.meeting;
      return read_status || isHost;
    });

    const hasDealEditPermission = computed(() => {
      const { isHost, edit_status } = props.meeting;
      return edit_status || isHost;
    });

    const meetingDealAccountName = computed(() => {
      if (isExistCurrentMeetingDealLead.value) {
        return props.dealInfo?.lead?.company;
      }
      return (
        props.dealInfo?.deal?.customer_accounts
          ?.map((item) => item?.customer_crm_account_name)
          ?.join(",") || props.dealInfo.deal?.customer_crm_account_name
      );
    });

    const isExistCurrentMeetingDealLead = computed(() => {
      return !isEmpty(props.dealInfo[props.meetingIndex]?.lead);
    });

    const getMeetingDealInfo = computed(() => {
      const { deal, lead } = props.dealInfo || {};
      return deal || lead || {};
    });

    const getMeetingDealAccountExist = computed(() => {
      const { deal, lead } = props.dealInfo || {};
      return deal?.customer_accounts?.length || deal?.id || lead;
    });

    watch(
      () => props.dealInfo,
      () => {
        nextTick(() => {
          const nextStepList = (this.$refs["next-step-list"] as HTMLElement);
          if (nextStepList) {
            isViewMore.value =
              nextStepList.scrollHeight > nextStepList.offsetHeight &&
              props.dealInfo.last_activity.next_steps.length > 2;
          }
        });
      },
      { immediate: true, deep: true }
    );

    const openImportDealDialog = () => {
      emit("import-deal");
    };

    return {
      isViewMore,
      hasDealViewPermission,
      hasDealEditPermission,
      meetingDealAccountName,
      isExistCurrentMeetingDealLead,
      getMeetingDealInfo,
      getMeetingDealAccountExist,
      openImportDealDialog,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
@import "~shared/sass/variable.scss";
.meeting-info.meeting-info-short {
  height: 126px;
}
.meeting-info {
  background: #f7f9fa;
  height: 208px;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 0 8px 0;
  line-height: 20px;
  .row-bg {
    margin-bottom: 16px;

    label {
      color: #444b53;
    }
    .deal-stage {
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      background: #f7f9fa;
      border: 1px solid #dfe3e8;
      margin-left: 4px;
      padding: 0 6px;
      border-radius: 3px 6px;
    }
    .edit-button {
      color: rgba(4, 4, 19, 0.56);
      font-size: $--font-size-small;
      border: none;
      display: inline-block;
      vertical-align: middle;
      padding: 0;
      width: 16px;
      height: 16px;
      &:focus,
      :active,
      :hover {
        color: $--color-primary;
      }
    }
    .last-activity-content {
      display: flex;
      .video-on-icon {
        width: 16px;
        height: 16px;
        margin-top: 2px;
      }
    }
    .next-step-list {
      overflow: hidden;
      max-height: 60px;
      line-height: 20px;
    }
  }
}

.content-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #444b53;
}

      </style>