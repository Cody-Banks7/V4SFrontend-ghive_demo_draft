<template>

  <g :transform="'translate(' +  [node.x , node.y] + ')'">
    <text font-size="20px" text-anchor="middle">{{ node.name }}
    </text>

    <circle r="30" :fill="node.color"
            stroke="grey" stroke-width="3"></circle>

  </g>
</template>

<script>
export default {
  name: "OperatorsNode",
  props: ["node"]
}
</script>

<style scoped>

</style>