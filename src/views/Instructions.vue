<template>
     <div class="instructions">
    <section class="section">
      <h1 class="title has-text-left">Instructions for {{numCusps}} Cusp(s) and {{numHoles}} Holes</h1>
    </section>
    <section class="section">
        <instruction-list :numCusps="numCusps" :numHoles="numHoles" />
    </section>
  </div>
</template>


<script lang="ts">
import InstructionList from "@/components/InstructionList.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import params from '@/store/params';

@Component({
  name: "Instructions",
  components: {InstructionList}
})
export default class Instructions extends Vue {
  get numCusps() {
    return params.numCusps;
  }

  get numHoles() {
    return params.numHoles;
  }
}
</script>

<style scoped>
    .instructions {
        font-size: 20px;
    }
</style>



