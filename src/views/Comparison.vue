<template>
    <div class="container" v-loading = "isLoading"
         element-loading-text="Loading"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(255,255, 255, 0.8)"
    >
        <!--    <ul class="nav2">-->
        <!--      <el-row>-->
        <!--        <el-col :span="8">-->
        <!--          <li class="titletext">Query Execution Analysis</li>-->
        <!--        </el-col>-->
        <!--      </el-row>-->
        <!--    </ul>-->
        <div id="main-pane" style="position: relative">
            <el-row style="height: 100%; width: 100%;" :gutter="8">
                <el-col :span="5" style="height: 100%" >
                    <el-row class="boundary" style="width: 100%; height: calc(100%); overflow: hidden">
                        <div class="mini_head">
                            <div class='mini_title'>Query List</div>
                        </div>
                        <div class="dag-container" style="height: calc(100% - 30px);">
                            <div v-for="(app) in applications" :key="app.appName" class="dag-item"
                                 :class="{'dag-item-collapse': app.dagDiagramCollapse,
                  'dag-item-not-collapse': !app.dagDiagramCollapse}">
                                <div class="card-head" style="">
                                    <el-icon class="el-icon-caret-bottom" v-show="!app.dagDiagramCollapse"
                                             @click.native="clickCollapseIcon(app)"/>
                                    <el-icon class="el-icon-caret-right" v-show="app.dagDiagramCollapse"
                                             @click.native="clickCollapseIcon(app)"/>
                                    <span style="font-size: 1em; margin-left: 5px;">{{ app.appName }}</span>
                                    <el-icon class="el-icon-s-data mini-icon"
                                             style="margin-left: auto"
                                             @click.native="clickShowDetailIcon(app)"
                                             :style="{color: getShowDetailIconColor(app)}"/>
                                    <svg width="25" height="25" class="mini-icon"
                                         style="cursor: pointer; margin-top: 2px;"
                                         @click="clickSQLIcon(app)"
                                         t="1630996342926" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                         p-id="2191">
                                        <path
                                                d="M298.337 320.634l-55.116 48.677c-19.402-26.983-39.066-40.39-59.171-40.39-9.789 0-17.726 2.645-23.986 7.849-6.174 5.204-9.347 11.109-9.347 17.726 0 6.525 2.207 12.787 6.702 18.606 6.001 7.849 24.252 24.605 54.587 50.266 28.396 23.723 45.678 38.714 51.677 44.973 15.081 15.254 25.837 29.806 32.099 43.741 6.26 13.933 9.434 29.101 9.434 45.595 0 32.099-11.109 58.641-33.246 79.54-22.223 20.899-51.147 31.396-86.773 31.396-27.868 0-52.116-6.79-72.841-20.46-20.636-13.67-38.359-35.095-53.087-64.375l62.611-37.742c18.783 34.57 40.476 51.852 64.992 51.852 12.787 0 23.547-3.703 32.276-11.2 8.731-7.407 13.052-16.048 13.052-25.837 0-8.907-3.263-17.726-9.877-26.63-6.614-8.907-21.074-22.396-43.387-40.653-42.592-34.745-70.194-61.554-82.627-80.425s-18.606-37.742-18.606-56.527c0-27.158 10.316-50.443 31.042-69.842 20.636-19.402 46.207-29.103 76.545-29.103 19.489 0 38.097 4.499 55.823 13.581 17.542 8.908 36.678 25.398 57.227 49.386v0z"
                                                p-id="5238"></path>
                                        <path
                                                d="M684.673 601.499l68.078 88.006h-88.182l-34.57-44.533c-28.57 15.695-60.495 23.455-95.591 23.455-58.729 0-107.585-20.283-146.474-60.758-38.89-40.476-58.288-88.801-58.288-144.798 0-37.389 9.082-71.783 27.158-103.087s42.945-56.174 74.69-74.605c31.657-18.429 65.699-27.69 102.029-27.69 55.555 0 103.174 20.017 143.035 60.141 39.86 40.036 59.79 88.89 59.79 146.563 0 53.088-17.283 98.765-51.677 137.303v0zM638.197 541.357c15.787-23.371 23.633-49.295 23.633-77.691 0-37.036-12.523-68.518-37.567-94.447-25.044-25.837-55.291-38.799-90.827-38.799-36.595 0-67.194 12.61-91.886 37.742-24.692 25.221-37.036 57.143-37.036 96.031 0 43.297 15.518 77.514 46.651 102.646 24.339 19.663 51.94 29.541 82.893 29.541 17.726 0 34.481-3.44 50.087-10.406l-70.018-90.124h88.801l35.275 45.503z"
                                                p-id="5239"></path>
                                        <path d="M779.294 267.37h74.426v320.198h108.554v70.99h-182.981v-391.184z" p-id="5240"></path>
                                    </svg>
                                    <el-icon class="el-icon-circle-plus mini-icon"
                                             style="margin-right: 7px;"
                                             @click.native="clickShowProgressIcon(app)"
                                             :style="{color: getShowProgressIconColor(app)}"/>
                                </div>
                                <DAGDiagram v-if="!app.dagDiagramCollapse"
                                            style="width: 100%; height: calc(100% - 30px);" :app="app"/>
                            </div>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="9" style="height: 100%">
                    <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Progress</div>
                        </div>
                        <div class="tdag-container" style="height: calc(100% - 30px);">
                            <div v-for="(app) in selectedApps" :key="app.appName" class="tdag-item">
                                <div class="card-head">
                                    <span style="font-size: 0.9em; margin-left: 4px;">{{ app.appName }}</span>
                                    <el-icon class="el-icon-view mini-icon icon"
                                             style="margin: 2px 7px 0 auto;" @click.native="clickShowTaskIcon(app)"
                                             :style="{color: getShowTaskIconColor(app)}"/>
                                </div>
                                <TlAggrView style="width: 100%; height: calc(100% - 30px);" :app="app"/>
                            </div>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="5" style="height: 100%" >
                    <el-row class="boundary"
                            style="width: 100%; height: calc(100%); margin-top: 0px; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Entity List</div>
                        </div>
                        <div class="task-list-container" style="height: calc(100% - 30px); width: 100%;">
                            <TaskListNew style="width: 100%; margin-left: -8px;" :app="appShowingTask"/>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="5" style="height: 100%">
                    <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Machine View</div>
                        </div>
                        <div class="machine-view-container" style="height: calc(100% - 30px); width: 100%;">
                            <MachineView style="width: 100%; height:100%;" :app="appShowingTask"/>
                        </div>
                    </el-row>
                </el-col>
            </el-row>
            <!--            <el-row style="height: 800px; width: 600px; position: absolute; left:0px; top:300px;background-color: #f5f5f5">-->
            <!--                <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">-->
            <!--                    <div class="mini_head">-->
            <!--                        <div class='mini_title'>Machine View</div>-->
            <!--                    </div>-->
            <!--                    <div class="machine-view-container" style="height: calc(100% - 30px); width: 100%;">-->
            <!--                        <MachineView style="width: 100%; height:100%;" :app="appShowingTask"/>-->
            <!--                    </div>-->
            <!--                </el-row>-->
            <!--            </el-row>-->
        </div>

    </div>

</template>

<script>
import {mapState} from "vuex";
import DAGDiagram from "@/components-new/DAGDiagram";
import TlAggrView from "@/components-new/TlAggrView";
import TaskListNew from "@/components-new/TaskListView";
import MachineView from "@/components-new/MachineView";

export default {
    name: 'Comparision',
    components: {
        DAGDiagram,
        TlAggrView,
        TaskListNew,
        MachineView,
    },


    data() {
        return {
            oHeight: 0,
            oWidth: 0,
            collapseList: [],
            loading: false,
            loadingAppName: ''
        }

    },
    created() {
        this.$store.dispatch('comparison/queryAllDags')
    },

    mounted() {
        // let rect = d3.select(".overviewContainer").node().getBoundingClientRect();
        // // this.oWidth = Math.min([rect.height, rect.width]);
        // // this.oHeight = this.oWidth+45
        // this.oWidth = rect.width * 0.95;
        // this.oHeight = rect.height * 0.95;
        // console.log('oHeight', this.oHeight, this.oWidth)

    },
    methods: {
        // resetScale(){
        //     this.$store.commit('simulation/updateSelectTimeScale',[]);
        // },
        clickShowDetailIcon(app) {
            app.showDetail ^= true
        },
        getShowDetailIconColor(app) {
            return app.showDetail ? '#409EFF' : ''
        },
        clickShowProgressIcon(app) {
            this.loadedAppName = app.appName
            if (this.selectedApps.includes(app)) {
                this.$store.commit('comparison/removeSelectedApp', app.appName)
            } else {
                this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})

                this.$store.dispatch('comparison/queryAppTasks', {
                    appName: app.appName,
                    application: null
                })

                // this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: false})
                // this.$store.dispatch('comparison/queryAppMonitorData', app.appName)
            }
        },
        getShowProgressIconColor(app) {
            return this.selectedApps.includes(app) ? '#409EFF' : ''
        },
        clickShowTaskIcon(app) {
            if (app.appName !== this.appShowingTask) {
                // this.loading = true
                this.$store.commit("comparison/changeAppShowingTaskOverviewMatrix")
                this.$store.commit("comparison/changeAppShowingAllTaskMachine")
                // app.overviewMatrix = !app.overviewMatrix
            }
        },
        getShowTaskIconColor(app) {
            return app === this.appShowingTask ? '#409EFF' : ''
        },
        clickSQLIcon(app) {
            console.log(app)
            let content = new Blob([app.sqlData.content])
            let urlObject = window.URL || window.webkitURL || window
            let url = urlObject.createObjectURL(content)
            let el = document.createElement('a')
            el.href = url
            el.download = app.appName + '-' + app.sqlData.queryName + '.sql'
            el.click()
            urlObject.revokeObjectURL(url)
        },
        clickCollapseIcon(app) {
            app.dagDiagramCollapse = !app.dagDiagramCollapse
        }
    },
    watch: {
        applications() {
            this.collapseList = this.applications.map(() => false)
        },
        taskLoaded(){
            // if (this.taskLoaded){
            //     this.$store.dispatch('comparison/queryAppMonitorData', this.loadedAppName)
            // }
        },
        overviewMatrix(){
            if (this.perfCellClick && !this.appShowingTask.monitorDataLoaded){
              this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})
              this.$store.dispatch('comparison/queryAppMonitorData', this.appShowingTask.appName)
            }
        },
        selectedMachineMetrics(){
          if (this.perfCellClick && !this.appShowingTask.monitorDataLoaded){
            this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})

            this.$store.dispatch('comparison/queryAppMonitorData', this.appShowingTask.appName)
          }
        }
    },
    computed: {
        ...mapState('comparison', {
            dataNames: state => state.dataNames,
            applications: state => state.applications,
            selectedApps: state => state.selectedApps,
            appShowingTask: state => state.appShowingTask,
            finishLoading : state => state.finishLoading,
            isLoading: state => state.isLoading,
            taskLoaded: state=>state.taskLoaded,
            overviewMatrix: state=>state.appShowingTask.overviewMatrix,
            selectedMachineMetrics: state=>state.appShowingTask.selectedMachineMetrics,
            perfCellClick: state => state.perfCellClick


          // machineList: state => state.machineList,
            // taskCount: state => state.taskCount,
            // selectTaskCount: state => state.selectTaskCount,
            // taskList: state => state.taskList,
            // renderSign: state => state.renderSign,
            // maxTime: state => state.maxTime,
            // minTime: state => state.minTime,
            // inLoading: state => state.inLoading,
            //
            // showDataflow: state => state.showDataflow,
        }),
    }

}
</script>

<style>
.selectContainer {
    margin: 0 auto;
}

.container {
    width: 100%;
    height: 100%;
}

/*#simulation {*/
/*    margin: 6px;*/
/*    width: calc(100% - 12px);*/
/*    height: calc(100% - 12px);*/

/*    !* use grid layout rather than el-row *!*/
/*    !* because el-row and el-scrollbar can't be used together *!*/
/*    display: grid;*/
/*    grid-template-columns: 10% auto;*/
/*    grid-template-rows: auto 60%;*/
/*    grid-template-areas:*/
/*                "sidebar upper"*/
/*                "sidebar lower";*/
/*    grid-gap: 10px 10px;*/
/*}*/
#main-pane {
    /*margin: 6px;*/
    /*width: calc(100% - 12px);*/
    /*height: calc(100% - 12px - 42px);*/
    margin: 6px;
    width: calc(100% - 12px);
    height: calc(100% - 12px);
    /* use grid layout rather than el-row */
    /* because el-row and el-scrollbar can't be used together */

}

#sidebar {
    grid-area: sidebar;
    width: 100%;
    height: 100%;
    text-align: left;
}

#dag-diagram-card {
    width: 100%;
    height: 100%;
    /*border-style: dashed;*/
    /*border-width: 1px;*/
}

#incremental-view-card {
    grid-area: lower;
    width: 100%;
    height: 100%;
    /*border-style: dashed;*/
    /*border-width: 1px;*/
}

.el-card >>> .el-card__body {
    padding: 10px;
    width: calc(100% - 10px * 2);
    height: calc(100% - 10px * 2);
}

.el-scrollbar {
    height: 100%;
    overflow-x: hidden;
}

.el-scrollbar >>> .el-scrollbar__wrap {
    height: 100%;
    overflow-x: hidden;
}

.el-tabs >>> .el-tabs__content {
    height: 100%;
    width: 100%;
}

.titletext {
    font-family: system-ui, serif;
    margin-left: 20px;
    margin-top: 8px;
    font-size: 18px;
    font-weight: bold;
}

.nav2 {
    /*font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;*/
    font-family: "Hiragino Sans GB";

    border-bottom-right-radius: 4px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-top-right-radius: 4px;
    background: #ccc;
    list-style-type: none;
    height: 42px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    color: #444444;
    text-align: left;

}

.el-input__inner {
    background-color: #f5f5f5;
}

.el-input-number__decrease {
    background-color: #dcdcdc;
}

.el-input-number__increase {
    background-color: #dcdcdc;
}

.el-button--mini {
    background-color: #dcdcdc;
}

.el-button.is-disabled {
    background-color: #dcdcdc;
}

.dag-container {
    overflow-y: scroll
}

.dag-item {
    margin: 6px 0 0 3px;
    border-style: solid;
    border-color: #d3dce6;
    border-width: 0.5px;
    border-radius: 3px;

    width: calc(100% - 10px);
}

.dag-item-not-collapse {
    height: 200px;
}

.dag-item-collapse {
    height: 30px;
}

.tdag-container {
    overflow-y: scroll
}

.tdag-item {
    margin: 6px 0 0 3px;
    border-style: solid;
    border-color: #d3dce6;
    border-width: 0.5px;
    border-radius: 3px;

    width: calc(100% - 10px);
    /*height: calc(50% - 12px);*/
}

.task-list-container {
    overflow-y: scroll
}

.machine-view-container {
    overflow: hidden;
}

.mini-icon {
    cursor: pointer;
    font-size: 1.2em;
    margin-left: 7px;
}

.card-head {
    height: 30px;
    display: flex;
    align-items: center;
}

.icon {
    float: left;
    cursor: pointer;
    margin: 2px;
    border: rgba(255, 255, 255, 0) solid 1px;
    border-radius: 3px;
    transition: border 0.4s
}

.icon:hover {
    border: rgb(206, 206, 206) solid 1px;
}
</style>
