import Casdoor from "casdoor-vue-sdk"

export default defineNuxtPlugin(nuxtApp => {
  const setups = useRuntimeConfig().public

  const config = {
    serverUrl: setups.OauthServerUrl,
    clientId: setups.OauthClientId,
    organizationName: setups.OauthOrganizationName,
    appName: setups.OauthAppName,
    redirectPath: "/callback",
  }

  nuxtApp.vueApp.use(Casdoor, config)
})
