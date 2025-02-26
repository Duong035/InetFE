<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
const props = defineProps(["timeSlots", "shortShifts"]);
const emit = defineEmits(["update:timeSlots", "update:shortShifts"]);
const listChecked = ref([]);
const listCheckedShifts = ref([]);

const shift = ref([
  {
    id: 0,
    name: "Sáng",
    start: "6",
    end: "12",
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
    id: 1,
    name: "Chiều",
    start: "12",
    end: "18",
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
    name: "Tối",
    start: "18",
    end: "23",
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

const handleCheckedDay = (day, checked) => {
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
  listChecked.value[day] = checked;
  if (checked) {
    listCheckedShifts.value[day] = shift.value.map((s) => s.id);
  } else {
    listCheckedShifts.value[day] = [];
  }
};

const handleCheckedValue = (day, checked, id) => {
  if (!Array.isArray(listCheckedShifts.value[day])) {
    listCheckedShifts.value[day] = [];
  }

  if (checked) {
    if (!listCheckedShifts.value[day].includes(id)) {
      listCheckedShifts.value[day].push(id);
    }
  } else {
    listCheckedShifts.value[day] = listCheckedShifts.value[day].filter(
      (e) => e !== id,
    );

    if (listCheckedShifts.value[day].length === 0) {
      delete listCheckedShifts.value[day];
    }
  }

  const found = daysOfWeek.value.find((e) => e.value === day);
  if (found) {
    found.checked = listCheckedShifts.value[day]?.length === shift.value.length;
  }
};

const selectedTimes = ref(
  shift.value.map(() => ({
    start: null,
    end: null,
  })),
);

const updateSelectedTime = (index, type, value) => {
  if (!selectedTimes.value[index]) return;
  selectedTimes.value[index][type] = value ? formatTime(value) : "Invalid Date";
};

const formatTime = (time) => {
  if (!time) return null;
  return dayjs(time).format("DD-MM-YYYYTHH:mm:ss");
};

const handleSubmit = async (e) => {
  console.log(listCheckedShifts.value);
  console.log(selectedTimes);
  console.log("Time Slots:", props.timeSlots);
};
</script>

<template>
  <n-grid :cols="11" :y-gap="16">
    <n-gi :span="7">
      <n-form-item
        label="Ngày mong muốn bắt đầu học:"
        label-placement="left"
        style="margin-bottom: -30px"
      >
        <n-date-picker type="date" placeholder="Chọn ngày" />
      </n-form-item>
    </n-gi>
    <n-gi :span="4">
      <n-button
        round
        type="info"
        class="h-12 w-52 rounded-2xl text-lg"
        @click.prevent="handleSubmit"
      >
        Lưu
      </n-button>
    </n-gi>
    <n-gi :span="4" class="font-500 mr-8 text-[#133D85]">Lịch trống:</n-gi>
    <n-gi v-for="day in daysOfWeek" :key="day.value">
      <n-checkbox
        :label="day.label"
        v-model:checked="listChecked[day.value]"
        @update:checked="(checked) => handleCheckedDay(day.value, checked)"
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
              @update:value="(val) => updateSelectedTime(s.id, 'start', val)"
            />
            <n-time-picker
              v-model="s.end"
              format="HH:mm"
              :hours="getEndHours[s.id] || []"
              :is-minute-disabled="
                (minute, hour) =>
                  getDisabledMinutes(hour, s.id, true).includes(minute)
              "
              @update:value="(val) => updateSelectedTime(s.id, 'end', val)"
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
