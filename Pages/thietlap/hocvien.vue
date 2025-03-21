<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const userRole = computed(() => userStore.userInfo?.role_id);
const permissionMapping = {
  "staff/list": ["staff/list/permissions", "staff/setting/permissions"],
};
onMounted(() => {
  console.log(permissionMapping);
});
</script>
<template>
  <div>
    <p v-if="userRole === ROLE_ID.STUDENT">A</p>
    <p v-else>B</p>
    <p>C</p>
  </div>
</template>
