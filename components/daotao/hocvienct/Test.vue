<script setup>
import { ref, computed, watch } from "vue";

const dayjs = useDayjs();
const listChecked = ref({});
const shift = ref([
  {
    id: 1,
    name: "Sáng",
    start: "6", // Default start time for Sáng
    end: "12", // Default end time for Sáng
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
    start: "12", // Default start time for Chiều
    end: "18", // Default end time for Chiều
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
    start: "18", // Default start time for Tối
    end: "23", // Default end time for Tối
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

const getStartHours = computed(() => {
  return shift.value.reduce((acc, s) => {
    acc[s.id] = Array.from(
      { length: Number(s.end) - Number(s.start) },
      (_, i) => Number(s.start) + i,
    );
    return acc;
  }, {});
});

const getEndHours = computed(() => {
  return shift.value.reduce((acc, s) => {
    acc[s.id] = Array.from(
      { length: Number(s.end) - Number(s.start) },
      (_, i) => Number(s.start) + i + 1,
    );
    return acc;
  }, {});
});

watch(
  shift,
  (newShifts) => {
    newShifts.forEach((s) => {
      if (Number(s.end) <= Number(s.start)) {
        s.end = Number(s.start) + 1; // Auto-adjust to enforce 1-hour gap
      }
    });
  },
  { deep: true },
);
const getDisabledMinutes = (selectedHour, shiftId, isEndPicker = false) => {
  const shiftData = shift.value.find((s) => s.id === shiftId);
  if (!shiftData) return [];

  const allMinutes = Array.from({ length: 60 }, (_, i) => i);
  const lastHour = isEndPicker
    ? Number(shiftData.end)
    : Number(shiftData.end) - 1;
  if (selectedHour === lastHour) {
    return allMinutes.filter((minute) => minute !== 0);
  }

  return [];
};

function handleDayCheckboxChange(day) {
  shift.value.forEach((s) => {
    s.session.forEach((sessionDay) => {
      if (sessionDay.value === day) {
        sessionDay.checked = false;
      }
    });
  });
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
              :hours="getStartHours[s.id] || []"
              :is-minute-disabled="
                (minute, hour) =>
                  getDisabledMinutes(hour, s.id, false).includes(minute)
              "
            />
            <n-time-picker
              v-model="s.end"
              format="HH:mm"
              :hours="getEndHours[s.id] || []"
              :is-minute-disabled="
                (minute, hour) =>
                  getDisabledMinutes(hour, s.id, true).includes(minute)
              "
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
