module.exports = {
  /*
  ** Headers of the page
  */
  modules: [
    '@nuxtjs/axios',
  ],

  env: {
    domain: process.env.API_URL,
    adminUrl: 'https://admin.pangea.global'
  },

  axios: {
    // API url
    baseURL: process.env.API_URL
  },
  head: {
    title: 'Pangea - Client portal',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0 ' },
      { hid: 'description', name: 'description', content: 'Pangea Localization Services' },

    ],
    script: [
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { href: "/reset.css", rel: "stylesheet" }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  // loading: { color: '#3B8070' },
  loading: '~/components/Loading.vue',
  /*
  ** Build configuration
  */
  build: {

    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  router: {
    base: '/',
    middleware: ['check-auth', 'main-redirect']
  },

  plugins: [
    '~/plugins/axios',
    '~plugins/vue-cookie'
  ]
};
