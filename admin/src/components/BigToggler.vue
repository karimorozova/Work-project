<template lang="pug">
    .big-toggler(@click="toggle" :class="{'on': isOn}")
        .big-toggler__toggler
        .big-toggler__yes 
            span.big-toggler__text YES
        .big-toggler__no 
            span.big-toggler__text NO    
</template>

<script>
export default {
    props: {
        isOn: { type: Boolean }
    },
    methods: {
        toggle() {
            this.$emit('toggle')
        }
    }
}
</script>

<style lang="scss" scoped>

%yes-no {
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    transition: all 0.3s;
}

.big-toggler {
    width: 76px;
    height: 28px;
    display: flex;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;    
    &__toggler {
        position: absolute;
        width: 46%;
        height: 100%;
        left: 0;
        top: 0;
        background: rgb(155, 155, 155);
        background: -moz-linear-gradient(top, rgba(185, 185, 185, 0.699) 11%, rgba(170, 170, 170,1) 100%);
        background: -webkit-linear-gradient(top, rgba(238, 238, 238, 0.76) 11%,rgba(170, 170, 170,1) 100%);
        background: linear-gradient(to bottom, rgb(238, 238, 238) 11%,rgba(170, 170, 170,1) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#eeeeee', endColorstr='#cccccc',GradientType=0 );
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        z-index: 2;
        transition: all 0.3s;        
    }
    &__text {
        padding-top: 3px;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
    }
    &__yes {
        @extend %yes-no;
        width: 45%;
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
        background-color: #82CD8F;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }
    &__no {
        @extend %yes-no;
        width: 55%;
        box-shadow: inset -2px 2px 5px rgba(0,0,0,0.5);
        background-color: #978D7E;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }
}

.on {
    .big-toggler__toggler {
        transform: translateX(41px);
    }
    .big-toggler__yes {
        width: 55%;
    }
    .big-toggler__no {
        width: 45%;
    }
}

</style>
