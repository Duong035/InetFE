import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || {},
    permissions: JSON.parse(localStorage.getItem("permissions")) || [],
    accessAll: JSON.parse(localStorage.getItem("accessAll")) || false,
  }),

  actions: {
    setUserInfo(value) {
      this.userInfo = value
      localStorage.setItem("userInfo", JSON.stringify(value))
    },
    setPermissions(access, permissions) {
      this.accessAll = access || false
      this.permissions = permissions
      localStorage.setItem("accessAll", JSON.stringify(this.accessAll))
      localStorage.setItem("permissions", JSON.stringify(this.permissions))
    },
    login(userInfo) {
      this.userInfo = userInfo || {}
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
    },
    logOut() {
      this.userInfo = {}
      this.permissions = []
      this.accessAll = false
      localStorage.removeItem("userInfo")
      localStorage.removeItem("permissions")
      localStorage.removeItem("accessAll")
    },
    checkAuth() {
      return this.userInfo.token ? useExpToken(this.userInfo.token) : false
    },
  }
})
