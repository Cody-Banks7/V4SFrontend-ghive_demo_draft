/* eslint-disable */

import * as d3 from "d3";
import dataService from "@/service/dataService";
import {Graph} from "@/utils/utils/graph";
import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {TLAggrAlgo} from "@/utils/algo/tl-aggregation/TLAggreAlgo";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {VisHierarchyGraph} from "@/utils/entities/VisHierarchyGraph";
import {Application} from "@/utils/entities/Application";
import {initDagDiagram} from "@/utils/application-utils/dagInitializer";
import {loadTasksToApp} from "@/utils/application-utils/GHiveTaskLoader";
import {layoutConfig} from "@/utils/const/layoutConfig";
import {layoutTDAG} from "@/utils/application-utils/tdagLayout";
import dataservice_ghive from "@/service/dataservice_ghive";


// const metrics = {
//   netIO: ['bytesRecv', 'bytesSent', 'dropin', 'dropout', 'errin', 'errout', 'packetsRecv', 'packetsSent'],
//   diskMetric: ['avgquSz', 'avgrqSz', 'await', 'rAwait', 'rkBs', 'rrqms', 'rs', 'wAwait', 'wkBs', 'wrqms', 'ws'],
//   diskMax: {'dm-0': {}, loop: {}, sdb: {}},
//   netIOMax: {}
//
// }
//
// metrics.diskMetric.forEach(metric => {
//   metrics.diskMax['dm-0'][metric] = 0;
//   metrics.diskMax.loop[metric] = 0;
//   metrics.diskMax.sdb[metric] = 0;
// })
// metrics.netIO.forEach(metric => {
//   metrics.netIOMax[metric] = 0;
// })

const xScale = d3.scaleLinear().range([layoutConfig.marginLeft, layoutConfig.width - layoutConfig.marginRight]);

const dLine = d3.line().x(d => d.x).y(d => d.y);
const matrixLayoutCOnfig = {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    height: 300,
    width: 100,
    matrixMin: {},
    matrixMax: {},
    upperHeight: 1000,
}

const mXScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginLeft, matrixLayoutCOnfig.width - matrixLayoutCOnfig.marginRight]);
const mYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);
const mTYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);


const getOrSetIfMiss = function (map, key, default_) {
    let res = map[key]
    if (res == undefined) {
        res = default_
        map[key] = default_
    }
    return res
}


// initial state
const state = () => ({
    clickVertexNode: [],
    /** @type {string[]} */
    dagNames: [],

    /** @type {Application[]} */
    applications: [],
    /** @type {Map<string, Application>} */
    applicationMap: new Map(),
    /** @type {Application[]} */
    selectedApps: [],

    /** @type {Application} */
    appShowingTask: new Application(),

    layoutConfig: Object.assign({}, layoutConfig),
    gapPixel: 25,       // the horizontal gasp between two vertex at same lane in data flow diagram

    inLoading: false,        // is data flow diagram in loading (by press button)
    finishLoading: false,

    tdagTransform: null,

    incTimeStep: 60 * 10,

    colorSchema: {
        'Map': "#1b9e77",
        'Reducer': "#D95F02",
        'selected': "purple",
        'MapFail': '#1b9e77',
        'ReducerFail': '#D95F02',
        'selectedFail': '#bb0000',

        'selectAsProvider': '#d55e5e',
        'selectCurrent': 'purple',
        'selectAsConsumer': '#3c76e5',
        'fetchHighlight': '#8c45dc',
    },

    isLoading: false,
    taskLoaded: false,

    selectedMachineMetrics: {},

    perfCellClick: false,
    application: null,
    applicationGpu: null,
    maxTimeScale: 0
})

// actions
const actions = {

    // Query the list of data names
    queryDag({state, commit, dispatch}) {
        dataservice_ghive.queryDag({name: "Example11"}, resp => {
                commit('addData', {dataName: "GHiveCpu", dagData: resp})
                commit('changeTaskLoadedStatus', false)
            }
        )

        dataservice_ghive.queryDag({name: "Example19"}, resp => {
                commit('addDataGpu', {dataName: "GHiveGpu", dagData: resp})
                commit('changeTaskLoadedStatus', true)
                // console.log(state.applicationGpu)
            }
        )
    },

    queryTasks({state, commit, dispatch}) {
        // dataservice_ghive.queryTasks({name: "Example11"}, resp => {
        dataservice_ghive.queryHiveTasks({name: "Example11"}, resp => {
            const tasks = resp
            // tasks.forEach(task => {
            //     if (task.vec_name === "Map 7") {
            //         console.log(task)
            //         console.log("Map 7!")
            //     }
            // })
            commit('initAppTasks', {tasks: tasks, app: state.application})
            // console.log(state.application)
            // // use timeout to insure tdag pane loads first
            setTimeout(() => commit('layoutAppTDAG', state.application), 0)
            // console.log(state.application)
            // commit('changeTaskLoadedStatus', false)
        })
    },

    queryTasksGpu({state, commit, dispatch}) {
        // dataservice_ghive.queryTasks({name: "Example19"}, resp => {
        dataservice_ghive.queryGHiveTasks({name: "Example11"}, resp => {
            const tasks = resp
            // tasks.forEach(task => {
            //     if (task.vec_name === "Map 7") {
            //         console.log(task)
            //         console.log("Map 7!")
            //     }
            // })
            commit('initAppTasks', {tasks: tasks, app: state.applicationGpu})
            // // use timeout to insure tdag pane loads first
            setTimeout(() => commit('layoutAppTDAG', state.applicationGpu), 0)
            // console.log(state.application)
            // commit('changeTaskLoadedStatus', false)
        })
    },

}

// mutations
const mutations = {

    simulationChangeShowingApp(state, app) {
        state.appShowingTask = app;
    },
    addData(state, {dataName, dagData}) {
        initDagDiagram(state, dataName, dagData, true)
    },
    addDataGpu(state, {dataName, dagData}) {
        initDagDiagram(state, dataName, dagData, false)
        state.applicationGpu = state.applications[0]
    },
    addSelectedApp(state, appName) {
        if (!state.selectedApps.includes(state.applicationMap.get(appName)))
            state.selectedApps.push(state.applicationMap.get(appName))
        state.appShowingTask = state.applicationMap.get(appName)
        setTimeout(() => {
            state.selectedApps.forEach(app => this.commit('comparison/layoutAppTDAG', app))
        }, 0)
    },
    removeSelectedApp(state, appName) {
        const app = state.applicationMap.get(appName)
        state.selectedApps.splice(state.selectedApps.indexOf(app), 1)
        if (state.selectedApps.length > 0)
            state.appShowingTask = state.selectedApps[state.selectedApps.length - 1]
        setTimeout(() => {
            state.selectedApps.forEach(app => this.commit('comparison/layoutAppTDAG', app))
        }, 0)
    },
    changeAppShowingTask(state, appName) {
        const app = state.applicationMap.get(appName)
        state.appShowingTask = app
        app.monitorDataLoaded = true
        console.log('current app', app)
    },
    changeRenderSign(state, app) {
        // wait a cycle for element creation
        setTimeout(() => app.changeRenderSign(), 0)
    },

    updateTDAGScale(state, {app, width, height}) {
        state.layoutConfig.width = width;
        state.layoutConfig.height = height - state.layoutConfig.marginTop;
        app.xScale.range([state.layoutConfig.marginLeft, state.layoutConfig.width - state.layoutConfig.marginRight]);
    },

    initAppTasks(state, {tasks, app}) {
        loadTasksToApp(state, tasks, app)
        //time used here Ghive
        // console.log(state.application.vMaxTime - state.application.minTime)
    },

    initialAppDiagnoseMatrix(state, {app, diagnoseMatrix}) {
        app.diagnoseMatrix = diagnoseMatrix
    },
    changeTaskLoadedStatus(state, status) {
        state.taskLoaded = status
    },
    layoutAppTDAG(state, app) {
        if (app === undefined) {
            return
        }
        let maxDuration = 0;
        if (state.selectedApps.length > 0 && state.selectedApps[0] !== undefined) {
            maxDuration = Math.max(...state.selectedApps.map(app => app.vMaxTime - app.minTime))
        } else {
            maxDuration = app.vMaxTime - app.minTime;
        }
        // console.log(app.maxTime - app.minTime)
        //ghive time scale
        console.log("ghive time scale", maxDuration)
        // maxDuration = 99091 + 19000
        maxDuration = 59892
        maxDuration *= 1.05;
        layoutTDAG(state, app, maxDuration)
        app.renderAxis ^= true
    },

    estimationIncrementalContainerHeight(state, nVertex) {
        // state.layoutConfig.vertexContainerHeight = Math.max((state.layoutConfig.height - state.layoutConfig.marginTop) / nVertex, 45);
        // state.layoutConfig.vertexContainerHeight = Math.min(20, state.layoutConfig.vertexContainerHeight);
        //
        // state.layoutConfig.vertexHeight = (state.layoutConfig.vertexContainerHeight - 8) * 0.8
        //
        // console.log('update', state.layoutConfig)
    },

    updateMonData(state, {app, monData}) {
        for (let machineId in monData) {
            let monList = monData[machineId]
            if (app.monData[machineId] === undefined) {
                app.monData[machineId] = monList
            } else {
                let monData = app.monData[machineId]
                monList.forEach(item => monData.push(item))
            }
        }
        for (let machineId in app.monData) {
            if (app.machineMap[machineId]) {
                app.machineMap[machineId]['status'] = app.monData[machineId]
                // console.log('>>', app.machineMap[machineId]['status'].length)
            }
        }

        // update disk Max value
        let diskNames = Object.keys(app.metrics.diskMax);
        let metrics = app.metrics.diskMetric;
        if (Object.values(monData).length > 0) {
            metrics.forEach(metric => {
                diskNames.forEach(diskName => {
                    app.metrics.diskMax[diskName][metric] = d3.max(Object.values(monData),
                        machineValue => d3.max(machineValue, d => d.iostat[diskName] == undefined ? 0 : d.iostat[diskName][metric]))
                })
            })
        }
        // update netIO maxValue

        let netMetrics = app.metrics.netIO;
        if (Object.values(monData).length > 0) {
            netMetrics.forEach(metric => {
                app.metrics.netIOMax[metric] = d3.max(Object.values(monData),
                    machineValue => d3.max(machineValue, d => d.netIO[metric]))
            })
        }
    },

    updateFetch(state, {app, changes, maxCSize, fetchGlyphs}) {
        // app.fetchData = changes;
        app.maxCSize = maxCSize;

        app.abnormalDeps = fetchGlyphs;
        // changes.forEach(fetchInfo => {
        //     app.fetchData.push(fetchInfo)
        // })
    },

    changeShowDataflow(state, {app, showDataflow}) {
        app.showDataflow = showDataflow
    },
    processDataFlow(state, {app, changes, maxCSize, fetchGlyphs}) {
        function addSrcDstTask(srcTask, dstTask, app) {
            let srcTaskMap = app.depTaskMaps.srcTaskMap, dstTaskMap = app.depTaskMaps.dstTaskMap
            if (!srcTaskMap[dstTask.task_id]) {
                srcTaskMap[dstTask.task_id] = {}
            }
            if (!srcTaskMap[dstTask.task_id][srcTask.task_id]) {
                srcTaskMap[dstTask.task_id][srcTask.task_id] = srcTask
            }
            if (!dstTaskMap[srcTask.task_id]) {
                dstTaskMap[srcTask.task_id] = {}
            }
            if (!dstTaskMap[srcTask.task_id][dstTask.task_id]) {
                dstTaskMap[srcTask.task_id][dstTask.task_id] = dstTask
            }
        }

        function addSrcDstDep(srcTask, dstTask, dep, app) {
            let srcDepMap = app.depTaskMaps.srcDepMap, dstDepMap = app.depTaskMaps.dstDepMap
            // -------------- src
            if (!srcDepMap[dstTask.task_id]) {
                srcDepMap[dstTask.task_id] = {}
            }
            if (!srcDepMap[dstTask.task_id][dep.dep_id]) {
                srcDepMap[dstTask.task_id][dep.dep_id] = dep
            }
            // -------------- dst
            if (!dstDepMap[srcTask.task_id]) {
                dstDepMap[srcTask.task_id] = {}
            }
            if (!dstDepMap[srcTask.task_id][dep.dep_id]) {
                dstDepMap[srcTask.task_id][dep.dep_id] = dep
            }
        }

        changes.forEach(dict => {
            if (dict.label === 'NORMAL') {
                dict.srcTask = app.taskMap[dict.src];
                dict.dstTask = app.taskMap[dict.dst];
                //  add depMap
                addSrcDstTask(dict.srcTask, dict.dstTask, app)
            } else {
                // src are all tasks from srcVtxName
                dict.srcTasks = app.vertexMap[dict.srcVtxName].tasks
                dict.dstTask = app.taskMap[dict.dst];
                dict.srcTasks.forEach(srcTask => {
                    addSrcDstTask(srcTask, dict.dstTask, app)
                })
            }
        })

        app.abnormalDeps.forEach((fetchGlyph) => {
            fetchGlyph.srcTask = app.taskMap[fetchGlyph.srcTask]
            fetchGlyph.dstTask = app.taskMap[fetchGlyph.dstTask]
            addSrcDstDep(fetchGlyph.srcTask, fetchGlyph.dstTask, fetchGlyph, app)
        })
    },

    changeDataNames(state, dataNames) {
        state.dataNames = dataNames;
    },

    changeSqlData(state, {app, sql}) {
        app.sqlData = sql
    },

    changeAppInfo(state, {app, info}) {
        app.appInfo = info
    },

    changeInLoading(state, inLoading) {
        state.inLoading = inLoading
        state.finishLoading = !inLoading
    },

    changeTDAGCursorMode(state, {app, mode}) {
        app.tdagCursorMode = mode
    },

    computeVisGraph(state, app) {
        console.log("computeVisGraph", app)
        app.visGraph = new VisHierarchyGraph(app.hGraph, {
            dagRoot: app.dagRoot,
            gapPixel: state.gapPixel,
            orderMap: (() => {
                let orderMap = new Map()
                Object.keys(app.orderMap).forEach(vertexName => {
                    orderMap.set(vertexName, app.orderMap[vertexName])
                })
                return orderMap
            })(),
            vertexContainerHeight: state.layoutConfig.vertexContainerHeight,
            marginTop: state.layoutConfig.marginTop,
        })
        console.log('marginTop', state.layoutConfig.marginTop)
        app.visGraph.computeStepLayout(app.vertexMap, xScale, state.layoutConfig)
    },

    handleTDAGNodeClick(state, {app, node}) {
        let aggrNode = node.data.hGraphNode.data
        let vertexId = aggrNode.nodeList[0].id
        if (app.clickedVertex !== null){
            app.clickedVertex = null
        }else{
            app.clickedVertex = state.application.vertexMap[vertexId]
        }
        console.log(app.clickedVertex, node)
        // let index = state.clickVertexNode.indexOf(state.application.vertexMap[vertexId])
        // if (index > -1) {
        //     state.clickVertexNode.splice(index, 1)
        // } else {
        //     state.clickVertexNode.push(state.application.vertexMap[vertexId])
        // }
    },

    changeHighlightByTask(state, {app, vertices, type, value}) {
        vertices.forEach(vertexName => {
            const node = app.visGraph.vertexName2Node.get(vertexName)
            node.data.layout[type] = value
        })
    },

    changeTDAGTransform(state, {app, transform}) {
        // state.selectedApps.forEach(application => {
        //   application.tdagTransform = transform
        // })
        state.lastMove = app
        state.tdagTransform = transform
        // console.log(state.tdagTransform)
    },

    // ------------- useless functions

    updateSelectTimeScale(state, range) {
        if (range == undefined || range.length != 2) {
            state.minTime = state.absMinTime;
            state.maxTime = state.absMaxTime;
            console.log('mutation', state.maxTime, state.minTime);
        } else {
            state.minTime = range[0];
            state.maxTime = range[1];
        }

        state.renderSign = !state.renderSign
    },
    updateTaskView(state, tasks) {
        if (tasks == undefined) {
            state.selectTaskList = state.taskList;
        } else {
            state.selectTaskList = tasks;
        }
    },
    // initIncrementalViewData(state) {
    //     state.taskNames = []
    //     state.vertexMap = {}
    //     state.vertexes = []
    //     state.renderEdges = []
    //
    //     state.vtxLaneMap = {}
    //
    //     state.monData = {}
    //     state.counters = {}
    //     state.fetchData = []
    //     state.fetchEndMap = {}
    //     state.outlierData = {}
    //
    //     state.transmitData = {}
    //
    //     state.maxCSize = 0
    // },

    updateLayout(state) {
        // Layout all nodes
        // let startTime = state.vertexes[0].startTime;
        // let endTime = state.vertexes[state.vertexes.length - 1].endTime;
        let startTime = d3.min(state.vertexes, vertex => vertex.startTime);
        let endTime = d3.max(state.vertexes, vertex => vertex.endTime);
        state.startTime = startTime
        if (endTime > state.endTime) {
            state.endTime = (endTime - startTime) * 1.2 + startTime;
            state.xScale.domain([startTime, state.endTime]);
            mXScale.domain([startTime, state.endTime]);
            mYScale.domain([startTime, state.endTime]);

            state.matrixDiagMin.x = mXScale(startTime);
            state.matrixDiagMin.y = mYScale(startTime);
            state.matrixDiagMax.x = mXScale(state.endTime);
            state.matrixDiagMax.y = mYScale(state.endTime);

        }

        /* layout */
        let mstAggregate = function mstAggregate() {
            // get ready for the layout algo
            let graph = new Graph()
            Object.keys(state.vertexMap).forEach(vtxName => {
                let vertex = state.vertexMap[vtxName]
                let vld = new VertexLayoutData(state.xScale(vertex.startTime),
                    state.xScale(vertex.endTime), 0,
                    vtxName.charAt(0) + vtxName.match(/.* (\d*)/)[1], [vtxName])
                graph.addNode(vtxName, vld)
            })
            Object.keys(state.childrenMap).forEach(vtxName => {
                let children = state.childrenMap[vtxName]
                children.forEach(child => graph.addEdge(child, vtxName))
            })
            let orderMap = new Map()
            Object.keys(state.orderMap).forEach(vertexName => {
                orderMap.set(vertexName, state.orderMap[vertexName])
            })


            let tlAggrAlgo = new TLAggrAlgo(graph)
            console.log(tlAggrAlgo)
            tlAggrAlgo.solve()

            return tlAggrAlgo.hGraph

        }
        // state.mstAggrGraph = mstAggregate()
        state.hGraph = mstAggregate()
        this.commit('comparison/computeVisGraph',)

        /* layout - end */

        // state.vertexes.forEach(vertex => {
        //   // let _widtj=
        //   let layout = {};
        //   if (vertex.layout.x == 0) {
        //     vertex.layout.x = state.xScale(vertex.startTime);
        //     vertex.layout.mX = mXScale(vertex.startTime);
        //   } else {
        //     layout.x = state.xScale(vertex.startTime);
        //     layout.mX = mXScale(vertex.startTime);
        //   }
        //   layout.width = state.xScale(vertex.endTime) - state.xScale(vertex.startTime);
        //   let laneIdx = state.vtxLaneMap[vertex.vertexName]
        //   if (vertex.layout.y == 0) {
        //     vertex.layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
        //     vertex.layout.mY = mYScale(vertex.endTime);
        //   } else {
        //     layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
        //     layout.mY = mYScale(vertex.endTime);
        //   }
        //   let startX = 0;
        //   // let stepLayout = []
        //   let sumVal = d3.sum(vertex.steps);
        //   TweenLite.to(vertex.layout, state.updateRate / 1000, layout)
        //   vertex.steps.forEach((step, j) => {
        //     let stepWidth = sumVal == 0 ? 0 : (step / sumVal * layout.width);
        //     let stepLayoutObj = {
        //       x: startX,
        //       width: stepWidth,
        //       id: j,
        //       fill: state.layoutConfig.stepColors[j],
        //       name: state.layoutConfig.stepName[vertex.hvType][j]
        //     }
        //     if (vertex.stepLayout.length < vertex.steps.length) {
        //       vertex.stepLayout.push(stepLayoutObj)
        //     } else {
        //       TweenLite.to(vertex.stepLayout[j], state.updateRate / 1000, stepLayoutObj);
        //     }
        //     // stepLayout.push(stepLayoutObj)
        //     startX += stepWidth;
        //   });
        //   // vertex.stepLayout = stepLayout;
        //   layout.height = state.layoutConfig.vertexHeight;
        // })
        //
        // state.renderSign = !state.renderSign
    },

    updateOutlierData(state, data) {
        state.outlierData = data
    },
    fixTaskStepInfo(state, taskList) {
        taskList.forEach(task => {
            state.taskMap[task.task_id].step_info = task.step_info
        })
    },
    updateCounters(state, {taskId, counter}) {
        state.counters[taskId] = counter
    },
    // must have full fetch data. when call this, processDataFlow has been called
    computeTransmission(state) {
        console.log('compute transmitMap start')

        let transmitMap = {}
        let transmitted = new Set()         // set of transmitted vertex for ALL label
        let machineIdxMap = {}
        state.machineList.forEach((machine, i) => machineIdxMap[machine.machineId] = i)
        let machineCnt = Object.keys(machineIdxMap).length
        if (machineCnt === 0) {
            return
        }
        state.fetchData.forEach(fetchInfo => {
            let dstVtxName = fetchInfo.dstTask.vec_name,
                dstMachine = fetchInfo.dstTask.machine_id
            let dstMachineIdx = machineIdxMap[dstMachine]

            if (fetchInfo.label === 'NORMAL') {
                let srcVtxName = fetchInfo.srcTask.vec_name,
                    srcMachine = fetchInfo.srcTask.machine_id
                let srcMachineIdx = machineIdxMap[srcMachine]

                let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
                let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

                if (tsmSrcDst.length === 0) {       // init if is []
                    for (let i = 0; i < machineCnt; i++) {
                        let row = []
                        for (let j = 0; j < machineCnt; j++) {
                            row.push(0)
                        }
                        tsmSrcDst.push(row)
                    }
                }
                tsmSrcDst[srcMachineIdx][dstMachineIdx] += fetchInfo.csize
                state.maxCSize = Math.max(state.maxCSize, fetchInfo.csize)

            } else {        // is ALL
                let srcVtxName = fetchInfo.srcVtxName
                if (!transmitted.has(srcVtxName)) {
                    fetchInfo.srcTasks.forEach(srcTask => {
                        let srcVtxName = srcTask.vec_name,
                            srcMachine = srcTask.machine_id
                        let srcMachineIdx = machineIdxMap[srcMachine]

                        let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
                        let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

                        if (tsmSrcDst.length === 0) {       // init if is []
                            for (let i = 0; i < machineCnt; i++) {
                                let row = []
                                for (let j = 0; j < machineCnt; j++) {
                                    row.push(0)
                                }
                                tsmSrcDst.push(row)
                            }
                        }
                        let srcTaskCounters = state.counters[srcTask['task_id']]
                        let size = srcTaskCounters['OUTPUT_BYTES']
                        tsmSrcDst[srcMachineIdx][dstMachineIdx] += size
                        state.maxCSize = Math.max(state.maxCSize, size)
                    })
                    transmitted.add(srcVtxName)
                }
            }
        })
        state.transmitData = transmitMap

        console.log('fetchData: %o', state.fetchData)
        console.log('transmitData: %o', state.transmitData)
    },
    // save task recv into task obj. {machineId: [recv]}
    computeTaskRecvSend(state) {
        state.fetchData.forEach(fetchInfo => {
            let dstTask = state.taskMap[fetchInfo.dst],
                dstMachine = fetchInfo.dstTask.machine_id
            let recvMap = getOrSetIfMiss(dstTask, 'recv', {})

            if (fetchInfo.label === 'NORMAL') {
                let srcTask = state.taskMap[fetchInfo.src],
                    srcMachine = fetchInfo.srcTask.machine_id
                let sendMap = getOrSetIfMiss(srcTask, 'send', {})

                getOrSetIfMiss(recvMap, srcMachine, []).push(fetchInfo)
                getOrSetIfMiss(sendMap, dstMachine, []).push(fetchInfo)

            } else {        // is ALL
                fetchInfo.srcTasks.forEach(srcTask => {
                    let srcMachine = srcTask.machine_id
                    let sendMap = getOrSetIfMiss(srcTask, 'send', {})

                    let srcTaskCounters = state.counters[srcTask['task_id']]
                    let size = srcTaskCounters['OUTPUT_BYTES']

                    let genFetchData = {
                        ...fetchInfo,
                        csize: size,
                        src: srcTask.task_id,
                        srcTask,
                    }
                    delete genFetchData['srcTasks']
                    delete genFetchData['srcVtxName']

                    getOrSetIfMiss(recvMap, srcMachine, []).push(genFetchData)
                    getOrSetIfMiss(sendMap, dstMachine, []).push(genFetchData)
                })
            }
        })
        console.log('after set recv / send, taskList: %o', state.taskList)
    },

    trgFinishLoading(state) {
        state.finishLoading = true
    },
    changeTimeHandler(state, {timeHandler}) {
        state.timeHandler = timeHandler
    },
    changeSimRate(state, simRate) {
        state.simRate = simRate
    },
    changeSimRunning(state, running) {
        state.simRunning = running
    },
    changeMonRunning(state, running) {
        state.monRunning = running
    },
    changeSimDataName(state, simDataName) {
        state.simDataName = simDataName
    },
    changeShowCompound(state, showCompound) {
        state.showCompound = showCompound
    },
    changeMergeCount(state, mergeCount) {
        state.mergeCount = mergeCount
    },

    updateTaskScale(state, region) {
        mXScale.range([matrixLayoutCOnfig.marginLeft, region.width - matrixLayoutCOnfig.marginRight]);
        mYScale.range([matrixLayoutCOnfig.marginTop, region.height - matrixLayoutCOnfig.marginBottom]);
        matrixLayoutCOnfig.upperHeight = region.upperHeight;
    },

    getTaskCountByTaskList(state, tasks) {
        let usage = [];
        let trend = [];
        let count = 0;
        tasks.forEach(task => {
            usage.push({'type': 'start', 'time': task.start_time});
            usage.push({'type': 'end', 'time': task.end_time});
        })
        usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

        usage.forEach(u => {
            if (u.type == 'start') {
                count += 1;
            } else if (u.type == 'end') {
                count -= 1;
            } else {
                console.log('error type')
            }
            if (trend.length > 0 && trend[trend.length - 1].time == u.time) {
                trend[trend.length - 1].count = count;
            } else {
                trend.push({'time': u.time, 'count': count})
            }
        })

        let _render = [];
        trend.forEach((u, i) => {
            if (i != 0) {
                _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
            }
            _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
        })
        state.selectTaskCount = dLine(_render);
    },
    hoverVertex(state, vertex) {
        if (typeof vertex == 'string') {
            vertex = state.vertexMap[vertex]
        }
        if (vertex == undefined) {
            return
        }
        vertex.layout.selected = true;
        state.vertexes.forEach(vertex => {
            vertex.tasks.forEach(task => {
                task.layout.selected = false;
            })
        })
        vertex.tasks.forEach(task => {
            task.layout.selected = true;
        })

        let startTimeRange = d3.extent(vertex.tasks, task => task.start_time);
        let endTimeRange = d3.extent(vertex.tasks, task => task.end_time);

        // should be put together

        state.timeSelection.startTime = state.timeSelection.minStartTime = startTimeRange[0];
        state.timeSelection.maxStartTime = startTimeRange[1];
        state.timeSelection.minEndTime = endTimeRange[0];
        state.timeSelection.endTime = state.timeSelection.maxEndTime = endTimeRange[1];


        this.commit('simulation/getTaskCountByTaskList', vertex.tasks);
    },
    hoverOutVertex(state, vertex) {
        if (typeof vertex == 'string') {
            vertex = state.vertexMap[vertex]
        }
        if (vertex == undefined) {
            return
        }
        vertex.layout.selected = false;
        vertex.tasks.forEach(task => {
            task.layout.selected = false;
        })

        state.machineList.forEach(machine => machine.selectTaskCount = "")
        // should be put together
        state.timeSelection.startTime = -1;
        state.timeSelection.endTime = -1;
        state.timeSelection.x1 = 0;
        state.timeSelection.x2 = 0;
        state.timeSelection.y1 = 0;
        state.timeSelection.y2 = 0;
    },
    selectVertex(state, vertex) {

        if (vertex == state.selectedVertex) {
            state.selectedVertex = null;
        } else {
            state.selectedVertex = vertex;
        }

    },

    changeLoadingStatus(state, {loadingStatus}) {
        state.isLoading = loadingStatus
    },

    changeAppShowingTaskOverviewMatrix(state) {
        if (state.appShowingTask.selectedMachineMetrics.length < 0)
            return
        state.perfCellClick = true
        state.appShowingTask.overviewMatrix = !state.appShowingTask.overviewMatrix
    },

    changeAppShowingTaskSelectedMachine(state, machineName) {
        if (state.appShowingTask.selectedMachineMetrics.length < 0)
            return
        state.perfCellClick = true
        let tmp = {}
        for (let machine in state.appShowingTask.selectedMachineMetrics) {
            tmp[machine] = state.appShowingTask.selectedMachineMetrics[machine]
        }
        tmp[machineName] = !tmp[machineName]
        state.appShowingTask.selectedMachineMetrics = tmp
    },

    changeAppShowingAllTaskMachine(state) {
        let tmp = {}
        for (let machine in state.appShowingTask.selectedMachineMetrics) {
            tmp[machine] = !state.appShowingTask.selectedMachineMetrics[machine]
        }
        state.appShowingTask.selectedMachineMetrics = tmp
    }

}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
