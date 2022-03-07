<template>
  <div style="height: calc(100%);">
    <el-row class="boundary" style="height:300px;width: 100%; overflow: hidden;">
      <DAGDiagram v-if="app != null"
                  style="width: 100%; height: calc(100% - 10px);" :app="app"/>
    </el-row>

    <el-row class="boundary" style="margin-top:6px;height:659px;width: 100%; overflow: hidden;">
      <el-row class="boundary" style="margin-top:6px;margin-left:6px;margin-right:6px;height:320px;overflow: hidden;">
        <TlAggrView v-if="app != null" style="width: 100%; height: calc(100% - 20px);" :app="app" transformY="-17"/>
      </el-row>
      <el-row class="boundary" style="margin-top:6px;margin-left:6px;margin-right:6px;height:320px; overflow: hidden;">
        <TlAggrView v-if="appGpu != null" style="width: 100%; height: calc(100% - 20px);" :app="appGpu" transformY="0"/>
      </el-row>
    </el-row>
  </div>
</template>

<script>
import {mapState} from "vuex";
import DAGDiagram from "@/components-new/DAGDiagram";
import TlAggrView from "@/components-new/TlAggrView";

export default {
  name: "index",
  components: {DAGDiagram, TlAggrView},
  data() {
    return {
      dagImg: require("@/assets/DagImg.svg")
    }
  },
  created() {
    this.$store.dispatch("ghive/queryDag")
  },
  mounted() {
    this.totalWidth = this.$el.clientWidth * 0.9
  },
  computed: {
    ...mapState("ghive", {
      taskLoaded: state => state.taskLoaded,
      app: state => state.application,
      appGpu: state=>state.applicationGpu,
      clickVertexNode: state => state.clickVertexNode
    }),
    rectWidth() {
      return 100 / (this.clickVertexNode.length > 0 ? this.clickVertexNode.length > 0 : 1)
    },
    taskWindowsCnt() {
      return (this.clickVertexNode.length > 0 ? this.clickVertexNode.length : 1)
    }
  },
  watch: {
    taskLoaded() {
      if (this.taskLoaded) {
        this.$store.dispatch("ghive/queryTasks")
        this.$store.dispatch("ghive/queryTasksGpu")
      }
    },
    // clickVertexNode() {
    // },
    // taskWindowsCnt() {
    //   this.taskWindowWidth = this.totalWidth / this.taskWindowsCnt
    // }
  }
}
</script>

<style scoped>

</style>