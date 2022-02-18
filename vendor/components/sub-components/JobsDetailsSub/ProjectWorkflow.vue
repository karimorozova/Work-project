<template lang="pug">
  .wrapper(v-if="isShowActionWrapper" )

    .files(v-if="job.status === 'Ready to Start' || job.status === 'In progress'" )
      ProjectFiles(
        :job="job"
      )

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

export default {
  name: "ProjectWorkflow",
  components: { ProjectFiles, Button },
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      emailAlert: false
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    quoteAction(status) {
      this.$emit('setJobStatus', { status })
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
    isShowActionWrapper() {
      return true
      // return this.job.status === 'Request Sent'
      //   || this.job.status === 'Approved'
      //   || this.job.status === 'Rejected'
      //   || this.job.status === 'Request Sent'
      //   || this.job.status === 'Ready to Start'
      //   || this.job.status === 'Ready to Start'
      //   || this.job.status === 'Ready to Start'
      //
      // { $in: [ 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress' ] },
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.block {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
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

</style>