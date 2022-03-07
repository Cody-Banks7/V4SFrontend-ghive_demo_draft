<template>
    <g>
        <g v-for="(vec, index) in vecNameList"
           :key="index"
           :transform="'translate(' + [index * colWidth, 0] + ')'">
            <PerfCell
                    :rowHeight="rowHeight"
                    :colWidth="colWidth"
                    :app="app"
                    :vecName="vec"
                    :vertexMap="vertexMap"
                    :data="data[vec]"
                    :machineId = "machineId"></PerfCell>

        </g>
    </g>
</template>

<script>

import PerfCell from "@/components-new/PerformanceMatrix/PerfCell";
export default {
    name: "PerformanceUnit",
    components:{PerfCell},
    props:[
        'colWidth', 'rowHeight', 'vecNameList',
        'data', 'app', 'vertexMap', 'machineId'
    ],
    mounted(){},
    computed:{},
    methods:{}

}
</script>

<style scoped>

</style>