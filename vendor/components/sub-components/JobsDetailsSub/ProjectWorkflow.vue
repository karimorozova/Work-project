<template lang="pug">
  .wrapper

    .files(v-if="job.status === 'Ready to Start' || job.status === 'In progress'" )
      ProjectFiles(
        :job="job"
      )

    .block(v-if="job.status === 'In progress' && !isCAT" )
      .upload__text
        .upload__text-title(v-if="!targetFiles.length")
          span
            i(class="fa-solid fa-cloud-arrow-up")
          span Choose files to Upload or Drag and Drop here
        .upload__text-files(v-else) {{ filesNames() }}
      .upload-area
        input.upload-area__input(type="file" @change="setDeliverables" :disabled="isWithoutFile" :class="{'no-drop-cursor': isWithoutFile}" multiple)
      .upload__withoutFiles
        CheckBox(
          :isDisabled="!!targetFiles.length"
          :isChecked="isWithoutFile"
          @check="(e) => toggleFile(true)"
          @uncheck="(e) => toggleFile(false)"
        )
        .upload__withoutFiles-text Close without files

    .block(v-if="job.status === 'In progress' && !isCAT && (targetFiles.length || isWithoutFile)" style="margin-top: 15px;")
      .action-buttons
        Button(value="Complete Job" :isDisabled="!!currentRequests" @clicked="completeJob()" )

    .block(v-if="job.status === 'In progress' && isCAT && abilityToCompleteCAT" style="margin-top: 15px;")
      .action-buttons
        Button(value="Complete Job" :isDisabled="!!currentRequests" @clicked="completeJob()" )


    .block(v-if="job.status === 'Request Sent'" )
      .action-buttons
        Button(value="Approve" :isDisabled="!!currentRequests" @clicked="quoteAction('Approved')" )
        Button(value="Reject" :isDisabled="!!currentRequests" @clicked="quoteAction('Rejected')" :outline="true")

    .block(v-if="job.status === 'Ready to Start'" )
      .action-buttons
        Button(value="Start Job" :isDisabled="!!currentRequests" @clicked="startJob()" )

    .alert(v-if="emailAlert")
      span.closebtn(@click="closeEmailAlert") &times;
      |  Credentials from MemoQ account have been sent to your Email.

</template>

<script>
import Button from "../../general/Button"
import { mapActions, mapGetters } from "vuex"
import ProjectFiles from "./ProjectFiles"
import CheckBox from "../../general/CheckBox"

export default {
  name: "ProjectWorkflow",
  components: { CheckBox, ProjectFiles, Button },
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      emailAlert: false,
      targetFiles: [],
      isWithoutFile: false,
      wrongFilesFormat: [ 'exe', 'js' ]
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    quoteAction(status) {
      this.$emit('setJobStatus', { status })
    },
    toggleFile(bool) {
      this.isWithoutFile = bool
    },
    setDeliverables(e) {
      this.targetFiles = Array.from(e.target.files).filter(file =>
          !this.wrongFilesFormat.includes(file.name.split('.').pop().toString())
          && file.size < 50000000
      )
    },
    filesNames() {
      return `${ this.targetFiles.length } file(s) uploaded`
      // return this.targetFiles.reduce((a, c) => {
      //   a = a + c.name + ', '
      //   return a
      // }, '')
    },
    async completeJob() {
      const typeCAT = this.job.payablesUnit.type === 'CAT Wordcount'
      try {
        if (typeCAT) {
          this.$emit('setJobStatus', { status: "Completed", targetFile: undefined })
          await this.$axios.post('/vendor/set-workFlowStatus', { token: this.getToken, stepId: this.job.stepId, stepAction: 'Finish' })
        } else {
          this.$emit('setJobStatus', { status: "Completed", targetFile: this.targetFiles })
        }
        // this.$emit('updateProgress')
        this.targetFiles = []
        this.isWithoutFile = false
      } catch (err) {
        console.log(err)
        this.alertToggle({ message: "Error closing, job. Please inform the project manager!", isShow: true, type: "error" })
      }
    },
    async startJob() {
      // if (!this.job.isVendorRead) alert('Please don\'t forget to confirm that you have read and downloaded all the reference files, by ticking the box')
      // if (!this.job.isVendorRead) return
      const typeCAT = this.job.payablesUnit.type === 'CAT Wordcount'
      try {
        if (typeCAT) {
          const { guid, memoqUserName, email } = this.vendor
          const memoqUsers = await this.$axios.get(`vendor/get-memoq-users?token=${ this.getToken }`)
          const memoqData = JSON.parse(window.atob(memoqUsers.data))
          const [ mqGuids, mqEmails, mqUserNames ] = [ memoqData.map(({ id }) => id), memoqData.map(({ email }) => email), memoqData.map(({ userName }) => userName) ]
          const [ isGuidInclude, isEmailInclude, isUserNameInclude ] = [ mqGuids.includes(guid), mqEmails.includes(email), mqUserNames.includes(memoqUserName) ]

          if (
              (!guid && !memoqUserName && !isEmailInclude && !isUserNameInclude)
              || (!isGuidInclude && !isEmailInclude && !isUserNameInclude)
          ) {
            console.log(1)
            await this.createMemoqTranslator()
          } else if (!guid && (isEmailInclude || isUserNameInclude)) {
            console.log(2)
            await this.rewriteGuidAndUserName(memoqData)
          } else if (!memoqUserName && isGuidInclude) {
            console.log(3)
            await this.rewriteGuidAndUserName(memoqData)
          }

          await this.assignMemoqVendor()
        }

        this.$emit('setJobStatus', { status: "In progress" })
      } catch (err) {
        console.log(err)
        this.alertToggle({ message: "Error in creating, assigning Vendor in MemoQ or guid recovering!", isShow: true, type: "error" })
      }
    },
    async assignMemoqVendor() {
      await this.$axios.post('/vendor/assign-translator', {
        token: this.token,
        stepId: this.job.stepId,
        projectId: this.job._projectId,
        stepAction: 'Start'
      })
    },
    async createMemoqTranslator() {
      await this.$axios.post(`/vendor/create-memoq-vendor`, { token: this.token })
      this.alertToggle({ message: "Vendor is created in MemoQ", isShow: true, type: "success" })
      this.emailAlert = true
    },
    async rewriteGuidAndUserName(memoqUsers) {
      await this.$axios.post(`/vendor/rewrite-quid-for-translator`, { token: this.token, memoqUsers })
    },
    closeEmailAlert() {
      this.emailAlert = false
    }
  },
  computed: {
    ...mapGetters({
      currentRequests: "getRequestsCount",
      vendor: 'getVendor',
      token: 'getToken'
    }),
    isCAT() {
      return this.job.payablesUnit.type === 'CAT Wordcount'
    },
    abilityToCompleteCAT() {
      if (this.isCAT) {
        const { memoqDocs, step: { title } } = this.job
        const filesSegmentsCompletedStatus = []
        for (const file of memoqDocs) {
          if (title === 'Translation') {
            filesSegmentsCompletedStatus.push(file.TotalSegmentCount === file.ConfirmedSegmentCount)
          }
          if (title === 'Revising') {
            filesSegmentsCompletedStatus.push(file.TotalSegmentCount === file.Reviewer1ConfirmedSegmentCount)
          }
        }
        return filesSegmentsCompletedStatus.length && filesSegmentsCompletedStatus.every(Boolean)
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.upload__withoutFiles {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.upload__text {
  z-index: 10;
  position: absolute;
  color: $dark-border;
  width: 100%;
  text-align: center;

  &-title {
    margin-top: 20px;
  }

  &-files {
    margin-top: 25px;
  }

  .fa-cloud-arrow-up {
    font-size: 20px;
    margin-right: 10px;
  }
}

.upload-area {
  border: 1px dotted $border;
  position: relative;
  z-index: 22;

  &__input {
    width: 100%;
    height: 60px;
    opacity: 0;
    cursor: pointer;
    background-color: chocolate;
  }
}

.block {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  position: relative;
  box-shadow: $box-shadow;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}


.alert {
  padding: 20px;
  background-color: $light-border;
  margin-top: 20px;
}

.closebtn {
  margin-left: 15px;
  color: $dark-border;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.2s ease-in;

  &:hover {
    color: $text;
  }
}

.no-drop-cursor {
  cursor: no-drop !important;
}

</style>