<template lang="pug">
.place(
  :style="{'left': x + 'px', 'top': y + 'px'}",
  :class="{'draggable': draggable, 'start': type === 'start', 'end': type === 'end'}")
  span
    | {{ name }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'Place',
})
export default class HelloWorld extends Vue {
  @Prop() private type!: string;

  @Prop() private draggable!: boolean;

  @Prop() private name!: string;

  @Prop() private x!: number;

  @Prop() private y!: number;
}
</script>

<style lang="stylus" scoped>
.place
  width 50px
  height 50px
  border-radius 25px
  background #6cc8d6
  border 1px solid #000
  display flex
  color #000
  justify-content center
  align-items center
  position absolute

.start
  background #d9364e

.end
  background #985059

.draggable
  cursor pointer
</style>
