import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import './examBefore.module.scss';
import { Checkbox } from 'antd';
import blue from '../../../../../public/image/examBefore/blue.jpg'
import back from '../../../../../public/image/examBefore/back.png'
import ts_1 from '../../../../../public/image/examBefore/ts_1.gif'
import ts_2 from '../../../../../public/image/examBefore/ts_2.gif'
class examBefore extends Component {

   constructor(props) {
      super(props);
      this.state = {
         currentIndex: 1,
         isAgree: false,
         threeTextIndex: 1,
         timeDownStr: '00:00',
         interVal: null,
         timeNum: null,
         isShowExamModal: false,
         query:{}
      }
      examBefore._this = this;
   }

   componentDidMount() {
      this.state.query=this.props.location.query || {}
      
   }

   timeDownFn(str) {// 倒计时
      let m = parseInt(str.split(':')[0])
      let s = parseInt(str.split(':')[1])
      this.state.timeNum = (m * 60 + s)
      this.state.interVal = setInterval(() => { this.countDown() }, 1000)
   }
   countDown() {
      this.state.timeNum--
      if (this.state.timeNum < 0) {
         clearInterval(this.state.interVal)
         this.toExam()// 跳转考试
         return
      }
      this.setState({
         timeDownStr: `${(parseInt(this.state.timeNum / 60 % 60)) >= 10 ? (parseInt(this.state.timeNum / 60 % 60)) : '0' + (parseInt(this.state.timeNum / 60 % 60))}:${(parseInt(this.state.timeNum % 60)) >= 10 ? (parseInt(this.state.timeNum % 60)) : '0' + (parseInt(this.state.timeNum % 60))}`
      })
   }
   toExam() {// 跳转考试
      let { isAgree ,query} = this.state
      if (!isAgree) {
         this.setState({
            isShowExamModal: true
         })
         return
      } 
      this.props.history.push({ pathname: '/home/exam', query })
   }
   render() {
      let that = examBefore._this
      let { isShowExamModal, timeDownStr, threeTextIndex, currentIndex } = that.state
      function isAgreeFn(e) {
         that.setState({
            isAgree: e.target.checked
         })
      }
      return (
         <div className="bodyEF">
            {currentIndex === 1 ? <div className="endBack2" style={{ color: 'red!important' }}>
               <div className="txttitle">
                  <span className="endtext ttop">国家统一法律职业资格考试客观题计算机化考试模拟答题系统</span>
                  <span className="endtext bg">
                     <a onClick={() => { that.setState({ currentIndex: 2 }) }} style={{ display: 'block', width: '268px', height: '90px', float: 'left', marginTop: '49px', marginLeft: '160px', cursor: 'pointer' }}>&nbsp;</a>
                     <a onClick={() => { that.setState({ currentIndex: 2 }) }} style={{ display: 'block', width: '268px', height: '90px', float: 'left', marginTop: '49px', marginLeft: '9px', cursor: 'pointer' }} >&nbsp;</a>
                  </span>
                  {/* <span className="endtext" style={{marginTop:'-140px',fontSize:'30px'}}>
                  请使用IE浏览器浏览
               </span> */}
                  <span className="endtext" style={{ marginTop: '30px', fontSize: '18px', textAlign: 'center', width: '710px', marginLeft: '155px' }}>
                     本模拟答题系统旨在让考生熟悉计算机化考试环境和作答方式，考试题型、题量、分值、界面及文字内容以正式考试答题系统为准。
                  </span>
               </div>
            </div> : currentIndex === 2 ?
               <div className="lg_main">
                  <div className="ksZwh" id="zwh" style={{ display: 'none' }}></div>
                  <div className="lg_header">
                     <span>&nbsp;</span>
                  </div>
                  <div className="lg_from">
                     <div className="kcmc">考场1&nbsp;</div>
                     <div className="shenfenz">
                        <span>准考证号:</span>
                        <input type="text" id="zkzh" value="88888888" style={{ border: '1px solid #000', borderRadius: '2px' }} />
                     </div>
                     <div className="zhenjian">
                        <span>身份证号:</span>
                        <input type="text" id="zjbm" style={{ imeMode: 'auto', border: '1px solid #000', borderRadius: '2px' }} value="888888888888888888" />
                     </div>
                     <div className="buttonk">
                           <input type="button" className="buttonDl" id="loginbtn" onClick={() => { that.setState({ currentIndex: 3 }, () => { that.timeDownFn('01:30')}) }} />
                        <input type="button" className="buttonCz" id="resetbtn" />
                     </div>
                  </div>

                  <div className="" id="tishi" style={{ marginTop: '20px', marginLeft: '450px', fontWeight: 'bold', fontFamily: "宋体", fontSize: '16px' }}><span>请按F11进入全屏</span></div>

                  <div className="version"><span></span></div>
               </div>
               : currentIndex === 3 ?
                  <div className="mainback" >
                     <div className="kspic">
                        <img id="kspic" src={blue} width="104" height="132" alt="" />
                     </div>
                     <div className="ksinfo">
                        姓  名：<span id="ksxm">xxx</span> <br />
                        性  别：<span id="ksxb">女</span> <br />
                        准考证号：<span id="zkzh">88888888</span> <br />
                        身份证号：<span id="sfzh">888888888888888888</span>
                     </div>

                     <div className="kstime">
                        <div id="msgTip" style={{ display: 'block', fontSize: '14px' }}>
                           距离考试还有：<span id="clock">{timeDownStr || '00:00'}</span>
                           <span><span onClick={() => { that.toExam() }} style={{ color: '#0064aa', cursor: 'pointer' }} >进入考试</span></span>
                        </div>
                     </div>
                     <div className="ksname" style={{ left: '100px' }}></div>
                     {
                        threeTextIndex === 1 ? <iframe className="centerText" frameBorder="0" id="mainText" src='http://hu0416.cn/lawDoc/intro/one.html' ></iframe>
                           : threeTextIndex === 2 ? <iframe className="centerText" frameBorder="0" id="mainText" src='http://hu0416.cn/lawDoc/intro/two.html' ></iframe>
                              : threeTextIndex === 3 ? <iframe className="centerText" frameBorder="0" id="mainText" src='http://hu0416.cn/lawDoc/intro/three.html' ></iframe>
                                 : ''
                     }
                     <div>
                        <div className="agree" style={{ top: '560px' }}>
                           <Checkbox onChange={(e) => { isAgreeFn(e) }}>我已阅读并同意</Checkbox>
                        </div>
                        <div onClick={() => { that.setState({ threeTextIndex: 1 }) }} className="kw kc" id="kwyq" style={{ left: '200px', top: '550px' }}>应试人员须知</div>
                        <div onClick={() => { that.setState({ threeTextIndex: 2 }) }} className="ys kc" id="ysgz" style={{ left: '360px', top: '550px' }}>应试规则</div>
                        <div onClick={() => { that.setState({ threeTextIndex: 3 }) }} className="cz kc" id="czsm" style={{ left: '520px', top: '550px' }}>操作说明</div>
                     </div>
                  </div>

                  : ''
            }
            <div className="dialogBox1" style={{ display: isShowExamModal?'block':'none' }}>
               <div style={{ background: `url(${ts_1})`, width: '115px', height: '40px', position: 'absolute', left: '5%', top: '8%' }}></div>
               <div style={{ background: `url(${ts_2})`, width: '130px', height: '135px', position: 'absolute', left: '6%', top: '35%' }}></div>
               <div style={{ width: '55%', position: 'absolute', left: '40%', top: '40%', fontSize: '20px', fontWeight: 'bolder', fontFamily: 'Microsoft YaHei', color: 'red' }}>勾选左下角“我已阅读并同意”方可进入考试。</div>
               <div className="backBtn" style={{ background: `url(${back})`, width: '84px', height: '31px', position: 'absolute', left: '70%', top: '70%', cursor: 'pointer' }} onClick={() => { that.setState({ isShowExamModal: false }) }}></div>
            </div>
         </div>
      );
   }

}
export default withRouter(examBefore);



