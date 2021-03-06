<template>
  <div class="canvas-container">
    <div class="card">
      <div class="card-image">
        <canvas :width="width" :height="height" id="drawingBoard" @click="handleMouseMove"></canvas>
      </div>
      <div class="card-footer">
        <a class="card-footer-item" @click="draw">Draw</a>

        <a class="card-footer-item" @click="reset">Reset</a>
      </div>
    </div>
    <b-collapse class="panel">
      <div slot="trigger" class="panel-heading" role="button">
        <strong>Options</strong>
      </div>
      <parameter-options
        :shape="shape"
        :selectedColors="selectedColors"
        :numHoles="numHoles"
        :numCusps="numCusps"
        :colorMode="stringMode"
      ></parameter-options>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ParameterOptions from "@/components/ParameterOptions.vue";
import { Point } from "@/models/models";
import params from '@/store/params';
@Component({
  name: "CanvasContainer",
  components: {
    ParameterOptions
  }
})
export default class CanvasContainer extends Vue {

  get a(): number {
    return params.shape === "circle" ? 250 : 250;
  }

  get b(): number {
    return params.shape === "circle" ? 250 : 150;
  }

  get d_theta(): number {
    return (2 * Math.PI) / params.numHoles;
  }

  get ctx(): CanvasRenderingContext2D {
    return this.canvasElement.getContext("2d") as CanvasRenderingContext2D;
  }

  get margin(): number {
    return 15;
  }

  get shape() {
    return params.shape;
  }

  get numCusps() {
    return params.numCusps;
  }

  get numHoles() {
    return params.numHoles;
  }

  get selectedColors() {
    return params.selectedColors;
  }

  get stringMode() {
    return params.stringMode;
  }

  hasStrings: boolean = false;
  chooseHole: boolean = true;
  canvasElement!: HTMLCanvasElement;
  private holeList: Point[] = [];

  @Prop({ default: 515 }) private width!: number;
  @Prop({ default: 515 }) private height!: number;

  mounted() {
    this.canvasElement = document.querySelector(
      "#drawingBoard"
    ) as HTMLCanvasElement;
    this.drawPoints();
  }

  clearAndDraw() {
    this.clear();
    this.drawPoints();
    if (this.hasStrings) {
      this.drawStrings();
    }
  }


  @Watch("shape")
  onShapeChanges() {
    this.clearAndDraw();
  }

    @Watch("numHoles")
    onHolesChanges() {
    this.clearAndDraw();
  }

  @Watch("numCusps")
  oncuspsChanges() {
  this.clearAndDraw();
  }

  @Watch("selectedColors")
  onColorChanges() {
    this.clearAndDraw();
  }

  @Watch("stringMode")
  onColorModeChanges() {
  this.clearAndDraw();
  }

  handleMouseMove(e: MouseEvent): void {
    if (this.chooseHole) {
      // if selecting a hole, handle the mouse. Otherwise don't
      const point: Point = { x: e.offsetX, y: e.offsetY, color: "black" };
      const foundIndex = this.holeList.findIndex((p) =>
      // create a larger click radius to help with selection
        this.doesOverlap(point, p, 4)
      );
      if (foundIndex > -1) {
        this.holeList[foundIndex].color = "red";
        this.holeList = this.holeList.map((p, i) =>
          i !== foundIndex ? { ...p, color: "black" } : { ...p }
        );
        this.holeList = [...this.holeList.slice(foundIndex), ...this.holeList.slice(0, foundIndex)];
        this.clear();
        this.drawPoints(false);
      }
    }
    return;
  }

  doesOverlap(
    selectedPoint: Point,
    checkPoint: Point,
    radius: number
  ): boolean {
    const isXRange =
      selectedPoint.x <= checkPoint.x + radius &&
      selectedPoint.x >= checkPoint.x - radius;
    const isYRange =
      selectedPoint.y <= checkPoint.y + radius &&
      selectedPoint.y >= checkPoint.y - radius;
    return isXRange && isYRange;
  }

  reset(): void {
    this.clear();
    this.drawPoints();
    this.hasStrings = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  getColor(num: number): string {
    if (this.selectedColors.length === 1) {
      return this.selectedColors[0];
    } else {
      if (this.stringMode === "alternate") {
        return this.selectedColors[num % this.selectedColors.length];
      } else {
        const index = Math.floor(num / (this.numHoles / this.selectedColors.length));
        return this.selectedColors[index];
      }
    }
  }

  getCurrentRadius(i: number): number {
    const numerator = this.a * this.b;
    const bTerm = this.b ** 2 * Math.cos(i * this.d_theta + Math.PI / 2) ** 2;
    const aTerm = this.a ** 2 * Math.sin(i * this.d_theta + Math.PI / 2) ** 2;
    return numerator / Math.sqrt(bTerm + aTerm);
  }

  draw() {
    this.drawPoints(false);
    this.hasStrings = true;
    this.drawStrings();
  }

  drawStrings() {
    for (let i = 0; i < this.numHoles; i++) {
      this.ctx.strokeStyle = this.getColor(i);
      const fromPoint = this.holeList[i];
      const n = ((this.numCusps + 1) * i + this.numHoles / 2) % this.numHoles;
      const endPoint = this.holeList[n];
      this.ctx.beginPath();
      this.ctx.moveTo(fromPoint.x, fromPoint.y);
      this.ctx.lineTo(endPoint.x, endPoint.y);
      this.ctx.stroke();
    }
    this.hasStrings = true;
  }

  generatePoints(): Point[] {
    const points = [];
    for (let i = 0; i < this.numHoles; i++) {
      const radius = this.getCurrentRadius(i);
      const point: Point = {
          x:
            this.a +
            this.margin / 2 +
            radius * Math.cos(i * this.d_theta + Math.PI / 2),
          y:
            (this.height - 2 * this.b) / 2 +
            this.b +
            radius * Math.sin(i * this.d_theta + Math.PI / 2),
          color: "black"
        };
      points.push(point);
      }
    return points;
  }

  drawPoints(reset = true) {
    if (reset) {
      this.holeList = this.generatePoints();
    }

    for (const point of this.holeList) {

      this.ctx.strokeStyle = point.color;
      this.ctx.fillStyle = point.color;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      this.ctx.fill();
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
</style>
