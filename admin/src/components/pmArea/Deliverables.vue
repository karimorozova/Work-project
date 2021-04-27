<template lang="pug">
  .deliverables
    .deliverables__DR2(v-if="isDR2Modal")
      DeliveryTwo(:user="user" :users="users" :project="currentProject" :index="currentIndex" @close="closeDR2")
    .deliverables__modal(v-if="deliverablesModal")
      .deliverables__title Upload Deliverables
      span.deliverables__close-modal(@click="closeDeliverablesModal") &#215;
      .deliverables__body
        .deliverables__select
          SelectMulti(
            placeholder="Select"
            :options="selectTaskInfo"
            :selectedOptions="selectedTasks"
            @chooseOptions="selectedTasksMethod"
          )
        .deliverables__items
          .deliverables__item
            span Upload deliverables:
            span.tasks-files__label-red
            .tasks-files__upload-file
              FilesUpload(
                buttonValue="Upload deliverables"
                inputClass="files-upload__ref-file"
                :files="refFiles"
                @uploadFiles="uploadRefFiles"
                @deleteFile="(e) => deleteFile(e, 'refFiles')"
              )
          .tasks-files__fileItem
            .deliverable__wrapper
              .file-list__items(v-for="(file, index) in refFiles")
                .file-list__item
                  .file-list__name {{file.name}}
                  span.file-list__delete(@click="deleteFile(index)") &#x2715

          .tasks-files__button(v-if="refFiles.length")
            Button(:value="'Upload'" @clicked="uploadFiles")
          .tasks-files__tooltip Each file can be <= 50Mb
          .tasks-files__tooltip (otherwise it will not be loaded)

    .deliverables__title Deliverables
    .deliverables-table
    DataTable(
      :fields="fields"
      :tableData="currentProject.tasksDR2.singleLang"
      :bodyClass="['review-body', {'tbody_visible-overflow': currentProject.tasksDR2.singleLang.length < 6}]"
      :tableheadRowClass="currentProject.tasksDR2.singleLang.length < 6 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
    )
      .deliverables-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}

      .deliverables-table__data(slot="pair" slot-scope="{ row }") {{ getLangPair(row, 'lang') }}
      .deliverables-table__data(slot="file" slot-scope="{ row }") {{ row.files.length }}
      .deliverables-table__data(slot="task" slot-scope="{ row }") {{ getTasksId(row) }}
      .deliverables-table__data(slot="action" slot-scope="{ row, index }")
        .deliverables-table__icons
            img.deliverables-table__icon(
              :src="icon.src"
              @click="openDR2(index)")
    Add(@add="showModal")
</template>

<script>
import DataTable from "../DataTable";
import Add from "../Add";
import Button from "../Button";
import FilesUpload from "./tasks-n-steps/tasksFiles/FilesUpload"
import { mapGetters } from "vuex"
import SelectMulti from "../SelectMulti";
import DeliveryTwo from "./tasks-n-steps/DeliveryTwo";
export default {
  data() {
    return {
      fields: [
        { label: "Language pair", headerKey: "headerPair", key: "pair", width: "30%", padding: 0 },
        { label: "# Files", headerKey: "headerFile", key: "file", width: "30%", padding: 0 },
        { label: "Task Id", headerKey: "headerTask", key: "task", width: "30%", padding: 0 },
        { label: "Delivery", headerKey: "headerAction", key: "action", width: "10%", padding: 0 },
      ],
      icon: { src: require("../../assets/images/delivery-review-icon.png") },
      deliverablesModal: false,
      refFilesForDelete: [],
      refFiles: [],
      selectedTasks: [],
      isTableDropMenu: true,
      isDR2Modal: false,
      currentIndex: null,
    }
  },
  methods: {
    openDR2(index) {
      this.currentIndex = index
      this.isDR2Modal = true
    },
    closeDR2() {
      this.currentIndex = null
      this.isDR2Modal = false
    },
    getLangPair(row, type) {
      const source = this.allLang.find(({_id}) => row.sourceLanguage.toString() === _id.toString())
      const target = this.allLang.find(({_id}) => row.targetLanguage.toString() === _id.toString())
      return source[type] + " >> " + target[type]
    },
    getTasksId(row) {
      const mySet = new Set(row.files.map(({taskId}) => taskId.substring(taskId.length - 3) ))
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
      const checkedTasks = this.currentProject.tasks.filter(item => item.isChecked)
      filesData.append('checkedTasks', JSON.stringify(checkedTasks))
      try {
        if (this.refFiles.length) {
          for (let file of this.refFiles) {
            filesData.append('refFiles', file)
          }
        }
        // const result = await this.$http.post('/pm-manage/upload-reference-files', filesData)
        this.storeProject(result.data)
        this.alertToggle({ message: "Files saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.closeFileModal()
      }
    },
    uploadRefFiles({ files }) {
      const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 50)
      if (filteredFiles.length) {
        for (let file of files) {
          if (!this.refFiles.find(item => item.name === file.name)) this.refFiles.push(file)
        }
      }
      if (!filteredFiles.length) {
        this.clearInputFiles(".files-upload__ref-file")
      }
    },
    deleteFile(index) {
      this.refFiles.splice(index, 1)
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
      padding: 0 10px;
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
    padding: 20px 40px;
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
    margin-left: 15px;
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
