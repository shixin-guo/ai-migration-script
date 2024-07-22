<template>
<div
  class="list-complete-item"
  @click="
    handleCardClick(
      notification.biz_type,
      notification.biz_id,
      notification.meeting_id,
      notification.sender_name,
      notification.biz_name,
      notification.text,
      notification.id
    )
  "
>
  <div
    :style="{ ...(notification.read ? { visibility: 'hidden' } : {}) }"
    class="blue-dot mgr-sm"
  />
  <zm-avatar-customize
    v-if="notification.biz_type === 1 || notification.biz_type === 10"
    class="item-img"
    shape="square"
    :size="48"
    :generate-key="notification.sender_name || 'Ext'"
    :avatar-short-name="getDisplayInitials(notification.sender_name)"
    :src="notification.sender_pic_url"
  />
  <div
    v-else-if="
      notification.biz_type === BIZ_TYPE.VIRTUAL_COACHING ||
      notification.biz_type === 6
    "
    class="item-img item-icon"
    style="background-color: #f46670"
  >
    <zm-icon name="triangle" size="mini" class="coaching-icon" />
  </div>
  <div
    v-else-if="notification.biz_type === 7"
    class="item-img item-icon"
    style="background-color: #0e72ed"
  >
    <zm-icon
      :name="getConversationIcon(notification.text)"
      size="mini"
      class="coaching-icon"
    />
  </div>
  <div
    v-else-if="notification.biz_type === 11"
    class="item-img item-icon"
    style="background-color: #ffbf39"
  >
    <zm-icon class="coaching-icon" name="alert-triangle-fill" />
  </div>
  <div
    v-else-if="notification.biz_type === 12"
    class="item-img item-icon"
    style="background-color: #fff2d7"
  >
    <img src="@assets/new-report.svg" />
  </div>
  <div
    v-else-if="notification.biz_type === 13"
    class="item-img item-icon"
    style="background: #ff8422"
  >
    <zm-icon class="coaching-icon" name="analytics" />
  </div>
  <div
    v-else-if="
      notification.biz_type === 14 ||
      notification.biz_type === BIZ_TYPE.EMAIL_CERTIFICATE_EXPIRED
    "
    class="item-img item-icon"
    style="background-color: #6e7680"
  >
    <zm-icon class="coaching-icon" name="alert-circle-fill" />
  </div>
  <div
    v-else-if="notification.biz_type === 16"
    class="item-img item-icon"
    style="background-color: #4b9d64"
  >
    <zm-icon class="coaching-icon" size="mini"
      ><use href="#icon-auto-score" xlink:href="#icon-auto-score"
    /></zm-icon>
  </div>
  <div v-else-if="notification.biz_type === 8" class="item-img item-icon">
    <zm-icon name="folder" size="mini" class="coaching-icon" />
  </div>
  <i v-else class="item-img item-icon zm-icon-playlist-create" />
  <div class="item-content">
    <div class="item-content-title">
      <span
        :style="{
          ...(isFromDetail
            ? { 'font-size': '14px', 'line-height': '20px' }
            : {}),
        }"
        >{{
          getNotificationTitle(notification.biz_type, notification.text)
        }}</span
      >
      <span class="create-time"
        >{{ formatDistance(new Date(notification.create_time)) }}
        {{ $t("dashboard.ago") }}</span
      >
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="item-content-text"
      :style="{
        ...(isFromDetail
          ? { 'font-size': '14px', 'line-height': '20px' }
          : {}),
      }"
      v-html="
        getNotificationText(
          notification.biz_type,
          notification.sender_name,
          notification.biz_id,
          notification.biz_name,
          notification.text
        )
      "
    />
  </div>
  <div class="button-group">
    <zm-button
      :style="{ ...(notification.read ? { visibility: 'hidden' } : {}) }"
      size="mini"
      @click.stop="handleMarkReadClick"
      >{{ $t("mark_as_read") }}</zm-button
    >
    <zm-button
      size="mini"
      type="icon"
      icon="zm-icon-close"
      :disabled="viewMoreLoading"
      @click.stop="handleDelete(notification.id, notification.notify_type)"
    />
  </div>
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, toRefs } from "vue";
import { formatDistanceToNowStrict, getMonth, getYear } from "date-fns";
import {
  generateIndicatorUrl,
  generateReportName,
} from "@views/analytics/indicator/report/report";
import { BIZ_TYPE } from "shared/js/constant";
import { xss } from "shared/js/utils";
import locale from "date-fns/locale/en-US";
import { setNotificationRead } from "@api/dashboard-new";
import { RISK_SIGNAL_TYPE } from "@views/deals/deal-detail/utils/risk-signal";
import { openLink } from "@common/js/client";

const formatDistanceLocale = {
  lessThanXSeconds: "{{count}}s",
  xSeconds: "{{count}}s",
  halfAMinute: "30s",
  lessThanXMinutes: "{{count}}m",
  xMinutes: "{{count}}m",
  aboutXHours: "{{count}}h",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}w",
  xWeeks: "{{count}}w",
  aboutXMonths: "{{count}}m",
  xMonths: "{{count}}m",
  aboutXYears: "{{count}}y",
  xYears: "{{count}}y",
  overXYears: "{{count}}y",
  almostXYears: "{{count}}y",
};

function formatDistance(token: string, count: number): string {
  const result = formatDistanceLocale[token].replace("{{count}}", count.toString());
  return result;
}

export default defineComponent({
  name: "NotificationCard",
  props: {
    notification: {
      type: Object,
      default: () => ({}),
    },
    viewMoreLoading: {
      type: Boolean,
      default: false,
    },
    isFromDetail: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { notification, viewMoreLoading, isFromDetail } = toRefs(props);
    const BIZ_TYPE_REF = ref(BIZ_TYPE);

    const handleMarkReadClick = () => {
      if (notification.value) {
        notification.value.read = true;
        setNotificationRead({ notify_id: notification.value.id, change_type: 0 })
          .then(() => {
            emit("read-change");
          })
          .catch((e) => emit("error", e.errorMessage));
      }
    };

    const formatDistanceFn = (date: Date) => {
      return formatDistanceToNowStrict(date, {
        addSuffix: true,
        locale: {
          ...locale,
          formatDistance,
        },
      });
    };

    const getNotificationTitle = (type: number, text: string) => {
      const biz_data = type === 13 ? JSON.parse(text) : {};
      if (type === 1) {
        return "dashboard.new_comment";
      } else if (type === 2 || type === 3 || type === 5 || type === 15) {
        return "dashboard.playlist_updates";
      } else if (type === BIZ_TYPE.VIRTUAL_COACHING) {
        return "virtual_coach_updates";
      } else if (type === 6) {
        return "coaching.page_title";
      } else if (type === 7) {
        return "dashboard.new_conversation";
      } else if (type === 8) {
        return "dashboard.folder_updates";
      } else if (type === 10) {
        return "recording.playlist_permission_request";
      } else if (type === 11) {
        return "deal_risk_signal";
      } else if (type === 12) {
        return "new_report";
      } else if (type === 13) {
        if (biz_data.subscribeType === 1) {
          if (biz_data.indicatorType === 4) {
            return "new_theme_mentions";
          } else {
            return "new_keyword_mentions";
          }
        } else {
          if (biz_data.indicatorType === 4) {
            return "new_theme_indicator_mentions";
          } else {
            return "new_indicator_mentions";
          }
        }
      } else if (type === 14 || type === BIZ_TYPE.EMAIL_CERTIFICATE_EXPIRED) {
        return "attention";
      } else if (type === 16) {
        return "k_automated_scorecard";
      }
    };

    const getConversationIcon = (text: string) => {
      return JSON.parse(text)?.conversation_type === "meeting" ? "video-on" : "phone";
    };

    const getDisplayInitials = (name: string) => {
      return name?.[0]?.toUpperCase() || "Ext";
    };

    const getNotificationText = (
      biz_type: number,
      sender_name: string,
      biz_id: string,
      biz_name: string,
      text: string
    ) => {
      const biz_data =
        biz_type === 7 ||
        biz_type === 11 ||
        biz_type === 12 ||
        biz_type === 13 ||
        biz_type === 14
          ? JSON.parse(text)
          : {};
      if (biz_type === 1) {
        return `${xss(sender_name)}: ${xss(text)}`;
      } else if (biz_type === 2) {
        const playListCount = xss(text) || 1;
        const senderName = xss(sender_name);
        const playlistName = xss(biz_name);
        return "dashboard.user_add_conversations_to_the_playlist";
      } else if (biz_type === 3) {
        const playListCount = xss(text) || 1;
        const playlistName = xss(biz_name);
        return "dashboard.new_conversations_auto_added_to_the_playlist";
      } else if (biz_type === BIZ_TYPE.VIRTUAL_COACHING) {
        const scenarioName = xss(biz_name);
        return "dashboard.scenario_updated";
      } else if (biz_type === 5) {
        const username = xss(sender_name);
        const playlistOrFolder = xss(biz_name);
        return "dashboard.shared_playlist_with_you";
      } else if (biz_type === 6) {
        const username = xss(sender_name);
        const conversationTopic = xss(text);
        return "dashboard.submitted_a_scorecard";
      } else if (biz_type === 7) {
        const conversationTopic = xss(biz_data.subject);
        return "dashboard.new_conversation_is_available";
      } else if (biz_type === 8) {
        const username = xss(sender_name);
        const count = xss(text) || 1;
        const folderName = xss(biz_name);
        return "dashboard.user_added_playlists_to_the_folder";
      } else if (biz_type === 9) {
        const username = xss(sender_name);
        const playlistName = xss(biz_name);
        return "dashboard.user_has_modified_the_sharing_setting_of_your_playlist";
      } else if (biz_type === 10) {
        const username = xss(sender_name);
        const playlistName = xss(biz_name);
        return "recording.user_has_requested_to_modify_the_sharing_setting_for_playlist";
      } else if (biz_type === 11) {
        const text =
          RISK_SIGNAL_TYPE[biz_data.rule_type]?.genContentKeys(biz_data) || "";
        return `<span class="notification-link-name">${xss(
          biz_data.opportunity_name
        )}</span>: ${text}`;
      } else if (biz_type === 12) {
        const name = generateReportName(
          biz_data.indicator_name,
          biz_data.report_time
        );
        return "new_report_available";
      } else if (biz_type === 13) {
        if (biz_data.subscribeType === 1) {
          if (biz_data.indicatorType === 4) {
            return biz_data.themeDetailDtos?.length === 1
              ? "new_theme_mentions_tip"
              : "new_theme_indicator_mentions_tip";
          } else {
            return biz_data.texts?.length === 1
              ? "new_keyword_mentions_tip"
              : "new_indicator_mentions_tip";
          }
        } else {
          if (biz_data.indicatorType === 4) {
            return "new_theme_indicator_mentions_tip";
          } else {
            return "new_indicator_mentions_tip";
          }
        }
      } else if (biz_type === 14) {
        const fields = biz_data.fields || [];
        const firstField = xss(fields[0]) || "";
        if (fields.length === 1) {
          return "system_error_tip1";
        } else {
          const moreCount = fields.length - 1;
          return "system_error_tip2";
        }
      } else if (biz_type === 15) {
        return "private_playlist_notification";
      } else if (biz_type === 16) {
        const scorecardName = xss(biz_name || "");
        const conversationTopic = xss(text || "");
        return "k_auto_score_notification";
      } else if (biz_type === BIZ_TYPE.EMAIL_CERTIFICATE_EXPIRED) {
        return "your_email_integration_expired_setting";
      }
    };

    const handleCardClick = (
      biz_type: number,
      biz_id: string,
      meeting_id: string,
      sender_name: string,
      biz_name: string,
      text: string,
      id: string
    ) => {
      if (!notification.value?.read) handleMarkReadClick();
      const biz_data =
        biz_type === 7 ||
        biz_type === 11 ||
        biz_type === 12 ||
        biz_type === 13 ||
        biz_type === 14
          ? JSON.parse(text)
          : {};

      if (biz_type === 1) {
        emit("navigate", {
          name: "recording-detail",
          query: {
            meetingId: meeting_id,
            tab: "comment",
          },
        });
      } else if (
        biz_type === 2 ||
        biz_type === 3 ||
        biz_type === 5 ||
        biz_type === 9
      ) {
        emit("navigate", {
          name: "playlist-detail",
          params: {
            id: biz_id,
          },
        });
      } else if (biz_type === 6 || biz_type === 7 || biz_type === 16) {
        emit("navigate", {
          name: "recording-detail",
          query: {
            meetingId: meeting_id,
          },
        });
      } else if (biz_type === 8) {
        emit("navigate", {
          name: "folder-detail",
          params: {
            id: biz_id,
          },
        });
      } else if (biz_type === 10) {
        emit("align-click", biz_id, sender_name, biz_name);
      } else if (biz_type === 11) {
        emit("navigate", {
          name: "deal-detail",
          params: { id: biz_data.opportunity_id },
          query: {
            activeTab: "riskSignals",
          },
        });
      } else if (biz_type === 12) {
        const year = getYear(new Date(biz_data.report_time));
        const month = getMonth(new Date(biz_data.report_time)) + 1;
        const tab = generateIndicatorUrl({
          indicator_id: biz_data.indicator_id,
          topic_discovery_config_id: biz_data.topic_discovery_config_id,
          date_str: `${year}${month < 10 ? 0 + month : month}`,
        });
        emit("navigate", {
          name: "indicator",
          query: {
            tab,
          },
        });
      } else if (biz_type === BIZ_TYPE.VIRTUAL_COACHING) {
        const searchText = xss(biz_name);
        emit("navigate", {
          name: "vc2-scenarios",
          params: { refresh: true, searchText },
        });
      } else if (biz_type === 13) {
        emit("navigate", {
          name: "indicator-mentioned",
          params: { id: biz_data.indicatorId },
          query: { notifyId: id },
        });
      } else if (biz_type === 14) {
        const link = biz_data.link || "";
        openLink(link);
      } else if (biz_type === BIZ_TYPE.EMAIL_CERTIFICATE_EXPIRED) {
        openLink("/profile/setting?tab=iq#kiwiMailIntegration");
      }
    };

    const handleDelete = (id: string, notify_type: number) => {
      emit("delete-one", id, notify_type);
    };

    return {
      BIZ_TYPE_REF,
      handleMarkReadClick,
      formatDistanceFn,
      getNotificationTitle,
      getConversationIcon,
      getDisplayInitials,
      getNotificationText,
      handleCardClick,
      handleDelete,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.list-complete-item {
  position: relative;
  padding: 8px 8px 8px 0;
  margin: 0 4px 16px 0;
  display: flex;
  align-items: center;
  border-radius: 8px;

  &:hover {
    cursor: pointer;
    background-color: #f1f4f6;
    .create-time {
      display: none;
    }
    .button-group {
      display: inline-flex;
    }
  }
  &.disable-click {
    cursor: default;
  }
  .create-time {
    font-size: 12px;
  }
  .blue-dot {
    border-radius: 50%;
    height: 8px;
    width: 8px;
    background: #0e72ed;
  }
  .button-group {
    display: none;
    z-index: 5;
    overflow: hidden;
    position: absolute;
    right: 8px;
    top: 8px;
  }
  .item-img {
    height: 48px;
    width: 48px;
    border-radius: 8px;
    flex-shrink: 0;
    margin-right: 8px;
  }
  .item-icon {
    color: #f7f9fa;
    background-color: #14bca0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    .coaching-icon {
      width: 16px;
      height: 16px;
      color: #f7f9fa;
    }
  }
  .item-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    &-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      color: #6e7680;
      span {
        white-space: nowrap;
        line-height: 16px;
        font-size: 12px;
      }
    }
    &-text {
      flex: 1;
      word-break: break-word;
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-height: 16px;
      font-size: 12px;
    }
  }
}

      </style>