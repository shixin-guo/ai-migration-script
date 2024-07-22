<template>
  <div>
    <zm-select
      v-model="selectedConsentProfile"
      remote
      filterable
      width-limit
      :loading="isSearching"
      :label="$t('l_assign_consent_profile')"
      :no-data-text="noDataText"
    >
      <zm-option
        v-for="result in selectOptions"
        :key="result.id"
        :label="result.name"
        :value="result.id"
        :disabled="result.id === originConsentProfileId"
      />
    </zm-select>

    <div class="dialog-footer">
      <zm-button
        type="primary"
        :disabled="!selectedConsentProfile"
        :loading="isSubmitting"
        @click="handleConfirm"
      >
        {{ $t("common.add") }}
      </zm-button>
      <zm-button @click="handleCancel">
        {{ $t("common.cancel") }}
      </zm-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const selectedConsentProfile = ref<string | null>(null);
    const isSearching = ref<boolean>(false);
    const isSubmitting = ref<boolean>(false);
    const selectOptions = ref<Array<{ id: string; name: string; }>>([]);
    const originConsentProfileId = ref<string>('');
    const noDataText = ref<string>('');

    const handleConfirm = () => {
      // handle confirm logic
    };

    const handleCancel = () => {
      // handle cancel logic
    };

    return {
      selectedConsentProfile,
      isSearching,
      isSubmitting,
      selectOptions,
      originConsentProfileId,
      noDataText,
      handleConfirm,
      handleCancel,
    };
  },
});
</script>
</template>
    <script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import {
  getConsentProfileSummaryList,
  consentProfileAssignees,
} from "@api/users";
import { cloneDeep } from "lodash-es";

let globalConsentProfileCache: any = null;
function getConsentProfileSummaryListWithCache() {
  if (globalConsentProfileCache) {
    return Promise.resolve(cloneDeep(globalConsentProfileCache));
  }
  return new Promise((resolve, reject) => {
    getConsentProfileSummaryList()
      .then((response) => {
        globalConsentProfileCache = response;
        resolve(cloneDeep(globalConsentProfileCache));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export default defineComponent({
  props: {
    originConsentProfileId: {
      type: String as PropType<string>,
      default: "",
    },
    userId: {
      type: String as PropType<string>,
      default: "",
    },
    targetType: {
      type: String as PropType<string>,
      default: "",
    },
  },
  setup(props, { emit }) {
    const isSearching = ref(false);
    const isSubmitting = ref(false);
    const selectOptions = ref<any[]>([]);
    const noDataText = ref("");
    const selectedConsentProfile = ref("");

    const getConsentProfileList = () => {
      isSearching.value = true;
      return getConsentProfileSummaryListWithCache()
        .then((response) => {
          selectOptions.value = response;
        })
        .catch((err) => {
          emit("message", {
            type: "error",
            message: err.message || err.errorMessage,
            duration: 2800,
          });
        })
        .finally(() => {
          isSearching.value = false;
        });
    };

    const handleConfirm = () => {
      isSubmitting.value = true;

      const selectedUserId = props.userId;
      return consentProfileAssignees({
        id: selectedConsentProfile.value,
        user_or_team: [
          {
            id: selectedUserId,
            type: props.targetType,
          },
        ],
      })
        .then(() => {
          emit("success");
          emit("apply-close");
        })
        .catch((err) => {
          emit("message", {
            type: "error",
            message: err.message || err.errorMessage,
            duration: 2800,
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    };

    const handleCancel = () => {
      emit("apply-close");
    };

    onMounted(() => {
      getConsentProfileList();
    });

    return {
      isSearching,
      isSubmitting,
      selectOptions,
      noDataText,
      selectedConsentProfile,
      getConsentProfileList,
      handleConfirm,
      handleCancel,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.zm-select {
  width: 100%;
}
.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

      </style>