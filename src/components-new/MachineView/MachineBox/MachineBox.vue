<template>
    <div style="text-align:center; border: gray solid 0.5px; border-radius: 3px;"
        v-if="selectedMachine">
        <div style="font-size:10px">{{ machine.machineId }}</div>
        <el-row>
            <TaskMatrix :selectTaskCount="machine.selectTaskCount" :id="machine.machineId"
                        :taskList="machine.taskList" v-if="initialized && false" :maxTime="maxTime" :minTime="minTime"
                        :status="machine.status"
                        :ch="35"
                        :matrixSize="subMatrixSize"
                        :style="'height:'+height + 'px;' + 'width: ' + width+'px;'"
                        :directShown="directShown"
                        :interaction="'zoom'"
                        :showDataflow="showDataflow"
                        :app="app"
                        :dependence="dependence"
                        :isMachine="true"
            ></TaskMatrix>

            <TaskMatrixNew :selectTaskCount="machine.selectTaskCount" :id="machine.machineId"
                           :taskList="machine.taskList" :maxTime="maxTime" :minTime="minTime"
                           :status="machine.status"
                           :ch="35"
                           :matrixSize="subMatrixSize"
                           :style="'height:'+height + 'px;' + 'width: ' + width+'px;'"
                           :directShown="directShown"
                           :interaction="'zoom'"
                           :showDataflow="showDataflow"
                           :dependence="dependence"
                           :isMachine="true"
                           :app="app"
                           :abnormalDeps="ownAbnormalDeps"

                           :interactiveModule="interactiveModule"
                           :selectedTasks="ownSelectedTasks"
                           :selectedDeps="ownSelectedDeps"
                           :srcAffectedTasks="ownSrcAffectedTasks"
                           :dstAffectedTasks="ownDstAffectedTasks"
                           :srcAffectedDeps="ownSrcAffectedDeps"
                           :dstAffectedDeps="ownDstAffectedDeps"
                           :startTime="startTime"
                           :endTime="endTime"
            ></TaskMatrixNew>
        </el-row>
        <el-row>
            <TaskCount
                    v-show="selectedMetrics.task"
                    :app="app"
                    :ch="metricHeight-2"
                    :width="width"
                    :height="metricHeight-2"
                    :id="machine.machineId"
                    :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></TaskCount>
        </el-row>
        <el-row>
            <CPUUsage style="margin-top:0px"
                      v-show="selectedMetrics.cpu"
                      :app="app"
                      :ch="metricHeight-2"
                      :width="width"
                      :height="metricHeight-2"
                      :status="machine.status"
                      :id="machine.machineId"
                      :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></CPUUsage>
        </el-row>

        <el-row>
            <NetIO
                    style="margin-top:0px"
                    v-show="selectedMetrics.network"
                    :app="app"
                    :ch="metricHeight-2"
                    :width="width"
                    :height="metricHeight-2"
                    :status="machine.status"
                    :id="machine.machineId"
                    :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></NetIO>
        </el-row>
        <el-row >
            <MemoryUsage style="margin-top:0px"
                         v-show="selectedMetrics.memory"
                         :app="app"
                         :ch="metricHeight-2"
                         :width="width"
                         :height="metricHeight-2"
                         :status="machine.status"
                         :id="machine.machineId"
                         :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></MemoryUsage>
        </el-row>
        <el-row >
            <DiskIO style="margin-top:0px"
                    v-show="selectedMetrics.disk"
                    :app="app"
                    :ch="metricHeight-2"
                    :width="width"
                    :height="metricHeight-2"
                    :status="machine.status"
                    :id="machine.machineId"
                    :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></DiskIO>
        </el-row>
    </div>
</template>

<script>

/* eslint-disable */

import TaskMatrix from "@/components-new/MachineView/MachineBox/TaskMatrix";
import TaskCount from "@/components-new/MachineView/MachineBox/TaskCount";
import CPUUsage from "@/components-new/MachineView/MachineBox/CPUUsage";
import MemoryUsage from "@/components-new/MachineView/MachineBox/MemoryUsage";
import NetIO from "@/components-new/MachineView/MachineBox/NetIO";
import DiskIO from "@/components-new/MachineView/MachineBox/DiskIO";
import {mapState} from "vuex";
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew";

export default {
    name: "MachineBox",
    components: {
        TaskMatrixNew,
        TaskMatrix,
        TaskCount,
        CPUUsage,
        MemoryUsage,
        NetIO,
        DiskIO
    },
    data() {
        return {
            height: 0,
            width: 0,
            initialized: false,
            maxTime: 0,
            minTime: 0,

            directShown: this.machine == undefined ? '' : 'src',
        }
    },
    props: ['app', 'machine', 'metricHeight', 'subMatrixSize', 'id', 'selectedMetrics', 'dependence',
        'interactiveModule',
    'startTime', 'endTime', 'machineSelected'],
    mounted() {
        this.height = this.width = this.subMatrixSize
        this.initialized = true;
        this.$store.commit('simulation/updateTaskScale', {
            'width': this.matrixSize,
            'height': this.matrixSize,
            'size': this.matrixSize,
            'upperHeight': 35,
        })
    },
    method: {},
    computed: {
        ...mapState('simulation', {
            taskList: state => state.taskList,
            renderSign: state => state.renderSign,
            showDataflow: state => state.showDataflow,
        }),
        ...mapState('comparison',{
          selectedMachineMetrics: state => state.appShowingTask.selectedMachineMetrics,
          isLoading: state => state.isLoading
        }),
        // machineSelected(){
        //   return this.selectedMachineMetrics[this.machine.machineId] !== undefined && this.selectedMachineMetrics[this.machine.machineId]
        // },
        ownAbnormalDeps(){
            let ownDeps = []
            this.app.abnormalDeps.forEach(dep=>{
                if(dep.srcTask.machine_id == this.machine.machineId
                    || dep.dstTask.machine_id == this.machine.machineId){
                    ownDeps.push(dep)
                }
            })
            return ownDeps
        },
        ownSelectedTasks(){
            let ownTasks = []
            this.interactiveModule.selectedTasks.forEach(task=>{
                if(task.machine_id == this.machine.machineId){
                    ownTasks.push(task)
                }
            })
            return ownTasks
        },
        ownSelectedDeps(){
            let ownDeps = []
            this.interactiveModule.selectedDeps.forEach(dep=>{
                if(dep.srcTask.machine_id == this.machine.machineId
                    || dep.dstTask.machine_id == this.machine.machineId){
                    ownDeps.push(dep)
                }
            })
            return ownDeps
        },
        ownSrcAffectedTasks(){
            let ownTasks = []
            this.interactiveModule.srcAffectedTasks.forEach(task=>{
                if(task.machine_id == this.machine.machineId){
                    ownTasks.push(task)
                }
            })
            return ownTasks
        },
        ownDstAffectedTasks(){
            let ownTasks = []
            this.interactiveModule.dstAffectedTasks.forEach(task=>{
                if(task.machine_id == this.machine.machineId){
                    ownTasks.push(task)
                }
            })
            return ownTasks
        },
        ownSrcAffectedDeps(){
            let ownDeps = []
            if(!this.interactiveModule.srcAffectedDeps) return []
            this.interactiveModule.srcAffectedDeps.forEach(dep=>{
                if(dep.srcTask.machine_id == this.machine.machineId
                    || dep.dstTask.machine_id == this.machine.machineId){
                    ownDeps.push(dep)
                }
            })
            return ownDeps
        },
        ownDstAffectedDeps(){
            let ownDeps = []
            if(!this.interactiveModule.dstAffectedDeps) return []
            this.interactiveModule.dstAffectedDeps.forEach(dep=>{
                if(dep.srcTask.machine_id == this.machine.machineId
                    || dep.dstTask.machine_id == this.machine.machineId){
                    ownDeps.push(dep)
                }
            })
            return ownDeps
        },
      selectedMachine(){
          return this.selectedMachineMetrics[this.machine.machineId] && !this.isLoading
      }
// ownDstAffectedDeps
    },
    watch:{
    }
}
</script>

<style scoped>

</style>
