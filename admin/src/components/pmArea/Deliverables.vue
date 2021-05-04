<template lang="pug">
  .deliverables
    .deliverables__approveModal(v-if="isDeleteModal")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="deleteDR2"
        @notApprove="closeDeleteModal"
        @close="closeDeleteModal"
      )

    .deliverables__DR2(v-if="isDR2Modal")
      DeliveryTwo(:user="user" :users="users" :project="currentProject" :id="currentReviewId" :type="currentReviewType" @close="closeDR2")
    .deliverables__modal(v-if="deliverablesModal")
      .deliverables__titleModal Upload Deliverables
      span.deliverables__close-modal(@click="closeDeliverablesModal") &#215;
      .deliverables__body
        .deliverables_items

          .deliverables__items
            .deliverables__item
              .deliverables__uploadItem
                //span Upload File:
                //span.tasks-files__label-red
                .deliverables__selectTitle Upload File:
                .tasks-files__upload-file
                  FilesUpload(
                    :isMulti="false"
                    buttonValue="Upload deliverables"
                    inputClass="files-upload__ref-file"
                    :files="refFiles"
                    @uploadFiles="uploadRefFiles"
                    @deleteFile="deleteFile()"
                  )
              .tasks-files__fileItem
                .deliverable__wrapper
                  .file-list__items(v-for="(file) in refFiles")
                    .file-list__item
                      .file-list__name {{file.name}}
                      span.file-list__delete(@click="deleteFile()") &#x2715
            div
              .deliverables__selectTitle Assign to task:
              .deliverables__select
                SelectMulti(
                  placeholder="Select"
                  :options="selectTaskInfo"
                  :selectedOptions="selectedTasks"
                  @chooseOptions="selectedTasksMethod"
                )

        .tasks-files__button
          Button(:value="'Upload'" @clicked="uploadFiles" :isDisabled="!checkMultiReview")
        .tasks-files__tooltip File can be <= 50Mb (otherwise it will not be loaded)

    .deliverables__title Deliverables
    .deliverables-table
    DataTable(
      :fields="fields"
      :tableData="deliverables"
      :bodyClass="['review-body', {'tbody_visible-overflow': deliverables.length < 6}]"
      :tableheadRowClass="deliverables.length < 6 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
    )
      .deliverables-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}

      .deliverables-table__data(slot="pair" slot-scope="{ row }") {{ row.pair }}
      .deliverables-table__data(slot="file" slot-scope="{ row }") {{ row.files.length }}
      .deliverables-table__data(slot="task" slot-scope="{ row }") {{ getTasksId(row) }}
      .deliverables-table__data(slot="action" slot-scope="{ row, index }")
        .i-table__icons(slot="icons" slot-scope="{ row, index }")
          img.i-table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'i-table_opacity': isActive(key, index)}")

        .deliverables-table__icons
            img.deliverables-table__icon(
              v-for="(icon, key) in getIcons(row)"
              :src="icon.src"
              @click="dr2Action(row, key)")
    Add(@add="showModal")
</template>

<script>
import DataTable from "../DataTable";
import Add from "../Add";
import Button from "../Button";
import FilesUpload from "./tasks-n-steps/tasksFiles/FilesUpload"
import {mapGetters,mapActions} from "vuex"
import SelectMulti from "../SelectMulti";
import DeliveryTwo from "./tasks-n-steps/DeliveryTwo";
import ApproveModal from "../ApproveModal";

export default {
  data() {
    return {
      fields: [
        { label: "Language pair", headerKey: "headerPair", key: "pair", width: "30%", padding: 0 },
        { label: "# Files", headerKey: "headerFile", key: "file", width: "30%", padding: 0 },
        { label: "Task Id", headerKey: "headerTask", key: "task", width: "30%", padding: 0 },
        { label: "Delivery", headerKey: "headerAction", key: "action", width: "10%", padding: 0 },
      ],
      deliverablesModal: false,
      refFilesForDelete: [],
      refFiles: [],
      selectedTasks: [],
      isTableDropMenu: true,
      isDR2Modal: false,
      isDeleteModal: false,
      currentReviewId: null,
      currentReviewType: null,
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeProject: "setCurrentProject",
    }),
    closeDeleteModal() {
      this.refFiles = []
      this.selectedTasks = []
      this.isDeleteModal = false
      this.currentReviewId = null
    },
    async deleteDR2() {
      try {
        const result = await this.$http.post('/delivery/multi-file-dr2-remove', {projectId: this.currentProject._id, dr2Id: this.currentReviewId})
        this.storeProject(result.data)

        this.closeDeleteModal()
        this.alertToggle({ message: "Review deleted", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.closeDeliverablesModal()
      }
    },
    getIcons({type}) {
      const icons =  {
        dr2: {src: require("../../assets/images/delivery-review-icon.png") },
      }
      if (type === 'multi') {
        icons.delete = {src: require("../../assets/images/latest-version/delete-icon.png")}
      }

      return icons
    },
    dr2Action({_id, type}, key) {
      this.currentReviewId = _id

      switch (key) {
        case "delete":
          this.isDeleteModal = true
          break;

        case "dr2":
          this.currentReviewType = type
          this.isDR2Modal = true
          break;

      }

    },
    closeDR2() {
      this.currentReviewId = this.currentReviewType  = null
      this.isDR2Modal = false
    },
    getLangPair(row, type) {
      const source = this.allLang.find(({_id}) => row.sourceLanguage.toString() === _id.toString())
      const target = this.allLang.find(({_id}) => row.targetLanguage.toString() === _id.toString())
      return source[type] + " >> " + target[type]
    },
    getTasksId(row) {
      const mySet = new Set(row.tasks.map((field) => field.substring(field.length - 3) ))
      return [...mySet].join(', ')
    },
    showModal() {
      this.deliverablesModal = true
    },
    closeDeliverablesModal() {
      this.deliverablesModal = false
    },
    async uploadFiles() {
      let filesData = new FormData()
      filesData.append('projectId', this.currentProject._id)
      filesData.append('taskIds', JSON.stringify(this.selectedTasks))
      try {
          filesData.append('refFiles', this.refFiles[0])

        const result = await this.$http.post('/delivery/multi-file-dr2-push', filesData)
        this.storeProject(result.data)

        this.refFiles = []
        this.selectedTasks = []
        this.alertToggle({ message: "Files saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.closeDeliverablesModal()
      }
    },
    uploadRefFiles({ files }) {
      const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 50)
      if (filteredFiles.length) {
          this.refFiles = [files[0]]
      }
      if (!filteredFiles.length) {
        this.clearInputFiles(".files-upload__ref-file")
      }
    },
    deleteFile() {
      this.refFiles = []
    },
    selectedTasksMethod({ option }) {
      const position = this.selectedTasks.indexOf(option);
      if(position !== -1) {
        this.selectedTasks.splice(position, 1);
      } else {
        this.selectedTasks.push(option);
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      allLang: 'getAllLanguages',
      users: 'getUsers',
      user: 'getUser',
    }),
    checkMultiReview() {
      return this.refFiles.length > 0 && this.selectedTasks.length > 0
    },
    deliverables(){
      if(!this.currentProject.hasOwnProperty('tasksDR2')) return []

      const { tasksDR2 } = this.currentProject

      const singleLang = tasksDR2.hasOwnProperty('singleLang') ?
        tasksDR2.singleLang.map(item => {
        return {
          _id: item._id,
          type: 'single',
          tasks: item.files.map(item => item.taskId),
          pair: this.getLangPair(item, 'lang'),
          files: item.files
        }
      }) : []

      const multiLang = tasksDR2.hasOwnProperty('multiLang') ?
        tasksDR2.multiLang.map(item => {
        return {
          _id: item._id,
          type: 'multi',
          tasks: item.tasks,
          pair: 'Multilingual',
          files: [item.file]
        }
      }) : []
      return [ ...singleLang, ...multiLang ]
    },
    selectTaskInfo() {
      if(!this.currentProject || !this.currentProject.tasksDR2 || !this.currentProject.tasksDR2.singleLang) return []
      let result = new Set()
      for(let test of this.currentProject.tasksDR2.singleLang) {
        const langPair = this.getLangPair(test, 'symbol')
          for(let file of test.files) {
            result.add(`${file.taskId}`)
          }
      }
      console.log([...result])
      return Array.from(result)
    }
  },
  components: {
    ApproveModal,
    DeliveryTwo,
    SelectMulti,
    DataTable,
    Add,
    Button,
    FilesUpload
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.deliverables {
  box-sizing: border-box;
  min-width: 1000px;
  width: 1000px;
  padding: 20px;
  margin: 0 40px;
  margin-top: 40px;
  box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  position: relative;

  &__items{
    display: flex;
  }

  &__selectTitle{
    margin-bottom: 4px;
  }

  &__approveModal{
    position: absolute;
    z-index: 5555;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__uploadItem{
    //display: flex;
    //align-items: center;
    //justify-content: center;
  }

  &__item {
    margin-right: 40px;
  }

  &__DR2 {
    position: absolute;
    top: -230px;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    padding-bottom: 150px;
  }

  &__titleModal{
    font-size: 22px;
    margin-bottom: 20px;
    text-align: center;
    font-family: Myriad600;
  }
  &__title{
    font-size: 22px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 191px;
  }

  &-table {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;


    &__approveModal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__actions {
      display: flex;
      justify-content: space-between;
    }

    &__action {
      position: relative;
      width: 191px;
      height: 30px;
      align-self: flex-end;
      margin-bottom: 20px;
    }

    &__data {
      height: 30px;
      box-sizing: border-box;
      padding-left: 7px;
      display: flex;
      align-items: center;
    }

    &__check-cell {
      display: flex;
      justify-content: center;
      padding-left: 0;
    }

    &__icons {
      width: 100%;
      padding: 0 10px 0 0;
      box-sizing: border-box;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
      max-width: 18px;
    }

    &__check-icon {
      font-size: 18px;
      color: $light-brown;
      cursor: pointer;
      transition: ease 0.1s;
    }

    &__file-icon {
      margin-right: 7px;
      color: #938676;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-repeat: no-repeat;
      background-position-y: center;
      width: 20px;
      height: 21px;
      overflow: hidden;

      input[type=file],
      input[type=file]::-webkit-file-upload-button {
        cursor: pointer;
      }
    }

    &_no-back {
      background: none;
      width: 30px;
      height: 30px;
    }

    &__file-input {
      padding-left: 0;
      padding-right: 0;
      width: 40px;
      height: 30px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: -5px;
      cursor: pointer;
      font-size: 0;
    }

    &_green {
      color: $green-approve;
      transform: rotateY(360deg);
    }

    &_opacity-04 {
      opacity: 0.4;
      cursor: default;

      input[type=file],
      input[type=file]::-webkit-file-upload-button {
        cursor: default;
      }
    }
  }
  &__modal {
    padding: 20px;
    background: white;
    position: absolute;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
  }

  &__close-modal {
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

.tasks-files {
  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  &__upload-file {
    display: flex;
    //margin-left: 15px;
  }

  &__button {
    margin-top: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  &__tooltip {
    text-align: center;
    opacity: 0.6;
  }

  &__tooltipManage {
    text-align: center;
    opacity: 0.6;
    margin-top: 20px;
  }

}

.file-list {
  &__items {
    position: relative;
  }

  &__name {
    color: #68573e;
    margin-right: 10px;
  }

  &__item {
    border-radius: 5px;
    border: 1px solid #68573e;
    box-sizing: border-box;
    background-color: #fff;
    font-size: 12px;
    padding: 8px;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-top: 10px;
    font-family: -webkit-pictograph;
  }

  &__delete {
    cursor: pointer;
    transform: 0.2s ease;
    font-size: 14px;

    &:hover {
      font-weight: bold;
      cursor: pointer;
    }
  }
}

</style>
