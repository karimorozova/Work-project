<template>
    <div class="radial">
        <div class="radial__num radial_left">0</div>
        <svg  xmlns="http://www.w3.org/2000/svg" height="150" width="150" viewBox="0 0 240 240" data-value="40">
            <defs>
                <mask id="mask1">
                    <rect width="100%" height="100%" fill="white"/>
                    <path stroke="black" stroke-width="2" d="M100 100 l100 -100"/> 
                    <path stroke="black" stroke-width="2" d="M100 100 l-100 -100"/> 
                    <path fill="black" d="M100 100 l-115 100 l115 100 l115 -100z"/>    
                </mask>
                <mask id="mask2">
                    <rect width="100%" height="100%" fill="white"/>
                    <path stroke="black" stroke-width="5" d="M100 100 l100 -100"/> 
                    <path stroke="black" stroke-width="5" d="M100 100 l-100 -100"/>  
                </mask>
            </defs>
            <circle mask="url(#mask1)" fill="none" stroke-width="25" stroke="#bfb09d" r="77" cx="100" cy="100"/>
            <path mask="url(#mask2)" fill="none" stroke-width="22" stroke="#FFF" d="M41 149.5a77 77 0 1 1 117.93 0"/>
            <path mask="url(#mask2)" fill="none" stroke-width="22" stroke="#D15F45" d="M41 149.5a77 77 0 1 1 117.93 0" class="meter" :pathLength="total" :stroke-dasharray="strokeDashArray">
                <animate id="an1" attributeName="stroke-dasharray" from="0 0" :to="strokeDashArray" dur="1s" repeatCount="0" fill="freeze" />
            </path>  
            <circle cx="100" cy="100" r="50" fill="none" stroke-width="4" stroke="#bfb09d" class="arrow-circle"/>
            <path d="m62.4 134.1c0 2.8 13.6 7.4-2.6 5-2.7-0.4-10.7-0.2-10.7-0.2 0 0 4-13.1 4.1-19.1 0.1-6 9.2 11.5 9.2 14.3z" fill="#bfb09d">
                <animateTransform id="an_arrow" attributeName="transform" type="rotate" from="-10 100 100" :to="arrowTo" dur="1s" repeatCount="0" fill="freeze" />
            </path>
            <text class="center-text" x="100" y="100" fill="#D15F45" text-anchor="middle" alignment-baseline="central">{{currentVal}}</text>
            <text class="bottom-text" x="100" y="190" fill="#66563d" text-anchor="middle" alignment-baseline="central">{{recordName}}</text>
        </svg>
        <div class="radial__num radial_right">{{ total }}<div>
    </div>
</template>

<script>
export default {
    props: {
        total: {
            type: [String, Number],
            default: 30
        },
        currentVal: {
            type: [String, Number],
            default: 0
        },
        recordName: {type: String}
    },
    data() {
        return {
            
        }
    },
    computed: {
        strokeDashArray() {
            return this.currentVal <= this.total ? `${this.currentVal}, 1000` : `${this.total}, 1000`;
        },
        arrowTo() {
            const circleFill = Math.round(+this.currentVal/+this.total*100);
            return circleFill <= 100 ? `${Math.round(2.55*circleFill)} 100 100` : '255 100 100';
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.radial {
    display: flex;
    align-items: baseline;
    position: relative;
    margin: 0 20px;
    &__num {
        position: absolute;
        opacity: 0.4;
        bottom: 40px;
    }
    &_left {
        left: 0px;
    }
    &_right {
        right: 17px;
    }
}

.center-text {
    font-size: 32px;
}

.bottom-text {
    font-size: 24px;
    font-weight: 600;
}

</style>
