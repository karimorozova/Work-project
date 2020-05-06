<template lang="pug">
.project 
    .project__all-info
        .project__info-row
            input.project__name(type="text" :value="project.name" disabled)
            .project__date
                LabelValue(label="Start Date & Time" :isRequired="false" customClass="project_margin")
                    input.project__input-text(type="text" :value="formateDate(project.creationTime)" disabled)
                img.project__calendar-icon(src="../../../assets/images/calendar.png")
            .project__date
                LabelValue(label="Deadline" :isRequired="false" customClass="project_margin")
                    input.project__input-text(type="text" :value="formateDate(project.deadline)" disabled)
                img.project__calendar-icon(src="../../../assets/images/calendar.png")  
        .project__info-row
            .project__client
                LabelValue(label="Client Name" :isRequired="false" customClass="project_margin")
                    span {{ project.client }}
            .project__industry
                LabelValue(label="Industry" :isRequired="false" customClass="project_margin")
                    span {{project.domain}}
            .project__number
                LabelValue(label="Client Project Number" customClass="project_margin")
                    span {{ project.serverProjectGuid }}
        .project__info-row.project_no-margin
            .project__textarea
                LabelValue(label="Project Brief" customClass="project_textarea")
                    textarea.project__text(type="text" rows="10" disabled :value="''")
            .project__textarea
                LabelValue(label="Internal Notes" customClass="project_textarea")
                    textarea.project__text(type="text" rows="10" disabled :value="''")
</template>

<script>
import LabelValue from "../LabelValue";
import moment from "moment";

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {};
  },
  methods: {
    formateDate: time => moment(time).format("DD-MM-YYYY HH:mm")
  },
  components: {
    LabelValue
  }
};
</script>

<style lang="scss" scoped>
.project {
  padding: 20px;
  width: 67%;
  display: flex;
  flex-direction: column;
  @media (max-width: 1600px) {
    width: 70%;
  }
  &__project-template {
    position: relative;
    width: 191px;
    margin-bottom: 60px;
  }
  &__all-info {
    padding: 20px;
    box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
  }
  &__info-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    ::-webkit-input-placeholder {
      color: #68573e;
      opacity: 0.47;
    }
  }
  &__name {
    font-size: 22px;
    padding: 0 5px;
    height: 44px;
    width: 33%;
    border-radius: 5px;
    color: #68573e;
    border: 1px solid #68573e;
    outline: none;
    &:focus {
      box-shadow: 0 0 5px #68573e;
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
    width: 151px;
    height: 28px;
    border: 1px solid #68573e;
    border-radius: 5px;
    padding: 0 5px;
    color: #68573e;
    font-size: 14px;
    outline: none;
    &:focus {
      box-shadow: 0 0 5px #68573e;
    }
  }
  &__textarea {
    width: 43%;
  }
  &__text {
    width: 100%;
    margin-top: 10px;
    border-radius: 10px;
    border: 1px solid #68573e;
    padding: 5px;
    color: #68573e;
    resize: none;
    outline: none;
    box-sizing: border-box;
    &:focus {
      box-shadow: 0 0 5px #68573e;
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
}
</style>
