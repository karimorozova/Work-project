<template lang="pug">
    .sliding
        .sliding__info(@click="toggleInfo" :class="customClass") {{ title }}
</template>

<script>
export default {
    props: {
        title: {type: String},
        customClass: {type: String},
    },
    methods: {
        toggleInfo() {
            this.$emit('toggleInfo');
        }
    }
}
</script>

<style lang="scss" scoped>

.sliding {
    display: none;
    @media (max-width: 1023px) {
    display: block;
    }
    font-size: 16px;
    font-weight: 700;
    transition: all 0.2s;
    position: fixed;;
    top: 38px;
    right: -27px;
    border: 1px solid #d15f45;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 5px;
    transform: rotate(-90deg);
    -webkit-transform-origin: 1; 
    z-index: 10;
    background: #d15f45;
    color: white;
    cursor: pointer;
}

.help-slide {
    top: 138px;
    right: -29px;
}

.translate {
    transform: rotate(0);
    transform: translateX(-26px);
}

</style>
