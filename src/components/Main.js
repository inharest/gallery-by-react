require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';

let imageDatas = (array => {
  for (let i = 0,len = array.length; i < len; i++) {
    let item = array[i];
    item.path = require('../images/'+ item.name);
    array[i] = item;
  }
  return array;
})(require('../data/imageDatas.json'));

// generate a random number in the range [a, b)
let getIntRandom = (a, b) => {
  if(a>b){
    let c = a;
    b = a;
    a = c;
  }
  return Math.floor(Math.random() * (b - a) + a);
};

class ImgComponent extends React.Component{

  render(){
    let data = this.props.data;
    let arrange = this.props.arrange;
    let styleObj = {};
    if(arrange.pos){
      styleObj = arrange.pos;
    }
    if(arrange.rotate){
      let prefixs = ['MozTransform', 'msTransform', 'WebkitTransform', 'transform'];
      prefixs.forEach(val => {
          styleObj[val] = 'rotate(' + arrange.rotate + ')';
      });
    }

    return (
      <figure className={this.props.arrange.isInverse ? 'is-inverse' : ''} style={styleObj} onClick={this.handleClick.bind(this)}>
        <img src={data.path} alt={data.text}/>
        <figcaption>{data.text}</figcaption>
        <article>{data.desc}</article>
      </figure>
    );
  }

  handleClick(e){
    if(!this.props.arrange.isCenter){
        this.props.center();
    }else{
        this.props.inverse();
    }
    e.stopPropagation();
    e.preventDefault();
  }
}

class NavComponent extends React.Component {
  render(){
    let className = '';
    if(this.props.arrange.isCenter){
      className += ' is-center';
      if(this.props.arrange.isInverse){
        className += ' is-inverse';
      }
    }
    return (
      <span className={className.trim()} onClick={this.handleClick.bind(this)}></span>
    );
  }

  handleClick(e){
    if (this.props.arrange.isCenter) {
        this.props.inverse();
    } else {
        this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }
}


class AppComponent extends React.Component {

  Constant = {
    ctnVol:{ // content element
      width: 0,
      height: 0,
      widthHalf: 0,
      heightHalf: 0
    },
    figVol:{ // figure element
      width:0,
      height:0,
      widthHalf:0,
      heightHalf:0
    },
    cntPos:{ // center position
      top: 0,
      left: 0
    },
    topPosRange:{ // top position's range
      x: [0, 0],
      y:[0, 0]
    },
    btmPosRange:{ // bottom positoin's range
      x: [0, 0],
      y: [0, 0]
    }
  };
  state = {
       arrangeArr: [
           /*{
               pos: {
                   left: '0',
                   top: '0'
               },
               rotate: 0,    // rotate degree
               isInverse: false,    // is inverse?
               isCenter: false,    // is center?
           }*/
       ]
   };


  render() {

    let imgComponents = [],
        navComponents = [];
    let state = this.state;

    imageDatas.forEach((val, idx) => {
      if(!state.arrangeArr[idx]){
        state.arrangeArr[idx] = {
          pos:{
            left:0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }
      imgComponents.push(<ImgComponent key={idx} data={val} arrange={state.arrangeArr[idx]} center={this.center(idx)} inverse={this.inverse(idx)}/>);
      navComponents.push(<NavComponent key={idx} arrange={state.arrangeArr[idx]} center={this.center(idx)} inverse={this.inverse(idx)} />);
    });

    return (
      <div>
        <div className="content" ref="content">
          {imgComponents}
        </div>
        <nav className="control">
          {navComponents}
        </nav>
      </div>
    );
  }

  componentDidMount() {
    let contentEl = ReactDOM.findDOMNode(this.refs.content),
      cw = contentEl.scrollWidth,
      ch = contentEl.scrollHeight,
      cwh = Math.ceil(cw/2),
      chh = Math.ceil(ch/2),
      fw = 320,
      fh = 360,
      fwh = Math.ceil(fw/2),
      fhh = Math.ceil(fh/2);

      this.Constant.ctnVol = {
        width: cw,
        height: ch,
        widthHalf: cwh,
        heightHalf: chh
      };
      this.Constant.figVol = {
        width: fw,
        height: fh,
        widthHalf: fwh,
        heightHalf: fhh
      };

      this.Constant.cntPos = {
        x: cwh,
        y: chh
      };

      this.Constant.topPosRange.x[0] = -cwh;
      this.Constant.topPosRange.x[1] = cwh;
      this.Constant.topPosRange.y[0] = 0;
      this.Constant.topPosRange.y[1] = chh - fh;

      this.Constant.btmPosRange.x[0] = -(cwh - fw);
      this.Constant.btmPosRange.x[1] = cwh - fw;
      this.Constant.btmPosRange.y[0] = chh - fh;
      this.Constant.btmPosRange.y[1] = ch;

      this.arrange(0);
  }

  center (index) {
    return () => this.arrange(index);
  }

  inverse (index) {
    return () => {
      var arrangeArr = this.state.arrangeArr;

      arrangeArr[index].isInverse = !arrangeArr[index].isInverse;

      this.setState({
        arrangeArr: arrangeArr
      });
    };
  }

  arrange(idx = 0){
    let arrangeArr = this.state.arrangeArr;

    arrangeArr[idx] = {
      pos: this.getCenterPos(),
      rotate: 0,
      isCenter: true
    };

    for (let i = 0, len = arrangeArr.length; i < len; i++) {
      if(i != idx){
        arrangeArr[i] = {
          pos: this.getRandomPos(),
          rotate: this.getRandom30Deg(),
          isCenter: false
        };
      }
    }

    this.setState({
      arrangeArr: arrangeArr
    });
  }

  getCenterPos(){
    let Constant = this.Constant,
    x = Constant.cntPos.x,
    y = Constant.cntPos.y,
    fwh = Constant.figVol.widthHalf,
    fhh = Constant.figVol.heightHalf;
    return {
      top: y - fhh,
      left: x - fwh,
      zIndex: 10
    };
  }

  getRandomPos(){
    let x = 0,
        y = 0,
        Constant = this.Constant,
        cw = Constant.ctnVol.width,
        ch = Constant.ctnVol.height,
        fwh = Constant.figVol.widthHalf,
        fhh = Constant.figVol.heightHalf,
        topPosRangeX = Constant.topPosRange.x,
        topPosRangeY = Constant.topPosRange.y,
        btmPosRangeX = Constant.btmPosRange.x,
        btmPosRangeY = Constant.btmPosRange.y;

    x = getIntRandom(topPosRangeX[0], topPosRangeX[1]);
    if(x < btmPosRangeX[0] || x > btmPosRangeX[1]){
      y = getIntRandom(topPosRangeY[0], topPosRangeY[1]);
    }else{
      y = getIntRandom(topPosRangeY[0], btmPosRangeY[1]);
    }

    return {
      top: (y+ch)%ch - fhh,
      left: (x + cw)%cw - fwh
    };
  }

  getRandom30Deg(){
    return getIntRandom(-30, 30) + 'deg';
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
