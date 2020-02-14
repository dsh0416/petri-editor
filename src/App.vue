<template lang="pug">
#app
  #editor-demo
    editor(:raw-data="rawData")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { PetriNet } from '@/types/petri';
import Editor from './components/Editor.vue';

@Component({
  components: {
    Editor,
  },
})
export default class App extends Vue {
  private rawData: PetriNet = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    start_place: 'start',
    // eslint-disable-next-line @typescript-eslint/camelcase
    end_place: 'end',
    places: [
      {
        label: 'start',
        name: 'Start',
        x: 0,
        y: 0,
      },
      {
        label: 'p1',
        name: 'p1',
        x: 200,
        y: 0,
      },
      {
        label: 'end',
        name: 'End',
        x: 400,
        y: 0,
      },
    ],
    transitions: [
      {
        label: 't1',
        name: 'Test1',
        x: 75,
        y: 0,
        consume: ['start'],
        produce: [{
          label: 'p1',
          guard: null,
        }],
      },
      {
        label: 't2',
        name: 'Test2',
        x: 275,
        y: 0,
        consume: ['p1'],
        produce: [{
          label: 'end',
          guard: null,
        }],
      },
    ],
  };
}
</script>

<style lang="stylus">
body
  margin 0

#editor-demo
  width 80vw
  height 600px
  margin 100px auto 0 auto
</style>
