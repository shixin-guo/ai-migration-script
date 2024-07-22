<template>
<div v-if="!currentUser.has_collaborator_role">
  <dashboard-new />
</div>
</template>
    <script lang="ts">
import { mapState } from "vuex";
import { defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import DashboardNew from "@views/dashboard/dashboard-new";

export default defineComponent({
  name: "DashboardPage",
  components: { DashboardNew },
  setup() {
    const router = useRouter();
    const currentUser = computed(() => mapState(["currentUser"]).currentUser);

    return {
      currentUser,
      router,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.currentUser.has_collaborator_role) {
        vm.router.push({ path: "/conversations/all" });
        return;
      }
    });
  },
});
</script>
    