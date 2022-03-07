<template>
  <g style="width: 95%;margin-top: 15px" :height="25 * vertex.tasks.length + 15" v-if="initialized">
    <!--          <rect x="0" y="-0" width="600" :height="25 * vertex.tasks.length + 15" stroke="black" fill="none" stroke-opacity="0.5" />-->
    <!--    <svg width="1470" :height="25 * vertex.tasks.length + 15">-->
    <!--      <line x1="0" x2="0" :y1="25 * vertex.tasks.length + 15" y2="0" stroke="black" stroke-width="2"-->
    <!--            stroke-opacity="0.3"/>-->
    <!--      <line x1="0" x2="1470" :y1="25 * vertex.tasks.length + 15" :y2="25 * vertex.tasks.length + 15"-->
    <!--            stroke="black" stroke-width="2" stroke-opacity="0.3"/>-->
    <!--      <line x1="1470" x2="1470" :y1="25 * vertex.tasks.length + 15" y2="0" stroke="black" stroke-width="2"-->
    <!--            stroke-opacity="0.3"/>-->
    <!--      <line x1="1470" x2="0" :y1="0" y2="0" stroke="black" stroke-width="2" stroke-opacity="0.3"/>-->
    <!--    </svg>-->
    <TaskRectCom style="text-align:left; margin-left: -0px; height: 20px;"
                 v-for="(task, id) in vertex.tasks.slice(0,50)"
                 :key="task.vertexName"
                 :id="id"
                 :task="task"
                 :axisWidth="width"
                 :totalWidth="taskLength[id]"
                 :transformX="transformXList[id]"
                 :height="height / (vertex.tasks.slice(0,50).length +2.2)"
                 gap="2.2"
                 :scaleRatio="scaleRatio"
                 :transformY="transformY"
    ></TaskRectCom>
  </g>
</template>

<script>
import TaskRectCom from "@/components-new/TaskRect/Rect/TaskRectCom";
import *  as d3 from 'd3';

export default {
  name: "TaskRect",
  props: ["vertex", "width", "height", "transformY"],
  components: {TaskRectCom},
  data() {
    return {
      taskLength: [],
      initialized: false,
      transformXList: [],
      scaleRatio:1
    }
  },
  mounted() {
    console.log(this.width)
    console.log(this.vertex)
    console.log(this.vertex.tasks.length)
    let taskLength = this.taskLength
    let transformXList = this.transformXList

    let startTime = this.vertex.tasks[0].start_time
    let endTime = this.vertex.tasks[0].end_time


    this.vertex.tasks.forEach(t => {
      taskLength.push(t.end_time - t.start_time)
      if (startTime > t.start_time) {
        startTime = t.start_time
      }
      if (endTime < t.end_time) {
        endTime = t.end_time
      }
    })
    let durantion = endTime - startTime
    this.vertex.tasks.forEach(t => {
      transformXList.push((t.start_time - startTime) / durantion * this.width)
    })

    let maxTask = d3.max(taskLength)
    for (let i = 0; i < taskLength.length; i++) {
      taskLength[i] = taskLength[i] / maxTask * this.width
    }

    let tmpMax = 0
    for (let i = 0; i < this.vertex.tasks.slice(0,50).length; i++) {
      let task = this.vertex.tasks[i]
      let totalTime = task.end_time - task.start_time
      let step_info = task.step_info
      let inputWidth = ((step_info[2] - step_info[0]) / totalTime) * this.taskLength[i]
      let processorWidth = (step_info[3] - step_info[2]) / totalTime * this.taskLength[i]
      let outputWidth = (step_info[5] - step_info[3]) / totalTime * this.taskLength[i]
      tmpMax = d3.max([tmpMax, inputWidth + processorWidth + outputWidth + this.transformXList[i]])
    }
    this.scaleRatio =  this.width/ tmpMax

    this.initialized = true
    console.log(taskLength, transformXList)
  }
}
</script>

<style scoped>

</style>