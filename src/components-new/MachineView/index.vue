<template>
    <div style="height: 100%; width: 100%">
        <el-row style="width: 100%">
            <div v-if="false" style="width: 100%; display: flex; justify-content: left"
                 :style="{marginTop: (matrixSize * .03) + 'px', height: matrixSize + 'px'}"
            >
                <TaskMatrix :selectTaskCount="selectTaskCount" :taskCount="taskCount"
                            :taskList="taskList" v-if="overviewMatrix && !isLoading" :maxTime="maxTime" :minTime="minTime"
                            :dependence="dependence"
                            :ch="50"
                            :style="'height:'+ matrixSize + 'px;' + 'width: ' + matrixSize  +'px;'"
                            :showDataflow="showDataflow"
                            :interaction="'zoom'"
                            :selectedMetrics="selectedMetrics"
                            :app="app"
                ></TaskMatrix>
            </div>

            <div style="width: 100%; display: flex; justify-content: left"
                 :style="{marginTop: (matrixSize * .03) + 'px', height: matrixSize + 'px'}"
                 class="overviewContainer">
                <TaskMatrixNew :selectTaskCount="selectTaskCount" :taskCount="taskCount"
                               :taskList="taskList" v-if="!isLoading &&overviewMatrix" :maxTime="maxTime" :minTime="minTime"
                               :dependence="dependence"
                               :ch="50"
                               :style="'height:'+ matrixSize + 'px;' + 'width: ' + matrixSize  +'px;'"
                               :showDataflow="showDataflow"
                               :interaction="'zoom'"
                               :selectedMetrics="selectedMetrics"
                               :app="app"
                               :abnormalDeps="app.abnormalDeps"
                               :isMachine="false"
                               :interactiveModule="app.interactiveModule"
                               :selectedTasks="app.interactiveModule.selectedTasks"
                               :selectedDeps="app.interactiveModule.selectedDeps"
                               :srcAffectedTasks="app.interactiveModule.srcAffectedTasks"
                               :dstAffectedTasks="app.interactiveModule.dstAffectedTasks"
                               :srcAffectedDeps="app.interactiveModule.srcAffectedDeps"
                               :dstAffectedDeps="app.interactiveModule.dstAffectedDeps"
                               :startTime="minTime"
                               :endTime="maxTime"
                ></TaskMatrixNew>

                <div style="background-color: #ffffff; justify-content: left; text-align: left;margin-left:5px"
                     :style="'height:'+ matrixSize + 'px;' + 'width: ' + (oWidth - matrixSize - 5)  +'px;'"
                     v-if="!isLoading &&overviewMatrix">
                    <el-checkbox v-model="selectedMetrics.task">Task Count</el-checkbox>
                    <el-checkbox v-model="selectedMetrics.cpu">CPU</el-checkbox>
                    <el-checkbox v-model="selectedMetrics.network">Network IO</el-checkbox>

                    <el-checkbox v-model="selectedMetrics.memory">Memory usage</el-checkbox>
                    <el-checkbox v-model="selectedMetrics.disk">Disk IO</el-checkbox>
                    <el-checkbox v-model="dependence">Dependence</el-checkbox>
                </div>
            </div>


        </el-row>

        <el-row v-if="machineList.length > 0"
                style="overflow-y: scroll; text-align: left; margin-top: 20px;"
                :style="{height: `calc(100% - ${matrixSize + 20 + matrixSize * .03}px`}"
        >
            <!--TODO: 添加了machinebox之后，task的index好像会变地不稳定-->
            <MachineBox v-for="(machine, id) in machineList" :key="machine.machine_id" :machine="machine"
                        :metricHeight="50" :id="id" :subMatrixSize="subMatrixSize"
                        :app="app"
                        :selectedMetrics="selectedMetrics"
                        :dependence="dependence"
                        :interactiveModule="app.interactiveModule"
                        :startTime="minTime"
                        :endTime="maxTime"
                        style="margin-left: 6px; margin-bottom: 7px; display: inline-block;"></MachineBox>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import {mapState} from "vuex"
import TaskMatrix from './MachineBox/TaskMatrix';
import MachineBox from "./MachineBox/MachineBox";
import {Application} from "@/utils/entities/Application";
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew";

export default {
    name: "MachineView",
    props: {
        app: Application,
    },
    components: {
        TaskMatrixNew,
        TaskMatrix, MachineBox
    },
    data() {
        return {
            oHeight: 0,
            oWidth: 0,
            matrixSize: 0,
            subMatrixSize: 0,
            selectedMetrics: {
                'task': false,
                'cpu': false,
                'memory': false,
                'network': false,
                'disk': false,
                'dependence': true
            },
            dependence: false,

            // interactiveModule: {
            //     selectedTasks: [],
            //     selectedDeps: [],
            //     srcAffectedTasks: [],
            //     dstAffectedTasks: [],
            //     srcAffectedDeps: [],
            //     dstAffectedDeps: []
            // }

        }
    },
    methods: {
    },
    watch: {
    },
    mounted() {
        let rect = this.$el.getBoundingClientRect();
        // this.oWidth = Math.min([rect.height, rect.width]);
        // this.oHeight = this.oWidth+45
        this.oWidth = rect.width * 0.95;
        this.oHeight = rect.height * 0.95;
        this.matrixSize = Math.min(this.oHeight, this.oWidth) * 3 / 4
        // console.log('matrix', this.$el, this.oHeight, this.oWidth)
        this.subMatrixSize = this.oWidth / 2 - 10
    },
    computed: {
        ...mapState('comparison', {
            overviewMatrix: state=>state.appShowingTask.overviewMatrix,
            isLoading: state => state.isLoading
        }),
        showDataflow() {
            return this.app.showDataflow
        },
        machineList() {
            return this.app.machineList
        },
        selectTaskCount() {
            return this.app.selectTaskCount
        },
        taskCount() {
            return this.app.taskCount
        },
        taskList() {
            return this.app.taskList
        },
        maxTime() {
            return this.app.maxTime
        },
        minTime() {
            return this.app.minTime
        },
    }
}
</script>

<style scoped>

</style>
