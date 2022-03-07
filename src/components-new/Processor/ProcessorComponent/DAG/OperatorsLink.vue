<template>
  <g>
    <path :d="path" fill="none" stroke="grey" stroke-width="4"></path>
  </g>
</template>

<script>
import * as d3 from "d3"


export default {
  name: "OperatorsLink",
  props: ["edge", "nodeMap"],
  computed: {
    path() {
      let startPoint = {x: this.nodeMap[this.edge.src].x - 23, y: this.nodeMap[this.edge.src].y - 40}
      let endPoint = {x: this.nodeMap[this.edge.dst].x - 23, y: this.nodeMap[this.edge.dst].y + 20}

      let points = [startPoint, endPoint]
      var Gen = d3.line()
          .x((p) => p.x)
          .y((p) => p.y)
      // .curve(d3.curveBasis)
      return Gen(points)

    }
  }

}
</script>

<style scoped>

</style>