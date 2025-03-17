<script setup>
import { ref, computed, watch, onMounted, watchEffect } from "vue";
import dayjs from "dayjs";

const formValue = reactive({
  user_id: computed(() => route.query.id || null),
  is_online: false,
  is_offline: false,
  notes: null,
  start_date: null,
  end_date: null,
  time_slots: [
    {
      work_session_id: null,
      start_time: null,
      end_time: null,
    },
  ],
  user_shifts: [
    {
      work_session_id: null,
      day_of_week: 2,
    },
  ],
});
const { restAPI } = useApi();
const listChecked = ref([]);
const listCheckedShifts = ref([]);
const selectedTimes = ref({});
const daysOfWeek = ref(createDaysOfWeek());

const shifts = ref([]);
const shift = ref([
  {
    id: 0,
    name: "Sáng",
    start: "6",
    end: "12",
    start_time: "",
    end_time: "",
    work_session_id: "",
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
    start_time: "",
    end_time: "",
    work_session_id: "",
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
    start_time: "",
    end_time: "",
    work_session_id: "",
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

//Timepicker_format____________________________________________________________________
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
    const startTimeRaw = selectedTimes.value[s.id]?.start;

    if (!startTimeRaw) {
      acc[s.id] = Array.from(
        { length: Number(s.end) - Number(s.start) },
        (_, i) => Number(s.start) + i + 1,
      );
      return acc;
    }

    const reformattedTime =
      typeof startTimeRaw === "string"
        ? startTimeRaw.replace(/(\d{2})-(\d{2})-(\d{4})T/, "$3-$2-$1T")
        : null;

    if (!reformattedTime) {
      acc[s.id] = [];
      return acc;
    }

    const selectedStartTime = dayjs(reformattedTime);

    if (!selectedStartTime.isValid()) {
      acc[s.id] = Array.from(
        { length: Number(s.end) - Number(s.start) },
        (_, i) => Number(s.start) + i + 1,
      );
    } else {
      const minEndHour = selectedStartTime.hour() + 1;
      const maxEndHour = Number(s.end);

      acc[s.id] =
        minEndHour > maxEndHour
          ? []
          : Array.from(
              { length: Math.max(1, maxEndHour - minEndHour + 1) },
              (_, i) => minEndHour + i,
            );
    }

    return acc;
  }, {});
});

const getDisabledMinutes = (selectedHour, shiftId, isEndPicker = false) => {
  const shiftData = shift.value.find((s) => s.id === shiftId);
  if (!shiftData) return [];

  const allMinutes = Array.from({ length: 60 }, (_, i) => i);
  const lastHour = Number(shiftData.end);

  const startTimeRaw = selectedTimes.value[shiftId]?.start;
  const endTimeRaw = selectedTimes.value[shiftId]?.end;

  if (!startTimeRaw && !endTimeRaw) return [];

  const parseTime = (time) =>
    typeof time === "string"
      ? dayjs(time.replace(/(\d{2})-(\d{2})-(\d{4})T/, "$3-$2-$1T"))
      : null;

  const selectedStartTime = parseTime(startTimeRaw);
  const selectedEndTime = parseTime(endTimeRaw);

  const startHour = selectedStartTime?.hour();
  const startMinute = selectedStartTime?.minute();
  const endHour = selectedEndTime?.hour();

  if (isEndPicker) {
    if (selectedHour === lastHour) {
      return allMinutes.filter((minute) => minute !== 0);
    }
    if (startHour !== undefined && selectedHour === startHour + 1) {
      return allMinutes.filter((minute) => minute < startMinute);
    }
    if (selectedHour <= startHour) {
      return allMinutes;
    }
  } else {
    if (startHour === lastHour - 1 && endHour === lastHour) {
      return allMinutes.filter((minute) => minute !== 0);
    }
  }

  return [];
};

const updateSelectedTime = (index, type, value) => {
  if (!selectedTimes.value[index]) return;

  if (!value || isNaN(new Date(value).getTime())) {
    selectedTimes.value[index][type] = null; // Set to null if value is invalid
    return;
  }

  selectedTimes.value[index][type] = formatTime(value);
};

const formatTime = (time) => {
  if (!time) return null;
  return dayjs(time).format("YYYY-MM-DDTHH:mm:ss");
};

watch(
  () => selectedTimes.value,
  (newTimes) => {
    const updatedTimes = { ...newTimes };

    shift.value.forEach((s) => {
      s.session.forEach((dayElement) => {
        const start = newTimes[s.id]?.start || null;
        const end = newTimes[s.id]?.end || null;

        const isValidTime =
          start !== null &&
          end !== null &&
          start !== "Invalid Date" &&
          end !== "Invalid Date";

        if (!start && !end) {
          updatedTimes[s.id] = { start: null, end: null };
        }

        if (!isValidTime) {
          dayElement.checked = false;

          Object.keys(listCheckedShifts.value).forEach((day) => {
            listCheckedShifts.value[day] = listCheckedShifts.value[day].filter(
              (id) => id !== s.id,
            );
          });
        }
      });
    });

    if (JSON.stringify(updatedTimes) !== JSON.stringify(newTimes)) {
      selectedTimes.value = updatedTimes;
    }
  },
  { deep: true },
);

const parseTime = (timeString) => {
  if (!timeString || timeString.trim() === "") return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const shiftTimes = ref(
  Object.fromEntries(
    shift.value.map((s) => [
      s.id,
      {
        start: parseTime(s.start_time),
        end: parseTime(s.end_time),
      },
    ]),
  ),
);
//_____________________________________________________________________________________

//Checkbox_____________________________________________________________________________
const handleCheckedDay = (day, checked) => {
  shift.value.forEach((s) => {
    const dayElement = s.session.find((element) => element.value === day);
    if (dayElement) {
      dayElement.checked = checked;
    }
  });

  if (!checked) {
    listChecked.value[day] = false;
  }
};

const handleCheckedValue = (day) => {
  const allShifts = shift.value
    .map((s) => s.session.find((el) => el.value === day))
    .filter(Boolean);
  const allChecked = allShifts.every((el) => el.checked);

  listChecked.value[day] = allChecked;
};
//_____________________________________________________________________________________

// Date picker_________________________________________________________________________
const startDate = ref();
const endDate = ref(null);

const disablePastDates = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const disableBeforeStartDate = (date) => {
  if (!startDate.value) return false;
  return date < new Date(startDate.value);
};

function formatHM(dateTimeString) {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
//_____________________________________________________________________________________

onMounted(async () => {
  selectedTimes.value = [{ start: null, end: null, session: "NO_SESSION" }];
});
</script>

<template>
  <n-grid :cols="11" :y-gap="16">
    <n-gi :span="11">
      <n-form-item
        label="Ngày mong muốn bắt đầu học:"
        label-placement="left"
        class="flex items-center space-x-2"
        :label-style="{ display: 'flex', alignItems: 'center' }"
      >
        <n-date-picker
          type="date"
          :is-date-disabled="disablePastDates"
          placeholder="Chọn ngày"
          v-model:value="startDate"
          format="dd-MM-yyyy"
          value-format="yyyy-MM-dd"
        />
        <i class="fa-solid fa-arrow-right px-1 text-[#133D85]"></i>
        <n-date-picker
          type="date"
          :is-date-disabled="disableBeforeStartDate"
          placeholder="Chọn ngày"
          v-model:value="endDate"
          format="dd-MM-yyyy"
          value-format="yyyy-MM-dd"
        />
      </n-form-item>
    </n-gi>

    <n-gi :span="4" class="font-500 text-[#133D85]">Lịch trống:</n-gi>
    <n-gi v-for="day in daysOfWeek" :key="day.value">
      <n-checkbox
        :label="day.label"
        class="whitespace-nowrap"
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
              v-model:value="shiftTimes[s.id].start"
              format="HH:mm"
              :hours="getStartHours[s.id] || []"
              :is-minute-disabled="
                (minute, hour) =>
                  getDisabledMinutes(hour, s.id, false).includes(minute)
              "
              @update:value="(val) => updateSelectedTime(s.id, 'start', val)"
            />
            <n-time-picker
              v-model:value="shiftTimes[s.id].end"
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
          @update:checked="
            (checked) => handleCheckedValue(day.value, checked, s.id)
          "
        />
      </n-gi>
    </template>
  </n-grid>
</template>
