<script setup lang="ts">
import BarChart from "../AdminChart/BarChart.vue";
import PieChart from "../AdminChart/PieChart.vue";

const barDataLessons = ref({
  labels: ["Tổng số buổi học", "Buổi học đã kết thúc", "Buổi học đã điểm danh"],
  datasets: [
    {
      label: "Số lượng",
      data: [19, 15, 5],
      backgroundColor: ["#4F46E5", "#60A5FA", "#A5B4FC"],
    },
  ],
});

const pieDataBranches = ref({
  labels: ["Cơ sở 1", "Cơ sở 2", "Cơ sở 3"],
  datasets: [
    {
      data: [50, 10, 40],
      backgroundColor: ["#4F46E5", "#60A5FA", "#A5B4FC"],
    },
  ],
});

const barDataStudents = ref({
  labels: [
    "Chương trình 1",
    "Chương trình 2",
    "Chương trình 3",
    "Chương trình 4",
    "Chương trình 5",
  ],
  datasets: [
    {
      label: "Số học viên",
      data: [20, 15, 10, 12, 18],
      backgroundColor: ["#60A5FA", "#A5B4FC", "#93C5FD", "#BFDBFE", "#E0F2FE"],
    },
  ],
});

const pieDataSupport = ref({
  labels: ["Xin nghỉ", "Bảo lưu", "Dừng học", "Khác"],
  datasets: [
    {
      data: [40, 30, 20, 10],
      backgroundColor: ["#4F46E5", "#60A5FA", "#A5B4FC", "#93C5FD"],
    },
  ],
});

const scheduleData = ref([
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 2",
    attendance: "Đã điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 1",
    attendance: "Chưa điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 2",
    attendance: "Đã điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 1",
    attendance: "Chưa điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 2",
    attendance: "Đã điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 1",
    attendance: "Chưa điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 2",
    attendance: "Đã điểm danh",
  },
  {
    time: "08:00-10:00",
    class: "Thiết kế đồ họa 1",
    subject: "Thiết kế đồ họa",
    room: "Phòng 12345",
    participants: "20/30",
    branch: "Cơ sở 1",
    attendance: "Chưa điểm danh",
  },

  // Add more rows as needed
]);
</script>

<template>
  <div class="grid grid-cols-12 gap-4 text-sm">
    <!-- Left Panel -->
    <div class="col-span-3 space-y-4">
      <!-- Thống kê buổi học -->
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-4 flex font-semibold text-gray-700">Thống kê buổi học</h2>

        <BarChart :data="barDataLessons" />
      </div>

      <!-- Thống kê lớp theo chi nhánh -->
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-4 flex font-semibold text-gray-700">
          Thống kê lớp theo chi nhánh
        </h2>
        <PieChart :data="pieDataBranches" />
      </div>
    </div>

    <!-- Right Panel -->
    <div class="col-span-9 rounded-lg bg-white p-4 shadow">
      <table class="w-full border-collapse border border-gray-200 text-xs">
        <thead>
          <tr class="bg-blue-50">
            <th class="border border-gray-200 px-4 py-2">Thời gian</th>
            <th class="border border-gray-200 px-4 py-2">Lớp học</th>
            <th class="border border-gray-200 px-4 py-2">Môn học</th>
            <th class="border border-gray-200 px-4 py-2">Phòng học</th>
            <th class="border border-gray-200 px-4 py-2">Học viên tham gia</th>
            <th class="border border-gray-200 px-4 py-2">Chi nhánh</th>
            <th class="border border-gray-200 px-4 py-2">Điểm danh</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in scheduleData"
            :key="item.time"
            class="hover:bg-gray-50"
          >
            <td class="border border-gray-200 px-4 py-2">
              {{ item.time }}
            </td>
            <td class="border border-gray-200 px-4 py-2">
              {{ item.class }}
            </td>
            <td class="border border-gray-200 px-4 py-2">
              {{ item.subject }}
            </td>
            <td class="border border-gray-200 px-4 py-2">
              {{ item.room }}
            </td>
            <td class="border border-gray-200 px-4 py-2">
              {{ item.participants }}
            </td>
            <td class="border border-gray-200 px-4 py-2">
              {{ item.branch }}
            </td>
            <td
              class="border border-gray-200 px-4 py-2"
              :class="
                item.attendance === 'Đã điểm danh'
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ item.attendance }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Charts -->
    <div class="col-span-8">
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-4 flex font-semibold text-gray-700">
          Thống kê học viên theo chương trình học
        </h2>
        <BarChart :data="barDataStudents" />
      </div>
    </div>
    <div class="col-span-4 space-y-4">
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-4 flex font-semibold text-gray-700">
          Thống kê trung tâm hỗ trợ
        </h2>
        <PieChart :data="pieDataSupport" />
      </div>
    </div>
  </div>
</template>
