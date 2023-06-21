import { _decorator, Component, Node, AnimationClip, input, Input, BoxCollider, ICollisionEvent, ITriggerEvent, EventMouse, Vec3, EventKeyboard, math, tween, animation, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('dweb_player')
export class dweb_player extends Component {
  keydown_w = false;
  keydown_s = false;
  keydown_a = false;
  keydown_d = false;

  mouse_x: number = 0;
  mouse_y: number = 0
  mouse_left = false
  mouse_right = false
  cameraFallGround: boolean = false

  @property({ type: Node })
  playerModel: Node | null = null
  playerAnima: animation.AnimationController | null = null
  @property({ type: Node })
  Bracket: Node | null = null;
  @property({ type: Node })
  playerCamera: Node | null = null


  Bracket_fall_x = 0
  player_runType: boolean = false

  cameraZoomMove: boolean = false

  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

    this.playerAnima = this.playerModel!.getComponent(animation.AnimationController)

    this.Bracket = this.node.getChildByName('bracket')
    let collider = this.Bracket!.getChildByName('cameraBox')!.getComponent(BoxCollider)
    // collider!.on('onTriggerEnter', this.onTriggerEnter, this)
    // collider!.on('onTriggerExit', this.onTriggerExit, this)
  }

  onTriggerEnter(event: ICollisionEvent) {
    // console.log(event.type, event);
    console.log('camera落地')
    // this.cameraFallGround = true
    // this.Bracket_fall_x = this.Bracket.eulerAngles.x
  }
  onTriggerExit(event: ITriggerEvent) {
    console.log('camera离开地面')
  }

  onMouseDown(event: EventMouse) {

    this.mouse_x = event.getLocationX();
    this.mouse_y = event.getLocationY();
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    let mouse_btn = event.getButton();
    if (mouse_btn == 0) {
      this.mouse_left = true;
    }
    if (mouse_btn == 2) {
      this.mouse_right = true;
      this.bracketHoming()
    }
    if (this.mouse_left && this.mouse_right) {
      this.player_runType = true
      this.playerRunAnime()
    }
  }
  onMouseWheel(event: EventMouse) {
    let scrollY = event.getScrollY()
    if (scrollY > 0) {
      this.cameraZoom("near")
    } else {
      this.cameraZoom("far")
    }
  }
  cameraZoom(far_near: "far" | "near") {
    console.log(far_near)
    if (this.cameraZoomMove == false) {
      this.cameraZoomMove = true
      let dis = far_near == "far" ? 1.5 : -1.5
      let now_cameraZ = this.playerCamera!.position.z
      if (now_cameraZ + dis > 6) {
        this.cameraZoomMove = false
        return
      }
      if (now_cameraZ + dis < 1.5) {
        this.cameraZoomMove = false
        return
      }
      tween(this.playerCamera).to(0.5, { position: new Vec3(this.playerCamera!.position.x, this.playerCamera!.position.y, this.playerCamera!.position.z + dis) }, {
        onComplete: () => {
          this.cameraZoomMove = false
        }
      }).start()
    }
  }

  onMouseMove(event: EventMouse) {
    let mouse_btn = event.getButton();
    if (mouse_btn == 0) {
      this.mouse_left = true;
    }
    if (mouse_btn == 2) {
      this.mouse_right = true;
    }
    this.cameraRotate(event.getLocationX(), event.getLocationY());
  }
  onMouseUp(event: EventMouse) {
    let mouse_btn = event.getButton();
    if (mouse_btn == 0) {
      this.mouse_left = false;
    }
    if (mouse_btn == 2) {
      this.mouse_right = false;
    }
    if (this.mouse_left == false && this.mouse_right == false) {
      input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
    if (this.keydown_a == false && this.keydown_d == false && this.keydown_s == false && this.keydown_w == false) {
      this.player_runType = false
      this.playerRunAnime()
    }

  }

  bracketHoming() {
    let world_rotation = this.Bracket!.getWorldRotation();
    let parent_rotation_y = world_rotation.getEulerAngles(new Vec3(0, 0, 0)).y;
    let rotation_x = this.Bracket!.eulerAngles.x;
    this.node.setRotationFromEuler(0, parent_rotation_y, 0);
    this.Bracket!.setRotationFromEuler(rotation_x, 0, 0)
  }

  cameraRotate(x: number, y: number) {
    let rotation_y: number = this.Bracket!.eulerAngles.y
    let rotation_x: number = this.Bracket!.eulerAngles.x;
    rotation_x += (y - this.mouse_y) * 1;
    rotation_y += (x - this.mouse_x) * -1;
    if (rotation_x > 90) {
      rotation_x = 90
    }
    if (rotation_x < -90) {
      rotation_x = -90
    }

    if (this.cameraFallGround) {
      let camera_rotation_x = this.playerCamera!.eulerAngles.x
      camera_rotation_x += (y - this.mouse_y);
      if (camera_rotation_x < 0) {
        this.cameraFallGround = false
        this.playerCamera!.setRotationFromEuler(0, 180, 0)
        this.Bracket!.setRotationFromEuler(rotation_x, rotation_y, 0);
        return
      }
      if (camera_rotation_x > 90) {
        camera_rotation_x = 90
      }

      this.playerCamera!.setRotationFromEuler(camera_rotation_x, 180, 0)
      this.Bracket!.setRotationFromEuler(this.Bracket_fall_x, rotation_y, 0);
    } else {
      this.Bracket!.setRotationFromEuler(rotation_x, rotation_y, 0);
    }

    if (this.mouse_right) {
      this.bracketHoming()
    }


    this.mouse_x = x;
    this.mouse_y = y;
  }


  onKeyDown(event: EventKeyboard) {
    // console.log(event)
    let code = event.keyCode;
    let pos = this.node.getPosition();
    switch (code) {
      case 87:
        //按下w 向上移动
        if (this.player_runType == false) {
          this.player_runType = true
          this.playerRunAnime()
        }
        this.keydown_w = true;
        break;
      case 83:
        //按下s 向上移动
        if (this.player_runType == false) {
          this.player_runType = true
          this.playerRunAnime()
        }
        this.keydown_s = true;
        break;
      case 65:
        //按下a 向左移动
        if (this.player_runType == false) {
          this.player_runType = true
          this.playerRunAnime()
        }
        this.keydown_a = true;
        break;
      case 68:
        //按下d 向右移动
        if (this.player_runType == false) {
          this.player_runType = true
          this.playerRunAnime()
        }
        this.keydown_d = true;
        break;
      case 49:
        this.playerAnima!.setValue('lightFit', true)
        break;
      case 50:
        this.playerAnima!.setValue('huixuan', true)
        break;
      case 32:
        this.playerAnima!.setValue('jump', true)
        this.node.getComponent(RigidBody)!.applyLocalImpulse(new Vec3(0, 3, 0));
        // tween(this.node).to(0.3, { position: new Vec3(this.node.position.x, 3, this.node.position.z) }, {
        //   easing: "circOut",
        //   onStart: () => {
        //     this.jump = true
        //   }
        // }).start()
        break;
      default:
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    let code = event.keyCode;
    switch (code) {
      case 87:
        this.keydown_w = false;
        if (this.player_runType) {
          if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_d || this.keydown_s) {
            break
          } else {
            this.player_runType = false
            this.playerRunAnime()
          }
        }
        break;
      case 83:
        this.keydown_s = false;
        if (this.player_runType) {
          if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_d || this.keydown_w) {
            break
          } else {
            this.player_runType = false
            this.playerRunAnime()
          }
        }
        break;
      case 65:
        this.keydown_a = false;
        if (this.player_runType) {
          if (this.mouse_left && this.mouse_right || this.keydown_w || this.keydown_d || this.keydown_s) {
            break
          } else {
            this.player_runType = false
            this.playerRunAnime()
          }
        }
        break;
      case 68:
        this.keydown_d = false;
        if (this.player_runType) {
          if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_w || this.keydown_s) {
            break
          } else {
            this.player_runType = false
            this.playerRunAnime()
          }
        }
        break;
      default:
        break;
    }
  }

  playerRunAnime() {
    // if (this.player_runType) {
    //   this.playerAnima!.setValue("walk", true)
    // } else {
    //   this.playerAnima!.setValue("walk", false)
    // }
  }

  getDirection(x: number, y: number, z: number, node: Node) {
    let ret = new Vec3(x, y, z);
    math.Vec3.transformQuat(ret, ret, node.getRotation());
    return ret;
  }

  update(deltaTime: number) {
    if (this.keydown_w || this.mouse_left && this.mouse_right) {
      this.playerModel!.setRotationFromEuler(0, 0, 0)
      let pos = this.node.getPosition();
      math.Vec3.scaleAndAdd(pos, pos, this.getDirection(0, 0, -1, this.node), deltaTime * 5);
      this.node.setPosition(pos);
    }
    if (this.keydown_s) {
      this.playerModel!.setRotationFromEuler(0, 180, 0)
      let pos = this.node.getPosition();
      math.Vec3.scaleAndAdd(pos, pos, this.getDirection(0, 0, 1, this.node), deltaTime * 5);
      this.node.setPosition(pos);
    }
    if (this.keydown_a) {
      this.playerModel!.setRotationFromEuler(0, 90, 0)
      let pos = this.node.getPosition();
      math.Vec3.scaleAndAdd(pos, pos, this.getDirection(-1, 0, 0, this.node), deltaTime * 5);
      this.node.setPosition(pos);
    }
    if (this.keydown_d) {
      this.playerModel!.setRotationFromEuler(0, -90, 0)
      let pos = this.node.getPosition();
      math.Vec3.scaleAndAdd(pos, pos, this.getDirection(1, 0, 0, this.node), deltaTime * 5);
      this.node.setPosition(pos);
    }
  }
}


