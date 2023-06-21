import { _decorator, BloomStage, Component, Node, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('particleBtn')
export class particleBtn extends Component {

  @property({
    type: [Node]
  })
  particle_1: Node[] = [];

  @property({
    type: [Node]
  })
  particle_2: Node[] = [];

  @property({ type: Node })
  postProcess: Node = null;

  start() {

  }


  btnClickPlay(event: any, num: number) {
    console.log(num)
    let particle = null;
    if (num == 1) {
      particle = this.particle_1;
    } else {
      particle = this.particle_2;
    }

    particle.forEach((item:Node) => {
      item.getComponent(ParticleSystem)?.play();
    })
  }

  update(deltaTime: number) {

  }
}


