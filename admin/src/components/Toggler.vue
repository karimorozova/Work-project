<template lang="pug">
.toggler
    label.switch
        input(type="checkbox" :checked="isActive" :disabled="isDisabled" @change="toggle")
        span.slider
</template>

<script>
export default {
    props: {
        isActive: {
            type: Boolean,
            default: false
        },
        isDisabled: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        toggle() {
            this.$emit("toggle");
        }
    }
}
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
  margin-bottom: 0
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 10px;
  width: 10px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .slider {
  background-color: rgb(64, 156, 61);
}

input:focus + .slider {
  box-shadow: 0 0 1px rgb(64, 156, 61);
}

input:checked + .slider:before {
  transform: translateX(16px);
}

</style>
