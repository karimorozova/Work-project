<template lang="pug">
  .languages
    .languages__setting(v-if="isWpLanguage")
      span.languages__setting-close(@click="closeSettings") &#215;
      .title-language
        img.languages__flag(:src="wpLanguage.icon")
        span &ensp;
        span {{ wpLanguage.lang }} &ensp;
      .languages__settingContent
        .languages__settingBody
          .languages__settingRow
            .checkbox
              input#individual(
                type="checkbox",
                ref="individual"
                :checked="languageType.isIndividual",
                @change="(e) => setWpLanguageSetting(e,'individual')"
              )
              label(for="individual")
            .option Individual language
          .languages__settingRow
            .checkbox
              input#parent(
                type="checkbox",
                ref="parent"
                :checked="languageType.isParent",
                @change="(e) => setWpLanguageSetting(e, 'parent')"
              )
              label(for="parent")
            .option Parent language
          .languages__settingRow
            .checkbox
              input#child(
                type="checkbox",
                ref="child"
                :checked="languageType.isChild",
                @change="(e) => setWpLanguageSetting(e,'child')"
              )
              label(for="child")
            .option Сhild language

          .languages__settingDrop(v-if="languageType.isChild")
            .select-single-title Choose parent language:
            .select-single
              SelectSingle(
                :hasSearch="true"
                placeholder="Select"
                :options="languages.map(i => i.lang)"
                :selectedOption="selectedWpLang"
                @chooseOption="selectWpLang"
              )
        .languages__settingSpliter
        .languages__settingScheme
          .languages__schemeBox
            .individual(v-if="languageType.isIndividual")
              .individual__title
                div.language-row
                  img(:src="languages[4].icon")
                  span.language-image-title {{ languages[4].lang }}
              .individual__title
                div.language-row(:class="{currentLanguage: true}")
                  img(:src="wpLanguage.icon")
                  span.language-image-title {{ wpLanguage.lang }}
              .individual__title
                div.language-row
                  img(:src="languages[29].icon")
                  span.language-image-title {{ languages[29].lang }}
              .individual__title
                div.language-row
                  img(:src="languages[66].icon")
                  span.language-image-title {{ languages[66].lang }}

            .child(v-if="languageType.isChild")
              .parent__title
                div.language-row
                  span(v-if="languageChildTitle.icon")
                    img(:src="languageChildTitle.icon")
                  span.language-image-title {{ languageChildTitle.lang }}
                div(v-for="item in languageChildInList")
                  div.language-row
                    span &#8735;
                    img(:src="item.icon")
                    span.language-image-title(:class="{currentLanguage: item.lang === wpLanguage.lang}") {{ item.lang }}

            .parent(v-if="languageType.isParent")
              .parent__title
                div.language-row
                  img(:src="wpLanguage.icon")
                  span.language-image-title(:class="{currentLanguage: true}") {{ wpLanguage.lang }}
                div(v-if="languagesParents.length")
                  div(v-for="item in languagesParents")
                    div.language-row
                      span &#8735;
                      img(:src="item.icon")
                      span.language-image-title {{ item.lang }}
                div.language-row(v-else)
                  span &#8735;
                  span.language-image-title The childs is not set yet

      .save-setting
        Button(
          value="Save"
          @clicked="saveWpSetting"
        )

    .languages__table
      SettingsTable(
        :fields="fields"
        :tableData="languages"
        :errors="errors"
        :areErrors="areErrors"
        @closeErrors="closeErrors"
      )

        template(slot="headerIcon" slot-scope="{ field }")
          .languages__header {{ field.label }}
        template(slot="headerName" slot-scope="{ field }")
          .languages__header {{ field.label }}
        template(slot="headerGroup" slot-scope="{ field }")
          .languages__header {{ field.label }}
        template(slot="headerSymbol" slot-scope="{ field }")
          .languages__header {{ field.label }}
        template(slot="headerIso1" slot-scope="{ field }")
          .languages__header {{ field.label }}
            .languages__header-icon(@click="toggleTooltip('iso1')" v-click-outside="() => closeTooltip('isTooltip1')")
              img.languages__info-icon(src="../../assets/images/info-icon-white.png")
              .languages__tooltip(v-if="isTooltip1") Two letters
        template(slot="headerIso2" slot-scope="{ field }")
          .languages__header {{ field.label }}
            .languages__header-icon(@click="toggleTooltip('iso2')" v-click-outside="() => closeTooltip('isTooltip2')")
              img.languages__info-icon(src="../../assets/images/info-icon-white.png")
              .languages__tooltip(v-if="isTooltip2") Three letters
        template(slot="headerActive" slot-scope="{ field }")
          .languages__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .languages__header {{ field.label }}

        template(slot="icon" slot-scope="{ row, index }")
          .languages__data.languages_centered(:class="{'languages_active': currentActive === index}")
            span.icon_body(v-if="currentActive !== index")
              img.languages__flag(:src="row.icon")

            span.icon_body(v-if="currentActive === index && currentId" )
              img.languages__flag(:src="row.icon")
              .languages__upload(:class="{'languages_no-back': imageData}")
                input.languages__load-file(type="file" @change="uploadFile")
                img.languages__file-preview(v-if="imageData" :src="imageData")

            span.icon_body(v-if="currentActive === index && currentId === null" )
              .languages__uploadSolo
                input.languages__load-fileSolo(type="file" @change="uploadFile")
                img.languages__file-previewSolo(v-if="imageData" :src="imageData")


        template(slot="name" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentName")
          .languages__data(v-else) {{ row.lang }}

        template(slot="group" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentGroup")
          .languages__data(v-else) {{row.group}}

        template(slot="symbol" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentSymbol")
          .languages__data(v-else) {{ row.symbol }}

        template(slot="memoq" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentMemoq")
          .languages__data(v-else) {{ row.memoq }}

        template(slot="iso1" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentISO1")
          .languages__data(v-else) {{ row.iso1 }}

        template(slot="iso2" slot-scope="{ row, index }")
          .languages__data.languages_active(v-if="currentActive === index")
            input(type="text" v-model="currentISO2")
          .languages__data(v-else) {{ row.iso2 }}

        template(slot="active" slot-scope="{ row, index }")
          .languages__data.languages_centered(:class="{'languages_active': currentActive === index}")
            img.languages__checkbox(
              v-if="row.active"
              src="../../assets/images/latest-version/checkbox-brown-1.png"
              @click="toggleActive(index)"
              :class="{'languages_opacity': currentActive === index}"
            )
            img.languages__checkbox(
              v-else
              src="../../assets/images/latest-version/checkbox-brown-0.png"
              @click="toggleActive(index)"
              :class="{'languages_opacity': currentActive === index}"
            )

        template(slot="icons" slot-scope="{ row, index }")
          .languages__icons(v-if="isAdmin && row.lang !== 'English (United Kingdom)'")
            img.languages__icon(
              v-if="!!row._id"
              src="../../assets/images/settings-icon.png"
              @click="openSettings(index)"
              :class="{'languages_opacity': true}"
            )
            img.languages__icon(
              v-if="key !== 'delete'"
              v-for="(icon, key) in icons"
              :src="icon.icon"
              @click="makeAction(index, key)"
              :class="{'languages_opacity': isActive(key, index)}"
            )
          .languages__icons(v-else)
            img(src="../../assets/images/lock.png")

    Add(v-if="isAdmin" @add="addData")

    //.testTable
      GeneralTable


</template>
<script>
	import SettingsTable from "./SettingsTable"
	import { mapActions, mapGetters } from "vuex"
	import ClickOutside from "vue-click-outside"
	import crudIcons from "@/mixins/crudIcons"
	import Add from "../Add"
	import scrollEnd from "../../mixins/scrollEnd"
	import SelectSingle from "../SelectSingle"
	import Button from "../Button"
  import GeneralTable from "../GeneralTable"

	export default {
		mixins: [ crudIcons, scrollEnd ],
		data() {
			return {
				fields: [
					{ label: "Icon", headerKey: "headerIcon", key: "icon", width: "10%", padding: "0" },
					{ label: "Name", headerKey: "headerName", key: "name", width: "16%", padding: "0" },
					{ label: "Group", headerKey: "headerGroup", key: "group", width: "16%", padding: "0" },
					{ label: "Symbol", headerKey: "headerSymbol", key: "symbol", width: "10%", padding: "0" },
					{ label: "Memoq", headerKey: "headerSymbol", key: "memoq", width: "10%", padding: "0" },
					{ label: "ISO 639-1", headerKey: "headerIso1", key: "iso1", width: "10%", padding: "0" },
					{ label: "ISO 639-2", headerKey: "headerIso2", key: "iso2", width: "10%", padding: "0" },
					{ label: "Active", headerKey: "headerActive", key: "active", width: "6%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "12%", padding: "0" }
				],
				languages: [],
				currentActive: -1,
				file: [],
				imageData: "",
				isTooltip1: false,
				isTooltip2: false,
				areErrors: false,
				errors: [],

				wpLanguage: null,
				isWpLanguage: false,

				currentId: null,
				currentIcon: null,
				currentName: null,
				currentGroup: null,
				currentSymbol: null,
				currentMemoq: null,
				currentISO1: null,
				currentISO2: null,
				currentCheckbox: null

			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async saveWpSetting() {
				try {
					await this.$http.put('/api-settings/language-setting', {
						obj: this.wpLanguage
					})
					this.alertToggle({
						message: "Language Setting saved!",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error on Languages setting",
						isShow: true,
						type: "error"
					})
				} finally {
					await this.getLanguages()
					this.cancel()
					this.closeSettings()
				}
			},
			selectWpLang({ option }) {
				const { symbol } = this.languages.find(({ lang }) => lang === option)
				this.wpLanguage.parent = symbol
			},
			setWpLanguageSetting(event, key) {
				if (!event.target.checked) {
					this.$refs.individual.checked = true
					key = 'individual'
				}
				switch (key) {
					case 'individual':
						this.wpLanguage = { ...this.wpLanguage, children: false, parent: "", direction: "in" }
						break
					case 'parent':
						this.wpLanguage = { ...this.wpLanguage, children: true, parent: "", direction: "both" }
						break
					case 'child':
						this.wpLanguage = { ...this.wpLanguage, children: false, parent: "Select", direction: "in" }
						break
				}
			},
			openSettings(index) {
				if (this.isWpLanguage) {
					this.wpLanguage = this.languages[index]
				} else {
					this.isWpLanguage = true
					this.wpLanguage = this.languages[index]
				}
			},
			closeSettings() {
				this.isWpLanguage = false
				this.wpLanguage = null
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				if (key === "save") {
					this.checkErrors()
				}
				if (key === "edit") {
					this.setEditingData(index)
				}
				if (key === "cancel") {
					if (this.currentActive === -1) return
					this.cancel()
					await this.getLanguages()
				}
			},
			addData() {
				if (this.currentActive !== -1) return this.isEditing()
				this.languages.push({
					_id: null,
					icon: "",
					lang: "",
					group: "",
					symbol: "",
					memoq: "",
					iso1: "",
					iso2: "",
					active: false
				})
				this.setEditingData(this.languages.length - 1)
				this.$nextTick(() => {
					this.scrollToEnd()
				})
			},
			async checkErrors() {
				if (this.currentActive === -1) return

				this.errors = []
				if (!this.currentName) this.errors.push('Name should not be empty')
				if (!this.currentGroup) this.errors.push('Group should not be empty')
				if (!this.currentSymbol) this.errors.push('Symbol should not be empty')
				if (!this.currentMemoq) this.errors.push('Memoq should not be empty')
				if (!this.currentISO1) this.errors.push('ISO 1 should not be empty')
				if (!this.currentISO2) this.errors.push('ISO 2 should not be empty')

				if (checkSameKeys('lang', this.currentName, this.languages, this.currentActive))
					this.errors.push('Name should be unique')
				if (checkSameKeys('symbol', this.currentSymbol, this.languages, this.currentActive))
					this.errors.push('Symbol should be unique')
				if (checkSameKeys('memoq', this.currentMemoq, this.languages, this.currentActive))
					this.errors.push('Memoq should be unique')
				if (checkSameKeys('iso1', this.currentISO1, this.languages, this.currentActive))
					this.errors.push('ISO 1 should be unique')
				if (checkSameKeys('iso2', this.currentISO2, this.languages, this.currentActive))
					this.errors.push('ISO 2 should be unique')

				if (!this.currentId) {
					if (this.file[0] === undefined) {
						this.errors.push('Icon File should not be empty')
					}
				}
				this.areErrors = !!this.errors.length
				if (!this.areErrors) {
					await this.saveChanges()
				}

				function checkSameKeys(objectKey, essence, languages, activeIndex) {
					return languages
							.filter((item, index) => index !== activeIndex)
							.some(item => item[objectKey] === essence)
				}
			},
			async saveChanges() {
				if (this.currentActive === -1) return

				let newData = new FormData()
				newData.append("id", this.currentId)
				newData.append("flag", this.file[0])
				newData.append("icon", this.currentIcon)
				newData.append("lang", this.currentName)
				newData.append("group", this.currentGroup)
				newData.append("symbol", this.currentSymbol)
				newData.append("memoq", this.currentMemoq)
				newData.append("iso1", this.currentISO1)
				newData.append("iso2", this.currentISO2)
				newData.append("active", this.currentCheckbox)

				try {
					await this.$http.post(`/api-settings/languages`, newData)
					this.alertToggle({
						message: "Language saved.",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error on saving language.",
						isShow: true,
						type: "error"
					})
				} finally {
					await this.getLanguages()
					this.currentId && await this.$http.post('/pricelists/update-language-activity', { lang: this.currentId, value: this.currentCheckbox })
					this.cancel()
				}
			},
			setEditingData(index) {
				this.currentActive = index
				const { _id, icon, lang, group, symbol, memoq, iso1, iso2, active } = this.languages[index]
				this.currentId = _id
				this.currentIcon = icon
				this.currentName = lang
				this.currentGroup = group
				this.currentSymbol = symbol
				this.currentMemoq = memoq
				this.currentISO1 = iso1
				this.currentISO2 = iso2
				this.currentCheckbox = !!active
			},
			cancel() {
				this.currentActive = -1
				this.file = []
				this.imageData = ""
				this.currentId = this.currentIcon = this.currentName = this.currentGroup = this.currentSymbol = this.currentMemoq = this.currentISO1 = this.currentISO2 = this.currentCheckbox = null
			},
			uploadFile(event) {
				this.file.push(event.target.files[0])
				const input = event.target
				if (input.files && input.files[0]) {
					let reader = new FileReader()
					reader.onload = (e) => {
						this.imageData = e.target.result
					}
					reader.readAsDataURL(input.files[0])
				}
			},
			closeTooltip(prop) {
				this[prop] = false
			},
			closeErrors() {
				this.areErrors = false
			},
			toggleActive(index) {
				if (this.currentActive !== index) return
				this.languages[index].active = this.currentCheckbox = !this.languages[index].active
			},
			toggleTooltip(iso) {
				if (iso === "iso1") {
					this.isTooltip1 = !this.isTooltip1
					this.isTooltip2 = false
				} else {
					this.isTooltip2 = !this.isTooltip2
					this.isTooltip1 = false
				}
			},
			async getLanguages() {
				try {
					const result = await this.$http.get("/api/languages")
					this.languages = result.body.sort((a, b) => {
						if (a.lang < b.lang) return -1
						if (a.lang > b.lang) return 1
					})
				} catch (err) {
					this.alertToggle({ message: "Error on getting languages.", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				user: 'getUser'
			}),
			languageType() {
				const { children, parent, direction } = this.wpLanguage
				let isIndividual, isParent, isChild = false

				if (children) isParent = true
				if (parent) isChild = true
				if (!parent && !children) isIndividual = true

				return { isIndividual, isParent, isChild }
			},
			selectedWpLang() {
				if (this.wpLanguage.parent === 'Select') return ""
				const { lang } = this.languages.find(({ symbol }) => symbol === this.wpLanguage.parent)
				return lang
			},
			languageChildTitle() {
				if (this.wpLanguage.parent === 'Select') return { lang: "The parent is not set yet", icon: false }
				const { lang, icon } = this.languages.find(({ symbol }) => symbol === this.wpLanguage.parent)
				return { lang, icon }
			},
			languageChildInList() {
				const allChilds = this.languages.filter(({ parent }) => parent === this.wpLanguage.parent)
				if (allChilds.findIndex(({ lang }) => lang === this.wpLanguage.lang) === -1) allChilds.push(this.wpLanguage)
				return allChilds
			},
			languagesParents() {
				return this.languages.filter(({ parent }) => parent === this.wpLanguage.symbol)
			},
			isAdmin() {
				if (this.user) {
					const { group: { name } } = this.user
					return name === 'Administrators' || name === 'Developers'
				}

			}
		},
		components: {
			Button,
			SelectSingle,
			Add,
			SettingsTable,
			GeneralTable
		},
		directives: {
			ClickOutside
		},
		created() {
			this.getLanguages()
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";
  @import "../../assets/scss/checkbox";

  .languages {
    @extend %setting-table;
    width: 1040px;

    &__settingSpliter {
      width: 1px;
      background: #C5BFB5;
      margin: 0 20px;
    }

    &__settingDrop {
      display: flex;
      flex-direction: column;
      width: 200px;
      position: relative;
    }

    &__settingScheme {
      width: 200px;
    }

    &__settingBody {
      width: 200px;
    }

    &__settingRow {
      display: flex;
      align-items: center;
      position: relative;
    }

    &__settingContent {
      display: flex;
    }

    &__setting {
      position: absolute;
      background: white;
      padding: 20px;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      z-index: 999;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 300px;

      &-close {
        position: absolute;
        top: 5px;
        right: 7px;
        font-size: 22px;
        cursor: pointer;
        height: 22px;
        width: 22px;
        justify-content: center;
        display: flex;
        align-items: center;
        font-family: Myriad900;
        opacity: 0.8;
        transition: ease 0.2s;

        &:hover {
          opacity: 1
        }
      }
    }

    &__header {
      position: relative;
    }

    &__header-icon {
      position: absolute;
      top: -1px;
      left: 80%;
      cursor: pointer;
    }

    &__tooltip {
      position: relative;
      top: -18px;
      left: -73px;
      z-index: 999;
      background: #938676;
      font-size: 14px;
      width: 70px;
      letter-spacing: -1px;
    }

    &__data {
      @extend %table-data;
      position: relative;
    }

    &__icons {
      @extend %table-icons;
    }

    &__icon {
      @extend %table-icon;
      margin-right: 4px;
      margin-left: 4px;
    }

    &__checkbox {
      cursor: pointer;
      opacity: 0.5;
    }

    &_centered {
      justify-content: center;
    }

    &__flag, &__file-preview, &__file-previewSolo {
      width: 32px;
      height: 22px;
      object-fit: cover;
      image-rendering: pixelated;
    }

    &__pagination {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
    }

    &__prev, &__next {
      text-align: center;
      padding: 5px;
      width: 130px;
      border: 1px solid $main-color;
      margin: 5px;
      cursor: pointer;
    }

    &_non-active {
      opacity: 0.4;
    }

    &__page-numbers {
      margin-left: 10px;
      margin-right: 10px;
    }

    &__page-number {
      cursor: pointer;
      margin-right: 5px;

      &:first-child {
        margin-left: 5px;
      }
    }

    &_opacity {
      opacity: 1;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-position-x: right;
      background-repeat: no-repeat;
      width: 40%;
      height: 22px;
      overflow: hidden;
    }

    &__uploadSolo {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-position-x: center;
      background-repeat: no-repeat;
      width: 100%;
      height: 22px;
      overflow: hidden;
    }

    &__load-file {
      width: 33px;
      height: 22px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: 15px;
      cursor: pointer;
      font-size: 0;
    }

    &__load-fileSolo {
      width: 63px;
      height: 22px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: 15px;
      cursor: pointer;
      font-size: 0;
    }

    &_no-back {
      background: none;
    }

    &__file-preview {
      margin-left: 10px;
    }

    &__file-previewSolo {
      margin-left: 30px;
    }

    &_active {
      box-shadow: inset 0 0 8px $brown-shadow;
    }
  }

  .icon_body {
    width: 100%;
    display: flex;
    justify-content: center;

  }

  .option {
    margin-left: 6px;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    color: inherit;
    background: transparent;
  }

  .title-language {
    height: 26px;
    display: flex;
    align-items: center;
    font-size: 16px;
    justify-content: center;
    margin-bottom: 10px;
  }

  .select-single {
    height: 30px;
  }

  .save-setting {
    margin-top: 20px;
    text-align: center;
  }

  .select-single-title {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .language-image-title {
    margin-left: 3px;
  }

  .currentLanguage {
    font-family: Myriad900;
  }

  .language-row {
    display: flex;
    align-items: center;
    margin-bottom: 2px;

    img {
      width: 32px;
      height: 22px;
      image-rendering: pixelated;
    }
  }
</style>
