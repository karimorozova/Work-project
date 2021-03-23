export default {
	methods: {
    removeEnglishLang(languages) {
      return languages.filter(({lang}) => lang.search("English") === -1 || lang === "English (United Kingdom)" )
    }
	}
}
