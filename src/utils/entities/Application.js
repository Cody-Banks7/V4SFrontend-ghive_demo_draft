import * as d3 from "d3";
import {layoutConfig} from "@/utils/const/layoutConfig";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";

export class Application {
    appName

    dagData
    sqlData
    appInfo

    monData = {}        // monitor data for each machine
    counters = {}       // counter map for each task

    fetchData = []      // fetch info from task to task.
    fetchEndMap = {}    // the finished input of task from a vertex. taskId -> list of vertexName

    vertexMap = {}      // used in incr
    vertexes = []       // used in incr

    orderMap = {}               // const
    orderedVertexIdx = []       // const
    dagRoot = ''                // const
    childrenMap = {}           // const, parent vtxName -> list of children
    parentsMap = {}            // const, child vtxName -> list of parents
    vtxLaneMap = {}

    taskList = []
    taskMap = {}
    taskCount = ""

    stepNames = [
        'Initialization',
        'InputShuffle',
        'Processor',
        'Sink',
        'Spill'
    ]

    depTaskMaps = {
        srcTaskMap: {},
        dstTaskMap: {},
        srcDepMap: {},
        dstDepMap: {}
    }
    selectTaskList = []

    diagnoseMatrix = {}

    isLoading = false
    totalLoading = false

    overviewMatrix = false
    selectedMachineMetrics = {}

    isTaskListProcessed = false

    interactiveModule = {
        selectedTasks: [],
        selectedDeps: [],
        srcAffectedTasks: [],
        dstAffectedTasks: [],
        srcAffectedDeps: [],
        dstAffectedDeps: []
    }

    abnormalDeps = []

    absMaxTime = -1
    absMinTime = -1
    minTime = -1
    maxTime = -1
    vMaxTime = -1
    minTimeLength = Number.MAX_VALUE
    maxTimeLength = -1

    minDataSize = Number.MAX_VALUE
    maxDataSize = -1

    machineList = []
    machineMap = {}

    dataFlow = []
    maxCSize = 0        // max transfer size (only for fetch now)\

    selectTaskCount = ''
    timeSelection = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        startTime: -1,
        endTime: -1,
        minStartTime: -1,
        maxStartTime: -1,
        minEndTime: -1,
        maxEndTime: -1
    }

    edges = []
    renderEdges = []

    metrics = metrics

    // interaction start >>>>>>
    taskViewSelects = []
    // interaction end <<<<<<<<

    // linkColorPool: d3.schemeCategory10,

    hGraph = null
    visGraph = null
    updateTDADGSign = true

    clusterNumber = 1
    mergeCount = 0
    xScale
    mXScale
    mYScale
    mTYScale

    tdagCursorMode = TDAGCursorMode.NORMAL

    matrixRefDuration = null

    renderSign = false
    renderAxis = false

    // layout

    taskLoaded = false
    monitorDataLoaded = false

    // show detail or not in DAG diagram
    showDetail = true

    dagDiagramCollapse = true

    clickedVertex = null

    // tdagTransform = null

    constructor() {
        this.xScale = d3.scaleLinear().range([layoutConfig.marginLeft, layoutConfig.width - layoutConfig.marginRight]);
        this.mXScale = d3.scaleLinear().range([matrixLayoutConfig.marginLeft, matrixLayoutConfig.width - matrixLayoutConfig.marginRight]);
        this.mYScale = d3.scaleLinear().range([matrixLayoutConfig.marginTop, matrixLayoutConfig.height - matrixLayoutConfig.marginBottom]);
        this.mTYScale = d3.scaleLinear().range([matrixLayoutConfig.marginTop, matrixLayoutConfig.height - matrixLayoutConfig.marginBottom]);
    }

    changeRenderSign() {
        this.renderSign ^= true
    }
}


const metrics = {
    netIO: ['bytesRecv', 'bytesSent', 'dropin', 'dropout', 'errin', 'errout', 'packetsRecv', 'packetsSent'],
    diskMetric: ['avgquSz', 'avgrqSz', 'await', 'rAwait', 'rkBs', 'rrqms', 'rs', 'wAwait', 'wkBs', 'wrqms', 'ws'],
    diskMax: {'dm-0': {}, loop: {}, sdb: {}},
    netIOMax: {}

}

metrics.diskMetric.forEach(metric => {
    metrics.diskMax['dm-0'][metric] = 0;
    metrics.diskMax.loop[metric] = 0;
    metrics.diskMax.sdb[metric] = 0;
})
metrics.netIO.forEach(metric => {
    metrics.netIOMax[metric] = 0;
})

const matrixLayoutConfig = {
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

