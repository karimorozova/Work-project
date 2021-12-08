module.exports = {
  /*
  ** Headers of the page
  */
  modules: [
    '@nuxtjs/axios',
  ],

  env: {
    domain: 'https://admin2.pangea.global'
  },

  axios: {
    // API url
    baseURL: 'https://admin2.pangea.global'
  },
  head: {
    title: 'Pangea - Client portal',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0 ' },
      { hid: 'description', name: 'description', content: 'Pangea Localization Services' },

    ],
    script: [
      { src: 'https://use.fontawesome.com/releases/v5.1.0/js/all.js' },
      // { src:"https://code.jquery.com/jquery-3.3.1.min.js",
      // integrity: "sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=",
      // crossorigin: "anonymous"},
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { href: "https://fonts.googleapis.com/css?family=Open+Sans:400,700", rel: "stylesheet" },
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
