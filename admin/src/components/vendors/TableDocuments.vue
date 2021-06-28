<template lang="pug">
  .documents
    .documents__table
      SettingsTable(
        :fields="fields"
        :tableData="documentsData"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteData"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
        :tbodyStyle="{'max-height': '256px'}",
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .documents__head-title {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          .documents__editing-data(v-if="currentActive === index && currentFile")
            span.documents__input {{ currentFile.name }}
          .documents__data(v-else)
            a( :href="domain + row.path" ) {{ row.fileName }}

        template(slot="category" slot-scope="{ row, index }")
          .documents__data(v-if="currentActive !== index") {{row.category}}
          .documents__drop-menu(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :selectedOption="currentCategory"
              :options="categories"
              @chooseOption="setCategory"
              @scrollDrop="scrollDrop(index)"
            )

        template(slot="icons" slot-scope="{ row, index }")
          .documents__icons
            img.documents__icon(v-if="!row.fileName && index <= 2" :style="{cursor: 'default'}" :class="'documents_opacity'" src="../../assets/images/red-info-icon.png")
            img.documents__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'documents_opacity': isActive(key, index)}")
            .documents__upload(v-if="currentActive === index")
              input.documents__load-file(type="file" id="file" ref="file" @change="uploadDocument(index)")
            .documents__upload(v-if="currentActive !== index" :class="'documents_opacity-half'")
              input.documents__load-file(type="file" disabled="disabled")

    Add(@add="addData" v-if="documentsData.filter(item => item.fileName !== '').length > 0")

</template>
<script>
	import SettingsTable from "../Table/SettingsTable"
	import { mapGetters, mapActions } from "vuex"
	import SelectSingle from "../SelectSingle"
	import Add from "../Add"
	import scrollDrop from "@/mixins/scrollDrop"
	import crudIcons from "@/mixins/crudIcons"

	export default {
		mixins: [ scrollDrop, crudIcons ],
		props: {
			["documentsData"]: {
				type: Array,
				default: () => []
			},
			vendorId: {
				type: String
			}
		},
		data() {
			return {
				fields: [
					{
						label: "File Name",
						headerKey: "headerFileName",
						key: "fileName",
						width: "64%",
						padding: "0"
					},
					{
						label: "Category",
						headerKey: "headerCategory",
						key: "category",
						width: "18%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "18%",
						padding: "0"
					}
				],
				categories: [ "NDA", "Contract", "Resume" ],
				currentCategory: "",
				currentFile: "",

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				isTableDropMenu: true,
				currentActive: -1,
				domain: "http://localhost:3001"
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeDocuments: "storeCurrentVendorDocuments",
				deleteDocument: "deleteCurrentVendorDocument",
				storeDocumentsDefault: "storeCurrentVendorDocumentsDefault"
			}),

			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index)
						break
					case "cancel":
						this.manageCancelEdition(index)
						break
					case "delete":
						this.manageDeleteClick(index)
						break
					default:
						await this.checkErrors(index)
				}
			},
			setEditingData(index) {
				this.currentActive = index
				this.currentCategory = this.documentsData[index].category
			},
			manageCancelEdition(index) {
				if (!this.documentsData[index].path) {
					this.documentsData.pop()
				}
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
				this.isDeleting = false
				this.currentCategory = ""
				this.currentFile = ""
			},
			addData() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.documentsData.push({
					category: "",
					fileName: "",
					path: ""
				})
				this.setEditingData(this.documentsData.length - 1)
			},
			uploadDocument() {
				this.currentFile = this.$refs.file.files[0]
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				const doc = this.documentsData[index]
				this.errors = []
				if (this.documentsData.map(doc => doc.fileName).includes(this.currentFile.name)) {
					this.errors.push("Cannot create document with same file name!")
				}
				if (!this.currentCategory)
					this.errors.push("Category should not be empty!")
				if ((!doc.path && !this.currentFile) || (doc.fileName === "" && !this.currentFile))
					this.errors.push("Upload a file to save!")
				if (this.isSameExist(index))
					this.errors.push(
							"There is a duplication of the file for chosen category!"
					)
				if (this.errors.length) {
					this.areErrors = true
					return
				} else {
					await this.manageSaveClick(index)
				}
			},
			scrollDrop(index) {
				let fillingCategory = this.documentsData.filter(function (item) {
					return item.fileName !== ""
				})

				this.categories = [ ...new Set(fillingCategory.map(item => item.category)) ]

				const { category } = this.documentsData[index]
				let countCategories = this.documentsData.filter(
						item => item.category == category
				)
				if (countCategories.length <= 1 && this.documentsData.length == 3) {
					this.errors = []
					this.errors.push("Сannot update category!")
					this.areErrors = true
				} else {
					false
				}
			},
			isSameExist(index) {
				const { fileName, category } = this.documentsData[index]
				const isSame = this.documentsData.find((item, i) => {
					return (
							item.fileName === fileName &&
							i !== index &&
							item.category === category
					)
				})
				return !!isSame
			},
			async manageSaveClick(index) {
				let formData = new FormData()
				formData.append("vendorId", this.vendorId)
				formData.append("category", this.currentCategory)
				formData.append("documentFile", this.currentFile)

				if (this.documentsData[index].path) {
					const { fileName, path, category } = this.documentsData[index]
					formData.append("oldCategory", category)
					formData.append("oldName", fileName)
					if (category === this.currentCategory) {
						formData.append("oldFilePath", path)
					}
				}
				try {
					const result = await this.storeDocuments(formData)
					this.alertToggle({
						message: "Document saved",
						isShow: true,
						type: "success"
					})
				} catch (err) {
				} finally {
					// this.$emit("refreshDocuments")
					this.setDefaults()
				}
			},
			async manageDeleteClick(index) {
				if (!this.documentsData[index].path) {
					this.documentsData.pop()
					return this.setDefaults()
				}
				if (this.checkDelete(index)) {
					this.deleteIndex = index
					this.isDeleting = true
				} else {
					this.errors = []
					this.errors.push("Сannot delete category!")
					this.areErrors = true
					return
				}
			},
			checkDelete(index) {
				const { category } = this.documentsData[index]
				let countCategories = this.documentsData.filter(
						item => item.category == category
				)
				return countCategories.length > 1 ? true : false
			},
			async deleteData() {
				const docFile = this.documentsData[this.deleteIndex]
				try {
					await this.deleteDocument({ docFile, vendorId: this.vendorId })
					this.alertToggle({
						message: "Document removed",
						isShow: true,
						type: "success"
					})
				} catch (err) {
				} finally {
					// this.$emit("refreshDocuments")
					this.setDefaults()
				}
			},
			closeErrors() {
				this.areErrors = false
			},
			setCategory({ option }) {
				this.currentCategory = this.categories.find(item => item === option)
			},
			async setDocumentsDefaults(category) {
				let defaultDocument = { vendorId: this.vendorId, category: category }
				try {
					const result = await this.storeDocumentsDefault(defaultDocument)
				} catch (err) {
				} finally {
					// this.$emit("refreshDocuments")
					this.setDefaults()
				}
			}
		},
		components: {
			SettingsTable,
			SelectSingle,
			Add
		},
		async created() {
			const vendor = await this.$http.get(
					`/vendorsapi/vendor?id=${ this.$route.params.id }`
			)
			if (vendor.data.documents.length == 0) {
				await this.setDocumentsDefaults("NDA")
				await this.setDocumentsDefaults("Contract")
				await this.setDocumentsDefaults("Resume")
			}
		},
		mounted() {
			this.domain = __WEBPACK__API_URL__
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .documents {
    @extend %setting-table;
    padding: 20px;
    border-radius: 4px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;

    &__upload {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-position: center;
      background-repeat: no-repeat;
      height: 30px;
      width: 18px;
      overflow: hidden;
      margin-right: 8px;
    }

    &__load-file {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      cursor: pointer;
      font-size: 0;
    }

    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      @extend %table-text-input;
    }

    &__input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
      height: 30px;
      justify-content: flex-end;
    }

    &__icon {
      @extend %table-icon;
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;

      &-half {
        opacity: 0.5;
      }
    }
  }
  a{
    color: #D15F45;
  }
</style>