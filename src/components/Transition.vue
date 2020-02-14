<template lang="pug">
.transition(
  :style="{'left': x + 'px', 'top': y + 'px'}",
  :class="{'draggable': draggable}")
  span
    | {{ name }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'Transition',
})
export default class HelloWorld extends Vue {
  @Prop() private draggable!: boolean;

  @Prop() private name!: string;

  @Prop() private x!: number;

  @Prop() private y!: number;
}
</script>

<style lang="stylus" scoped>
.transition
  width 100px
  height 50px
  border-radius 10px
  background #ebcdcc
  border 1px solid #000
  display flex
  color #000
  justify-content center
  align-items center
  position absolute

.draggable
  cursor pointer
</style>
