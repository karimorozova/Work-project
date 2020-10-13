<template lang="pug">
  .project
    .project__all-info
      .project__info-row
        input.project__name(type="text" :value="projectName" disabled)
      .project__info-row
        .project__date
          LabelValue(label="Start Date & Time" :isRequired="false" customClass="project_margin")
            input.project__input-text(type="text" :value="formateDate(project.creationTime)" disabled)
          img.project__calendar-icon(src="../../../assets/images/calendar.png")
        .project__date
          LabelValue(label="Deadline" :isRequired="false" customClass="project_margin")
            input.project__input-text(type="text" :value="formateDate(project.deadline)" disabled)
          img.project__calendar-icon(src="../../../assets/images/calendar.png")
        .project__date
          LabelValue(label="Billing Date" :isRequired="false" customClass="project_margin")
            input.project__input-text(type="text" :value="formateDate(project.deadline)" disabled)
          img.project__calendar-icon(src="../../../assets/images/calendar.png")
      .project__info-row
        .project__client(v-if='project.customer')
          LabelValue(label="Client Name" :isRequired="false" customClass="project_margin")
            .tooltip
              span#myTooltip.tooltiptext XTRF: {{ project.client }}
              img(:style="{ cursor: 'help', 'margin-right': '5px' }", src="../../../assets/images/red-info-icon.png")
            .project__input-icons
              i.fa.fa-external-link.icon-link(aria-hidden='true' @click="goToClientInfo(project.customer._id)")
              input.project__input-text2.project__input-client(type="text" :value="project.customer.name" readonly)
        .project__client(v-else)
          LabelValue(label="Client Name" :isRequired="false" customClass="project_margin")
            input.project__input-text(type="text" :value="project.client" disabled)

        .project__industry
          LabelValue(label="Industry" :isRequired="false" customClass="project_margin")
            input.project__input-text(type="text" :value="project.domain | otherProjectsIndustryFilter" disabled)
        .project__number
          LabelValue(label="№" customClass="project_margin")
            span.number {{ project.serverProjectGuid }}
        .project__test.checkbox
          input(type="checkbox" id="test" :checked="project.isTest" @change="setTest(project._id)")
          label(for="test") Test
</template>

<script>
	import LabelValue from "../LabelValue";
	import moment from "moment";
	import { mapActions } from "vuex";
	import '../../../filters/OtherProjectsFilters'


	export default {
		props: {
			project: {
				type: Object
			},
			projectName: {
				type: String
			}
		},
		data() {
			return {
				isTest: false
			};
		},
		methods: {
			goToClientInfo(id) {
				const route = this.$router.resolve({ path: `/clients/details/${ id }` });
				window.open(route.href, "_blank");
			},
			...mapActions(["alertToggle"]),
			formateDate: time => moment(time).format("DD-MM-YYYY HH:mm"),
			async setTest(projectId) {
				await this.setProjectProp({
					projectId: projectId,
					prop: "isTest",
					value: event.target.checked
				});
			},
			async setProjectProp({ projectId, prop, value }) {
				try {
					const result = await this.$http.put("/pm-manage/other-project-prop", {
						projectId,
						prop,
						value
					});
					this.alertToggle({
						message: "Project type changed",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({
						message: "Server Error / Cannot update status Project",
						isShow: true,
						type: "error"
					});
				}
			}
		},
		components: {
			LabelValue
		}
	};
</script>

<style lang="scss" scoped>
  .project {
    padding: 40px;
    display: flex;
    flex-direction: column;

    &__input-icons {
      position: relative;

      .icon-link {
        position: absolute;
        right: 6px;
        top: 8px;
        font-size: 18px;
        cursor: pointer;
      }
    }

    &__project-template {
      position: relative;
      width: 191px;
      margin-bottom: 60px;
    }

    &__all-info {
      width: 960px;
      padding: 20px;
      box-shadow: 0 0 10px #67573e9d;
    }

    &__info-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;

      ::-webkit-input-placeholder {
        color: #68573E;
        opacity: 0.47;
      }
    }

    &__name {
      font-size: 22px;
      padding: 0 5px;
      height: 44px;
      width: 35%;
      border-radius: 5px;
      color: #68573E;
      border: 1px solid #68573E;
      outline: none;

      &:focus {
        box-shadow: 0 0 5px #68573E;
      }
    }

    &__date {
      width: fit-content;
      position: relative;
    }

    &__client,
    &__industry,
    &__number {
      width: fit-content;
    }

    &__drop-menu {
      position: relative;
      height: 28px;
      width: 191px;
    }

    &__client-link {
      width: 191px;
      display: flex;
      justify-content: flex-start;
    }

    &__link {
      border-bottom: 1px solid #68573e;
      cursor: pointer;
    }

    &__input-text {
      width: 158px;
      height: 28px;
      border: 1px solid #68573E;
      border-radius: 5px;
      padding: 0 5px;
      color: #68573E;
      font-size: 14px;
      outline: none;

      &:focus {
        box-shadow: 0 0 5px #68573E;
      }
    }

    &__input-text2 {
      width: 133px;
      height: 28px;
      border: 1px solid #68573E;
      border-radius: 5px;
      padding: 0 5px;
      color: #68573E;
      font-size: 14px;
      outline: none;
      padding-right: 30px;

      &:focus {
        box-shadow: 0 0 5px #68573E;
      }
    }

    &__textarea {
      width: 43%;
    }

    &__text {
      width: 100%;
      margin-top: 10px;
      border-radius: 10px;
      border: 1px solid #68573E;
      padding: 5px;
      color: #68573E;
      resize: none;
      outline: none;
      box-sizing: border-box;

      &:focus {
        box-shadow: 0 0 5px #68573E;
      }
    }

    &__calendar-icon {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 18px;
      cursor: pointer;
    }

    &__button {
      text-align: center;
      margin-top: 30px;
    }

    &_no-margin {
      margin-bottom: 0;
    }

    &__test {
      height: 24px;
    }

    .checkbox {
      display: flex;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 4px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 150%;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  .number {
    letter-spacing: -1px;
  }
</style>
