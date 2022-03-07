import Vue from 'vue'
import axios from 'axios'


// Vue.use(axios);
Vue.prototype.axios = axios

// const dataServerUrl = "http://10.16.3.177:5000";
const dataServerUrl = "http://10.24.83.98:9876";


function queryDag(param, callback) {
    const url=`${dataServerUrl}/api/dag/`;
    axios.get(url, param)
        .then(response => {
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryTasks(param, callback) {
    const url = `${dataServerUrl}/api/static/tasks/`;
    axios.post(url, param)
        .then(response => {
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}


function queryHiveTasks(param, callback) {
    const url = `${dataServerUrl}/api/hive-tasks/`;
    axios.get(url, param)
        .then(response => {
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryGHiveTasks(param, callback) {
    const url = `${dataServerUrl}/api/ghive-tasks/`;
    axios.get(url, param)
        .then(response => {
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}


export default {
    queryDag,
    queryTasks,
    queryHiveTasks,
    queryGHiveTasks
}