
import {Graph} from "@/utils/utils/graph";
import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {TLAggrAlgo} from "@/utils/algo/tl-aggregation/TLAggreAlgo";
import {VisHierarchyGraph} from "@/utils/entities/VisHierarchyGraph";

export function layoutTDAG(state, app, maxDuration) {
  // Layout all nodes
  // let startTime = app.vertexes[0].startTime;
  // let endTime = app.vertexes[app.vertexes.length - 1].endTime;
  // let startTime = d3.min(app.vertexes, vertex => vertex.startTime);
  // let endTime = d3.max(app.vertexes, vertex => vertex.endTime);

  // state.startTime = startTime
  // if (endTime > state.endTime) {
  //     state.endTime = (endTime - startTime) * 1.2 + startTime;
  //     state.xScale.domain([startTime, state.endTime]);
  //     mXScale.domain([startTime, state.endTime]);
  //     mYScale.domain([startTime, state.endTime]);
  //
  //     state.matrixDiagMin.x = mXScale(startTime);
  //     state.matrixDiagMin.y = mYScale(startTime);
  //     state.matrixDiagMax.x = mXScale(state.endTime);
  //     state.matrixDiagMax.y = mYScale(state.endTime);
  //
  //     // this.commit('simulation/updateAllTask');
  // }
  app.xScale.domain([app.minTime, maxDuration ? app.minTime + maxDuration : app.vMaxTime]);
  app.mXScale.domain([app.minTime, app.vMaxTime]);
  app.mYScale.domain([app.minTime, app.vMaxTime]);
  // console.log('scale', startTime, endTime, app.xScale.domain(), app.xScale.range(), app.minTime, app.vMaxTime)

  // /* layout */
  // let computeVtxLaneMap = function computeVtxLaneMap() {
  //     // get ready for the layout algo
  //     let graph = new Graph()
  //     Object.keys(app.vertexMap).forEach(vtxName => {
  //         let vertex = app.vertexMap[vtxName]
  //         let vld = new VertexLayoutData(xScale(vertex.startTime),
  //             xScale(vertex.endTime), 0, vtxName.charAt(0), [vtxName])
  //         graph.addNode(vtxName, vld)
  //     })
  //     Object.keys(app.childrenMap).forEach(vtxName => {
  //         let children = app.childrenMap[vtxName]
  //         children.forEach(child => graph.addEdge(child, vtxName))
  //     })
  //
  //     // run layout algo
  //     let greedyLayoutAlgo = new GreedyLayoutAlgo(app.dagRoot, graph, state.gapPixel)
  //     console.log(greedyLayoutAlgo)
  //     greedyLayoutAlgo.solve()
  //
  //     greedyLayoutAlgo.setResultToGraph()
  //
  //     return greedyLayoutAlgo.nodeLaneMap
  // }
  // app.vtxLaneMap = computeVtxLaneMap()
  // /* layout - end */

  /* layout */
  let mstAggregate = function mstAggregate() {
    // get ready for the layout algo
    let graph = new Graph()
    Object.keys(app.vertexMap).forEach(vtxName => {
      let vertex = app.vertexMap[vtxName]
      let vld = new VertexLayoutData(app.xScale(vertex.startTime),
        app.xScale(vertex.endTime), 0,
        vtxName.charAt(0) + vtxName.match(/.* (\d*)/)[1], [vtxName])
      graph.addNode(vtxName, vld)
    })
    Object.keys(app.childrenMap).forEach(vtxName => {
      let children = app.childrenMap[vtxName]
      children.forEach(child => graph.addEdge(child, vtxName))
    })
    let orderMap = new Map()
    Object.keys(app.orderMap).forEach(vertexName => {
      orderMap.set(vertexName, app.orderMap[vertexName])
    })

    // run layout algo first
    // let greedyLayoutAlgo = new GreedyLayoutAlgo(app.dagRoot, graph, app.gapPixel, orderMap)
    // console.log(greedyLayoutAlgo)
    // greedyLayoutAlgo.solve()
    //
    // greedyLayoutAlgo.setResultToGraph(state.layoutConfig.vertexContainerHeight)

    // run aggregation
    // const reLayoutFunc = g => {
    //   let root = g.nodes.find(n => n.data.vertexIdList.includes(app.dagRoot))
    //   let greedyLayoutAlgo = new GreedyLayoutAlgo(root.id, g, state.gapPixel, orderMap)
    //   // console.log(greedyLayoutAlgo)
    //   greedyLayoutAlgo.solve()
    //   greedyLayoutAlgo.setResultToGraph(state.layoutConfig.vertexContainerHeight)
    // }
    // let mstAggrAlgo = new MSTAggrAlgo(graph, reLayoutFunc)
    // console.log(mstAggrAlgo)
    // mstAggrAlgo.solve(app.clusterNumber)
    // graph.edges.forEach(e => e.data = mstAggrAlgo.getWeight(e))

    // let mcAggrAlgo = new MCAggrAlgo(graph, reLayoutFunc, 1.05, 1.1)
    // console.log(mcAggrAlgo)
    // mcAggrAlgo.solve(app.mergeCount)
    // graph.edges.forEach(e => e.data = mcAggrAlgo.getWeight(e))

    // let depthAggrAlgo = new DepthAggrAlgo(graph)
    // console.log(depthAggrAlgo)
    // depthAggrAlgo.solve()
    // reLayoutFunc(graph)

    // let topologicalAggrAlgo = new TopologicalAggrAlgo(graph)
    // console.log(topologicalAggrAlgo)
    // topologicalAggrAlgo.solve()
    // reLayoutFunc(graph)
    //
    // return graph

    let tlAggrAlgo = new TLAggrAlgo(graph)
    tlAggrAlgo.solve()

    return tlAggrAlgo.hGraph

  }
  // app.mstAggrGraph = mstAggregate()
  app.hGraph = mstAggregate()
  computeVisGraph(state, app)

  // /* layout - end */
  // app.vertexes.forEach(vertex => {
  //   // let _widtj=
  //   let layout = {};
  //   if (vertex.layout.x == 0) {
  //     vertex.layout.x = app.xScale(vertex.startTime);
  //     vertex.layout.mX = app.mXScale(vertex.startTime);
  //   } else {
  //     layout.x = app.xScale(vertex.startTime);
  //     layout.mX = app.mXScale(vertex.startTime);
  //   }
  //   layout.width = app.xScale(vertex.endTime) - app.xScale(vertex.startTime);
  //   let laneIdx = app.vtxLaneMap[vertex.vertexName]
  //   if (vertex.layout.y == 0) {
  //     vertex.layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
  //     vertex.layout.mY = app.mYScale(vertex.endTime);
  //   } else {
  //     layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
  //     layout.mY = app.mYScale(vertex.endTime);
  //   }
  //   let startX = 0;
  //   // let stepLayout = []
  //   let sumVal = d3.sum(vertex.steps);
  //   vertex.steps.forEach((step, j) => {
  //     let stepWidth = sumVal == 0 ? 0 : (step / sumVal * layout.width);
  //     let stepLayoutObj = {
  //       x: startX,
  //       width: stepWidth,
  //       id: j,
  //       fill: state.layoutConfig.stepColors[j],
  //       name: state.layoutConfig.stepName[vertex.hvType][j]
  //     }
  //     if (vertex.stepLayout.length < vertex.steps.length) {
  //       vertex.stepLayout.push(stepLayoutObj)
  //     } else {
  //       vertex.stepLayout[j] = stepLayoutObj
  //     }
  //     // stepLayout.push(stepLayoutObj)
  //     startX += stepWidth;
  //   });
  //   // vertex.stepLayout = stepLayout;
  //   layout.height = state.layoutConfig.vertexHeight;
  // })
}
function computeVisGraph(state, app) {
  app.visGraph = new VisHierarchyGraph(app.hGraph, {
    dagRoot: app.dagRoot,
    gapPixel: state.gapPixel,
    orderMap: (() => {
      let orderMap = new Map()
      Object.keys(app.orderMap).forEach(vertexName => {
        orderMap.set(vertexName, app.orderMap[vertexName])
      })
      return orderMap
    })(),
    vertexContainerHeight: state.layoutConfig.vertexContainerHeight,
    marginTop: state.layoutConfig.marginTop,
  })
  app.visGraph.computeStepLayout(app.vertexMap, app.xScale, state.layoutConfig)
}
