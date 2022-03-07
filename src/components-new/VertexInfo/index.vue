<template>
  <div style="height: calc(100%);">
    <el-row>
      <!--      <div class="mini_head">-->
      <!--        <div class='mini_title'>Vertex Info</div>-->
      <!--      </div>-->
      <el-col :span="24">
        <el-row style="height: 300px;" class="boundary">
          <DAGDiagram :dag="dag"></DAGDiagram>
        </el-row>

        <el-row style="height: 570px; margin-top: 5px" class="boundary">
          <Charts :dag="dag"></Charts>
        </el-row>

      </el-col>
    </el-row>
  </div>

</template>

<script>
import DAGDiagram from "@/components-new/Processor/ProcessorComponent/DAG/DAGDiagram";
import Charts from "@/components-new/Processor/ProcessorComponent/Chart/Charts";

export default {
  name: "index",
  components: {
    DAGDiagram,
    Charts
  },
  data() {
    return {
      dag: {
        name: "JOIN",
        children: [
          {
            name: "JOIN_1",
            children: [
              {
                name: "FIL",
                // children: null
              },
              {
                name: "FIL_1",
                // children: null
              }
            ]
          },
          {
            name: "GBY",
            // children: null
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>