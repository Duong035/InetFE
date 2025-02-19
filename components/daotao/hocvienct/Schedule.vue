<script setup>
import { ref, computed } from "vue";

const listChecked = ref({});
const shift = ref([
  {
    id: 1,
    name: "Sáng",
    start: "06:00", // Default start time for Sáng
    end: "12:00", // Default end time for Sáng
    session: [
      { value: 1, checked: false },
      { value: 2, checked: false },
      { value: 3, checked: false },
      { value: 4, checked: false },
      { value: 5, checked: false },
      { value: 6, checked: false },
      { value: 0, checked: false },
    ],
  },
  {
    id: 2,
    name: "Chiều",
    start: "12:00", // Default start time for Chiều
    end: "18:00", // Default end time for Chiều
    session: [
      { value: 1, checked: false },
      { value: 2, checked: false },
      { value: 3, checked: false },
      { value: 4, checked: false },
      { value: 5, checked: false },
      { value: 6, checked: false },
      { value: 0, checked: false },
    ],
  },
  {
    id: 3,
    name: "Tối",
    start: "18:00", // Default start time for Tối
    end: "23:59", // Default end time for Tối
    session: [
      { value: 1, checked: false },
      { value: 2, checked: false },
      { value: 3, checked: false },
      { value: 4, checked: false },
      { value: 5, checked: false },
      { value: 6, checked: false },
      { value: 0, checked: false },
    ],
  },
]);

const daysOfWeek = ref(createDaysOfWeek());

const disabledStartTime = computed(() => {
  return (shiftId) => {
    const selectedShift = shift.value.find((s) => s.id === shiftId);
    const startHour = parseInt(selectedShift.start.split(":")[0]);
    const startMinute = parseInt(selectedShift.start.split(":")[1]);
    return {
      disabledHours: () => {
        return Array.from({ length: startHour }, (_, index) => index);
      },

      disabledMinutes: (hour) => {
        if (hour === startHour) {
          return Array.from({ length: 60 }, (_, index) => index < startMinute);
        }
        return [];
      },
    };
  };
});

const disabledEndTime = computed(() => {
  return (shiftId) => {
    const selectedShift = shift.value.find((s) => s.id === shiftId);
    const endHour = parseInt(selectedShift.end.split(":")[0]);
    const endMinute = parseInt(selectedShift.end.split(":")[1]);
    // console.log(endHour);
    return {
      disabledHours: Array.from({ length: endHour + 1 }).map(
        (_, index) => index,
      ),
      disabledMinutes: (hour) => {
        if (hour === endHour) {
          return Array.from({ length: 60 }).map(
            (_, index) => index >= endMinute,
          );
        }
        return [];
      },
    };
  };
});

function handleDayCheckboxChange(day) {
  for (let s of this.shift) {
    for (let sessionDay of s.session) {
      if (sessionDay.value === day) {
        sessionDay.checked = false;
      }
    }
  }
}
</script>

<template>
  <n-grid :cols="11" :y-gap="16">
    <n-gi :span="4" class="font-500 mr-8 text-[#133D85]">Lịch trống:</n-gi>
    <n-gi v-for="day in daysOfWeek" :key="day.value">
      <n-checkbox
        :label="day.label"
        v-model:checked="listChecked[day.value]"
        @update:checked="handleDayCheckboxChange(day.value)"
      />
    </n-gi>
    <template v-for="s in shift" :key="s">
      <n-gi span="4">
        <n-flex align="center" :wrap="false" justify="space-between">
          <n-ellipsis
            :tooltip="{
              contentClass: 'text-[#133D85]  bg-white p-2 rd-2',
              raw: true,
              arrowClass: '!bg-white',
            }"
            :line-clamp="2"
            >{{ s.name + ":" }}
          </n-ellipsis>
          <n-input-group
            class="rounded-15px -ml-5 mr-3 w-fit shrink-0 bg-white"
          >
            <n-time-picker
              v-model="s.start"
              format="HH:mm"
              :disabled-hours="disabledStartTime(s.id).disabledHours"
              :disabled-minutes="disabledStartTime(s.id).disabledMinutes"
            />
            <n-time-picker
              v-model="s.end"
              format="HH:mm"
              :disabled-hours="disabledEndTime(s.id).disabledHours"
              :disabled-minutes="disabledEndTime(s.id).disabledMinutes"
            />
          </n-input-group>
        </n-flex>
      </n-gi>
      <n-gi v-for="day in s.session" :key="day.value" class="flex items-center">
        <n-checkbox
          v-model:checked="day.checked"
          class="custom-checkbox-no-disabled"
          :disabled="listChecked[day.value] !== true"
        />
      </n-gi>
    </template>
  </n-grid>
</template>
