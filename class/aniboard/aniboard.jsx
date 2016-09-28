import React from 'react';
import {Motion, spring} from '../../src/react-motion';
import GSAP from '../../src/gsap/gsap-enhancer';
import range from 'lodash.range';

const springSetting1 = {stiffness: 180, damping: 10};
const springSetting2 = {stiffness: 120, damping: 17};
const columns = 30;
function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];
const [count, width, height] = [6, 30, 30];
// indexed by visual position
const layout = range(count).map(n => {
  const row = Math.floor(n / columns);
  const col = n % columns;
  return [width * col, height * row];
});

const Aniboard = GSAP()(React.createClass({
  getInitialState() {
    return {
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: range(count), // index: visual position. value: component key/id
    };
  },

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseMove({pageX, pageY}) {
    const {order, lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      const mouse = [pageX - dx, pageY - dy];
      /*const col = clamp(Math.floor(mouse[0] / width), 0, 2);
      const row = clamp(Math.floor(mouse[1] / height), 0, Math.floor(count / columns));
      const index = row * 3 + col;*/
      const newOrder = reinsert(order, order.indexOf(lastPress), 1);
      this.setState({mouse: mouse, order: newOrder});
    }
  },

  handleMouseDown(key, [pressX, pressY], {pageX, pageY}) {
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY],
    });
  },

  handleMouseUp() {
    this.setState({isPressed: false, delta: [0, 0]});
  },

  render() {
    const {order, lastPress, isPressed, mouse} = this.state;
    let initialized = false;
    return (
      <div className="stage">
        {order.map((_, key) => {
          let style;
          let x;
          let y;
          const visualPosition = order.indexOf(key);
          if (key === lastPress && isPressed) {
            [x, y] = mouse;
            style = {
              translateX: x,
              translateY: y,
              scale: spring(1.2, springSetting1),
            };
          } else {
            //[x, y] = layout[visualPosition];
            [x, y] = mouse;
            if (!initialized) {
              x = x+(order.indexOf(key)*40);
            }
            style = {
              translateX: spring(x, springSetting2),
              translateY: spring(y, springSetting2),
              scale: spring(1, springSetting1),
            };
          }
          return (
            <Motion key={key} style={style}>
              {({translateX, translateY, scale, boxShadow}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, key, [x, y])}
                  onTouchStart={this.handleTouchStart.bind(null, key, [x, y])}
                  className="circle"
                  style={{
                    backgroundColor: (key < allColors.length ? allColors[key] : '#999999' ),
                    WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    zIndex: key === lastPress ? 99 : visualPosition,
                    boxShadow: `${boxShadow}px 2px 2px rgba(0,0,0,0.5)`,
                  }}
                />
              }
            </Motion>
          );
        })}
        <div id='action'>
          <div id='move'></div>
          <div id='select-color'></div>
        </div>
      </div>
    );
    initialized = true;
  },
}));


export default Aniboard;
