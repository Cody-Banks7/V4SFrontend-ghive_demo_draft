<template>
  <div style="height: 100%;">
    <svg style="height: 90%; width: 90%">
      <g class="rootContainer">
        <rect :width="containerWidth" :height="containerHeight"
              fill="none"></rect>
        <g class="container">
          <g v-if="loaded">
            <OperatorsNode v-for="node in nodes" :key="node.idx" :node="node"></OperatorsNode>
            <g :transform="'translate(' + linkTranslate + ')'">
              <OperatorsLink v-for="edge in edges" :key="edge.idx" :edge="edge" :nodeMap="nodeMap"></OperatorsLink>
            </g>
          </g>
          <g v-if="!loaded">
            <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
              No data selected
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>

import * as d3 from "d3"
import OperatorsNode from "@/components-new/Processor/ProcessorComponent/DAG/OperatorsNode";
import OperatorsLink from "@/components-new/Processor/ProcessorComponent/DAG/OperatorsLink";

export default {
  name: "DAGDiagram",
  props: ['dag'],
  components: {
    OperatorsNode,
    OperatorsLink
    // Vertex
  },

  data() {
    return {
      margin: {top: 20, right: 20, bottom: 50, left: 10},
      containerWidth: 0,
      containerHeight: 0,
      nodeContainerHeight: 30,
      nodeBarHeight: 25,
      nodes: [],
      nodeMap: {},
      edges: [],
      stepColorEncoding: {
        "Initialization": "#a6cee3",
        "Shuffle": "#1f78b4",
        "Processor": "#b2df8a",
        "Sink": "#e31a1c",
        "Output": "#ff7f00",
        "Spill": "#cab2d6",
        "Input": "#984ea3"
      },
      nodeWidth: 50,
      nodeHeight: 20,
    }
  },
  mounted() {
    this.containerHeight = this.$el.clientHeight;
    this.containerWidth = this.$el.clientWidth;  // hardcode
    console.log(this.containerHeight)
    this.svg = d3.select(this.$el);
    let zoom = d3.zoom()
        .scaleExtent([-13, 12])
    zoom.on('zoom', () => {
      this.svg.select('.rootContainer').attr('transform', d3.event.transform);
      // zoom.transform(this.svg.select('.rootContainer'), d3.event.transform)
    });
    this.svg.call(zoom);
    // const transform = d3.zoomTransform(this.svg.node).apply([-100, 0]).scale(0.8)
    // zoom.transform(this.svg, transform)
    zoom.scaleTo(this.svg, 0.8)
    // zoom.translateBy(this.svg, -this.containerWidth * 0.2, 0)

    this.init()
    // console.log(this.nodes)
  },
  methods: {
    init() {
      let dag = this.dag
      let h = this.calDep(dag)
      let totalHeight = this.containerHeight
      let avgHeight = totalHeight / h * 1.2
      let curTotalWidth = this.containerWidth
      // let nodeRoot = new Node(tmpNode.name, curTotalWidth / 2, avgHeight / 2, 10)
      this.initNode(dag, 0, curTotalWidth, -40, avgHeight)

    },
    initNode(rootNode, curXOffSet, curTotalWidth, curYOffSet, avgHeight) {
      // let nodeRoot = new Node(rootNode.name, curXOffSet + curTotalWidth / 2, curYOffSet + avgHeight / 2, 10)
      let nodeRoot = {
        name: rootNode.name,
        x: curXOffSet + curTotalWidth / 2,
        y: curYOffSet + avgHeight / 2,
        color: "None"
      }
      this.nodeMap[rootNode.name] = nodeRoot
      this.nodes.push(nodeRoot)
      if (rootNode.children === undefined)
        return
      this.edges.push({
        src: rootNode.children[0].name,
        dst: rootNode.name
      })

      this.edges.push({
        src: rootNode.children[1].name,
        dst: rootNode.name
      })
      this.initNode(rootNode.children[0], curXOffSet, curTotalWidth / 2, curYOffSet + avgHeight, avgHeight)
      this.initNode(rootNode.children[1], curXOffSet + curTotalWidth / 2, curTotalWidth / 2,
          curYOffSet + avgHeight, avgHeight)

    },
    calDep(dagRoot) {
      let tmpNode = dagRoot
      if (tmpNode.children === undefined) {
        return 1
      }
      let tmpH = this.calDep(tmpNode.children[0])
      for (let child in tmpNode.children) {
        tmpH = d3.max([tmpH, this.calDep(child)])
      }
      return 1 + tmpH
    },
    enterDagNode(node) {
      if (!this.app.monitorDataLoaded) {
        return
      }
      this.$store.commit('comparison/changeHighlightByTask', {
        app: this.app,
        vertices: [node.vdat.vertex_name],
        type: 'selectCurrent',
        value: true,
      })
      const vertex = this.app.vertexMap[node.vdat.vertex_name]
      vertex.tasks.forEach(task => {
        task.layout.selectCurrent = true
      })

      let maxDuration = 0
      maxDuration = Math.max(maxDuration, d3.max(vertex.tasks, t => t.end_time - t.start_time))
      this.app.matrixRefDuration = maxDuration
    },
    leaveDagNode(node) {
      if (!this.app.monitorDataLoaded) {
        return
      }
      this.$store.commit('comparison/changeHighlightByTask', {
        app: this.app,
        vertices: [node.vdat.vertex_name],
        type: 'selectCurrent',
        value: false,
      })
      const vertex = this.app.vertexMap[node.vdat.vertex_name]
      vertex.tasks.forEach(task => {
        task.layout.selectCurrent = false
      })
      this.app.matrixRefDuration = null
    },
    drawAppInfo() {
      const detailContainer = d3.select(this.$el).select('.detail-container')
      if (!detailContainer.selectAll('*').empty() || !this.appInfo) {
        return
      }
      const duration = this.appInfo.endTime - this.appInfo.startTime
      const machineCnt = this.appInfo.machines.length
      const mapCnt = this.appInfo.vertices.filter(v => v.startsWith('Map')).length
      const reducerCnt = this.appInfo.vertices.filter(v => v.startsWith('Reducer')).length
      const taskCnt = this.appInfo.taskCnt

      const labels = ['Duration', 'Machine No.', 'Map No.', 'Reducer No.', 'Task No.']
      const values = [Math.round(duration / 1000) + 's', machineCnt, mapCnt, reducerCnt, taskCnt]
      const rows = detailContainer.selectAll('g').data(labels).enter().append('g')
          .attr('transform', (d, i) => 'translate(' + [5, 12 * i + 11] + ')')
      rows.append('text')
          .text(d => d)
          .style('font-size', '11px')
      rows.append('text')
          .text((d, i) => values[i])
          .attr('dx', 70)
          .style('font-size', '11px')
    }
  },
  watch: {},
  computed: {
    loaded() {
      return !(this.nodes.length === 0 && this.edges.length === 0);
    },
    linkTranslate() {
      // return [0, 0]
      if (!this.nodeWidth || !this.nodeHeight) return [0, 0]
      return [this.nodeWidth / 2, this.nodeHeight / 2]
    },
  },
}
</script>

<style scoped>

</style>
