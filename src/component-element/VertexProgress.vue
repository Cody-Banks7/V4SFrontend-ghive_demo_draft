<template>
  <g>
    <g :transform="'translate(' +  [node.data.layout.x0 , node.data.layout.y] + ')'"
       @click="clickNode(node)"
       @mouseenter="enterNode(node)"
       @mouseleave="leaveNode(node)"
    >
      <!--      :stroke="getNodeStroke(node)"-->
      <!--      :stroke-width="getStrokeWidth(node)"-->
      <!--      :fill="'url(#grad-' + app.appName.replace(' ', '-') + '-' + node.id.replace(' ', '-') + ')'"-->
      <!--    stroke="black"-->
      <!--    stroke-width="1"-->
      <!--    fill="red"-->
      <g v-show="!showStepView">
        <rect :height="layoutConfig.vertexHeight"
              :width="node.data.layout.x1 - node.data.layout.x0"
              rx="1" ry="1"
              :stroke="getNodeStroke(node)"
              :stroke-width="getStrokeWidth(node)"
              :fill="'url(#grad-' + app.appName.replace(' ', '-') + '-' + node.id.replace(' ', '-') + ')'"
              class="vertex-rect">
          <title>{{ getNodeLabel(node) }}</title>
        </rect>
        <text dy="-3" style="font-size: 15px;font-family: 'Calibri',serif; stroke: black; stroke-width: 0.6">
          {{ node.data.vertexIdList[0] }}
        </text>
        <!--            <text font-size="10px">{{ getNodeLabel(node) }}</text>-->
      </g>
      <!--        <g v-show="showStepView">-->
      <!--            <g>-->
      <!--                <rect v-for="(stepData, i) in node.data.stepDataList" :key="stepData.stepId"-->
      <!--                      class="progress vertex-rect"-->
      <!--                      :x="stepData.offsetX" :width="stepData.width"-->
      <!--                      :fill="stepData.color" :height="layoutConfig.vertexHeight"-->
      <!--                      stroke-width="1" stroke-opacity="0">-->
      <!--                    <title>{{ stepNames[i] }}</title>-->
      <!--                </rect>-->
      <!--                <rect :height="layoutConfig.vertexHeight" fill="none"-->
      <!--                      :width="node.data.layout.x1 - node.data.layout.x0"-->
      <!--                      :stroke="getNodeStroke(node)"-->
      <!--                      :stroke-width="getStrokeWidth(node)"-->
      <!--                      class="vertex-rect">-->
      <!--                </rect>-->
      <!--                <text font-size="10px">{{ getNodeLabel(node) }}</text>-->
      <!--            </g>-->
      <!--        </g>-->
    </g>

    <g :transform="'translate(' +  [node.data.layout.x0 , node.data.layout.y] + ')'"
       v-if="app.clickedVertex !== null && node.data.hGraphNode.data.nodeList[0].id === app.clickedVertex.vertexName">
      <rect :transform="'translate(' +  [0, layoutConfig.vertexHeight * 3] + ')'"
            :height="layoutConfig.vertexHeight * 5"
            :width="node.data.layout.x1 - node.data.layout.x0"
            rx="1" ry="1"
            stroke="black"
            stroke-width="1"
            fill="white"
            class="vertex-rect">
      </rect>
      <line x1="0" :y1="layoutConfig.vertexHeight" x2="0" :y2="layoutConfig.vertexHeight * 3" stroke-dasharray="3 3"
            stroke="black"></line>
      <line :x1="node.data.layout.x1 - node.data.layout.x0" :y1="layoutConfig.vertexHeight"
            :x2="node.data.layout.x1 - node.data.layout.x0" :y2="layoutConfig.vertexHeight * 3" stroke-dasharray="3 3"
            stroke="black"></line>

      <TaskRect :width="node.data.layout.x1 - node.data.layout.x0"
                :height="layoutConfig.vertexHeight * 5"
                :vertex="app.clickedVertex"
                :transformY="layoutConfig.vertexHeight * 3"
                style="margin-left: 6px; margin-bottom: 7px; display: inline-block;
                        height: 80%; width: 90%; overflow-y: scroll;"></TaskRect>
    </g>
  </g>
</template>

<script>
import * as d3 from "d3";
import TaskRect from "@/components-new/TaskRect"

export default {
  components: {
    TaskRect
  },
  name: "Vertex",
  props: ['node', 'layoutConfig', 'colorSchema', 'app', 'showStepView', 'stepNames'
    // 'getNodeStroke', 'getStrokeWidth', 'enterNode', 'clickNode', 'leaveNode', 'getNodeLabel'
  ],
  methods: {
    enterNode(node) {
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
    clickNode(node) {
      this.$store.commit('ghive/handleTDAGNodeClick', {app: this.app, node})
      // this.$store.commit('comparison/handleTDAGNodeClick', {app: this.app, node})
    },
    leaveNode(node) {
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
      this.node.data.vertexIdList.forEach(vertexName => {
        const vertex = this.app.vertexMap[vertexName]
        vertex.tasks.forEach(task => task.layout.selectCurrent = false)
      })
      this.app.matrixRefDuration = null
      // remove selected tasks
      this.app.interactiveModule.selectedTasks = []
    },
    getShortNodeLabel(node) {
      const idList = node?.data?.vertexIdList
      if (!idList) return ''
      if (idList.length === 1) {
        const group = idList[0].split(' ')
        return group[0][0] + group[1];
      } else {
        return idList.length + ' Nodes'
      }
    },
    getNodeLabel(node) {
      const idList = node?.data?.vertexIdList
      if (!idList) return ''
      return idList.length === 1 ? idList[0] : (idList.length + ' Nodes')
    },
    getNodeStroke() {
      const layout = this.node.data.layout
      if (layout.selectCurrent) {
        return this.colorSchema['selectCurrent']
      } else if (layout.selectAsProvider) {
        return this.colorSchema['selectAsProvider']
      } else if (layout.selectAsConsumer) {
        return this.colorSchema['selectAsConsumer']
      } else {
        return 'grey'
      }
    },
    getStrokeWidth(node) {
      const layout = node.data.layout
      if (layout.selectCurrent || layout.selectAsProvider || layout.selectAsConsumer) {
        return 4
      } else {
        return 1
      }
    },
  }
}
</script>

<style scoped>

</style>
