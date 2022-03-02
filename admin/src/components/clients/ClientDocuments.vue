<template lang="pug">
  .documents
    .documents__table
      GeneralTable(
        :fields="fields"
        :tableData="documentsData"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteData"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .documents__head-title {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          .documents__data(v-if="currentActive === index && currentFile")
            span.documents__input {{ currentFile.name }}
          .documents__data(v-else)
            span(v-if="row.fileName")
              a(:href="domain + row.path" ) {{ row.fileName }}
            span(style="opacity: 0.6" v-else) No file...

        template(slot="category" slot-scope="{ row, index }")
          .documents__data {{row.category}}

        template(slot="icons" slot-scope="{ row, index }")
          .documents__icons
            img.documents__icon(v-if="!row.fileName && index <= 2" :style="{cursor: 'default'}" :class="'documents_opacity'" src="../../assets/images/red-info-icon.png")
            img.documents__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'documents_opacity': isActive(key, index)}")
            .documents__upload(v-if="currentActive === index")
              input.documents__load-file(type="file" id="file" ref="file" @change="uploadDocument(index)")
            .documents__upload(v-if="currentActive !== index" :class="'documents_opacity-half'")
              input.documents__load-file(type="file" disabled="disabled")


</template>
<script>
	import SettingsTable from "../Table/SettingsTable"
	import SelectSingle from "../SelectSingle"
	import Add from "../Add"
	import crudIcons from "@/mixins/crudIcons"
	import { mapGetters, mapActions } from "vuex"
	import GeneralTable from "../GeneralTable"

	export default {
		mixins: [ crudIcons ],
		props: {
			documentsData: {
				type: Array
			}
		},
		data() {
			return {
				fields: [
					{
						label: "File Name",
						headerKey: "headerFileName",
						key: "fileName",
						style: { width: "60%" }
					},
					{
						label: "Category",
						headerKey: "headerCategory",
						key: "category",
						style: { width: "20%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "20%" }
					}
				],
				currentCategory: "",
				currentFile: "",

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				isTableDropMenu: true,
				currentActive: -1,
				domain: this.$domains.admin,

				defaultDocuments: [
					{ fileName: "", path: "", category: "NDA" },
					{ fileName: "", path: "", category: "Contract" }
				]
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				setUpClientProp: "setUpClientProp"
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
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
				this.isDeleting = false
				this.currentCategory = ""
				this.currentFile = ""
			},
			uploadDocument() {
				this.currentFile = this.$refs.file.files[0]
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				const doc = this.documentsData[index]
				this.errors = []
				if (!this.currentCategory)
					this.errors.push("Category should not be empty!")
				if ((!doc.path && !this.currentFile) || (doc.fileName === "" && !this.currentFile))
					this.errors.push("Upload a file to save!")
				if (this.currentFile.size > 40000000) {
					this.errors.push("The file should not exceed 40 MB!")
				}
				if (this.errors.length) {
					this.areErrors = true
				} else {
					await this.manageSaveClick(index)
				}
			},

			async manageSaveClick(index) {
				let formData = new FormData()
				formData.append("clientId", this.currentClient._id)
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
					await this.$http.post("/clientsapi/client-document", formData)
					this.alertToggle({ message: "Document saved", isShow: true, type: "success" })
				} catch (err) {
				} finally {
					this.refreshDocuments()
				}
			},
			async manageDeleteClick(index) {
				if (!this.documentsData[index].path) {
					return this.setDefaults()
				}

				this.deleteIndex = index
				this.isDeleting = true
			},
			async deleteData() {
				const docFile = this.documentsData[this.deleteIndex]
				try {
					await this.$http.post("/clientsapi/remove-client-doc", { docFile, clientId: this.$route.params.id })
					this.alertToggle({ message: "Document removed", isShow: true, type: "success" })
				} catch (err) {
				} finally {
					this.refreshDocuments()
				}
			},
			closeErrors() {
				this.areErrors = false
			},
			async refreshDocuments() {
				const client = await this.$http.get(`/clientsapi/client?id=${ this.$route.params.id }`)
				this.setUpClientProp({ _id: this.$route.params.id, key: 'documents', value: client.data.documents })
				this.setDefaults()
			}

		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			})
		},
		components: {
			GeneralTable,
			SettingsTable,
			SelectSingle,
			Add
		},
		mounted() {
			this.domain = this.$domains.admin
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  a {
    color: $text;
  }

  .documents {
    &__head-title {
      padding: 0 7px;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/latest-version/upload-file.png");
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
      display: flex;
      width: 100%;
      gap: 1px;
      justify-content: center;
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
</style>