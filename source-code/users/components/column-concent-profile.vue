<template>
<zm-table-column :label="$t('l_consent_profile')" min-width="150">
  <template #default="{ row }">
    <inline-editor-plain
      :editable="hasPermission"
      @request-edit="handleReassign(row)"
    >
      {{ displayName(row) }}
    </inline-editor-plain>
  </template>
</zm-table-column>
</template>
    <script lang="ts">
import { defineComponent, ref } from "vue";
import InlineEditorPlain from "./inline-editor-plain.vue";
import { openReassignDialog } from "./consent-profile-utils";

export default defineComponent({
  components: { InlineEditorPlain },
  props: {
    hasPermission: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const displayName = (row: any) => {
      return row.consent_profile?.consent_name || "-";
    };

    const handleReassign = async (userInfo: any) => {
      try {
        await openReassignDialog({
          originConsentProfileId: userInfo.consent_profile?.id,
          userId: userInfo.user_id,
        });
        emit("user-changed-something");
      } catch (e: any) {
        if (e.message === "cancel") {
          return;
        }
        // Assuming `this.$message` is a global method or you have a way to access it
        // You might need to import or inject it depending on your setup
        // For example, if using Element Plus, you might use ElMessage
        // ElMessage({
        //   message: e.message,
        //   type: "error",
        // });
      }
    };

    return {
      displayName,
      handleReassign,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
        
        
::v-deep .inline-editor-plain-inner {
  word-break: break-word;
}

      
      
      </style>