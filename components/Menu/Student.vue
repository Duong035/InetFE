<template>
  <MenuLayout :menus v-model:collapsed="collapsed" />
</template>

<script setup>
import DashboardIcon from "@/assets/icons/menu/dashboard.svg"
import ClassIcon from "@/assets/icons/menu/class.svg"
import ScheduleIcon from "@/assets/icons/menu/schedule.svg"
import TestIcon from "@/assets/icons/menu/test.svg"
import ResultIcon from "@/assets/icons/menu/result.svg"
import FeeIcon from "@/assets/icons/menu/fee.svg"
import JobIcon from "@/assets/icons/menu/job.svg"
import InfoIcon from "@/assets/icons/menu/info.svg"
import QuestionMarkIcon from "@/assets/icons/menu/question-mark.svg"

import { renderIcon, renderIconNoColor } from "./Render.js"

const { t } = useI18n()

const collapsed = defineModel('collapsed')

const menus = ref([
  {
    label: t("dashboard"),
    key: `dashboard`,
    icon: renderIcon(DashboardIcon),
    link_breadcrumb: false,
  },
  {
    label: t("class"),
    key: `class`,
    icon: renderIcon(ClassIcon),
    link_breadcrumb: false,
  },
  {
    label: t("training.schedule"),
    key: `schedule`,
    icon: renderIcon(ScheduleIcon),
    link_breadcrumb: false,
  },
  {
    label: t("common.test"),
    key: `exam`,
    icon: renderIcon(TestIcon),
    link_breadcrumb: false,
  },
  {
    label: t("common.study.result"),
    key: `result`,
    icon: renderIcon(ResultIcon),
    link_breadcrumb: false,
  },
  {
    label: t("training.setting.subject.fee.edit"),
    key: `tuition-fee`,
    icon: renderIcon(FeeIcon),
    link_breadcrumb: false,
  },
  {
    label: t("training.official_student.employment"),
    key: `job`,
    icon: renderIcon(JobIcon),
    link_breadcrumb: false,
    disabled: true,
  },
  {
    label: t("setting.unit-information"),
    key: `unit-information`,
    icon: renderIcon(InfoIcon),
    link_breadcrumb: false,
  },
  {
    label: t("help-center"),
    key: `help-center`,
    icon: renderIconNoColor(QuestionMarkIcon),
    link_breadcrumb: false,
  },
])
</script>
