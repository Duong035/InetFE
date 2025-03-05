<script setup>
import {
  ref,
  computed,
  watch,
  defineExpose,
  onMounted,
  watchEffect,
} from "vue";
import dayjs from "dayjs";
// const props = defineProps(["timeSlots", "shortShifts", "studying_start_date"]);
const props = defineProps({
  studying_start_date: String,
  timeSlots: Array,
  shortShifts: Array,
  localBranchId: [String, Number],
  stt: [Number],
  queryId: [String],
});
const emit = defineEmits([
  "update:timeSlots",
  "update:shortShifts",
  "update:studying_start_date",
]);

const { restAPI } = useApi();
const listChecked = ref([]);
const listCheckedShifts = ref([]);
const shifts = ref([]);
const shift = ref([
  {
    id: 0,
    name: "Sáng",
    start: "6",
    end: "12",
    start_time: "",
    end_time: "",
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

const handleCheckedDay = (day, checked) => {
  shift.value.forEach((s) => {
    const dayElement = s.session.find((element) => element.value === day);

    if (dayElement) {
      const start = selectedTimes.value[s.id]?.start;
      const end = selectedTimes.value[s.id]?.end;

      const isValidTime =
        start !== null &&
        end !== null &&
        start !== "Invalid Date" &&
        end !== "Invalid Date";

      dayElement.checked = isValidTime ? checked : false;
    }
  });

  const found = daysOfWeek.value.find((e) => e.value === day);
  if (found) {
    found.checked = checked;
  }

  listChecked.value[day] = checked;

  if (checked) {
    listCheckedShifts.value[day] = shift.value
      .filter((s) => {
        const start = selectedTimes.value[s.id]?.start;
        const end = selectedTimes.value[s.id]?.end;
        return (
          start !== null &&
          end !== null &&
          start !== "Invalid Date" &&
          end !== "Invalid Date"
        );
      })
      .map((s) => s.id);
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

const selectedTimes = ref({});

const updateSelectedTime = (index, type, value) => {
  if (!selectedTimes.value[index]) return;
  selectedTimes.value[index][type] = value ? formatTime(value) : "Invalid Date";
};

const formatTime = (time) => {
  if (!time) return null;
  return dayjs(time).format("YYYY-MM-DDTHH:mm:ss");
};

const scheduleSubmit = async (e) => {
  for (const s of shift.value) {
    let body = {
      title: `${props.queryId}_${props.stt}_${s.id}`,
      branch_id: props.localBranchId,
      start_time: "2024-06-09T18:00:00.000Z",
      end_time: "2024-06-09T18:00:00.000Z",
      is_active: true,
    };
    await restAPI.cms.createShift({
      body,
    });
  }
  await listShifts();
  const validTimeSlots = Object.entries(selectedTimes.value).reduce(
    (acc, [shiftId, t]) => {
      if (
        t.start !== null &&
        t.end !== null &&
        t.start !== "Invalid Date" &&
        t.end !== "Invalid Date"
      ) {
        let work_id = `${props.queryId}_${props.stt}_${shiftId}`;

        const matchingShift = shifts.value.find((s) => s.title === work_id);
        acc[shiftId] = {
          start: t.start,
          end: t.end,
          work_session_id: matchingShift.id,
        };
      }
      return acc;
    },
    {},
  );
  emit("update:timeSlots", validTimeSlots);

  const validWork = Array(3)
    .fill(null)
    .map(() => []);

  listCheckedShifts.value.forEach((shifts, dayIndex) => {
    shifts.forEach((shift) => {
      validWork[shift].push(dayIndex);
    });
  });

  const filteredValidWork = validWork.reduce((acc, shiftDays, index) => {
    if (shiftDays.length > 0) {
      acc[index] = shiftDays;
    }
    return acc;
  }, {});
  emit("update:shortShifts", filteredValidWork);
  emit("update:studying_start_date", selectedDate.value?.toISOString());
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

defineExpose({
  scheduleSubmit,
});

const selectedDate = ref(
  props.studying_start_date ? new Date(props.studying_start_date) : null,
);

watch(
  () => props.studying_start_date,
  (newDate) => {
    selectedDate.value = newDate ? new Date(newDate) : null;
  },
);

const disablePastDates = (timestamp) => {
  const today = new Date().setHours(0, 0, 0, 0);
  return timestamp < today;
};

function formatHM(dateTimeString) {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

const listShifts = async () => {
  const { data } = await restAPI.cms.getShift({});
  shifts.value = data.value.data.data;
};

onMounted(async () => {
  if (!props.timeSlots || props.timeSlots.length === 0) {
    selectedTimes.value = [{ start: null, end: null }];
    return;
  }

  selectedTimes.value = props.timeSlots
    .map((timeSlot) => ({
      start: timeSlot.start_time ? formatHM(timeSlot.start_time) : null,
      end: timeSlot.end_time ? formatHM(timeSlot.end_time) : null,
    }))
    .sort((a, b) => (a.start > b.start ? 1 : -1));
  console.log(selectedTimes);

  shift.value.forEach((s, index) => {
    if (selectedTimes.value[index]) {
      s.start_time = selectedTimes.value[index].start || s.start_time;
      s.end_time = selectedTimes.value[index].end || s.end_time;
    }
  });

  console.log("Updated Shift:", shift.value);

  await listShifts();
});

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

watchEffect(() => {
  shiftTimes.value = Object.fromEntries(
    shift.value.map((s) => [
      s.id,
      {
        start: parseTime(s.start_time),
        end: parseTime(s.end_time),
      },
    ]),
  );
});
</script>

<template>
  <n-grid :cols="11" :y-gap="16">
    <n-gi :span="11">
      <n-form-item
        label="Ngày mong muốn bắt đầu học:"
        label-placement="left"
        style="margin-bottom: -30px"
      >
        <n-date-picker
          type="date"
          :is-date-disabled="disablePastDates"
          placeholder="Chọn ngày"
          v-model:value="selectedDate"
        />
      </n-form-item>
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
              :disabled="!selectedTimes[s.id]?.start"
            />
          </n-input-group>
        </n-flex>
      </n-gi>
      <n-gi v-for="day in s.session" :key="day.value" class="flex items-center">
        <n-checkbox
          v-model:checked="day.checked"
          class="custom-checkbox-no-disabled"
          :disabled="
            !listChecked[day.value] || // Day checkbox must be checked
            !selectedTimes[s.id] || // Shift must exist
            selectedTimes[s.id].start === null ||
            selectedTimes[s.id].end === null ||
            selectedTimes[s.id].start === 'Invalid Date' ||
            selectedTimes[s.id].end === 'Invalid Date' // Ensure shift time is valid
          "
          @update:checked="
            (checked) => handleCheckedValue(day.value, checked, s.id)
          "
        />
      </n-gi>
    </template>
  </n-grid>
</template>
