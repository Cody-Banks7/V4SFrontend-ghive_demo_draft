<template>
  <div>
    <el-row style="height: 250px; margin-top: 5px">
      <ChartOperators></ChartOperators>
    </el-row>
    <el-row style="height: 250px; margin-top: 10px">
      <ChartCalculate></ChartCalculate>
    </el-row>
  </div>
</template>

<script>
import ChartOperators from "@/components-new/Processor/ProcessorComponent/Chart/ChartOperators";
import ChartCalculate from "@/components-new/Processor/ProcessorComponent/Chart/ChartCalculate";

export default {
  name: "Charts",
  components: {ChartOperators, ChartCalculate},
  data() {
    return {
      echartsObj: null
    }
  },
  methods: {
    initCharts() {
    }
  }
}
</script>

<style scoped>

</style>