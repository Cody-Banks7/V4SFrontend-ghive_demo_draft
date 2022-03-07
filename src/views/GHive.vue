<template>
  <div class="container">
    <div id="main-pane" style="position: relative">
      <el-row style="height: 100%; width: 100%;" :gutter="8">
        <el-col :span="5" style="height: 100%">
          <!--          <el-row style="height: 30px"></el-row>-->
          <el-row class="boundary" style="height:100%; overflow: hidden">
            <SystemSetting></SystemSetting>
          </el-row>
        </el-col>
        <el-col :span="13">
          <el-row style="height:100%; overflow: hidden">
            <Processor style="z-index: 1; position:relative"></Processor>
          </el-row>
        </el-col>
        <el-col :span="6">
          <el-row style="height:100%; overflow: hidden">
            <VertexInfo></VertexInfo>
          </el-row>

        </el-col>
      </el-row>
      <!--      <el-row style="height: 70%; width: 100%;" :gutter="8">-->
      <!--        <TlAggrView v-if="app != null" style="width: 100%; height: calc(100% - 20px);" :app="app"/>-->
      <!--      </el-row>-->
      <!--      <el-row style="height: 50%; width: 100%; overflow-y: scroll;margin-top: -0px" :gutter="8">-->
      <!--        <TaskRect v-for="(vertex, id) in clickVertexNode"-->
      <!--                  :key="vertex.vertexName" :vertex="vertex"-->
      <!--                  :id="id"-->
      <!--                  style="margin-left: 6px; margin-bottom: 7px; display: inline-block;-->
      <!--                  height: 80%; width: 90%; overflow-y: scroll"></TaskRect>-->
      <!--      </el-row>-->
    </div>
  </div>
</template>

<script>

// import {mapState} from "vuex";
import SystemSetting from "@/components-new/SystemSetting"
import Processor from "@/components-new/Processor"
import VertexInfo from "@/components-new/VertexInfo"

export default {
  name: "GHive",
  components: {
    SystemSetting,
    Processor,
    VertexInfo

  },
  data() {
    return {
      oWidth: 0,
      oHeight: 0,
      totalWidth: 0,
      taskWindowWidth: 0
    }
  },
  created() {
    // this.$store.dispatch("ghive/queryDag")
  },
  mounted() {
    this.totalWidth = this.$el.clientWidth * 0.9
  },
  // computed: {
  //   ...mapState("ghive", {
  //     taskLoaded: state => state.taskLoaded,
  //     app: state => state.application,
  //     clickVertexNode: state => state.clickVertexNode
  //   }),
  //   rectWidth() {
  //     return 100 / (this.clickVertexNode.length > 0 ? this.clickVertexNode.length > 0 : 1)
  //   },
  //   taskWindowsCnt() {
  //     return (this.clickVertexNode.length > 0 ? this.clickVertexNode.length : 1)
  //   }
  // },
  // watch: {
  //   taskLoaded() {
  //     if (this.taskLoaded) {
  //       this.$store.dispatch("ghive/queryTasks")
  //     }
  //   },
  //   clickVertexNode() {
  //   },
  //   taskWindowsCnt() {
  //     this.taskWindowWidth = this.totalWidth / this.taskWindowsCnt
  //   }
  // }

}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

#main-pane {
  /*margin: 6px;*/
  /*width: calc(100% - 12px);*/
  /*height: calc(100% - 12px - 42px);*/
  margin: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  /* use grid layout rather than el-row */
  /* because el-row and el-scrollbar can't be used together */

}

</style>