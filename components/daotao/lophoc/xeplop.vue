<script lang="ts">
import { defineComponent, ref, computed, onMounted, toRaw } from "vue";
import { message } from "ant-design-vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default defineComponent({
  components: { VueDatePicker },
  setup() {
    //Byweek__________________________________________________________________________________________________
    const daysOfWeek = ref(["T2", "T3", "T4", "T5", "T6", "T7", "CN"]);
    const daysMapping: Record<string, string> = {
      T2: "Thứ 2",
      T3: "Thứ 3",
      T4: "Thứ 4",
      T5: "Thứ 5",
      T6: "Thứ 6",
      T7: "Thứ 7",
      CN: "Chủ Nhật",
    };
    const selectedDays = ref<string[]>([]);

    // Checkbox update function
    const toggleDay = (day: string, checked: boolean) => {
      if (checked) {
        if (!selectedDays.value.includes(day)) {
          selectedDays.value.push(day); // Add day if not already selected
        }
      } else {
        const index = selectedDays.value.indexOf(day);
        if (index !== -1) {
          selectedDays.value.splice(index, 1); // Remove day at correct position
        }
      }

      console.log("Updated selectedDays:", selectedDays.value);
    };

    const formValue = ref({
      sessions: {} as Record<
        string,
        Array<{
          session: null;
          time: { start: string; end: string };
          teacher: null;
          room: null;
        }>
      >,
    });

    const addSession = (day: string) => {
      if (!formValue.value.sessions[day]) {
        formValue.value.sessions[day] = [];
      }
      formValue.value.sessions[day].push({
        session: null,
        time: { start: "", end: "" },
        teacher: null,
        room: null,
      });
    };

    const removeSession = (day: string, index: number) => {
      formValue.value.sessions[day].splice(index, 1);
    };

    //________________________________________________________________________________________________________

    interface RowData {
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      status: string;
      endAt: string;
      name: string;
      totalLessons: number;
    }

    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const showSchedule = ref(false);
    const currentClass = ref<RowData | null>(null);
    const scheduleMode = ref<"date" | "week">("week");
    const dates = ref<Date[]>([]);
    const route = useRoute();
    const newId = route.query.id;

    // ✅ Lọc ngày hợp lệ dựa trên startAt và endAt
    const availableDates = computed(() => {
      if (!currentClass.value) return [];
      return dates.value.filter(
        (date) =>
          new Date(date) >= new Date(currentClass.value!.startAt) &&
          new Date(date) <= new Date(currentClass.value!.endAt),
      );
    });

    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});
        if (error?.value) {
          message.error(error.value.data?.message || "Lỗi tải dữ liệu");
          return;
        }
        const rawData = toRaw(resData.value)?.data?.classes;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any) => ({
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

    // ✅ Hàm xử lý khi chọn ngày
    const handleDateChange = (selectedDates: Date[]) => {
      if (selectedDates.length > 0) {
        showSchedule.value = true;
        dates.value = selectedDates;
      }
    };

    const handleSave = () => {
      console.log("Lưu lịch học", {
        mode: scheduleMode.value,
        dates: dates.value,
      });
      showSchedule.value = false;
    };

    const handleClose = () => {
      showSchedule.value = false;
      currentClass.value = null;
      dates.value = [];
      scheduleMode.value = "week";
    };

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

    return {
      selectedDays,
      daysMapping,
      daysOfWeek,
      formValue,
      addSession,
      removeSession,
      toggleDay,

      data,
      showSchedule,
      currentClass,
      scheduleMode,
      dates,
      availableDates,
      handleSave,
      handleClose,
      handleDateChange,
    };
  },
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
                    Chọn ngày(Hệ thống sẽ không tự tạo buổi học theo lịch tuần)
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-gi>
            <n-gi v-if="scheduleMode === 'date'">
              <VueDatePicker
                v-model="dates"
                :min-date="currentClass?.startAt"
                :max-date="currentClass?.endAt"
                multi-dates
                inline
                auto-apply
                @update:model-value="handleDateChange"
              />

              <div class="mt-4 flex items-center justify-between">
                <span>Số buổi cuối tháng: 0 buổi</span>
              </div>
              <span>Số buổi của lớp: {{ currentClass?.totalLessons }}</span>
            </n-gi>
            <n-gi v-else class="mt-2">
              <n-grid cols="4" :x-gap="10">
                <n-gi span="1">
                  <h1 class="ml-5 text-lg">Chọn nhanh thời gian học</h1>
                </n-gi>
                <n-gi span="2" class="mb-3">
                  <n-grid cols="7" :x-gap="10">
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
                <n-gi
                  v-for="(day, index) in daysOfWeek"
                  :key="'form-' + index"
                  span="4"
                >
                  <template v-if="selectedDays.includes(day)">
                    <n-form>
                      <n-grid :cols="21" :x-gap="20">
                        <!-- First Row: Headers + Add Button -->
                        <n-gi :span="4">
                          <n-form-item label="Ngày học">
                            <n-input :value="daysMapping[day]" disabled />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item label="Ca học">
                            <n-select placeholder="Chọn ca học" />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item label="Thời gian">
                            <n-input-group
                              class="w-fit rounded-2xl border bg-[#F5F5F5]"
                            >
                              <n-time-picker
                                class="custom-tp-left"
                                placeholder="Bắt đầu"
                                format="HH:mm"
                              >
                                <p>-</p>
                              </n-time-picker>
                              <n-time-picker
                                class="custom-tp-right"
                                placeholder="Kết thúc"
                                format="HH:mm"
                              >
                              </n-time-picker>
                            </n-input-group>
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item label="Giảng viên">
                            <n-select placeholder="Chọn giảng viên" />
                          </n-form-item>
                        </n-gi>
                        <n-gi :span="4">
                          <n-form-item label="Phòng học">
                            <n-select placeholder="Chọn phòng học" />
                          </n-form-item>
                        </n-gi>
                        <n-gi class="flex items-center justify-center">
                          <n-button quaternary circle @click="addSession(day)">
                            <i
                              class="fa-regular fa-square-plus"
                              style="font-size: 24px; color: #008cff"
                            ></i>
                          </n-button>
                        </n-gi>

                        <!-- Additional Sessions -->
                        <template
                          v-for="(session, sessionIndex) in formValue.sessions[
                            day
                          ]"
                          :key="sessionIndex"
                        >
                          <n-gi :span="4"></n-gi>
                          <!-- Empty space under "Ngày học" -->
                          <n-gi :span="4">
                            <n-form-item :show-label="false">
                              <n-select
                                v-model:value="session.session"
                                placeholder="Chọn ca học"
                              />
                            </n-form-item>
                          </n-gi>
                          <n-gi :span="4">
                            <n-form-item :show-label="false">
                              <n-input-group
                                class="w-fit rounded-2xl border bg-[#F5F5F5]"
                              >
                                <n-time-picker
                                  class="custom-tp-left"
                                  placeholder="Bắt đầu"
                                  format="HH:mm"
                                >
                                  <p>-</p>
                                </n-time-picker>
                                <n-time-picker
                                  class="custom-tp-right"
                                  placeholder="Kết thúc"
                                  format="HH:mm"
                                >
                                </n-time-picker>
                              </n-input-group>
                            </n-form-item>
                          </n-gi>
                          <n-gi :span="4">
                            <n-form-item :show-label="false">
                              <n-select
                                v-model:value="session.teacher"
                                placeholder="Chọn giảng viên"
                              />
                            </n-form-item>
                          </n-gi>
                          <n-gi :span="4">
                            <n-form-item :show-label="false">
                              <n-select
                                v-model:value="session.room"
                                placeholder="Chọn phòng học"
                              />
                            </n-form-item>
                          </n-gi>
                          <n-gi class="mb-5 flex items-center justify-center">
                            <n-button
                              quaternary
                              circle
                              @click="removeSession(day, sessionIndex)"
                            >
                              <i
                                class="fa-solid fa-trash-can text-lg text-red-500"
                              ></i>
                            </n-button>
                          </n-gi>
                        </template>
                      </n-grid>
                    </n-form>
                  </template>
                </n-gi>
              </n-grid>
            </n-gi>
            <n-gi class="flex justify-center">
              <n-button type="info" class="w-1/5" @click="handleSave">
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
</style>
