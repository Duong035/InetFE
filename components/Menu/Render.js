import ViewOpenIcon from "@/assets/icons/menu/view-open.svg"
import ViewIcon from "@/assets/icons/menu/view.svg"

import { NIcon } from "naive-ui"

export const renderIcon = icon => {
    return () => h(NIcon, { class: "flex items-center justify-center transition-all-300 max-2xl:text-16px" }, { default: () => h(icon) })
}
export const renderIconNoColor = icon => {
    return () => h(NIcon, { class: "flex items-center justify-center no-fill transition-all-300 max-2xl:text-16px" }, { default: () => h(icon) })
}
export const renderIconChild = path => {
    const currentRoute = useRoute()
    return () => h(NIcon, { size: 24, color: "#00A2EB", class: "flex items-center justify-center transition-all-300" }, { default: () => (currentRoute.path.includes(path) ? h(ViewOpenIcon) : h(ViewIcon)) })
}