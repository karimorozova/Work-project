<template>
    <!-- <div class="radial">
        <svg  xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 200 200" data-value="40">
            <path class="bg" stroke="#ccc" d="M41 149.5a77 77 0 1 1 117.93 0"  fill="none"/>
            <path class="meter" stroke="#D15F45" d="M41 149.5a77 77 0 1 1 117.93 0" fill="none" pathLength="90" stroke-dasharray="30 1"/>
        </svg>
    </div> -->
    <!-- <div class="radial">
        <svg  xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 200 200" data-value="40">
    
            <path  class="bg" stroke-width="22" stroke="#ccc" d="M41 149.5a77 77 0 1 1 117.93 0"  fill="none"/>
            <path class="meter" stroke-width="22" stroke="#D15F45" d="M41 149.5a77 77 0 1 1 117.93 0" fill="none" pathLength="30" stroke-dasharray="30, 100"/>
                    <path stroke="white" stroke-width="5" d="M100 100 l-100 -100"/> 
                <path stroke="white" stroke-width="5" d="M100 100 l100 -100"/> 
        </svg>
    </div> -->
    <div class="radial">
        <svg  xmlns="http://www.w3.org/2000/svg" height="80" width="80" viewBox="0 0 200 200" data-value="20">
            <defs>
            <mask id="mask">
                <rect width="100%" height="100%" fill="white"/>
                <path fill="black" d="M100 100 l-4 -4 l100 -100 l8,8 l-100 80z"/> 
                <path fill="black" d="M100 100 l-4 4 l-100 -100 l8,-8 l100 120z"/>       
            </mask>
            </defs>
            <path mask="url(#mask)" class="bg" stroke-width="22" stroke="#FFF" d="M41 149.5a77 77 0 1 1 117.93 0"  fill="none"/>
            <path mask="url(#mask)" class="meter" stroke-width="22" stroke="#D15F45" d="M41 149.5a77 77 0 1 1 117.93 0" fill="#DFE" fill-rule="evenodd" pathLength="30" stroke-dasharray="20, 100"/>           
        </svg>
</div>
</template>

<script>
export default {
    data() {
        return {
            center: 40,
            center: 40,
            radius: 18
        }
    }
}
</script>

<style lang="scss" scoped>

.radial {
    margin-left: 60px;
}

</style>
