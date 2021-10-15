<template lang="pug">
  .industries
    .industries__table
      SettingsTable(
        :fields="fields"
        :tableData="industries"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteIndustry"
        @notApprove="cancel"
        @closeModal="cancel"
      )
        template(slot="headerIcon" slot-scope="{ field }")
          .industries__header {{ field.label }}
        template(slot="headerName" slot-scope="{ field }")
          .industries__header {{ field.label }}
        template(slot="headerGeneric" slot-scope="{ field }")
          .industries__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .industries__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .industries__header {{ field.label }}
        template(slot="icon" slot-scope="{ row, index }")
          .industries__data.industries_centered(:class="activeClasses(index)")
            img.industries__main-icon(v-if="row.icon" :src="row.icon")
            .industries__upload(v-if="currentActive === index" :class="{'industries_no-back': imageData}")
              input.industries__load-file(type="file" @change="uploadIcon")
              img.industries__file-preview(v-if="imageData" :src="imageData")
        template(slot="name" slot-scope="{ row, index }")
          .industries__data(v-if="currentActive !== index") {{ row.name }}
          .industries__editing-data(v-else)
            input.industries__input(type="text" v-model="currentName")
        template(slot="generic" slot-scope="{ row, index }")
          .industries__data.industries_centered(:class="activeClasses(index)")
            .industries__no-file(v-if="!row.generic && currentActive !== index") No file loaded
            .industries__download(v-if="row.generic")
              a.industries__link(:href="row.generic")
                img.industries__download-file(src="../../assets/images/Other/Download-icon.png")
            .industries__upload(v-if="currentActive === index")
              input.industries__load-file(type="file" @change="uploadGeneric")
              .industries__generic-preview
        template(slot="active" slot-scope="{ row, index }")
          .industries__data.industries_centered(:class="{'industries_active': currentActive === index}")
            img.industries__checkbox(v-if="row.active" src="../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index)" :class="{'industries_opacity': currentActive === index}")
            img.industries__checkbox(v-else src="../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index)" :class="{'industries_opacity': currentActive === index}")
        template(slot="icons" slot-scope="{ row, index }")
          .industries__icons
            img.industries__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'industries_opacity': isActive(key, index)}")
    Add(@add="addIndustry")

</template>

<script>
	import SettingsTable from "./SettingsTable"
	import Add from "../Add"
	import { mapGetters, mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"

	export default {
		mixins: [ crudIcons ],
		data() {
			return {
				fields: [
					{ label: "Icon", headerKey: "headerIcon", key: "icon", width: "12%", padding: "0" },
					{ label: "Name", headerKey: "headerName", key: "name", width: "42%", padding: "0" },
					{ label: "Generic TB", headerKey: "headerGeneric", key: "generic", width: "20%", padding: "0" },
					{ label: "Active", headerKey: "headerActive", key: "active", width: "12%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "14%", padding: "0" }
				],
				industries: [],
				tableData: [],
				currentActive: -1,
				currentName: "",
				imageData: "",
				iconFile: [],
				genericFile: [],
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1
			}
		},
		methods: {
			uploadIcon(event) {
				this.iconFile.push(event.target.files[0])
				const input = event.target
				if (input.files && input.files[0]) {
					let reader = new FileReader()
					reader.onload = (e) => {
						this.imageData = e.target.result
					}
					reader.readAsDataURL(input.files[0])
				}
			},
			uploadGeneric(event) {
				this.genericFile.push(event.target.files[0])
			},
			downloadGeneric(index) {

			},
			toggleActive(index) {
				if (this.currentActive !== index) return
				this.industries[index].active = !this.industries[index].active
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				if (key === "save") {
					await this.checkErrors(index)
				}
				if (key === "edit") {
					this.setEditionData(index)
				}
				if (key === "cancel") {
					if (this.currentActive === -1) return
					this.cancel()
					await this.getIndustries()
				}
				if (key === "delete") {
					if (!this.industries[index]._id) {
						this.industries.splice(index, 1)
						return this.cancel()
					}
					this.deleteIndex = index
					this.isDeleting = true
				}
			},
			setEditionData(index) {
				this.currentActive = index
				this.currentName = this.industries[index].name
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if (!this.currentName || !this.isNameUnique(index)) this.errors.push("Name should not be empty and be unique!")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.saveChanges(index)
				this.cancel()
			},
			isNameUnique(index) {
				const duplicateIndex = this.industries.findIndex((item, ind) => {
					if (index !== ind && item.name.toLowerCase() === this.currentName.toLowerCase().trim()) {
						return item
					}
				})
				return duplicateIndex === -1
			},
			closeErrors() {
				this.areErrors = false
			},
			async saveChanges(index) {
				const id = this.industries[index]._id
				const newData = this.collectData(index)
				try {
					if (!id) {
						await this.createNew(newData)
					} else {
						await this.updateIndustry(id, newData, index)
					}
					await this.getIndustries()
					this.alertToggle({ message: "Saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Industry info", isShow: true, type: "error" })
				}
			},
			collectData(index) {
				const newData = new FormData()
				newData.append("name", this.currentName)
				newData.append("active", this.industries[index].active)
				newData.append("icon", this.iconFile[0])
				newData.append("generic", this.genericFile[0])
				return newData
			},
			async createNew(newData) {
				try {
					const result = await this.$http.post(`/industry/industry/new`, newData)
					if (result.data !== 'Updated') {
						await this.$http.post('/pricelists/add-new-multiplier', {
							key: 'Industry',
							id: result.data
						})
					}
				} catch (err) {
					this.alertToggle({ message: "Error on saving Industry info", isShow: true, type: "error" })
				}
			},
			async updateIndustry(id, newData, index) {
				const oldIndustry = this.industries[index]
				oldIndustry.active = !oldIndustry.active
				try {
					await this.$http.post(`/industry/industry/${ id }`, newData)
					await this.$http.post('/pricelists/update-multiplier', {
						key: 'Industry',
						oldMultiplier: oldIndustry
					})
					// await this.$http.post('/clientsapi/rates', {
					// 	key: 'Industry',
					// 	oldMultiplier: oldIndustry
					// })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Industry info", isShow: true, type: "error" })
				}
			},
			async deleteIndustry() {
				const index = this.deleteIndex
				const id = this.industries[index]._id
				const { icon, generic } = this.industries[index]
				try {
					await this.$http.delete(`/industry/industry/${ id }`, { body: { icon, generic } })
					this.industries.splice(index, 1)
					this.alertToggle({ message: "Industry removed", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on removing Industry", isShow: true, type: "error" })
				}
				this.cancel()
			},
			cancel() {
				this.currentActive = -1
				this.imageData = ""
				this.iconFile = []
				this.genericFile = []
				this.isDeleting = false
			},
			addIndustry() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.industries.push({
					icon: "",
					name: "",
					generic: "",
					active: true
				})
				this.setEditionData(this.industries.length - 1)

				this.$nextTick(() => {
					this.scrollToEnd()
				})

			},
			async getIndustries() {
				try {
					const allIndustries = await this.$http.get("/api/industries")
					this.industries = allIndustries.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industries", isShow: true, type: "error" })
				}
			},
			activeClasses(index) {
				return this.currentActive === index ? 'industries_active industries_flex' : ""
			},
			...mapActions({
				alertToggle: "alertToggle"
			}),
			scrollToEnd() {
				const element = this.$el.querySelector('.table__tbody')
				element.scrollTop = element.scrollHeight
			}
		},
		computed: {
			manageIcons() {
				const { "delete": del, ...result } = this.icons
				return result
			}
		},
		components: {
			SettingsTable,
			Add
		},
		mounted() {
			this.getIndustries()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .industries {
    @extend %setting-table;
    border-radius: 4px;
    width: 900px;
    margin: 50px;

    &__data {
      @extend %table-data;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
    }

    &__icon {
      @extend %table-icon;
    }

    &__checkbox {
      cursor: pointer;
      opacity: 0.5;
    }

    &_centered {
      justify-content: center;
    }

    &_flex {
      display: flex;
      justify-content: space-around;
    }

    &__main-icon, &__file-preview {
      width: 22px;
      height: 22px;
    }

    &__link {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 22px;
    }

    &__download {
      cursor: pointer;
      width: 40%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &_opacity {
      opacity: 1;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-position-x: center;
      background-repeat: no-repeat;
      width: 40%;
      height: 22px;
      overflow: hidden;
    }

    &__load-file {
      width: 100%;
      height: 22px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: 6px;
      cursor: pointer;
      font-size: 0;
    }

    &__no-file {
      opacity: 0.5;
    }

    &_no-back {
      background: none;
    }

    &__file-preview {
      margin-left: 10px;
    }

    &_active {
      box-shadow: inset 0 0 8px $brown-shadow;
    }
  }

</style>
