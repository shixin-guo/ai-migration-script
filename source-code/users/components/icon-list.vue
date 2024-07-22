<template>
  <div class="icon-list">
    <zm-tooltip
      :content="
        isActivity ? $t('user.meetings') : $t('user.meeting_auto_record')
      "
      placement="top"
      :visible-arrow="false"
      offset="0,-10"
      popper-class="icon-tooltip"
    >
      <zm-icon
        class="icon mgr-sm"
        :class="meeting ? 'blue-color' : ''"
        name="video-on-fill"
      />
    </zm-tooltip>
    <zm-tooltip
      v-if="phone.isExist"
      :content="isActivity ? $t('user.phone') : $t('user.phone_auto_record')"
      placement="top"
      :visible-arrow="showRightTooltip"
      :offset="showRightTooltip ? undefined : '0,-10'"
      :popper-class="showRightTooltip ? '' : 'icon-tooltip'"
    >
      <template v-if="showRightTooltip" #content>
        <div class="right-tooltip">
          <div style="margin-bottom: 12px">
            {{ $t("automatic_call_recording_is_disabled_and_locked") }}
          </div>
          <div v-html="$t('view_and_manage_policy')" />
        </div>
      </template>
      <zm-icon
        class="icon mgr-sm"
        :class="phone.isEnabled ? 'blue-color' : ''"
        name="phone-fill"
      />
    </zm-tooltip>
    <template v-if="isActivity">
      <zm-tooltip
        :content="calendarTooltipContent"
        placement="top"
        :visible-arrow="false"
        offset="0,-10"
        popper-class="icon-tooltip"
      >
        <zm-icon
          class="icon calendar mgr-sm"
          :class="calendar ? 'blue-color' : ''"
          name="calendar-fill"
        />
      </zm-tooltip>
      <zm-tooltip
        :content="$t('user.email_integration')"
        placement="top"
        :visible-arrow="false"
        offset="0,-10"
        popper-class="icon-tooltip"
      >
        <zm-icon
          class="icon"
          :class="email ? 'blue-color' : ''"
          name="email-fill"
        />
      </zm-tooltip>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isActivity: Boolean,
    meeting: Boolean,
    phone: Object,
    calendar: Boolean,
    email: Boolean,
    showRightTooltip: Boolean,
    calendarTooltipContent: String
  }
});
</script>
</template>
    <script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: "IconList",
  props: {
    isActivity: {
      type: Boolean,
      default: true,
    },
    meeting: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Object as PropType<{ isEnabled: boolean }>,
      default: () => ({}),
    },
    calendar: {
      type: Boolean,
      default: false,
    },
    email: {
      type: Boolean,
      default: false,
    },
    calendarSync: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const calendarTooltipContent = computed(() => {
      return props.calendar
        ? props.calendarSync
          ? t("user.calendar_integration_on")
          : t("user.calendar_integration_off")
        : t("user.calendar_integration_off");
    });

    const showRightTooltip = computed(() => {
      return !props.isActivity && !props.phone.isEnabled;
    });

    return {
      calendarTooltipContent,
      showRightTooltip,
    };
  },
});
</script>
    <style lang="scss" >
        
        
.icon-list {
  display: flex;
  .icon {
    width: 16px;
    height: 16px;
    color: #6e7680;
  }
  .blue-color {
    color: #0e72ed;
  }
}
.icon-tooltip.zm-tooltip__popper {
  line-height: 16px;
  height: 16px;
  border-radius: 1px;
  padding: 0 2px;
  font-size: 12px;
  color: #222230 !important;
  border: 0.5px solid #dfe3e8 !important;
  box-shadow: 0 4px 8px rgba(19, 22, 25, 0.1), 0 2px 4px rgba(19, 22, 25, 0.1) !important;
}
.right-tooltip {
  color: #131619;
  line-height: 20px;
  width: 228px;
}

      
      </style>