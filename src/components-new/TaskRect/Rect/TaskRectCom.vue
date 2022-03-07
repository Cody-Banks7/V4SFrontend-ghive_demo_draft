<template>
  <g v-if="initialized" :transform="'translate(' + [transformX * scaleRatio,id*gap + transformY]+')'">
    <g>
      <rect :transform="'translate(' + [0,0]+')'"
            :width="inputWidth * scaleRatio" :height="height"
            style="fill:rgba(143,147,147,0.73);stroke-width:0;stroke:rgb(0,0,0);"></rect>
      <rect :transform="'translate(' + [inputWidth * scaleRatio,0]+')'"
            :width="processorWidth * scaleRatio" :height="height"
            style="fill:blue;stroke-width:0;stroke:rgb(0,0,0);"></rect>
      <rect :transform="'translate(' + [processorWidth * scaleRatio + inputWidth * scaleRatio,0]+')'"
            :width="outputWidth * scaleRatio" :height="height"
            style="fill:rgba(143,147,147,0.73);stroke-width:0;stroke:rgb(0,0,0);"></rect>
    </g>
  </g>

</template>

<script>
export default {
  name: "TaskRect",
  props: ["task", "axisWidth", "transformX", "transformY", "totalWidth", "id", "height", "gap", "scaleRatio"],
  data() {
    return {
      // height: 5,
      inputWidth: 0,
      processorWidth: 0,
      outputWidth: 0,
      initialized: false,
      // scaleRatio: 0.9
    }
  },
  created() {
    // console.log(this.totalWidth)
    let totalTime = this.task.end_time - this.task.start_time
    let step_info = this.task.step_info
    this.inputWidth = ((step_info[2] - step_info[0]) / totalTime) * this.totalWidth
    this.processorWidth = (step_info[3] - step_info[2]) / totalTime * this.totalWidth
    this.outputWidth = (step_info[5] - step_info[3]) / totalTime * this.totalWidth
    // console.log(step_info[2] - step_info[0], this.inputWidth)
    // console.log(step_info[3] - step_info[2], this.processorWidth)
    // console.log(step_info[5] - step_info[3], this.outputWidth)
    // console.log(this.task, totalTime)
    this.initialized = true
  }
}
</script>

<style scoped>

</style>