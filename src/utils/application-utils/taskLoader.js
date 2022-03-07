import * as d3 from "d3";

export function loadTasksToApp(state, app, tasks) {
  app.taskLoaded = true
  tasks.forEach(task => {
    // handle counter first
    if (task['counter'] !== undefined) {
      app.counters[task.task_id] = task.counter
      // delete counter field because it will be used below
      delete task['counter']
    }
    refineTaskData(state, app, task)
    if (app.vertexMap[task.vec_name] === undefined) {
      createVertex(app, task)
    } else {
      updateVertex(app, task)
    }
  })
}

function refineTaskData(state, app, task) {
  if (app.maxTime === -1) {
    app.maxTime = task.end_time;
    app.minTime = task.start_time;
    app.absMinTime = task.start_time;
    app.absMaxTime = task.end_time;
    app.vMaxTime = task.end_time + state.incTimeStep;
    app.minTimeLength = task.end_time - task.start_time;
    app.maxTimeLength = task.end_time - task.start_time;
  } else {
    app.maxTime = d3.max([task.end_time, app.maxTime]);
    app.absMaxTime = app.maxTime;
    app.minTime = d3.min([task.start_time, app.minTime]);
    app.maxTimeLength = d3.max([task.end_time - task.start_time, app.maxTimeLength]);
    app.minTimeLength = d3.min([task.end_time - task.start_time, app.minTimeLength]);
    app.absMinTime = app.minTime;
    if (app.maxTime > app.vMaxTime) {
      app.vMaxTime = app.maxTime + state.incTimeStep;
    }
  }

  let taskId = task.task_id;
  let machineId = task.machine_id;
  if (app.machineMap[machineId] == undefined) {
    let machine = {
      'machineId': machineId,
      'taskList': [],
      'taskCount': "",
      'status': [],
    }
    app.machineMap[machineId] = machine
    app.machineList.push(machine)
    app.selectedMachineMetrics[machineId] = false
  }

  let layout = {
    y: 0,
    x: 0,
    selected: false,
    selectedClick: false,

    selectAsProvider: false,
    selectCurrent: false,
    selectAsConsumer: false,
  };
  if (app.taskMap[taskId] == undefined) {
    task.selectedToExtend = false;
    task.layout = layout;
    app.taskList.push(task);
    app.selectTaskList.push(task);
    app.taskMap[taskId] = task;

    // add task to machine
    app.machineMap[machineId].taskList.push(task);

  } else {
    app.taskMap[taskId].end_time = task.end_time;
  }
}

function createVertex(app, task) {
  let steps = [];
  task.time_len.forEach(d => steps.push(d));
  let vertex = {
    vertexName: task.vec_name,
    startTime: task.start_time,
    endTime: task.end_time,
    hvType: task.hv_type,
    steps: steps,
    taskMap: {},
    layout: {x: 0, y: 0, width: 0, height: 0, mX: 0, mY: 0, selected: false, selectToExtend: true, childMerge: 0},
    stepLayout: [],
    dagNode: app.dagData.vertexMap[task.vec_name],
    ended: task.eov,
  }
  vertex.taskMap[task.task_id] = task;
  vertex.tasks = [task];
  app.vertexMap[vertex.vertexName] = vertex;
  app.vertexes.push(vertex);

  for (let i = 0, ilen = app.edges.length; i < ilen; i++) {
    let edge = app.edges[i];
    if (edge.srcVertexName == vertex.vertexName) {
      edge.srcRealNode = vertex;
      if (edge.dstRealNode != null) {
        app.renderEdges.push({...edge, layout: {ctrl: app.xScale(vertex.endTime)}})
      }
    }
    if (edge.dstVertexName == vertex.vertexName) {
      edge.dstRealNode = vertex;
      if (edge.srcRealNode != null) {
        app.renderEdges.push({...edge, layout: {ctrl: app.xScale(edge.srcRealNode.endTime)}})
      }
    }
  }
  // console.log('layout: %o, %o', app.edges, app.renderEdges)
  task.vertex = vertex;

  // update position according to the relationship
}

function updateVertex(app, task) {
  let currentVertex = app.vertexMap[task.vec_name];
  task.vertex = currentVertex;
  let task_id = task.task_id;
  if (currentVertex.taskMap[task_id] == undefined) {
    currentVertex.taskMap[task_id] = task;
    currentVertex.tasks.push(task);
    for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
      currentVertex.steps[i] += task.time_len[i];
    }
    task.fail = task.fail != undefined      // true if has this field
  } else {
    let preTask = currentVertex.taskMap[task_id];
    for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
      currentVertex.steps[i] = currentVertex.steps[i] + task.time_len[i] - preTask.time_len[i];
    }
    preTask.end_time = task.end_time;
    preTask.time_len = task.time_len;
    preTask.fail = task.fail != undefined      // true if has this field
  }
  if (task.fail) {
    console.log('task failed')
  }
  currentVertex.endTime = Math.max(task.end_time, currentVertex.endTime);
  if (task.eov) {
    currentVertex.ended = true
  }
}
