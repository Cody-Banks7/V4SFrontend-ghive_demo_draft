<template>
  <div style="height:100%;width:100%;" id="chart1"></div>
</template>

<script>
// import echarts from "echarts"

export default {
  name: "Chart",
  props: ['operators', 'operatorTimes'],
  computed: {
    options() {

      let op = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'line' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        // legend: {
        //   data: ['Hive', 'GHive']
        // },
        xAxis: [{
          type: "category",
          data: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6']
        }],
        yAxis: [{
          type: "value",
          position: "left",  // 左边，第一个y轴，控制展示位置
        }],
        series: [{
          name: "Input",
          type: "bar",
          stack: "total",
          color: ["rgba(143,147,147,0.73)"],
          data: [2, 4, 5, 6, 7, 8]
        },
          {
            name: "Calculate",
            type: "bar",
            stack: "total",
            color: ["blue"],
            data: [2, 4, 5, 6, 7, 8]
          },
          {
            name: "Output",
            type: "bar",
            stack: "total",
            color: ["rgba(143,147,147,0.73)"],
            data: [2, 4, 5, 6, 7, 8]
          },

          {
            name: "Input",
            type: "bar",
            stack: "total2",
            color: ["rgba(143,147,147,0.73)"],
            data: [1, 3, 4, 5, 6, 7]
          },
          {
            name: "Calculate",
            type: "bar",
            stack: "total2",
            color: ["blue"],
            data: [1, 3, 4, 5, 6, 7]
          },
          {
            name: "Output",
            type: "bar",
            stack: "total2",
            color: ["rgba(143,147,147,0.73)"],
            data: [1, 3, 4, 5, 6, 7]
          }]
      }

      return op
    }
  },
  methods: {
    initChart() {
      let t = this.$echarts.init(document.getElementById("chart1")
      );
      t.setOption(this.options)
      // let myChart1 = echarts.init(this.$el);
      // myChart1.setOption(this.options)
    }
  },
  mounted() {
    this.initChart()
  }
}
</script>

<style scoped>

</style>