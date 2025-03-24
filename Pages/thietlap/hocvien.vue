<script setup>
// import { onMounted } from "vue";
// import { useUserStore } from "@/stores/userStore";
// const userStore = useUserStore();
// const userRole = computed(() => userStore.userInfo?.role_id);
// const permissionMapping = {
//   "staff/list": ["staff/list/permissions", "staff/setting/permissions"],
// };
// onMounted(() => {
//   console.log(permissionMapping);
// });

import { ref, watch, computed } from "vue";

const exist = ref(4);
const massadd = ref(false);
const number = ref(1); // Number of input fields
const mainName = ref(""); // Separate name input (not part of formValue)
const formValue = ref([]);

// Initialize formValue with at least 1 item
const initializeForm = () => {
  formValue.value = Array.from({ length: number.value }, (_, index) => ({
    name: "",
    is_trial: false,
    index: exist.value + index + 1, // Start numbering from `exist + 1`
  }));
};

// Ensure `formValue` matches `number`
watch(number, (newVal, oldVal) => {
  if (newVal > oldVal) {
    for (let i = oldVal; i < newVal; i++) {
      formValue.value.push({
        name: "",
        is_trial: false,
        index: exist.value + i + 1, // Keep numbering in sync
      });
    }
  } else {
    formValue.value.length = newVal; // Trim if number decreases
  }
});

// Master checkbox logic
const masterChecked = computed({
  get: () => {
    const checkedCount = formValue.value.filter((item) => item.is_trial).length;
    if (checkedCount === 0) return false; // None checked
    if (checkedCount === formValue.value.length) return true; // All checked
    return null; // Some checked
  },
  set: (value) => {
    formValue.value.forEach((item) => {
      item.is_trial = value; // Set all child checkboxes to the master value
    });
  },
});

// Submit function
const handleSubmit = () => {
  console.log("Form Submitted:", formValue.value);
  alert(JSON.stringify(formValue.value, null, 2)); // Show form values in alert
};

// Initialize form on load
initializeForm();
</script>

<template>
  <div>
    <!-- Toggle Switch -->
    <n-switch v-model:value="massadd" />

    <!-- Conditional Display -->
    <div v-if="!massadd">A</div>
    <div v-else>
      <n-grid cols="2" :x-gap="20" :y-gap="10">
        <!-- Number Input -->
        <n-gi>
          <n-input-number
            v-model:value="number"
            clearable
            :min="1"
            :max="10"
            placeholder="Enter number"
          />
        </n-gi>

        <!-- Separate Name Input (Not in formValue) -->
        <n-gi>
          <n-input v-model:value="mainName" placeholder="Enter main name" />
        </n-gi>

        <!-- Master Checkbox Section -->
        <n-gi>
          <h1>Danh sách buổi học</h1>
        </n-gi>
        <n-gi>
          <n-checkbox
            v-model:checked="masterChecked"
            :indeterminate="masterChecked === null"
          >
            Chọn tất cả
          </n-checkbox>
        </n-gi>

        <!-- Dynamic Fields -->
        <n-gi v-for="(item, index) in formValue" :key="index" span="2">
          <n-grid cols="2" :x-gap="20">
            <n-gi>
              <!-- Dynamic Input Field -->
              <n-input
                v-model:value="item.name"
                :placeholder="
                  mainName ? `${mainName} ${item.index}` : `${item.index}`
                "
              />
            </n-gi>
            <n-gi>
              <!-- Child Checkbox -->
              <n-checkbox v-model:checked="item.is_trial" />
            </n-gi>
          </n-grid>
        </n-gi>
      </n-grid>

      <!-- Submit Button -->
      <div style="margin-top: 20px">
        <n-button type="primary" @click="handleSubmit">Submit</n-button>
      </div>
    </div>
  </div>
</template>
