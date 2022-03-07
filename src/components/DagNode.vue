<template>
    <g :transform="'translate(' +  [node.x , node.y] + ')'" @mouseover="mouseover" @mouseout="mouseout" @click="clickNode"
    >
        <rect :fill="fill" fill-opacity="0.5" rx="3" ry="3"
              :width="node.width" :height="node.height"
              stroke-width=1 :stroke="stroke"
        ></rect>
        <text class="title" font-size="17" text-anchor="middle" style="cursor: default">{{ vertexName }}</text>
    </g>
</template>

<script>
import * as d3 from "d3"
import {mapState} from "vuex";

export default {
    name: "DagNode",
    props: ['node'],
    mounted() {

        let title = d3.select(this.$el).select('.title');
        // let boundaryRect = title.node().getBoundingClientRect();
        let boundaryRect = title.node().getBBox();
        title.attr('dx', this.node.width / 2)
            .attr('dy', boundaryRect.height / 2 + this.node.height / 2 - 3);
    },
    computed: {
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema
        }),
        vName(){
            let nameSegs = this.node.vdat.vertex_name.split(' ');
            return nameSegs.map(seg => (/[0-9]/.test(seg[0]) ? seg : 'J')).join('')
        },
        vertexName() {
            let nameSegs = this.node.vdat.vertex_name.split(' ');
            return nameSegs.map(seg => (/[0-9]/.test(seg[0]) ? seg : seg[0])).join('')
        },
        stroke() {
            return 'grey'
        },
        fill() {
            if (this.node.vdat.hv_type == 'Reducer' || this.node.vdat.hv_type == 'Map') {
                return this.colorSchema[this.node.vdat.hv_type];
            } else {
                return 'grey';
            }

        },

    },
    methods: {
        mouseover() {
            this.$store.commit('simulation/hoverVertex', this.node.vdat.vertex_name);
        },
        mouseout() {
            this.$store.commit('simulation/hoverOutVertex', this.node.vdat.vertex_name)
        },
        clickNode(){
            // console.log('click', this.node);
            this.$store.commit('simulation/selectVertex', this.node)
        }
    }
}
</script>

<style scoped>

</style>
