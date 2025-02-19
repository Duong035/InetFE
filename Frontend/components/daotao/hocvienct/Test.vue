<script setup>
import { nextTick } from "vue";
const listChecked = defineModel("listChecked");
const shift = ref([
  {
    id: 1,
    name: "Sáng",
    start: null,
    end: null,
    session: [
      { value: "monday", checked: false },
      { value: "tuesday", checked: false },
      { value: "wednesday", checked: false },
      { value: "thursday", checked: false },
      { value: "friday", checked: false },
      { value: "saturday", checked: false },
      { value: "sunday", checked: false },
    ],
  },
  {
    id: 2,
    name: "Chiều",
    start: null,
    end: null,
    session: [
      { value: "monday", checked: false },
      { value: "tuesday", checked: false },
      { value: "wednesday", checked: false },
      { value: "thursday", checked: false },
      { value: "friday", checked: false },
      { value: "saturday", checked: false },
      { value: "sunday", checked: false },
    ],
  },
  {
    id: 3,
    name: "Tối",
    start: null,
    end: null,
    session: [
      { value: "monday", checked: false },
      { value: "tuesday", checked: false },
      { value: "wednesday", checked: false },
      { value: "thursday", checked: false },
      { value: "friday", checked: false },
      { value: "saturday", checked: false },
      { value: "sunday", checked: false },
    ],
  },
]);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const dayjs = useDayjs();

const daysOfWeek = ref(createDaysOfWeek());

watch(
  () => shift.value,
  (newValue, oldValue) => {
    resetChecked();
    handleCheck();
  },
);

onMounted(() => {});

function handleCheck() {
  daysOfWeek.value?.forEach((day) => {
    day.checked = shift.value?.every((s) =>
      s.session
        ?.filter((ss) => ss?.value === day?.value)
        ?.every((ss) => ss.checked),
    );
  });
}

function resetChecked() {
  listChecked.value = [];
  daysOfWeek.value.forEach((val) => (val.checked = false));
}

const handleCheckedDay = (day, checked) => {
  console.log(listChecked);
  shift.value.forEach((s) => {
    const dayElement = s.session.find((element) => element.value === day);
    if (dayElement) {
      dayElement.checked = checked;
    }
  });

  const found = daysOfWeek.value.find((e) => e.value === day);
  if (found) {
    found.checked = checked;
  }

  if (checked) {
    if (!listChecked.value[day]) listChecked.value[day] = [];
    listChecked.value[day] = shift.value.map((s) => s.id);
  } else {
    listChecked.value[day] = [];
  }
};

const handleCheckedValue = (day, checked, id) => {
  const found = daysOfWeek.value.find((e) => e.value === day);
  if (!found) return;
  if (checked) {
    if (!listChecked.value[day]) listChecked.value[day] = [];
    if (!listChecked.value[day].includes(id)) {
      listChecked.value[day].push(id);
    }
    if (listChecked.value[day].length === shift.value.length) {
      found.checked = true;
    }
  } else {
    listChecked.value[day] = listChecked.value[day].filter((e) => e !== id);
    if (found.checked) {
      found.checked = false;
    }
  }
};

const isMinuteStartDisabled = (index, minute, selectedHour) => {
  if (!selectedHour) return false;
  const end = dayjs(shift.value[index]?.end);
  const startTime = dayjs(shift.value[index]?.start_time);
  const endTime = dayjs(shift.value[index]?.end_time);
  const selectedHourNum = Number(selectedHour);
  const minuteNum = Number(minute);
  if (
    end.isValid() &&
    startTime.isValid() &&
    selectedHourNum === end.hour() &&
    selectedHourNum === startTime.hour()
  ) {
    return !(minuteNum >= startTime.minute() && minuteNum <= end.minute());
  }
  if (selectedHourNum === startTime.hour()) {
    return minuteNum < startTime.minute();
  }
  if (selectedHourNum === end.hour()) {
    return minuteNum > end.minute();
  }
  if (selectedHourNum === endTime.hour()) {
    return minuteNum > endTime.minute();
  }
  return false;
};

const isHourStartDisabled = (index, hour) => {
  return (
    Number(dayjs(shift.value[index]?.end_time).format("HH")) < Number(hour) ||
    Number(dayjs(shift.value[index]?.end).format("HH")) < Number(hour) ||
    Number(dayjs(shift.value[index]?.start_time).format("HH")) > Number(hour)
  );
};

const isMinuteEndDisabled = (index, minute, selectedHour) => {
  if (!selectedHour) return false;
  const start = dayjs(shift.value[index]?.start);
  const startTime = dayjs(shift.value[index]?.start_time);
  const endTime = dayjs(shift.value[index]?.end_time);
  const selectedHourNum = Number(selectedHour);
  const minuteNum = Number(minute);
  if (
    start.isValid() &&
    endTime.isValid() &&
    selectedHourNum === start.hour() &&
    selectedHourNum === endTime.hour()
  ) {
    return !(minuteNum >= start.minute() && minuteNum <= endTime.minute());
  }
  if (selectedHourNum === endTime.hour()) {
    return minuteNum > endTime.minute();
  }
  if (selectedHourNum === start.hour()) {
    return minuteNum < start.minute();
  }
  if (selectedHourNum === startTime.hour()) {
    return minuteNum < startTime.minute();
  }
  return false;
};

const isHourEndDisabled = (index, hour) => {
  return (
    Number(dayjs(shift.value[index]?.start_time).format("HH")) > Number(hour) ||
    Number(dayjs(shift.value[index]?.start).format("HH")) > Number(hour) ||
    Number(dayjs(shift.value[index]?.end_time).format("HH")) < Number(hour)
  );
};

const optionsHour = (index) => {
  const startTime = dayjs(shift.value[index]?.start_time).hour();
  const endTime = dayjs(shift.value[index]?.end_time).hour();
  return Array.from(
    { length: endTime - startTime + 1 },
    (_, i) => startTime + i,
  );
};
</script>

<template>
  <n-grid :cols="11" :y-gap="16" class="text-primary">
    <n-gi :span="4" class="font-500 mr-8 text-primary">Lịch trống:</n-gi>
    <n-gi v-for="day in daysOfWeek" :key="day.value">
      <n-checkbox
        :disabled="day.disabled || disabled"
        @update:checked="(checked) => handleCheckedDay(day.value, checked)"
        v-model:checked="day.checked"
        :label="day.label"
        class="custom-checkbox-no-disabled !text-primary"
      />
    </n-gi>

    <!-- Show this if shift is empty -->
    <template v-if="shift.length === 0">
      <n-gi :span="4" class="mr-3">
        <n-flex align="center" :wrap="false" justify="space-between">
          <n-ellipsis
            :tooltip="{
              contentClass: 'text-primary bg-white p-2 rd-2',
              raw: true,
              arrowClass: '!bg-white',
            }"
            :line-clamp="2"
          >
            No Shifts Available
          </n-ellipsis>
        </n-flex>
      </n-gi>
    </template>

    <!-- Your existing loop for shift items -->
    <template v-for="(s, idx) in shift" :key="s">
      <n-gi :span="4" class="mr-3">
        <n-flex align="center" :wrap="false" justify="space-between">
          <n-ellipsis
            :tooltip="{
              contentClass: 'text-primary bg-white p-2 rd-2',
              raw: true,
              arrowClass: '!bg-white',
            }"
            :line-clamp="2"
            >{{ s.name + ":" }}
            <template #tooltip> {{ s.name }} </template>
          </n-ellipsis>
          <n-input-group class="rounded-15px mr-3 w-fit shrink-0 bg-white">
            <n-time-picker
              :disabled="!s?.session?.some((ss) => ss.checked) || disabled"
              class="custom-time-picker-left custom-time-picker-w"
              v-model:value="s.start"
              format="HH:mm"
              :is-hour-disabled="(hour) => isHourStartDisabled(idx, hour)"
              :is-minute-disabled="
                (minute, selectedHour) =>
                  isMinuteStartDisabled(idx, minute, selectedHour)
              "
              :hours="optionsHour(idx)"
            />
            <n-time-picker
              :disabled="!s?.session?.some((ss) => ss.checked) || disabled"
              class="custom-time-picker-right custom-time-picker-w"
              v-model:value="s.end"
              format="HH:mm"
              :is-hour-disabled="(hour) => isHourEndDisabled(idx, hour)"
              :is-minute-disabled="
                (minute, selectedHour) =>
                  isMinuteEndDisabled(idx, minute, selectedHour)
              "
              :hours="optionsHour(idx)"
            />
          </n-input-group>
        </n-flex>
      </n-gi>
      <n-gi v-for="day in s.session" :key="day.value" class="flex items-center">
        <n-checkbox
          :disabled="day.disabled || disabled"
          @update:checked="
            (checked) => handleCheckedValue(day.value, checked, s.id)
          "
          v-model:checked="day.checked"
          class="custom-checkbox-no-disabled"
        />
      </n-gi>
    </template>
  </n-grid>
</template>
