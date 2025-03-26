<script setup>
import { ref, computed, onMounted, toRaw } from "vue";
import { message } from "ant-design-vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

const { restAPI } = useApi();
const data = ref([]);
const showSchedule = ref(false);
const currentClass = ref(null);
const scheduleMode = ref("week");
const dates = ref([]);
const route = useRoute();
const newId = route.query.id;
const formRef = ref(null);

//Rules_________________________________________________________________________________________________
const rules = {
  [`sessions`]: {
    type: "object",
    required: true,
  },
  [`sessions.*.sessions.*.session`]: {
    required: true,
    message: "Ca học phải được chọn",
    trigger: "change",
  },
};

//______________________________________________________________________________________________________

//Schedule______________________________________________________________________________________________
const daysOfWeek = ref([
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
]);

const selectedDays = ref([]);
const selectedDates = ref([]);
const selectedDisplay = computed(() => {
  if (scheduleMode.value === "date") {
    return selectedDates.value;
  } else if (scheduleMode.value === "week") {
    return selectedDays.value;
  }
  return [];
});

const toggleDay = (day, checked) => {
  const dayOrder = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ Nhật",
  ];

  if (checked) {
    if (!selectedDays.value.includes(day)) {
      selectedDays.value.push(day);
      addSession(day);
    }
  } else {
    const index = selectedDays.value.indexOf(day);
    if (index !== -1) {
      selectedDays.value.splice(index, 1);
      delete formValue.value.sessions[day];
    }
  }

  selectedDays.value.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};

const formValue = ref({
  sessions: {},
});
//______________________________________________________________________________________________________

//ScheduleDisplay_______________________________________________________________________________________
const addSession = (day) => {
  if (!formValue.value.sessions[day]) {
    formValue.value.sessions[day] = [];
  }
  formValue.value.sessions[day].push({
    session: null,
    time: { start: null, end: null },
    teacher: null,
    room: null,
  });
};

const removeSession = (day, index) => {
  formValue.value.sessions[day].splice(index, 1);
};

const sessionTimeRanges = {
  Sáng: {
    start: new Date().setHours(6, 0, 0, 0),
    end: new Date().setHours(12, 0, 0, 0),
  },
  Chiều: {
    start: new Date().setHours(12, 0, 0, 0),
    end: new Date().setHours(18, 0, 0, 0),
  },
  Tối: {
    start: new Date().setHours(18, 0, 0, 0),
    end: new Date().setHours(22, 0, 0, 0),
  },
};

const handleSessionChange = (day, sessionIndex, sessionValue) => {
  if (sessionValue && sessionTimeRanges[sessionValue]) {
    const { start, end } = sessionTimeRanges[sessionValue];
    formValue.value.sessions[day][sessionIndex].time.start = start;
    formValue.value.sessions[day][sessionIndex].time.end = end;
  } else {
    formValue.value.sessions[day][sessionIndex].time.start = null;
    formValue.value.sessions[day][sessionIndex].time.end = null;
  }
};

const getDisabledMinutes = (selectedHour, session, isEndPicker) => {
  if (!session.time.start || !session.time.end || selectedHour === null) {
    return [];
  }

  const startTime = new Date(session.time.start);
  const endTime = new Date(session.time.end);
  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();

  const sessionRange = sessionTimeRanges[session.session];
  if (!sessionRange) return [];

  const lastHour = new Date(sessionRange.end).getHours();

  if (isEndPicker && selectedHour === lastHour) {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  }

  if (!isEndPicker && selectedHour === lastHour - 1) {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  }

  if (isEndPicker && selectedHour === startHour + 1) {
    return Array.from({ length: startMinute }, (_, i) => i);
  }

  return [];
};

const checkOverlap = (day) => {
  const sessions = formValue.value.sessions[day];
  const conflicts = new Set();

  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      if (
        sessions[i].time.start &&
        sessions[i].time.end &&
        sessions[j].time.start &&
        sessions[j].time.end
      ) {
        const startA = new Date(sessions[i].time.start).getTime();
        const endA = new Date(sessions[i].time.end).getTime();
        const startB = new Date(sessions[j].time.start).getTime();
        const endB = new Date(sessions[j].time.end).getTime();

        if (startA < endB && startB < endA) {
          conflicts.add(i);
          conflicts.add(j);
        }
      }
    }
  }

  return conflicts;
};

//______________________________________________________________________________________________________

//Handle________________________________________________________________________________________________
const availableDates = computed(() => {
  if (!currentClass.value) return [];
  return dates.value.filter(
    (date) =>
      new Date(date) >= new Date(currentClass.value.startAt) &&
      new Date(date) <= new Date(currentClass.value.endAt),
  );
});

const handleDateChange = (dates) => {
  //Create a proxy that update at the end

  // Convert the selected dates to a formatted array
  const formattedDates = dates.map((date) => dayjs(date).format("YYYY/MM/DD"));

  // Track unselected dates for deletion logic
  const unselectedDates = selectedDates.value.filter(
    (selectedDate) => !formattedDates.includes(selectedDate),
  );

  // Remove sessions for unselected dates
  unselectedDates.forEach((unselectedDate) => {
    if (formValue.value.sessions[unselectedDate]) {
      delete formValue.value.sessions[unselectedDate];
    }
  });

  // Sort the selected dates
  formattedDates.sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));

  // Update selectedDates to reflect the current selection
  selectedDates.value = formattedDates;

  // Add sessions for newly selected dates
  formattedDates.forEach((formattedDate) => {
    if (!formValue.value.sessions[formattedDate]) {
      addSession(formattedDate);
    }
  });
};

const handleClose = () => {
  showSchedule.value = false;
  currentClass.value = null;
  dates.value = [];
  scheduleMode.value = "week";
};
//______________________________________________________________________________________________________

//Load__________________________________________________________________________________________________
const loadData = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getClasses({});
    if (error?.value) {
      message.error(error.value.data?.message || "Lỗi tải dữ liệu");
      return;
    }
    const rawData = toRaw(resData.value)?.data?.classes;
    if (Array.isArray(rawData)) {
      data.value = rawData.map((item) => ({
        id: item.id || "N/A",
        classType: item.type ? `${item.type}` : "N/A",
        startAt: item.start_at?.split("T")[0] || "N/A",
        endAt: item.end_at?.split("T")[0] || "N/A",
        status: item.status,
        name: item.name,
        subjectName: item.subject?.name || "N/A",
        totalLessons: item.subject?.total_lessons || 0,
      }));
    }
  } catch (err) {
    message.error("Lỗi tải dữ liệu.");
  }
};
//______________________________________________________________________________________________________

//Submit________________________________________________________________________________________________
const handleSubmit = async () => {
  // if (!formRef.value) return;
  // await formRef.value.validate();
  console.log(formValue.value);
};
//______________________________________________________________________________________________________

onMounted(async () => {
  await loadData();
  if (newId) {
    const foundClass = data.value.find((cls) => cls.id === newId);
    if (foundClass) {
      currentClass.value = foundClass;
      showSchedule.value = true;
    } else {
      message.error("Không tìm thấy lớp học");
    }
  }
});
</script>

<template>
  <div class="h-full w-full overflow-auto rounded-2xl bg-white">
    <div class="mt-4 rounded-md border p-4">
      <h2 class="mb-2 text-xl font-bold">
        Xếp lịch học cho lớp: {{ currentClass?.name }}
      </h2>

      <div>
        <div class="mb-4 flex items-center gap-3">
          <n-grid cols="1">
            <n-gi>
              <n-radio-group v-model:value="scheduleMode">
                <n-space>
                  <n-radio value="week">Tuần</n-radio>
                  <n-radio value="date">
                    Chọn ngày (Hệ thống sẽ không tự tạo buổi học theo lịch tuần)
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-gi>
            <n-gi v-if="scheduleMode === 'date'">
              <n-grid cols="1">
                <n-gi>
                  <VueDatePicker
                    v-if="scheduleMode === 'date'"
                    v-model="selectedDates"
                    :min-date="currentClass?.startAt"
                    :max-date="currentClass?.endAt"
                    multi-dates
                    inline
                    auto-apply
                    @update:model-value="handleDateChange"
                  />
                </n-gi>
                <n-gi>
                  <n-grid cols="2" x-gap="20">
                    <n-gi>
                      <span>Số buổi cuối tháng: 0 buổi</span>
                    </n-gi>
                    <n-gi>
                      <span>Số buổi của lớp: 0</span>
                    </n-gi>
                  </n-grid>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi v-if="scheduleMode === 'week'" class="mt-2">
              <n-grid cols="4" :x-gap="10">
                <n-gi span="1">
                  <h1 class="ml-5 text-lg">Chọn nhanh thời gian học</h1>
                </n-gi>
                <n-gi span="3" class="mb-3">
                  <n-grid
                    cols="7"
                    :x-gap="20"
                    style="display: flex; flex-wrap: wrap"
                  >
                    <n-gi v-for="(day, index) in daysOfWeek" :key="index">
                      <n-checkbox
                        :checked="selectedDays.includes(day)"
                        @update:checked="toggleDay(day, $event)"
                      >
                        {{ day }}
                      </n-checkbox>
                    </n-gi>
                  </n-grid>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi
              v-for="(item, index) in selectedDisplay"
              :key="'form-' + index"
              span="4"
            >
              <n-form :model="formValue" ref="formRef" :rules="rules">
                <n-grid :cols="21" :x-gap="20">
                  <n-gi :span="4">
                    <n-form-item label="Ngày học">
                      <n-input :value="item" disabled />
                    </n-form-item>
                  </n-gi>
                  <n-gi :span="17">
                    <template
                      v-for="(session, sessionIndex) in formValue.sessions[
                        item
                      ]"
                      :key="sessionIndex"
                    >
                      <n-grid :cols="17" :x-gap="20">
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Ca học' : ''"
                            :path="`sessions.${item}.${sessionIndex}.session`"
                          >
                            <n-select
                              v-model:value="session.session"
                              placeholder="Chọn ca học"
                              :options="[
                                { label: 'Sáng', value: 'Sáng' },
                                { label: 'Chiều', value: 'Chiều' },
                                { label: 'Tối', value: 'Tối' },
                              ]"
                              @update:value="
                                handleSessionChange(item, sessionIndex, $event)
                              "
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4" class="text-red-400">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Thời gian' : ''"
                            :feedback="
                              checkOverlap(item).has(sessionIndex)
                                ? 'Thời gian bị trùng lặp!'
                                : ''
                            "
                            feedback-status="error"
                            :style="{ marginBottom: '8px' }"
                          >
                            <n-input-group
                              class="w-fit rounded-2xl border bg-[#F5F5F5]"
                            >
                              <n-time-picker
                                class="custom-tp-left"
                                placeholder="Bắt đầu"
                                format="HH:mm"
                                v-model:value="session.time.start"
                                :hours="
                                  (() => {
                                    if (
                                      !session.session ||
                                      !sessionTimeRanges[session.session]
                                    )
                                      return [];
                                    const sessionRange =
                                      sessionTimeRanges[session.session];

                                    const startHour = new Date(
                                      sessionRange.start,
                                    ).getHours();
                                    const endHour = new Date(
                                      sessionRange.end,
                                    ).getHours();

                                    return startHour < endHour
                                      ? Array.from(
                                          { length: endHour - startHour },
                                          (_, i) => startHour + i,
                                        )
                                      : [];
                                  })()
                                "
                                :is-minute-disabled="
                                  (minute, hour) =>
                                    hour !== null &&
                                    getDisabledMinutes(
                                      hour,
                                      session,
                                      false,
                                    ).includes(minute)
                                "
                              />

                              <n-time-picker
                                class="custom-tp-right"
                                placeholder="Kết thúc"
                                format="HH:mm"
                                v-model:value="session.time.end"
                                :hours="
                                  (() => {
                                    if (
                                      !session.session ||
                                      !sessionTimeRanges[session.session] ||
                                      !session.time.start
                                    )
                                      return [];

                                    const sessionRange =
                                      sessionTimeRanges[session.session];
                                    const startHour = new Date(
                                      session.time.start,
                                    ).getHours();
                                    const endHour = new Date(
                                      sessionRange.end,
                                    ).getHours();

                                    return startHour < endHour
                                      ? Array.from(
                                          { length: endHour - startHour },
                                          (_, i) => startHour + i + 1,
                                        )
                                      : [];
                                  })()
                                "
                                :is-minute-disabled="
                                  (minute, hour) =>
                                    hour !== null &&
                                    getDisabledMinutes(
                                      hour,
                                      session,
                                      true,
                                    ).includes(minute)
                                "
                              />
                            </n-input-group>
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Giảng viên' : ''"
                          >
                            <n-select
                              v-model:value="session.teacher"
                              placeholder="Chọn giảng viên"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item
                            :show-label="sessionIndex === 0"
                            :label="sessionIndex === 0 ? 'Phòng học' : ''"
                          >
                            <n-select
                              v-model:value="session.room"
                              placeholder="Chọn phòng học"
                            />
                          </n-form-item>
                        </n-gi>
                        <n-gi
                          v-if="sessionIndex == 0"
                          class="flex items-center justify-center"
                        >
                          <n-button quaternary circle @click="addSession(item)">
                            <i
                              class="fa-regular fa-square-plus"
                              style="font-size: 24px; color: #008cff"
                            ></i>
                          </n-button>
                        </n-gi>
                        <n-gi
                          v-else
                          class="mb-8 flex items-center justify-center"
                        >
                          <n-button
                            quaternary
                            circle
                            @click="removeSession(item, sessionIndex)"
                          >
                            <i
                              class="fa-solid fa-trash-can text-lg text-red-500"
                            ></i>
                          </n-button>
                        </n-gi>
                      </n-grid>
                    </template>
                  </n-gi>
                </n-grid>
              </n-form>
            </n-gi>
            <n-gi class="flex justify-center">
              <n-button type="info" class="w-1/5" @click="handleSubmit">
                Lưu
              </n-button>
            </n-gi>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
* :deep(.custom-tp-left .n-input) {
  --n-border-disabled: none !important;
  --n-padding-right: 0px !important;
  --n-border: none !important;
  --n-border-focus: none !important;
  --n-border-hover: none !important;
  --n-box-shadow-focus: none !important;
  --n-color: #fff !important;
  --n-color-disabled: #fff !important;
  --n-color-focus: #fff !important;
  --n-color-focus-error: #fff !important;
  --n-border-error: none !important;
  --n-border-focus-error: none !important;
  --n-box-shadow-focus-error: none !important;
  --n-border-hover-error: none !important;
}

* :deep(.custom-tp-right .n-input) {
  --n-padding-left: 7px !important;
  --n-padding-right: 12px !important;
  --n-border-disabled: none !important;
  --n-border: none !important;
  --n-border-focus: none !important;
  --n-border-hover: none !important;
  --n-box-shadow-focus: none !important;
  --n-color: #fff !important;
  --n-color-disabled: #fff !important;
  --n-color-focus: #fff !important;
  --n-color-focus-error: #fff !important;
  --n-border-error: none !important;
  --n-border-focus-error: none !important;
  --n-box-shadow-focus-error: none !important;
  --n-border-hover-error: none !important;
}
:deep(.custom-tp-left .n-input),
:deep(.custom-tp-right .n-input) {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

* :deep(.custom-tp-right .n-input .n-input__suffix) {
  display: none !important;
}

:deep(.n-form-item .n-form-item-feedback-wrapper .n-form-item-feedback) {
  color: red;
}
</style>
