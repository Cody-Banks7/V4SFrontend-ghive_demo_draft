<!-- 左输入参数框-->
<template>
  <div style="height: calc(100%);">
    <el-row class="boundary"
            style="width: 100%; overflow: hidden;  border-radius: 0px; margin-bottom: 10px">
      <div class="mini_head">
        <div class='mini_title'>
          System Setting
        </div>
      </div>
    </el-row>
    <el-row class="row_item">
      <el-row style="margin-top: 8px">
        <el-col :span="10">
          <div class="words">
            Number of worker:
          </div>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-input v-model="settingMatrix.workerNum"></el-input>
        </el-col>
      </el-row>

      <el-row class="row_item">
        <el-col :span="11">
          <div class="words">
            Number of container:
          </div>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-input v-model="settingMatrix.containerNum"></el-input>
        </el-col>
      </el-row>

      <el-row class="row_item">
        <el-col :span="11">
          <div class="words">
            Maximum thread:
          </div>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-input v-model="settingMatrix.maxThread"></el-input>
        </el-col>
      </el-row>

      <el-row class="row_item">
        <el-col :span="11">
          <div class="words">
            Memory per thread:
          </div>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-input v-model="settingMatrix.memPerThread"></el-input>
        </el-col>
      </el-row>
    </el-row>

    <el-row class="row_item ">
      <el-col :span="6">
        <div class="words">
          Data set:
        </div>
      </el-col>
      <el-col :span="15" :offset="3">
        <el-select v-model="selectedData" placeholder="Data Set">
          <el-option
              v-for="item in dataSet"
              :key="item"
              :label="item"
              :value="item"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row class="row_item">
      <el-col :span="6">
        <div class="words">
          Query:
        </div>
      </el-col>
      <el-col :span="15" :offset=3>
        <el-select v-model="selectedQuery" placeholder="Data Set">
          <el-option
              v-for="item in querySet"
              :key="item"
              :label="item"
              :value="item"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row class="row_item">
      <div class="words" style="margin-bottom: 8px">
        Input query:
      </div>
      <el-col :span="20" :offset="2" style="margin-top: 5px" class="queryInput">
        <el-input v-model="inputQuery"
                  clearable
                  type="textarea"
                  :rows="10"></el-input>
      </el-col>
    </el-row>
    <el-row class="row_item" style="margin-top: 16px; margin-bottom: 40px">
      <el-button @click="get_data_demo" size="medium" plain>
        Run
      </el-button>
    </el-row>

  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      settingMatrix: {
        workerNum: 8,
        containerNum: 8,
        maxThread: 10,
        memPerThread: 1024
      },
      dataSet: ["tpcds_text_100_new", "tpcds_text_5_new"],
      selectedData: "",
      querySet: ["Query1", "Query2"],
      selectedQuery: "",
      inputQuery: "",
    };
  },
methods: {
  get_data_demo() {
    this.axios({
      // method: 'post',
      url: 'http://192.168.1.215:5001',
      params: {
        'workerNum':this.settingMatrix.workerNum,
        'containerNum':this.settingMatrix.containerNum,
        'maxThread':this.settingMatrix.maxThread,
        'memPerThread':this.settingMatrix.memPerThread,
        'set_info': this.selectedData,
        'query_info': this.selectedQuery,
        'inputQuery':this.inputQuery},
    })
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log(error)
        })
  },
}
}
</script>

<style scoped>
.words {
  text-align: left;
  font-size: 1.1em;
  font-family: 'Arial', 'Avenir Medium';
  margin-top: 8px;
  margin-left: 5px;
}

/deep/ .el-input__inner {
  background: #ffffff;
}

.row_item {
  margin-top: 35px;
}
</style>