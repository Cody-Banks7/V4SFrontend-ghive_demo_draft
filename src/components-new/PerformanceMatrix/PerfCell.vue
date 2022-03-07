<template>
    <g @mouseover="mouseover" @mouseout="mouseout" @click="cellClick">
        <rect :x="boundary" :y="boundary"
              :width="colWidth-boundary*2" :height="rowHeight-boundary*2"
              :stroke="stroke" :stroke-width="strokeWidth"
              fill="black" :fill-opacity="fillOpacity" rx="2"></rect>
        <g :transform="'translate(' + [colWidth / 2, rowHeight / 2] + ')'">
            <path v-for="(pathObj, index) in pathList" :key="index"
                  :fill="pathObj.stroke" stroke="white" stroke-width="0.5"
                  :d="pathObj.path"></path>
            <circle :cx="0" :cy="0" :r="colWidth / 2 * 0.8"
                    fill-opacity="0" stroke="steelblue" stroke-width="0.5">
            </circle>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3";
// TODO: 需要重构一下，把piechart抽离出来
// TODO: score 的计算最好也能函数话，分为考虑impact和不考虑impact两类
export default {
    name: "PerfCell",
    props: ['vecName', 'colWidth', 'rowHeight', 'data', 'app', 'vertexMap','machineId'],
    data(){
        return {
            boundary: 1,
            stroke: 'grey',
            strokeWidth: 0.5
        }
    },
    computed:{
        pathList(){
            if(this.data){
                let score = this.data['duration_score'];
                let scoreOutR = score* (this.colWidth / 2 * 0.8)
                return [
                    {
                        path:d3.arc()
                            .innerRadius(0)
                            // .outerRadius(this.data[vec].duration_score)
                            .outerRadius(scoreOutR)
                            .startAngle(-1 * Math.PI / 180 * 60)
                            .endAngle(Math.PI / 180 * 60)(),
                        stroke: "#33a02c"
                    },{
                        path: d3.arc()
                            .innerRadius(0)
                            // .outerRadius(this.data[vec].duration_score)
                            .outerRadius(this.getR('parallel_score') * this.data.vertex_impact)
                            .startAngle(Math.PI / 180 * 60)
                            .endAngle(Math.PI / 180 * 180)(),
                        stroke: "#e31a1c"
                    },{
                        path: d3.arc()
                            .innerRadius(0)
                            // .outerRadius(this.data[vec].duration_score)
                            .outerRadius(this.getR('end_time') * this.data.vertex_impact)
                            .startAngle(Math.PI / 180 * 180)
                            .endAngle(Math.PI / 180 * 300)(),
                        stroke: "#1f78b4"
                    }
                ]
            }else{
                return []
            }
        },
        fillOpacity(){
            return this.data ? this.data.vertex_impact * 0.9: 0
        },
    },
    methods:{
        getR(feature){
            return this.data[feature]* (this.colWidth / 2 * 0.8)
        },
        getDurationScore(){
            if(this.data){
                return this.data.duration
            }else{
                return 0
            }
        },
        mouseover(){
            this.enterNode(this.vertexMap[this.vecName])
            this.stroke = 'purple'
            this.strokeWidth = 2
        },
        mouseout(){
            this.leaveNode(this.vertexMap[this.vecName])
            this.stroke = 'grey'
            this.strokeWidth = 0.5
        },
        enterNode(node) {
            //TODO:直接copy过来，需要封装起来
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.data.vertexIdList,
                type: 'selectCurrent',
                value: true,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.inEdges.map(e => e.src.data.vertexIdList).flat(),
                type: 'selectAsProvider',
                value: true,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.outEdges.map(e => e.dst.data.vertexIdList).flat(),
                type: 'selectAsConsumer',
                value: true,
            })
            let maxDuration = 0
            node.data.vertexIdList.forEach(vertexName => {
                const vertex = this.app.vertexMap[vertexName]
                const selecteTaskdList = []
                vertex.tasks.forEach(task => {
                    task.layout.selectCurrent = true
                    selecteTaskdList.push(task)
                })
                maxDuration = Math.max(maxDuration, d3.max(vertex.tasks, t => t.end_time - t.start_time))
                //  highlight in TaskMatrix
                this.app.interactiveModule.selectedTasks = selecteTaskdList
            })
            this.app.matrixRefDuration = maxDuration
        },
        leaveNode(node) {
            //TODO:直接copy过来，需要封装起来
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.data.vertexIdList,
                type: 'selectCurrent',
                value: false,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.inEdges.map(e => e.src.data.vertexIdList).flat(),
                type: 'selectAsProvider',
                value: false,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: node.outEdges.map(e => e.dst.data.vertexIdList).flat(),
                type: 'selectAsConsumer',
                value: false,
            })
            node.data.vertexIdList.forEach(vertexName => {
                const vertex = this.app.vertexMap[vertexName]
                vertex.tasks.forEach(task => task.layout.selectCurrent = false)
            })
            this.app.matrixRefDuration = null
            // remove selected tasks
            this.app.interactiveModule.selectedTasks = []
        },

        cellClick(){
          // if (this.machineId === undefined){
          //   this.$store.commit("comparison/changeAppShowingTaskOverviewMatrix")
          // }else{
          //   this.$store.commit("comparison/changeAppShowingTaskSelectedMachine", this.machineId)
          // }
        },
    }
}
</script>

<style scoped>

</style>