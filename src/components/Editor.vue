<template lang="pug">
.editor(ref="editor")
  .canvas(@dragover="dragover", draggable)
    .places(v-for="place in net.places")
      .place(
        @dragstart="dragstart($event, place.label, 'place')",
        @dragend="dragend",
        @click="togglePanel",
        :draggable="!readonly")
        place(
          draggable="true",
          :type="getPlaceType(place.label)",
          :name="place.name",
          :x="place.x"
          :y="place.y"
        )
    .transitions(v-for="transition in net.transitions")
      .transition(
        @dragstart="dragstart($event, transition.label, 'transition')",
        @dragend="dragend",
        @click="togglePanel",
        :draggable="!readonly")
        p-transition(
          draggable="true",
          :name="transition.name",
          :x="transition.x"
          :y="transition.y"
        )
    .lines(draggable="false")
      svg.line(v-for="line in lines")
        line(
          draggable="false",
          :x1="line.x1",
          :x2="line.x2",
          :y1="line.y1",
          :y2="line.y2",
          style="stroke:rgb(0,0,0);stroke-width:2")
  transition(name="fade")
    .panel(v-if="showPanel")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Place from '@/components/Place.vue';
import PTransition from '@/components/Transition.vue';
import { PetriNet } from '@/types/petri';

interface PlaceType {
  label: string;
  name: string;
  type: 'normal';
}

interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

@Component({
  name: 'Editor',
  components: {
    Place,
    PTransition,
  },
})
export default class HelloWorld extends Vue {
  @Prop({ default: false }) private readonly!: boolean;

  @Prop() private rawData!: PetriNet;

  private net: PetriNet = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    start_place: '',
    // eslint-disable-next-line @typescript-eslint/camelcase
    end_place: '',
    places: [],
    transitions: [],
  };

  private showPanel = false;

  private dragging = '';

  private draggingType = 'place'

  private mounted() {
    this.net = JSON.parse(JSON.stringify(this.rawData)); // Deep Copy
  }

  private togglePanel() {
    this.showPanel = !this.showPanel;
  }

  private getPlaceType(label: string) {
    console.log(label, this.net.start_place);
    if (label === this.net.start_place) return 'start';
    if (label === this.net.end_place) return 'end';
    return 'normal';
  }

  private get lines() {
    const res: Array<Line> = [];
    this.net.transitions.forEach((trasition) => {
      trasition.consume.forEach((label) => {
        const c = this.net.places.filter((place) => place.label === label)[0];
        res.push({
          x1: c.x + 25,
          y1: c.y + 25,
          x2: trasition.x + 50,
          y2: trasition.y + 25,
        });
      });

      trasition.produce.forEach((produce) => {
        const p = this.net.places.filter((place) => place.label === produce.label)[0];
        res.push({
          x1: trasition.x + 50,
          y1: trasition.y + 25,
          x2: p.x + 25,
          y2: p.y + 25,
        });
      });
    });
    return res;
  }

  // eslint-disable-next-line class-methods-use-this
  private dragover(e: DragEvent) {
    if (this.dragging === '') return;
    const editor = this.$refs.editor as HTMLElement;

    const resultX = e.clientX - editor.offsetLeft;
    let resultY = e.clientY - editor.offsetTop;

    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      resultY += 25;
    }

    if (this.draggingType === 'place') {
      const element = this.net.places.filter((value) => value.label === this.dragging)[0];
      element.x = resultX - 25;
      element.y = resultY - 25;
    }

    if (this.draggingType === 'transition') {
      const element = this.net.transitions.filter((value) => value.label === this.dragging)[0];
      element.x = resultX - 50;
      element.y = resultY - 25;
    }
  }

  private dragstart(e: DragEvent, label: string, type: string) {
    this.dragging = label;
    this.draggingType = type;

    if (e.dataTransfer !== null) {
      const img = new Image(10, 10);
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      img.style.opacity = '0';
      e.dataTransfer.setDragImage(img, window.outerWidth, window.outerHeight);
    }
  }

  private dragend() {
    this.dragging = '';
  }
}
</script>

<style lang="stylus" scoped>
.editor
  width 100%
  height 100%
  display flex
  background #cfd4e0

.canvas
  flex 1
  position relative
  overflow scroll

.transition
  z-index 2

.place
  z-index 3

.line
  position absolute
  width 100%
  height 100%
  z-index 1

.panel
  width 300px
  background #617198
  border-radius 4px 0 0 4px
  box-shadow -2px 0px 2px #aaa

.fade-enter-active, .fade-leave-active
  transition opacity .1s

.fade-enter, .fade-leave-to
  opacity 0
</style>
