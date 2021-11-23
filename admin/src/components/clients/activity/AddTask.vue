<template lang="pug">
  .clientTask
    ValidationErrors(v-if="areErrors", :errors="errors", @closeErrors="closeErrors")
    .clientTask__body
      .clientTask__close(@click="closeModal") &#215;
      .clientTask__input
        .group
          input(type='text' v-model="clientTask.title" required)
          span.highlight
          span.bar
          label Task Title

      .clientTask__content
        ckeditor(
          v-model="clientTask.details"
          :config="editorConfig"
        )

      .clientTask__setting
        .setting__item
          label Due Date & Time:
            span.mandatory *
          input(type="text" readonly v-model="clientTask.dateTime")
          span.date(v-click-outside="closePicker")
            i.far.fa-calendar-alt(@click="isDatePicker = true")
            .datepicker(v-if="isDatePicker")
              Datepicker(
                :value="clientTask.dateTime"
                @selected="(e) => setDate(e)"
                :inline="true"
                :monday-first="true"
              )
        .setting__item
          label Priority:
          .setting__drop
            SelectSingle(
              placeholder="Select"
              :selectedOption="clientTask.priority"
              :options="['Regular','High']"
              @chooseOption="setPriority"
            )
        .setting__item
          label Assigned to:
          .setting__drop
            SelectSingle(
              placeholder="Select"
              :selectedOption="clientTask.assignedTo.hasOwnProperty('firstName') ? `${clientTask.assignedTo.firstName} ${clientTask.assignedTo.lastName}` : ''"
              :options="AMsPMs.map(({firstName, lastName}) => `${firstName} ${lastName}`)"
              @chooseOption="setAssignedUser"
            )
        .setting__item
          label Associated With:
          .setting__drop
            SelectMulti(
              placeholder="Select"
              :selectedOptions="clientTask.associatedTo.length ? clientTask.associatedTo.map(({firstName, surname}) => `${firstName} ${surname}`) : []"
              :options="clientContacts.map(({firstName, surname}) => `${firstName} ${surname}`)"
              @chooseOptions="setAssociatedTo"
            )

      .clientTask__button
        Button(value="Save" @clicked="checkCreateUpdateTasks" :color="'#48A6A6'")
</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import Datepicker from "../../DatepickerWithTime"
	import moment from "moment"
	import SelectSingle from "../../SelectSingle"
	import { mapActions, mapGetters } from "vuex"
	import SelectMulti from "../../SelectMulti"
	import Button from "../../Button"
	import ValidationErrors from "../../ValidationErrors"
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			clientTask: {
				type: Object
			}
		},
		data() {
			return {
				areErrors: false,
				errors: [],

				isDatePicker: false,
				editorConfig: {
					allowedContent: true,
					uiColor: "#ffffff",
					height: 200
				}
			}
		},
		methods: {
			...mapActions({
				setUpClientProp: 'setUpClientProp',
				alertToggle: "alertToggle"
			}),
			closePicker() {
				this.isDatePicker = false
			},
			closeErrors() {
				this.errors = []
				this.areErrors = false
			},
			checkCreateUpdateTasks() {
				this.errors = []
				const taskDate = new Date(this.clientTask.dateTime).getTime()
				const timeNow = new Date().getTime()

				if (taskDate < timeNow) this.errors.push('The date should be future')
				if (!this.clientTask.title) this.errors.push('Please, enter title')
				if (!this.clientTask.details) this.errors.push('Please, enter details')
				if (!this.clientTask.dateTime) this.errors.push('Please, enter dateTime')
				if (!this.clientTask.assignedTo.hasOwnProperty('firstName')) {
					this.clientTask.assignedTo = this.user
				}
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				this.createUpdateTask()
			},
			async createUpdateTask() {
				const { _id, priority, title, dateTime, details, assignedTo, associatedTo, stage } = this.clientTask

				const data = {
					priority,
					title,
					dateTime,
					details,
					assignedTo,
					associatedTo,
					client: this.$route.params.id
				}
				let tasks = null
				try {
					if (stage === 'update') {
						tasks = await this.$http.post(`/clientsapi/activity/task/${ _id }`, { data })
					} else {
						tasks = await this.$http.post(`/clientsapi/activity/task`, { data })
					}
					this.setUpClientProp({ key: "tasks", value: tasks.data })
					this.closeModal()
					this.alertToggle({message: "Task created", isShow: true, type: "success"});
				} catch (e) {
					this.alertToggle({message: "Error on Task creating", isShow: true, type: "error"});
				}
			},
			setAssociatedTo({ option }) {
				const position = this.clientTask.associatedTo
						.map(item => `${ item.firstName } ${ item.surname }`)
						.indexOf(option)

				position !== -1 ?
						this.clientTask.associatedTo.splice(position, 1) :
						this.clientTask.associatedTo.push(this.clientContacts.find(item => `${ item.firstName } ${ item.surname }` === option))
			},
			setAssignedUser({ option }) {
				this.clientTask.assignedTo = this.AMsPMs.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
			},
			setPriority({ option }) {
				this.clientTask.priority = option
			},
			setDate(e) {
				// this.clientTask.dateTime = moment(new Date(e)).format('DD-MM-YYYY, HH:mm')
				this.clientTask.dateTime = new Date(e)
				this.closePicker()
			},
			closeModal() {
				this.$emit('close')
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				user: "getUser",
				users: "getUsers"
			}),
			AMsPMs() {
				return this.users.filter(({ group }) => group.name === "Account Managers" || group.name === "Project Managers")
			},
			clientContacts() {
				return this.currentClient.contacts
			}
		},
		components: {
			ValidationErrors,
			Button,
			SelectMulti,
			SelectSingle,
			ckeditor: CKEditor.component,
			Datepicker
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>
 @import "../../../assets/scss/colors";
  .setting {
    &__drop {
      position: relative;
      width: 220px;
      height: 30px;
    }

    &__item {
      position: relative;
      position: relative;
      height: 30px;
      width: 320px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .fa-calendar-alt {
        color: #938676;
        font-size: 19px;
      }

      input {
        font-size: 14px;
        color: #66563d;
        border: 1px solid #c1bbb1;
        border-radius: 4px;
        box-sizing: border-box;
        padding: 0 5px;
        outline: none;
        width: 220px;
        height: 30px;
      }
    }
  }

  .clientTask {
    background: white;
    padding: 35px 20px 20px 20px;
    box-shadow: $box-shadow;
    width: 780px;
    position: relative;

    &__close {
      position: absolute;
      top: 5px;
      right: 7px;
      font-size: 19px;
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

    &__button {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    &__setting {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    &__content {
      margin: 20px 0;
      overflow-y: auto;
      max-height: 500px;
    }

    &__input {
      .group {
        position: relative;
      }

      input {
        font-size: 18px;
        padding: 10px 0px 10px 0px;
        display: block;
        width: 100%;
        border: none;
        border-bottom: 2px solid #e8e8e8;
        color: $text;
      }

      input:focus {
        outline: none;
      }

      label {
        font-size: 18px;
        font-weight: normal;
        position: absolute;
        pointer-events: none;
        left: 0;
        top: 10px;
        transition: 0.2s ease all;
        -moz-transition: 0.2s ease all;
        -webkit-transition: 0.2s ease all;
      }

      input:focus ~ label, input:valid ~ label {
        top: -15px;
        font-size: 14px;
        /*color: #48A6A6;*/
      }


      .bar {
        position: relative;
        display: block;
        width: auto;
      }

      .bar:before, .bar:after {
        content: '';
        height: 2px;
        width: 0;
        bottom: 1px;
        position: absolute;
        background: #48A6A6;
        transition: 0.2s ease all;
        -moz-transition: 0.2s ease all;
        -webkit-transition: 0.2s ease all;
      }

      .bar:before {
        left: 50%;
      }

      .bar:after {
        right: 50%;
      }

      input:focus ~ .bar:before, input:focus ~ .bar:after {
        width: 50%;
      }

      input:focus ~ .highlight {
        -webkit-animation: inputHighlighter 0.3s ease;
        -moz-animation: inputHighlighter 0.3s ease;
        animation: inputHighlighter 0.3s ease;
      }

      @-webkit-keyframes inputHighlighter {
        from {
          background: #48A6A6;
        }
        to {
          width: 0;
          background: transparent;
        }
      }
      @-moz-keyframes inputHighlighter {
        from {
          background: #48A6A6;
        }
        to {
          width: 0;
          background: transparent;
        }
      }
      @keyframes inputHighlighter {
        from {
          background: #48A6A6;
        }
        to {
          width: 0;
          background: transparent;
        }
      }
    }
  }

  .datepicker {
    position: absolute;
    left: 32px;
    margin-top: -220px;
    z-index: 60;
  }

  .mandatory {
    color: red;
    margin-left: 2px;
  }

  .date {
    cursor: pointer;
    position: absolute;
    right: 5px;
  }
</style>
