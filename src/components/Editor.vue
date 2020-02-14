<template lang="pug">
.editor(ref="editor")
  .canvas(@dragover="dragover", draggable)
    .places(v-for="place in net.places")
      .place(
        :key="place.label",
        @dragstart="dragstart($event, place.label, 'place')",
        @dragend="dragend",
        @click="togglePanel(place.label, 'place')",
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
        :key="transition.label",
        @dragstart="dragstart($event, transition.label, 'transition')",
        @dragend="dragend",
        @click="togglePanel(transition.label, 'transition')",
        :draggable="!readonly")
        p-transition(
          draggable="true",
          :name="transition.name",
          :x="transition.x"
          :y="transition.y"
        )
    .buttons(v-if="!readonly")
      button(@click="newPlace")
        | Add New Place
      button(@click="newTransition")
        | Add New Transition
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
    .panel(v-if="selectLabel.length > 0")
      .place-panel(v-if="selectLabelType === 'place'")
        form
          label.label(for="label")
            | Label
          br
          input.input#label(type="text", :value="panelItem.label", disabled)
          br
          label.label(for="name")
            | Name
          br
          input.input#name(type="text", v-model="panelItem.name", :disabled="readonly")
          br
          button(v-if="!readonly && \
                        panelItem.label !== net.start_place && \
                        panelItem.label !== net.end_place",
                @click.prevent="deletePlace(panelItem.label)")
            | Delete Place
      .transition-panel(v-if="selectLabelType === 'transition'")
        form
          label.label(for="label")
            | Label
          br
          input.input#label(type="text", :value="panelItem.label", disabled)
          br
          label.label(for="name")
            | Name
          br
          input.input#name(type="text", v-model="panelItem.name", :disabled="readonly")
          br
          label.label(for="consume")
            | Consume
          ul.list
            li(v-for="item in panelItem.consume")
              span
                | {{ item }}
              button.btn-span(
                v-if="!readonly",
                @click.prevent="deleteConsume(panelItem.label, item)",
              )
                | DELETE
            li
              select(v-model="candidateLabel")
                option(v-for="place in net.places", :key="place.label")
                  | {{ place.label }}
              button.btn-span(
                v-if="!readonly",
                @click.prevent="addConsume(panelItem.label, candidateLabel)")
                | ADD
          br
          label.label(for="produce")
            | Produce
          ul.list
            li(v-for="item in panelItem.produce")
              span
                | {{ item.label }}
              button.btn-span(
                v-if="!readonly",
                @click.prevent="deleteProduce(panelItem.label, item.label)",
              )
                | DELETE
            li
              select(v-model="candidateLabel2")
                option(v-for="place in net.places", :key="place.label")
                  | {{ place.label }}
              button.btn-span(
                v-if="!readonly",
                @click.prevent="addProduce(panelItem.label, candidateLabel2)")
                | ADD
          br
          button(v-if="!readonly", @click.prevent="deleteTransition(panelItem.label)")
            | Delete Transition
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

  private candidateLabel = 'start';

  private candidateLabel2 = 'start';

  private dragging = '';

  private draggingType = 'place';

  private selectLabel = '';

  private selectLabelType = 'place';

  private mounted() {
    this.net = JSON.parse(JSON.stringify(this.rawData)); // Deep Copy
  }

  private togglePanel(label: string, type: string) {
    this.selectLabelType = type;
    if (label === this.selectLabel) {
      this.selectLabel = '';
    } else {
      this.selectLabel = label;
    }
  }

  private getPlaceType(label: string) {
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
          x1: c.x + 25 + 5,
          y1: c.y + 25 + 5,
          x2: trasition.x + 50 + 5,
          y2: trasition.y + 25 + 5,
        });
      });

      trasition.produce.forEach((produce) => {
        const p = this.net.places.filter((place) => place.label === produce.label)[0];
        res.push({
          x1: trasition.x + 50 - 5,
          y1: trasition.y + 25 - 5,
          x2: p.x + 25 - 5,
          y2: p.y + 25 - 5,
        });
      });
    });
    return res;
  }

  private get panelItem() {
    if (this.selectLabelType === 'place') {
      return this.net.places.filter((place) => place.label === this.selectLabel)[0];
    }
    if (this.selectLabelType === 'transition') {
      return this.net.transitions.filter((transition) => transition.label === this.selectLabel)[0];
    }
    return null;
  }

  private newPlace() {
    // eslint-disable-next-line no-alert
    const label = prompt('Please Enter Label For New Place');

    if (label === '' || label === null) {
      // eslint-disable-next-line no-alert
      alert('Label Can\'t be Empty.');
      return;
    }

    if (this.net.places.filter((place) => place.label === label).length > 0) {
      // eslint-disable-next-line no-alert
      alert('Label Existed.');
      return;
    }

    this.net.places.push({
      label,
      name: label,
      x: 0,
      y: 0,
    });
  }

  private deletePlace(label: string) {
    // Delete All Related Links
    this.net.transitions.forEach((transition) => {
      if (transition.consume.indexOf(label) > -1) {
        transition.consume.splice(transition.consume.indexOf(label), 1);
      }

      const filtered = transition.produce.filter((produce) => produce.label === label);

      if (filtered.length > 0) {
        transition.produce.splice(transition.produce.indexOf(filtered[0]), 1);
      }
    });

    // Delete the Place
    this.selectLabel = '';
    const place = this.net.places.filter((p) => p.label === label)[0];
    this.net.places.splice(this.net.places.indexOf(place), 1);
  }

  private deleteTransition(label: string) {
    this.selectLabel = '';
    const transition = this.net.transitions.filter((t) => t.label === label)[0];
    this.net.transitions.splice(this.net.transitions.indexOf(transition), 1);
  }

  private newTransition() {
    // eslint-disable-next-line no-alert
    const label = prompt('Please Enter Label For New Transition');

    if (label === '' || label === null) {
      // eslint-disable-next-line no-alert
      alert('Label Can\'t be Empty.');
      return;
    }

    if (this.net.transitions.filter((transition) => transition.label === label).length > 0) {
      // eslint-disable-next-line no-alert
      alert('Label Existed.');
      return;
    }

    this.net.transitions.push({
      label,
      name: label,
      consume: [],
      produce: [],
      x: 0,
      y: 0,
    });
  }

  private addConsume(transitionLabel: string, placeLabel: string) {
    const transition = this.net.transitions.filter((t) => t.label === transitionLabel)[0];
    if (transition.consume.filter((c) => c === placeLabel).length > 0) {
      // eslint-disable-next-line no-alert
      alert('Already Connected');
      return;
    }
    transition.consume.push(placeLabel);
  }

  private addProduce(transitionLabel: string, placeLabel: string) {
    const transition = this.net.transitions.filter((t) => t.label === transitionLabel)[0];
    if (transition.produce.filter((c) => c.label === placeLabel).length > 0) {
      // eslint-disable-next-line no-alert
      alert('Already Connected');
      return;
    }
    transition.produce.push({
      label: placeLabel,
      guard: null,
    });
  }

  private deleteConsume(transitionLabel: string, placeLabel: string) {
    const transition = this.net.transitions.filter((t) => t.label === transitionLabel)[0];
    const toDelete = transition.consume.filter((c) => c === placeLabel)[0];
    transition.consume.splice(transition.consume.indexOf(toDelete), 1);
  }

  private deleteProduce(transitionLabel: string, placeLabel: string) {
    const transition = this.net.transitions.filter((t) => t.label === transitionLabel)[0];
    const toDelete = transition.produce.filter((c) => c.label === placeLabel)[0];
    transition.produce.splice(transition.produce.indexOf(toDelete), 1);
  }

  // eslint-disable-next-line class-methods-use-this
  private dragover(e: DragEvent) {
    if (this.dragging === '') return;
    const editor = this.$refs.editor as HTMLElement;

    const resultX = e.clientX - editor.offsetLeft;
    const resultY = e.clientY - editor.offsetTop;

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
  font-family 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

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
  padding 20px

.label
  color #fff

.list
  color #fff

.input
  margin-bottom 10px

.fade-enter-active, .fade-leave-active
  transition opacity .1s

.fade-enter, .fade-leave-to
  opacity 0

.buttons
  position absolute
  bottom 0
  z-index 4

.btn-span
  margin 0 10px
  cursor pointer
</style>
