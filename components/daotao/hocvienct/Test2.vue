<script setup>
import { ref, computed, watch } from "vue";
const props = defineProps(["timeSlots", "shortShifts"]);
const emit = defineEmits(["update:timeSlots", "update:shortShifts"]);
const listChecked = ref([]);
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

// watch(
//   () => props.timeSlots,
//   (newTimeSlots) => {
//     shift.value.forEach((s, index) => {
//       if (newTimeSlots[index]) {
//         s.start = newTimeSlots[index].start_time;
//         s.end = newTimeSlots[index].end_time;
//       }
//     });
//   },
//   { deep: true, immediate: true },
// );

// watch(
//   shift,
//   (newShifts) => {
//     const updatedTimeSlots = newShifts.map((s) => ({
//       start_time: s.start,
//       end_time: s.end,
//     }));
//     emit("update:timeSlots", updatedTimeSlots);
//   },
//   { deep: true },
// );

// watch(
//   () => props.shortShifts,
//   (newShortShifts) => {
//     shift.value.forEach((s) => {
//       s.session.forEach((day) => {
//         day.checked = newShortShifts.some((shortShift) =>
//           shortShift.day_of_week.includes(day.value),
//         );
//       });
//     });
//   },
//   { deep: true, immediate: true },
// );

// Emit updates to Need.vue when checkboxes change
// const updateShortShifts = () => {
//   const updatedShortShifts = shift.value.map((s) => ({
//     day_of_week: s.session.filter((day) => day.checked).map((day) => day.value),
//   }));
//   emit("update:shortShifts", updatedShortShifts);
// };

// Handle checkboxes

function handleDayCheckboxChange(day, checked) {
  const isChecked = listChecked.value[day];
  console.log("Checkbox State for", day, ":", isChecked);
  shift.value.forEach((s) => {
    s.session.forEach((sessionDay) => {
      if (sessionDay.value === day) {
        sessionDay.checked = false;
      }
    });
  });
  // updateShortShifts();
  const found = daysOfWeek.value.find((e) => e.value === day);
  if (found) {
    found.checked = isChecked;
  }
  console.log(found);
  console.log(listChecked);
  if (checked) {
    if (!listChecked.value[day]) listChecked.value[day] = [];
    listChecked.value[day] = shift.value.map((s) => s.id);
  } else {
    listChecked.value[day] = [];
  }
}

const handleCheckedValue = (day, checked, id) => {
  const found = daysOfWeek.value.find((e) => e.value === day);
  console.log(found);
  if (checked) {
    if (!listChecked.value[day]) listChecked.value[day] = [];
    if (!listChecked.value[day].includes(id)) {
      listChecked.value[day].push(id);
    }
    //   if (listChecked.value[day].length === shift.value.length) {
    //     found.checked = true;
    //   }
    // } else {
    //   listChecked.value[day] = listChecked.value[day].filter((e) => e !== id);
    //   if (found.checked) {
    //     found.checked = false;
    //   }
  }
  console.log(listChecked);
};
</script>

<template>
  <n-grid :cols="11" :y-gap="16">
    <n-gi :span="11">
      <n-form-item
        label="Ngày mong muốn bắt đầu học:"
        label-placement="left"
        style="margin-bottom: -30px"
      >
        <n-date-picker type="date" placeholder="Chọn ngày" />
      </n-form-item>
    </n-gi>
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
          @update:checked="
            (checked) => handleCheckedValue(day.value, checked, s.id)
          "
        />
      </n-gi>
    </template>
  </n-grid>
</template>
