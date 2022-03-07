<template>
    <svg :height="height" class="container">
        <g class="vec" :transform="vecTitleTransform">
            <g v-for="(headName, index) in vecNameList" :key="index" :transform="'translate(' + [index * colWidth + colWidth / 2, UB] + ')'">
                <!--                <circle :cx="0" cy="0" r="2" fill="green"></circle>-->
                <text style="font-size:10px" y="-10" x="5" transform="rotate(-45)">{{headName}}</text>
            </g>
        </g>
      <g class="machine" :transform="machineIdTransform">
        <svg x=18 y=-30 v-if="overviewMatrix === false" @click="showOverviewClick"
             t="1636560944465" class="icon" viewBox="0 0 1643 1024" version="1.1"
             xmlns="http://www.w3.org/2000/svg" p-id="2446" width="25" height="25"><path d="M1131.861333 0H512a512 512 0 0 0 0 1024h619.861333a512 512 0 0 0 0-1024z m0 887.466667H512a375.466667 375.466667 0 0 1 0-750.933334h619.861333a375.466667 375.466667 0 0 1 0 750.933334z" p-id="2447"></path><path d="M1104.554667 278.528a247.125333 247.125333 0 1 0 245.76 245.76 247.125333 247.125333 0 0 0-245.76-245.76z" p-id="2448"></path></svg>
        <svg x=18 y=-30 v-if="overviewMatrix === true" @click="showOverviewClick"
             t="1636561024284" class="icon" viewBox="0 0 1137 1024" version="1.1"
             xmlns="http://www.w3.org/2000/svg" p-id="2707" width="25" height="25"><path d="M739.555556 113.777778H398.222222a398.222222 398.222222 0 1 0 0 796.444444h341.333334a398.222222 398.222222 0 1 0 0-796.444444z m0 682.666666H398.222222c-156.842667 0-284.444444-127.601778-284.444444-284.444444s127.601778-284.444444 284.444444-284.444444h341.333334c156.842667 0 284.444444 127.601778 284.444444 284.444444s-127.601778 284.444444-284.444444 284.444444z" fill="" p-id="2708"></path><path d="M568.888889 512a170.666667 170.666667 0 1 1-341.333333 0 170.666667 170.666667 0 0 1 341.333333 0z" fill="" p-id="2709"></path></svg>

      </g>
        <g :transform="vecContextTransform">
            <PerMachineRow
                    :colWidth="colWidth"
                    :rowHeight="rowHeight"
                    :vecNameList="vecNameList"
                    :data="vecPerObj"
                    :vertexMap="vertexMap"
                    :app="app"
            ></PerMachineRow>
        </g>
        <g class="machine" :transform="machineIdTransform">
            <g v-for="(headName, index) in machineIdList" :key="index" :transform="'translate(' + [0, index * rowHeight + rowHeight / 2] + ')'">
                <!--                <circle :cx="0" cy="0" r="2" fill="green"></circle>-->
                <text x=15 y=-3 style="font-size:10px" >{{headName}}</text>
                <svg x=18 y=-4 v-if="selectedMachineMetrics[headName] === undefined || selectedMachineMetrics[headName] === false" @click="showClick(headName)"
                  t="1636560944465" class="icon" viewBox="0 0 1643 1024" version="1.1"
                   xmlns="http://www.w3.org/2000/svg" p-id="2446" width="22" height="22"><path d="M1131.861333 0H512a512 512 0 0 0 0 1024h619.861333a512 512 0 0 0 0-1024z m0 887.466667H512a375.466667 375.466667 0 0 1 0-750.933334h619.861333a375.466667 375.466667 0 0 1 0 750.933334z" p-id="2447"></path><path d="M1104.554667 278.528a247.125333 247.125333 0 1 0 245.76 245.76 247.125333 247.125333 0 0 0-245.76-245.76z" p-id="2448"></path></svg>
                <svg x=18 y=-4 v-if="selectedMachineMetrics[headName] === true" @click="showClick(headName)"
                  t="1636561024284" class="icon" viewBox="0 0 1137 1024" version="1.1"
                   xmlns="http://www.w3.org/2000/svg" p-id="2707" width="22" height="22"><path d="M739.555556 113.777778H398.222222a398.222222 398.222222 0 1 0 0 796.444444h341.333334a398.222222 398.222222 0 1 0 0-796.444444z m0 682.666666H398.222222c-156.842667 0-284.444444-127.601778-284.444444-284.444444s127.601778-284.444444 284.444444-284.444444h341.333334c156.842667 0 284.444444 127.601778 284.444444 284.444444s-127.601778 284.444444-284.444444 284.444444z" fill="" p-id="2708"></path><path d="M568.888889 512a170.666667 170.666667 0 1 1-341.333333 0 170.666667 170.666667 0 0 1 341.333333 0z" fill="" p-id="2709"></path></svg>
            </g>
        </g>
      <g class="context" :transform="machineVecTransform">
            <g v-for="(machine, index) in perMatrix" :key="machine.machine_id">
                <g>
                    <PerMachineRow
                            :colWidth="colWidth"
                            :rowHeight="rowHeight"
                            :vecNameList="vecNameList"
                            :data="machine"
                            :app="app"
                            :vertexMap="vertexMap"
                            :machineId="machineIdList[index]"
                            :transform="'translate(' + [0, index * rowHeight] + ')'"></PerMachineRow>
                </g>
            </g>
        </g>
    </svg>
</template>

<script>
// import * as d3 from "d3";
import PerMachineRow from "@/components-new/PerformanceMatrix/PefMachineRow";
import {mapState} from "vuex";

export default {
    name: "PerformanceMatrix",
    components: {PerMachineRow},
    props: ['perData', 'app', 'nodes'],
    data(){
        return {
            UB: 60,
            LB: 50,
            rowHeight: 35,
            colWidth: 35,
            containerWidth: 0,
            totalHeight:450
        }
    },
    computed: {
        ...mapState("comparison",{
          selectedMachineMetrics: state=>state.appShowingTask.selectedMachineMetrics,
          overviewMatrix:state=>state.appShowingTask.overviewMatrix
        }),
        vertexMap(){
            let _map = {}
            if(this.nodes){
                this.nodes.forEach(node=>{
                    _map[node.data.vertexIdList[0]] = node
                })
            }
            return _map
        },
        height(){
            return this.UB + this.rowHeight * (this.perMatrix.length + 1) + 20
        },
        machineIdList(){
            return [...new Set(this.vecMachineList.map(d=>d.machine_id))]
        },
        vecNameList(){
            return [...new Set(this.vecMachineList.map(d=>d.vec_name))]
        },
        vecMachineList(){
            return this.perData.vec_machine_df
        },
        perMatrix() {
            let machineVecDict = {}
            this.vecMachineList.forEach(d=>{
                if(!machineVecDict[d.machine_id]) machineVecDict[d.machine_id] = {machine_id:d.machine_id}
                if(!machineVecDict[d.machine_id][d.vec_name])
                    machineVecDict[d.machine_id][d.vec_name] = {}
                machineVecDict[d.machine_id][d.vec_name] = d
            })
            return Object.values(machineVecDict)
        },
        vecList(){
            return this.perData.vec_df
        },
        vecPerObj(){
            let vecMap = {}
            this.vecList.forEach(vec=>{
                vecMap[vec.vec_name] = vec
            })
            return vecMap
        },
        vecTitleTransform(){
            return "translate(" + [this.LB, 0] + ')'
        },
        vecContextTransform(){
            return "translate(" + [this.LB, this.UB] + ')'
        },
        machineIdTransform(){
            return "translate(" + [0, this.UB+this.rowHeight + 5] + ')'
        },
        machineVecTransform(){
            return "translate(" + [this.LB, this.UB + this.rowHeight + 5] + ')'
        },
    },
    watch:{},
    mounted(){
        this.containerWidth = this.$el.clientWidth
        let rowWidth = this.containerWidth - this.LB * 1.5
        this.colWidth = Math.min(rowWidth / this.vecNameList.length, this.rowHeight)
        this.rowHeight = this.colWidth
    },
    methods:{
      showClick(machineName){
        this.$store.commit("comparison/changeAppShowingTaskSelectedMachine", machineName)
        this.$store.commit("simulation/changeAppShowingTaskSelectedMachine", machineName)

      },
      showOverviewClick(){
        this.$store.commit("comparison/changeAppShowingTaskOverviewMatrix")
        this.$store.commit("simulation/changeAppShowingTaskOverviewMatrix")

      },
    }
}
</script>

<style scoped>
.container {
  border-style: solid;
  border-color: #d9d8d8;
  border-width: 0.2px;
  border-radius: 3px;

  width: calc(100% - 10px);
  /*height: calc(50% - 12px);*/
}
</style>