<template>
  <div style="width: 100%">
    <el-row v-show="showProgress" style="height: 100%; ">
      <!--            <svg style="height: 100%; width: 100%;" class="tdag-container">-->
      <svg style="height: 320px; width: calc(100% - 10px)" class="tdag-container svgContainer">
        <defs>
          <linearGradient v-for="[nodeId, colorTicks] in Array.from(colorPropMap.entries())"
                          :key="nodeId"
                          :id="'grad-' + app.appName.replace(' ', '-') + '-' + nodeId.replace(' ', '-')"
                          x1="0" x2="1" y1="0" y2="0">
            <stop v-for="(colorTick, i) in colorTicks" :key="i"
                  :offset="colorTick.percent + '%'" :stop-color="colorTick.color"/>
          </linearGradient>
          <linearGradient :id="'grad-' + app.appName + '-legend'">
            <stop offset="0%" :stop-color="minTaskNoColor"></stop>
            <stop offset="100%" :stop-color="maxTaskNoColor"></stop>
          </linearGradient>
        </defs>
        <g transform="translate(12,0)">
          <g v-if="loaded" class="progressContainer" :transform="'translate(' + [transformY, 0]+')'">
            <g class="edgeContainer">
              <path v-for="({path, edge}, i) in pathModels" :key="i"
                    :d="path" fill="none"
                    stroke="rgb(125, 125, 125)"
                    stroke-width="2"
              ></path>
              <!--                                      :stroke-width="getEdgeStrokeWidth(edge)"></path>-->
            </g>
            <VertexProgress v-for="(node) in nodes" v-bind:key="node.id" :node="node"
                            :layoutConfig="layoutConfig"
                            :app="app"
                            :colorSchema="colorSchema"
                            :showStepView="showStepView"
                            :stepNames="stepNames">
            </VertexProgress>


          </g>
          <g class="timeAxis" transform="translate(0,300)">
            <rect fill="white" :width="width" height="20" opacity="1"></rect>
          </g>
          <g class="YAxis" transform="translate(20, 0)">
            <!--            <text y=20 x=-38 style="font-family:'Calibri',Serif;font-size: 18px;">Jobs</text>-->
            <!--            <rect y=0 fill="white" :width="30" height="430" opacity="1"></rect>-->
          </g>
        </g>

        <g v-if="!loaded">
          <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
            No data selected
          </text>
        </g>
        <g class="detailStructure"></g>
      </svg>
      <!--            <div style="background-color: #ffffff; justify-content: left; text-align: left;margin-left:5px">-->
      <!--              <el-radio-group v-model="ratioName">-->
      <!--                <el-radio :label="stepSelector[0]">Overall</el-radio>-->
      <!--                <el-radio :label="stepSelector[1]">Input</el-radio>-->
      <!--                <el-radio :label="stepSelector[2]">Processor</el-radio>-->
      <!--                <el-radio :label="stepSelector[3]">Output</el-radio>-->
      <!--                &lt;!&ndash;                    <el-radio :label="stepSelector[3]">{{stepSelector[3]}}</el-radio>&ndash;&gt;-->
      <!--                &lt;!&ndash;                    <el-radio :label="stepSelector[4]">{{stepSelector[4]}}</el-radio>&ndash;&gt;-->
      <!--                &lt;!&ndash;                    <el-radio :label="stepSelector[5]">{{stepSelector[5]}}</el-radio>&ndash;&gt;-->
      <!--              </el-radio-group>-->
      <!--            </div>-->
    </el-row>
  </div>
</template>

<script>
/* eslint-disable */
import * as d3 from "d3";
import {mapState} from "vuex";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {Application} from "@/utils/entities/Application";
import VertexProgress from "@/component-element/VertexProgress";
import PerformanceMatrix from "@/components-new/PerformanceMatrix/PerformanceMatrix";
import {arrayFindIndex} from "element-ui/src/utils/util";

const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)


// FIXME compute bar color
const colorGen = d3.interpolateBlues


/**
 * @param nodeId
 * @param trend
 * @param timeInterval in ms
 * @param globalMaxCount
 * @returns {{percent:number, color:string}[]}
 */

function generateScale(newXScale) {
  //TODO axis
  let axis = d3.axisBottom(newXScale)
  axis.ticks(5).tickFormat(d => (d) / 1000 + 's').tickSize(3)
  return axis
}

export default {
  name: "TlAggrView",
  props: [
    "app",
    "transformY"
  ],
  components: {
    PerformanceMatrix,
    VertexProgress
  },
  data() {
    return {
      iconSize: 18,   // px
      containerWidth: 0,
      containerHeight: 0,
      mergeCount: 0,
      maxMergeCount: 10,
      showStepView: false,
      testTransform: '',
      staticXScaleCopy: undefined,
      newXScale: undefined,
      width: 0,
      zoom: null,
      domain: null,
      stepNames: [
        'Initialization',
        'Input/Shuffle',
        'Processor',
        'Sink',
        'Spill',
      ],
      overallExtend: new Map(),
      showPerformance: false,
      showProgress: true,
      stepSelectorIndex: 0,
      ratioName: "Overall",
      initialed: false,
      overallExtendLen: 0
    }
  },
  mounted() {
    let width = this.$el.clientWidth;
    let height = this.$el.clientHeight;
    // console.log(width, height, this.$el)
    this.width = width
    this.containerHeight = height;
    this.containerWidth = width;
    this.$store.commit('comparison/updateTDAGScale', {app: this.app, width, height});
  },
  created() {
  },
  watch: {
    loaded() {
      if (this.loaded == true) {
        let _this = this

        // d3.select('.testCircle').attr('cx', this.newXScale(start))

        // console.log('= d3.min(taskList, task => task.start_time', start, end, (end - start), (end - start) / 1000)

        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;

        this.svg = d3.select(this.$el).select('.tdag-container');
        this.zoom = d3.zoom()
            .scaleExtent([-3, 8])
            .extent([[20, 20], [width - 20, height - 20]])
            .on('zoom', function () {
              _this.svg.select('.progressContainer').attr('transform', d3.event.transform);
              _this.newXScale = d3.event.transform.rescaleX(_this.staticXScaleCopy);
              _this.updateAxis()
              _this.$store.commit('comparison/changeTDAGTransform',
                  {app: _this.app, transform: d3.event.transform})
            });
        this.svg.call(this.zoom);
        this.clusterNumber = this.maxMergeCount = Math.max(1, this.graph.nodes.length)
      }
    },
    tdagTransform() {
      if (!this.tdagTransform) return
      this.svg.select('.progressContainer').attr('transform', this.tdagTransform);
      this.newXScale = this.tdagTransform.rescaleX(this.staticXScaleCopy);
      this.zoom.transform = this.tdagTransform
      this.updateAxis()
    },
    renderAxis() {
      const domain = this.stateXScale.domain()
      let start = d3.min(this.taskList, task => task.start_time)
      let end = d3.max(this.taskList, task => task.end_time)
      domain[0] -= start
      domain[1] -= start
      this.staticXScaleCopy = d3.scaleLinear().domain(domain).range(this.stateXScale.range())
      this.newXScale = d3.scaleLinear().domain(domain).range(this.stateXScale.range())

      this.updateAxis()
    },
    ratioName() {
      this.stepSelectorIndex = this.getIndex(this.stepSelector, this.ratioName)
      this.generateColorPropMap()
    },
    overallExtendLen() {
      if (this.initialed || this.overallExtendLen === 8) {
        this.ratioName = "Processor"
      }
    }
  },
  methods: {
    getTrend(taskList) {
      let usage = [];
      let trend = [];
      let count = 0;
      if (this.stepSelectorIndex !== 0) {
        taskList.forEach(task => {
          //TODO modify here
          usage.push({'type': 'start', 'time': task.step_info[this.stepSelectorIndex * 2 - 2]});
          usage.push({'type': 'end', 'time': task.step_info[this.stepSelectorIndex * 2 - 1]});
        })
      } else {
        taskList.forEach(task => {
          //TODO modify here
          usage.push({'type': 'start', 'time': task.start_time});
          usage.push({'type': 'end', 'time': task.end_time});
        })
      }
      usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

      usage.forEach(u => {
        if (u.type === 'start') {
          count += 1;
        } else if (u.type === 'end') {
          count -= 1;
        } else {
          console.log('error type')
        }
        if (trend.length > 0 && trend[trend.length - 1].time === u.time) {
          trend[trend.length - 1].count = count;
        } else {
          if (trend.length == 0) {
            trend.push({'time': u.time, 'count': 0})
          }
          // console.log('count', count)
          trend.push({'time': u.time, 'count': count})
        }

      })

      return trend
    },

    getColorTicks(nodeId, trend, timeInterval, globalMaxCount) {
      if (trend.length === 0) {
        return []
      }
      let timeExtent = d3.extent(trend, u => u.time)
      if (this.stepSelectorIndex === 0) {
        if (!this.overallExtend.has(nodeId)) {
          this.overallExtendLen += 1
          this.overallExtend.set(nodeId, timeExtent)
        }
      }
      //   if (nodeId === "Map 23" ){
      //     console.log(trend)
      // }
      timeExtent = this.overallExtend.get(nodeId);
      const getTimePercent = function getTimePercent(time) {
        if (time === timeExtent[0]) {
          return 0
        }

        return (time - timeExtent[0]) / (timeExtent[1] - timeExtent[0]) * 100
      }
      const colorTicks = []

      // remove last one (as it must be 0)
      for (let i = 0; i < trend.length - 1; ++i) {
        const t0 = trend[i], t1 = trend[i + 1]
        let color
        if (t0.count === 0) {
          color = 'rgba(143,147,147,0.73)'
        } else {
          // color = colorGen(t0.count / (globalMaxCount + 5 ))
          color = "blue"
        }
        colorTicks.push({percent: getTimePercent(t0.time), color})
        colorTicks.push({percent: getTimePercent(t1.time), color})
      }
      let color = "rgba(143,147,147,0.73)"
      colorTicks.push({percent: getTimePercent(trend[trend.length - 1].time), color})

      // let maxTime = d3.max(trend, t => t.time)
      // for (;maxTime<timeExtent[1];maxTime++){
      //
      // }
      //         let color = 'gray'
      // colorTicks.push({percent: getTimePercent(maxTime), color})

      return colorTicks
    },

    getIndex(ary, val) {
      let index = null;
      ary.every(function (value, i) {
        if (val === value) {
          index = i;
          return false;
        }
        return true;
      });
      return index;
    },
    clickShowProgress() {
      this.showProgress = !this.showProgress
    },
    clickShowPerf() {
      this.showPerformance = !this.showPerformance
    },
    changeMergeCount(mergeCount) {
      if (this.loaded) {
        this.$store.commit('comparison/changeMergeCount', mergeCount)
        this.$store.commit('comparison/updateLayout')
      }
    },
    toUnfoldMode() {
      console.log('unfold', this.tdagCursorMode)
      if (this.tdagCursorMode === TDAGCursorMode.UNFOLD) {
        this.$store.commit('comparison/changeTDAGCursorMode',
            {app: this.app, mode: TDAGCursorMode.NORMAL})
      } else {
        this.$store.commit('comparison/changeTDAGCursorMode',
            {app: this.app, mode: TDAGCursorMode.UNFOLD})
      }
    },
    toFoldMode() {
      console.log('fold', this.tdagCursorMode)
      if (this.tdagCursorMode === TDAGCursorMode.FOLD) {
        this.$store.commit('comparison/changeTDAGCursorMode',
            {app: this.app, mode: TDAGCursorMode.NORMAL})
      } else {
        this.$store.commit('comparison/changeTDAGCursorMode',
            {app: this.app, mode: TDAGCursorMode.FOLD})
      }
    },
    changeShowStepView() {
      this.showStepView ^= true
    },

    getEdgeStrokeWidth(edge) {
      const srcLayout = edge.src.data.layout,
          dstLayout = edge.dst.data.layout
      const toBold = [srcLayout, dstLayout].every(layout => {
        return layout.selectCurrent || layout.selectAsProvider || layout.selectAsConsumer
      })
      return 0.2
      // return toBold ? 2.5 : 0.5
    },
    updateAxis() {
      d3.select(this.$el).select('.timeAxis').call(generateScale(this.newXScale));
      d3.select(this.$el).select('.timeAxis').selectAll('text').style('font-size', 15).style('stroke', "black").style('stroke-width', 0.5)


      var yScale = d3.scaleLinear()
          .domain([0, 10])
          .range([300, 0])
      // var yAxis = d3.svg.axis()
      //     .scale(yScale)
      //     .orient("left");
      d3.select(this.$el).select('.YAxis').call(d3.axisRight(yScale).ticks(0).tickFormat(d => '').tickSize(3))

    },
    generateColorPropMap() {
      const ret = new Map()

      // cluster tasks by vertex
      const vertexTasksMap = new Map()
      this.taskList.forEach(task => {
        if (!vertexTasksMap.has(task.vec_name)) {
          vertexTasksMap.set(task.vec_name, [])
        }
        vertexTasksMap.get(task.vec_name).push(task)
      })
      // console.log('vertexTasksMap', vertexTasksMap)

      const taskListMap = new Map()   // layout node -> tasks
      this.nodes.forEach(node => {
        const tasks = []
        node.data.vertexIdList.forEach(vertexName => {
          tasks.push(...vertexTasksMap.get(vertexName))
        })
        taskListMap.set(node.id, tasks)
      })
      // console.log('taskListMap', taskListMap)
      const trendMap = new Map()
      Array.from(taskListMap.entries()).forEach(entry => {
        const [nodeId, tasks] = entry
        const trend = this.getTrend(tasks)
        trendMap.set(nodeId, trend)
      })
      const maxCount = d3.max(Array.from(trendMap.values()), trend => d3.max(trend, t => t.count))
      // console.log(maxCount)
      Array.from(trendMap.entries()).forEach(entry => {
        const [nodeId, trend] = entry
        ret.set(nodeId, this.getColorTicks(nodeId, trend, 100, maxCount))
      })
      this.initialed = true
      return ret
    }
  },
  computed: {
    stepSelector() {
      return this.app.stepNames
    },
    graph() {
      return this.app.visGraph
    },
    loaded() {
      return !!this.graph
    },
    ...mapState('comparison', {
      colorSchema: state => state.colorSchema,
      layoutConfig: state => state.layoutConfig,
      gapPixel: state => state.gapPixel,
      tdagTransform: state => state.tdagTransform,
      lastMove: state => state.lastMove,
    }),
    taskList() {
      return this.app.taskList
    },
    dagRoot() {
      return this.app.dagRoot
    },
    tdagCursorMode() {
      return this.app.tdagCursorMode
    },
    stateXScale() {
      return this.app.xScale
    },
    // tdagTransform() {
    //   return this.app.tdagTransform
    // },
    renderAxis() {
      return this.app.renderAxis
    },
    orderMap() {
      const originOrderMap = this.app.orderMap
      let orderMap = new Map()
      Object.keys(originOrderMap).forEach(vertexName => {
        orderMap.set(vertexName, originOrderMap[vertexName])
      })
      return orderMap
    },
    nodes() {
      return this.graph ? this.graph.nodes : []
    },
    edges() {
      return this.graph ?
          [...this.graph.edges].sort((e1, e2) => e2.data - e1.data) : []
    },
    pathModels() {
      return this.edges.map(e => {
        let offsetY = this.layoutConfig.vertexHeight / 2
        let sx = e.src.data.layout.x1,
            sy = e.src.data.layout.y + offsetY,
            dx = e.dst.data.layout.x0,
            dy = e.dst.data.layout.y + offsetY
        if (dx <= sx) {
          dx = Math.min(e.dst.data.layout.x1, sx + 20)
          dy += ((sy < dy) ? -1 : 1) * offsetY
        }
        dx = Math.max(sx, dx)
        let points = [
          [sx, sy],
          [(sx + dx) / 2, sy],
          [(sx + dx) / 2, dy],
          [dx, dy]
        ]
        return {path: curveGen(points), edge: e}
      })
    },
    colorPropMap() {
      return this.generateColorPropMap()
    },
    unfoldIconColor() {
      return this.tdagCursorMode === TDAGCursorMode.UNFOLD ? '#539fff' : '#231815'
    },
    foldIconColor() {
      return this.tdagCursorMode === TDAGCursorMode.FOLD ? '#539fff' : '#231815'
    },
    stepViewIconColor() {
      return this.showStepView ? '#539fff' : '#231815'
    },
    stateXScaleRage() {
      return this.stateXScale?.range()
    },
    minTaskNoColor() {
      return colorGen(0)
    },
    maxTaskNoColor() {
      return colorGen(1)
    }
  }
}
</script>

<style scoped>
.bottom-group {
  /*position: absolute;*/
  /*left: 0;*/
  /*bottom: 0;*/
  /*margin: 10px;*/
  /*padding: 2px;*/
  /*float: right;*/
  /*border-radius: 4px;*/
  /*background: rgba(241, 241, 241, 0.62);*/

  position: absolute;
  right: 30px;
  top: -25px;
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

.vertex-rect {
  cursor: pointer;
}

.svgContainer {
  /*border-style: solid;*/
  /*border-color: #d9d8d8;*/
  /*border-width: 0.2px;*/
  /*border-radius: 3px;*/
  width: calc(100% - 10px);
  /*height: calc(50% - 12px);*/
}


.YAxis {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
</style>
