<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

const props = defineProps({
  branch_id: String,
});

const Subjectarray = ref([]);
const formRef = ref(null);
const route = useRoute();
const { restAPI } = useApi();
const listChecked = ref([]);
const listCheckedShifts = ref([]);
const selectedTimes = ref({});
const daysOfWeek = ref(createDaysOfWeek());
const is_update = ref(false);
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
  subject_ids: [],
  user_shifts: [
    {
      work_session_id: null,
      day_of_week: [],
    },
  ],
});
const session = ref([]);
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

//Rule_________________________________________________________________________________

const isSubjectSelected = computed(() => formValue.subject_ids.length > 0);

const rules = ref({
  startDate: [],
  endDate: [],
});

watch(isSubjectSelected, (isSelected) => {
  if (isSelected) {
    rules.value = {
      ...rules.value, // Preserve other rules (if any)
      startDate: [
        {
          required: true,
          message: "Vui lòng chọn ngày bắt đầu!",
          trigger: "blur",
        },
      ],
      endDate: [
        {
          required: true,
          message: "Vui lòng chọn ngày kết thúc!",
          trigger: "blur",
        },
      ],
    };
  } else {
    rules.value = {
      ...rules.value,
      startDate: [], // Remove validation
      endDate: [], // Remove validation
    };
  }

  // Force validation to update
  formRef.value?.restoreValidation();
});
//_____________________________________________________________________________________

//Subject_______________________________________________________________________________
const fetchSubjects = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getAllSubject({});
    const rawData = toRaw(resData.value.data);
    if (resData.value.status) {
      Subjectarray.value = rawData
        .map(({ id, name }) => ({
          id,
          name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      message.error("Failed to load subjects!");
      Subjectarray.value = [];
    }
  } catch (err) {
    message.error("Error fetching subjects!");
    console.error(err);
    Subjectarray.value = [];
  }
};
//_____________________________________________________________________________________

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

const isAnyChecked = (shiftId) => {
  const shiftData = shift.value.find((s) => s.id === shiftId);
  return shiftData?.session.some((day) => day.checked);
};
//_____________________________________________________________________________________

//Checkbox_____________________________________________________________________________
const handleCheckedDay = (day, checked) => {
  shift.value.forEach((s) => {
    const dayElement = s.session.find((element) => element.value === day);
    if (dayElement) {
      dayElement.checked = checked;
    }

    if (checked) {
      if (!listCheckedShifts.value[day]) {
        listCheckedShifts.value[day] = [];
      }
      if (!listCheckedShifts.value[day].includes(s.id)) {
        listCheckedShifts.value[day].push(s.id);
      }
    } else {
      delete listCheckedShifts.value[day];
    }
  });

  listChecked.value[day] = checked;
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

  if (daysOfWeek.value) {
    const found = daysOfWeek.value.find((e) => e.value === day);
    if (found) {
      found.checked =
        listCheckedShifts.value[day]?.length === shift.value.length;
    }
  }
};
//_____________________________________________________________________________________

// Date picker_________________________________________________________________________
const startDate = ref(null);
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
//_____________________________________________________________________________________

//Shifts_______________________________________________________________________________
const listSession = async () => {
  const { data } = await restAPI.cms.getShift({});
  session.value = data.value.data.data.filter((session) =>
    session.title.includes(formValue.user_id),
  );
};
const createShifts = async () => {
  if (!formValue.user_id) return;

  for (const s of shift.value) {
    let body = {
      title: `${formValue.user_id}_${s.id}`,
      branch_id: props.branch_id,
      start_time: startDate.value
        ? new Date(startDate.value).toISOString()
        : null,
      end_time: endDate.value ? new Date(endDate.value).toISOString() : null,
      is_active: true,
    };
    try {
      await restAPI.cms.createShift({ body });
    } catch (error) {
      if (error.response?.data?.message?.includes("already exists")) {
        return;
      } else {
        console.error(`Error creating shift ${s.id}:`, error);
      }
    }
  }
  listSession();
};
//_____________________________________________________________________________________

//format_______________________________________________________________________________
const formatDate = (timestamp) => {
  return timestamp
    ? dayjs(timestamp).format("YYYY-MM-DDTHH:mm:ss.SSS+07:00")
    : null;
};
const workSessionMap = computed(() => {
  return session.value.reduce((acc, s) => {
    const shiftType = s.title.split("_").pop();
    acc[shiftType] = s.id;
    return acc;
  }, {});
});

const validTimeSlots = computed(() => {
  return Object.entries(selectedTimes.value).reduce((acc, [shiftId, t]) => {
    if (!isAnyChecked(Number(shiftId))) return acc; // Use your isAnyChecked function

    if (
      t.start !== null &&
      t.end !== null &&
      t.start !== "Invalid Date" &&
      t.end !== "Invalid Date"
    ) {
      const workSessionId = workSessionMap.value[shiftId] || null;

      acc[shiftId] = {
        start: t.start,
        end: t.end,
        work_session_id: workSessionId,
      };
    }
    return acc;
  }, {});
});

const formattedTimeSlots = computed(() => {
  return Object.values(validTimeSlots.value).map(
    ({ start, end, work_session_id }) => ({
      start_time: dayjs(start).format("YYYY-MM-DDTHH:mm:ss.SSS+07:00"),
      end_time: dayjs(end).format("YYYY-MM-DDTHH:mm:ss.SSS+07:00"),
      work_session_id,
    }),
  );
});

const convertToUserShifts = (listCheckedShifts) => {
  const shiftMapping = {};

  Object.entries(listCheckedShifts).forEach(([day, shiftTypes]) => {
    const dayNumber = Number(day);
    if (!Array.isArray(shiftTypes)) return;

    shiftTypes.forEach((shiftType) => {
      if (!validTimeSlots.value[shiftType]) {
        return;
      }

      if (!shiftMapping[shiftType]) {
        shiftMapping[shiftType] = {
          work_session_id: workSessionMap.value[shiftType] || null,
          day_of_week: [],
        };
      }
      shiftMapping[shiftType].day_of_week.push(dayNumber);
    });
  });

  return Object.values(shiftMapping);
};
//_____________________________________________________________________________________

//Load_________________________________________________________________________________
const loadData = async () => {
      loading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getStaff();

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data;
        const Teachersdata = rawData.data;
        if (Array.isArray(Teachersdata)) {
          data.value = Teachersdata.map((item: any, index) => ({
            id: item.id,
            stt: index + 1,
            username: item.username,
            full_name: item.full_name,
            avatar: item.avatar,
            created_at: item.created_at ? item.created_at.split("T")[0] : "N/A",
            salary: item.salary || 0,
            organ_struct_id: item.organ_struct_id,
            branch_id: item.branch_id,
            position: item.position,
            permission_grp_id: item.permission_grp_id,
            is_active:
              item.is_active === true
                ? "Hoạt động"
                : item.is_active === false
                  ? "Không hoạt động"
                  : "N/A",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
        loading.value = false;
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

//_____________________________________________________________________________________

//submit_______________________________________________________________________________
const scheduleSubmit = async () => {
  await listSession();
  if (!session.value.length) {
    await createShifts();
  }
  return new Promise((resolve, reject) => {
    formRef.value?.validate((errors) => {
      if (!errors) {
        const body = {
          user_id: formValue.user_id,
          is_online: formValue.is_online,
          is_offline: formValue.is_offline,
          notes: formValue.notes,
          start_date: formatDate(startDate.value),
          end_date: formatDate(endDate.value),
          time_slots: formattedTimeSlots.value,
          user_shifts: convertToUserShifts(listCheckedShifts.value),
        };

        console.log(body);
        resolve(true);
      } else {
        // Validation failed, reject the promise
        reject(false);
      }
    });
  });
};
defineExpose({
  scheduleSubmit,
});
//_____________________________________________________________________________________

onMounted(async () => {
  fetchSubjects();
  selectedTimes.value = [{ start: null, end: null, session: "NO_SESSION" }];
});
</script>

<template>
  <n-form ref="formRef" :model="formValue" :rules="rules">
    <n-grid :cols="11" :y-gap="16">
      <n-gi span="11">
        <n-grid cols="2" :x-gap="20" responsive="screen">
          <n-gi span="2">
            <h1 class="text-2xl font-bold text-[#133D85]">Đăng ký lịch dạy</h1>
          </n-gi>
          <n-gi class="mt-7">
            <n-form-item
              label="Hình thức dạy học"
              label-placement="left"
              :show-feedback="false"
            >
              <n-space item-style="display: flex;">
                <n-checkbox
                  label="Học online"
                  v-model:checked="formValue.is_online"
                />
                <n-checkbox
                  label="Học offline"
                  v-model:checked="formValue.is_offline"
                />
              </n-space>
            </n-form-item>
          </n-gi>
          <n-gi span="1 ">
            <n-form-item label="Môn học" :show-feedback="false">
              <n-select
                placeholder="Chọn môn học"
                multiple
                v-model:value="formValue.subject_ids"
                :options="Subjectarray"
                label-field="name"
                value-field="id"
                clearable
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-gi>
      <n-gi :span="11">
        <n-form-item
          label="Ngày áp dụng:"
          label-placement="left"
          class="flex items-center space-x-2"
          :label-style="{ display: 'flex', alignItems: 'center' }"
        >
          <n-form-item path="startDate" :show-label="false">
            <n-date-picker
              type="date"
              :is-date-disabled="disablePastDates"
              placeholder="Chọn ngày"
              v-model:value="startDate"
              format="dd-MM-yyyy"
              value-format="yyyy-MM-dd"
            />
          </n-form-item>
          <i class="fa-solid fa-arrow-right mb-6 px-1 text-[#133D85]"></i>
          <n-form-item path="endDate" :show-label="false">
            <n-date-picker
              type="date"
              :is-date-disabled="disableBeforeStartDate"
              placeholder="Chọn ngày"
              v-model:value="endDate"
              format="dd-MM-yyyy"
              value-format="yyyy-MM-dd"
            />
          </n-form-item>
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
                :disabled="!isAnyChecked(s.id)"
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
                :disabled="!isAnyChecked(s.id)"
              />
            </n-input-group>
          </n-flex>
        </n-gi>
        <n-gi
          v-for="day in s.session"
          :key="day.value"
          class="flex items-center"
        >
          <n-checkbox
            v-model:checked="day.checked"
            class="custom-checkbox-no-disabled"
            @update:checked="
              (checked) => handleCheckedValue(day.value, checked, s.id)
            "
          />
        </n-gi>
      </template>
      <n-gi span="11">
        <n-form-item label="Ghi chú">
          <n-input
            type="textarea"
            v-model:value="formValue.notes"
            class="w-full"
            placeholder="Note"
          />
        </n-form-item>
      </n-gi>
    </n-grid>
  </n-form>
</template>
