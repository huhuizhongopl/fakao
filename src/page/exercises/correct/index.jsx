
import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb, Card, Spin, Row, Col, Button, Progress, Tooltip, Input, InputNumber } from 'antd';
import { PlusCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import corrLeftSXArrow from '../../../../public/image/exercises/correct/corrLeftSXArrow.png'
import zan from '../../../../public/image/exercises/correct/zan.png'
import err from '../../../../public/image/exercises/correct/err.png'
import s from './correct.module.scss';
const { TextArea } = Input
class correct extends Component {

   constructor(props) {
      super(props);
      this.state = {
         correctList: [],
         pageLoading: false,
         title: '',
         typeArr: [],
         isHideSiderIndex: '空',
         leftBtmBtnIndex: 1,
         examInfo: {},
         currentQues: { userAnswer: '' }, //当前展示问题
         activeIndex: [0, 0], //当前活跃的问题序号
         isOnlyShowErr: false,
         isAddNote: false,
         zhuguanQuesIndex: 0,// 主观题当前活跃问题下标
         isSourceOther: false,
         textareaContent: '',
         zhuguanQuesIndex: 0,
         isAddScore: false,
         addScoreObj: { kwd: '', score: 0, teaWord: '' },
         isCanAddScore: false, // 是否有权限添加得分点
         addScoreLoading:false // 确认得分按钮的loading
      }
      correct._this = this;
      this.noteText = React.createRef();
   }

   async componentDidMount() {//TODO处理结果数据
      let title = this.props.history.location?.query?.typeStr || ''
      let examLimitTime = this.props.history.location?.query?.examLimitTime || 0
      let resultInfo = JSON.parse(this.props.history.location?.query?.resultInfo || '{}')
      let examId = this.props.history.location?.query?.examId || ''
      let isSourceOther = this.props.history.location?.query?.isSourceOther || false
      sessionStorage.setItem('examId', examId)
      let allArr = JSON.parse(sessionStorage.getItem('examTotal') || '[]')
      let typeArr = []
      let correctList = []
      let examInfo = { examId, usedTime: examLimitTime - resultInfo.usedTime, allLength: allArr.length, allScore: 0, noZhuGuanScore: 0, zhuGuanScore: 0, keGuanScore: 0, keGuanUserScore: { no: 0, err: 0, suc: 0 }, score: 0, point: 0, credit: 0, isNeedZNZG: 0, noNeedZNZG: 0 }
      allArr.forEach((item) => {
         if (!(typeArr.indexOf(item.questionType) > -1)) {
            typeArr.push(item.questionType)
         }
         examInfo.allScore += item?.score || 0
         examInfo.point += item.point
         examInfo.credit += item.credit
         examInfo.score += item?.userKsData?.score || 0
         if (item.questionTypeClass == "主观题") {
            examInfo.zhuGuanScore += item?.score || 0
            if (item?.answer.search('kwd') > -1) {// 智能判题
               item.isZhiNeng = true
               let kwArr = new Array(30).fill(0)
               let kwAllTempScore = 0
               let eachArrTemp = item.userAnswer instanceof Array ? item.userAnswer : []
               eachArrTemp.forEach((ansItem, ansIndex) => {
                  let tempScore = 0
                  JSON.parse(item.answer || '["{}"]')[0].score.forEach((kwItem) => {
                     if ((ansItem || '').search(kwItem.kwd) > -1) {
                        tempScore += Number(kwItem.score)
                     }
                  })
                  kwArr[ansIndex] = tempScore
               })
               kwArr.forEach(kwArrIt => kwAllTempScore += Number(kwArrIt))
               if (item.userKsData) {
                  item.userKsData.score = kwAllTempScore //主观题所以命中关键字的得分
               } else {
                  item.userKsData = { score: kwAllTempScore } //主观题所以命中关键字的得分
               }
               item.zhuguanUserExamScore = kwArr
               examInfo.isNeedZNZG++
            } else {
               item.isZhiNeng = false
               examInfo.noNeedZNZG++
               examInfo.noZhuGuanScore += item?.score || 0
            }
         } else {
            examInfo.keGuanScore += item?.score || 0
            if (item.isAnswer === 1) {
               examInfo.keGuanUserScore.no += item?.score || 0
            } else if (item.isAnswer === 2) {
               examInfo.keGuanUserScore.err += item?.score || 0
            } else if (item.isAnswer === 3) {
               examInfo.keGuanUserScore.suc += item?.score || 0
            }
         }
      })
      typeArr.forEach(item => {
         let arrTemp = allArr.filter(itk => {
            return itk.questionType === item
         })
         correctList.push(arrTemp)
      })
      this.setState({
         title,
         correctList,
         typeArr,
         examInfo,
         currentQues: correctList[0][0],
         isSourceOther
      })
      if (resultInfo && Object.keys(resultInfo).length) {
         await React.$http.post('questionandexam/endMyExam', resultInfo).then(res => {
            if (res.code === 1) {
               console.log('交卷成功')
            }
         })
      }
      if (JSON.parse(sessionStorage.getItem('fkUserData') || '{}')?.role > 0) {//当前用户是否有权限增加得分点
         this.state.isCanAddScore = true
      }
   }

   async restartExam() {//TODO重新开始考试
      let { examInfo } = this.state
      let obj = {
         //userExamId: examInfo.userExamId,//用户试卷ID
         examId: examInfo.examId, //考试模式时需传此参数
         restartExam: 1
      }
      await React.$http.post('/questionandexam/updateUserExam', obj).then(res => {
         if (res.code === 1) {
            this.props.history.push({ pathname: '/home/exam', query: { examData: {}, typeStr: '继续考试' } })
         }
      });
   }
   // 添加收藏与我不会
   async favCantFn(str, bool) {
      let { currentQues, activeIndex } = this.state
      let data = {
         questionId: currentQues.id,
         subjectNumb: currentQues.subjectNumb,
         type: currentQues.type
      }
      if (str === 'fav') {
         data.collect = bool ? 0 : 1
         //data.cant = (this.state.correctList[activeIndex[0]][activeIndex[1]].isCant || false) ? 1 : 0
      } else if (str === 'cant') {
         //data.collect = (this.state.correctList[activeIndex[0]][activeIndex[1]].isFav || false) ? 1 : 0
         data.cant = bool ? 0 : 1
      }
      await React.$http.post('/questionandexam/questionOperation', data).then(res => {
         if (res.code === 1) {
            React.$message({
               type: 'success',
               content: `${bool ? '取消' : '添加'}${str === 'fav' ? '收藏' : str === 'cant' ? '我不会' : ''}成功`
            })
            if (str == 'fav') {
               this.state.correctList[activeIndex[0]][activeIndex[1]].isFav = !bool
               this.state.currentQues.isFav = !bool
            } else if (str == 'cant') {
               this.state.correctList[activeIndex[0]][activeIndex[1]].isCant = !bool
               this.state.currentQues.isCant = !bool
            }
            this.forceUpdate()
         } else {
            console.log(`${bool ? '取消' : '添加'}${str === 'fav' ? '收藏' : str === 'cant' ? '我不会' : ''}失败`);
         }
      }).catch(err => {
         console.log(`${bool ? '取消' : '添加'}${str === 'fav' ? '收藏' : str === 'cant' ? '我不会' : ''}失败`);
      })
   }
   render() {
      let that = correct._this
      let { addScoreLoading,  addScoreObj, isCanAddScore, isAddScore, textareaContent, isSourceOther, zhuguanQuesIndex, isAddNote, isOnlyShowErr, activeIndex, currentQues, examInfo, leftBtmBtnIndex, isHideSiderIndex, title, correctList, pageLoading, typeArr } = that.state
      function isHideSiderIndexFn(str) {
         let strIndex = isHideSiderIndex
         if (strIndex.indexOf(str) > -1) {
            strIndex = strIndex.replace(str, '')
         } else {
            strIndex += str
         }
         that.setState({
            isHideSiderIndex: strIndex
         })
      }
      function toggleActiveIndex(index, idk) {
         that.setState({
            activeIndex: [index, idk],
            currentQues: correctList[index][idk],
            textareaContent: (correctList[index][idk]?.userAnswer || [''])[0],
            addScoreObj: { kwd: '', score: 0, teaWord: '' },
            isAddScore: false
         })
      }
      function leftBtmBtnFn(num) {
         if (num === 1) {
            that.setState({
               isOnlyShowErr: false,
               leftBtmBtnIndex: 1
            })
         } else if (num === 2) {
            that.setState({
               isOnlyShowErr: true,
               leftBtmBtnIndex: 2
            })
         } else if (num === 3) {
            that.restartExam()
            that.setState({
               leftBtmBtnIndex: 3
            })
         }

      }
      async function addNoteFn() {
         let userId = JSON.parse(sessionStorage.getItem('fkUserData') || '{}')?.id
         let data = {
            questionId: currentQues?.id,
            subjectNumb: currentQues.subjectNumb,
            userId,
            content: that.noteText.current.value
         }
         await React.$http.post('/notes/insertNotes', data).then(res => {
            if (res.code === 1) {
               React.$message({
                  type: 'success',
                  content: '添加笔记成功'
               })
               that.noteText.current.value = ''
            }
         })
         that.setState({ isAddNote: false })
      }
      function otherSelOption(option) {
         if (!isSourceOther) {
            return
         }
         if (currentQues.questionType === '单选') {
            that.state.correctList[activeIndex[0]][activeIndex[1]].userAnswer = option
            //that.state.currentQues.userAnswer = option
         } else {
            if (currentQues?.userAnswer) {

               if (currentQues?.userAnswer.indexOf(option) > -1) {

                  let strTemp = currentQues?.userAnswer
                  let inx = strTemp.indexOf(option)
                  if (inx > -1) {
                     strTemp = strTemp.split('')
                     strTemp.splice(inx, 1)
                     strTemp = Array.from(new Set(strTemp))
                     strTemp = strTemp.join('')
                     that.state.correctList[activeIndex[0]][activeIndex[1]].userAnswer = strTemp
                     //that.state.currentQues.userAnswer = strTemp
                  }
               } else {
                  that.state.correctList[activeIndex[0]][activeIndex[1]].userAnswer += option
                  //that.state.currentQues.userAnswer += option
               }
            } else {
               that.state.correctList[activeIndex[0]][activeIndex[1]].userAnswer = option
               //that.state.currentQues.userAnswer = option
            }
         }
         that.setState({
            currentQues: that.state.currentQues
         })
      }
      function isShowRealFn() {
         that.state.currentQues.isShowReal = true
         if (currentQues.questionType === '单选') {
            if (currentQues.userAnswer == (JSON.parse(currentQues.answer || '{}'))?.answer) {
               that.state.correctList[activeIndex[0]][activeIndex[1]].isAnswer = 3
            } else {
               that.state.correctList[activeIndex[0]][activeIndex[1]].isAnswer = 2
            }
         } else {
            let arr = (currentQues?.userAnswer instanceof Array ? '' : (currentQues?.userAnswer || '')).split('')
            let flag = arr.every((item) => {
               return (JSON.parse(currentQues.answer || '{}'))?.answer.indexOf(item) > -1
            })
            if (flag && (currentQues?.userAnswer || '').length == ((JSON.parse(currentQues.answer || '{}'))?.answer || '').replace(/[^A-Z]/g, '').length) {
               that.state.correctList[activeIndex[0]][activeIndex[1]].isAnswer = 3
            } else {
               that.state.correctList[activeIndex[0]][activeIndex[1]].isAnswer = 2
            }
         }
         //that.state.textareaContent=''
         that.forceUpdate()
      }
      function handleContentChange(e) {
         that.setState({
            textareaContent: e.target.value || ''
         })
      }
      function submitZG(e, zgIndex) {
         let arr = []
         if (currentQues.userAnswer instanceof Array) {
            arr = currentQues.userAnswer
         }
         let userAnswerArr = JSON.parse(currentQues?.answer || '{}')
         arr[zgIndex] = e.target.value || ''
         if (true) {
            if ((currentQues?.answer || '').search('kwd') === -1) {
               that.state.correctList[activeIndex[0]][activeIndex[1]].userKsData = { score: 0, point: 0, credit: 0 }
               return
            }
            that.state.correctList[activeIndex[0]][activeIndex[1]].userAnswer = arr
            that.state.correctList[activeIndex[0]][activeIndex[1]].isAnswer = 4
            let lastGetScore = 0
            let zhuguanUserExamScore = []
               (userAnswerArr[zgIndex]?.score || []).forEach((item) => {
                  if ((e.target.value || '').search(item.kwd) > -1) {
                     lastGetScore += Number(item.score)
                  }
               })
            zhuguanUserExamScore[zgIndex] = lastGetScore
            that.state.correctList[activeIndex[0]][activeIndex[1]].zhuguanUserExamScore = zhuguanUserExamScore
            if (e.target.value) {
               that.state.correctList[activeIndex[0]][activeIndex[1]].userKsData = { score: lastGetScore, point: that.state.correctList[activeIndex[0]][activeIndex[1]].point, credit: that.state.correctList[activeIndex[0]][activeIndex[1]].credit }
            } else {
               that.state.correctList[activeIndex[0]][activeIndex[1]].userKsData = { score: lastGetScore, point: 0, credit: 0 }
            }

         }
      }
      // 添加得分点
      function addScoreFn() {
         console.log(currentQues);
         that.setState({
            isAddScore: !that.state.isAddScore
         })
      }
      // 确认得分点
      async function submitScoreFn() {
         let userId = JSON.parse(sessionStorage.getItem('fkUserData') || '{}')?.id
         let hst=''
         let data={
            userId,
            questionId: currentQues.id,
            historyAnswer: JSON.stringify(hst)
         }
         await React.$http.post('questionandexam/AdminUpdateUserQuestion', data ).then(res => {
            if (res.code === 1) {
               React.$message({
                  type: 'success',
                  content: '添加得分点成功'
               })
            }
            that.setState({
               addScoreObj: { kwd: '', score: 0, teaWord: '' },
               isAddScore: false
            })
         }).catch(err => {
            that.setState({
               addScoreObj: { kwd: '', score: 0, teaWord: '' },
               isAddScore: false
            })
         })
      }
      return (
         <Spin size="large" spinning={pageLoading} tip='亲，正在努力加载中~'>
            <div className={s.exerCorrect}>
               <Breadcrumb separator="" className={s.exerBreadcrumb}>
                  <Breadcrumb.Item key='/home/exercises'>
                     <Link to='/home/exercises'>{'题海  >'}</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item style={{ display: isSourceOther ? '' : 'none' }} key='/home/exercises/other'>
                     <Link to={'/home/exercises/other?type=' + title}>&nbsp;&nbsp;{'我的题库  >'}</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>&nbsp;&nbsp;{isSourceOther ? title === 'err' ? '我的错题本' : title === 'fav' ? '我的收藏本' : title === 'no' ? '我不会' : '我的错题本' : '考试结果'}</Breadcrumb.Item>
               </Breadcrumb>
               <Row>
                  <Col span={9} style={{ paddingRight: '10px' }} >
                     <Card>
                        <div className={s.tipsBox} style={{ display: isSourceOther ? 'none' : '' }}>
                           <div className={s.tipInner}>
                              <div className={s.tiplbox}>
                                 <div className={s.tpsIco}>Tips</div>
                                 <div className={s.tipstitle}>点击题号查看题目</div>
                              </div>
                              <div className={s.tiprbox}>
                                 <div className={s.tipveno1}><div style={{ background: '#E9F5FF' }} className={s.blockdb}></div><div className={s.tiptxt}>答对</div></div>
                                 <div className={s.tipveno1}><div style={{ background: '#FFEEE5' }} className={s.blockdb}></div><div className={s.tiptxt}>答错</div></div>
                                 <div className={s.tipveno1}><div style={{ background: '#FFFFFF', border: '1px dotted #ebebeb' }} className={s.blockdb}></div><div className={s.tiptxt}>未答</div></div>
                              </div>
                           </div>
                        </div>
                        {typeArr.map((item, index) => {
                           return <div key={index + 1} className={s.corrLeftItemWrap}>
                              <div className={s.corrLeftItem}>
                                 <div className={s.corrLeftItemTitle} onClick={() => { isHideSiderIndexFn(item) }}>
                                    <div className={s.tit}>{item || ''}题</div>
                                    <div className={s.revers} >
                                       <span>{isHideSiderIndex.search(item) > -1 ? '展开' : '收起'}</span>
                                       <img style={{ transform: isHideSiderIndex.search(item) > -1 ? '' : 'rotate(-90deg)' }} src={corrLeftSXArrow} alt="" className={s.corrLeftItemImg} />
                                    </div>
                                 </div>
                                 <div style={{ display: isHideSiderIndex.search(item) > -1 ? 'none' : '' }} className={s.corrLeftItemBtmWrap}>
                                    {correctList[index].map((itk, idk) => {
                                       return <div key={idk + 1} className={s.corrLeftItemBtm}>
                                          <div style={{
                                             color: (activeIndex[0] === index && activeIndex[1] === idk) ? itk.isAnswer === 4 ? '#fff' : itk.isAnswer === 1 ? '#fff' : itk.isAnswer === 3 ? '#fff' : itk.isAnswer === 2 ? '#fff' : '' : itk.isAnswer === 4 ? '#268CFF' : itk.isAnswer === 3 ? '#268CFF' : itk.isAnswer === 2 ? '#FB5200' : '',
                                             background: (activeIndex[0] === index && activeIndex[1] === idk) ? itk.isAnswer === 4 ? '#268CFF' : itk.isAnswer === 1 ? '#268CFF' : itk.isAnswer === 3 ? '#268CFF' : itk.isAnswer === 2 ? '#FB5200' : '' : itk.isAnswer === 4 ? '#E9F5FF' : itk.isAnswer === 3 ? '#e9f5ff' : itk.isAnswer === 2 ? '#FFEEE5' : '',
                                             borderRadius: item === '单选' ? '50%' : 'none',
                                             display: isOnlyShowErr ? itk.isAnswer === 2 ? '' : 'none' : ''
                                          }}
                                             onClick={() => { toggleActiveIndex(index, idk) }}
                                             className={s.corrLeftItemYuan}>{
                                                index > 4 ? correctList[0].length + correctList[1].length + correctList[2].length + correctList[3].length + correctList[4].length + (idk + 1) :
                                                   index > 3 ? correctList[0].length + correctList[1].length + correctList[2].length + correctList[3].length + (idk + 1) :
                                                      index > 2 ? correctList[0].length + correctList[1].length + correctList[2].length + (idk + 1) :
                                                         index > 1 ? correctList[0].length + correctList[1].length + (idk + 1) :
                                                            index > 0 ? correctList[0].length + (idk + 1) :
                                                               (idk + 1)}
                                          </div>
                                       </div>
                                    })}

                                 </div>
                              </div>
                           </div>
                        })
                        }
                        <div className={s.corrLeftBtnWrap} style={{ display: isSourceOther ? 'none' : '' }}>
                           <Button onClick={() => { leftBtmBtnFn(1) }} size='large' style={{ background: leftBtmBtnIndex === 1 ? '#268CFF' : '', color: leftBtmBtnIndex === 1 ? '#fff' : '#268CFF', borderColor: '#268CFF' }} shape='round'>全部解析</Button>
                           <Button onClick={() => { leftBtmBtnFn(2) }} size='large' style={{ background: leftBtmBtnIndex === 2 ? '#268CFF' : '', color: leftBtmBtnIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF' }} shape='round'>只看错题</Button>
                           <Button onClick={() => { leftBtmBtnFn(3) }} size='large' style={{ background: leftBtmBtnIndex === 3 ? '#268CFF' : '', color: leftBtmBtnIndex === 3 ? '#fff' : '#268CFF', borderColor: '#268CFF' }} shape='round'>再做一次</Button>
                        </div>
                     </Card>
                  </Col>
                  <Col span={15} style={{ paddingLeft: '10px' }}>
                     <Card style={{ marginBottom: '20px', display: isSourceOther ? 'none' : '' }} >
                        <div className={s.topScorebox}>
                           <div className={s.piechart} >
                              <Progress type="circle" percent={parseInt(((examInfo?.score instanceof Number ? (examInfo?.score || 0) : 0) / (examInfo?.allScore instanceof Number ? (examInfo?.allScore || 1) : 1)) * 100)} format={() =>
                                 <div className={s.pieInner}>
                                    <div className={s.df}>得分</div>
                                    <div className={s.num}>{examInfo?.score || 0}</div>
                                    <div className={s.txt}>共{examInfo?.allScore || 0}分</div>
                                 </div>
                              } />
                           </div>
                           <div className={s.info}>
                              <div className={s.title}>{title}</div>
                              <div className={s.datasee}>
                                 <div className={s.difficulty}>
                                    <div className={s.num}>{examInfo.allLength || 0}</div>
                                    <div className={s.txt}>题量</div>
                                 </div>
                                 {/* <div className={s.difficulty}>
                                    <div className={s.num}>2.8</div>
                                    <div className={s.txt}>难度</div>
                                 </div> */}
                                 <div className={s.difficulty}>
                                    <div className={s.num}>{examInfo?.usedTime || 0}'</div>
                                    <div className={s.txt}>耗时</div>
                                 </div>
                              </div>
                           </div>
                           <div className={s.positionTips}>
                              <div className={s.tipsTit}>打分提示</div>
                              <p>{`客观题满分共计${examInfo?.keGuanScore || 0}分,答对${examInfo?.keGuanUserScore?.suc || 0}分,答错${examInfo?.keGuanUserScore?.err || 0}分,未答${examInfo?.keGuanUserScore?.no || 0}分`}</p>
                              <p>{`主观题满分共计${examInfo?.zhuGuanScore || 0}分，有${examInfo?.isNeedZNZG || 0}问参与智能打分`}</p>
                              <p>{`总分为${examInfo?.allScore || 0}分,您获得${examInfo?.score || 0}分`}</p>
                              <p>{`有${examInfo?.noNeedZNZG || 0}问不参与智能打分,总分为${examInfo?.noZhuGuanScore || 0}分`}</p>
                           </div>
                        </div>
                     </Card>
                     <Card className={s.btmAnalyCard}> 
                        <div className={s.layered} >
                           <div className={s.titlebarlist}>
                              <div className={s.tabbar}>{currentQues?.questionType}题</div>
                              <Tooltip placement="top" arrowPointAtCenter title='收藏' color='#18A9FF'>
                                 <PlusCircleFilled onClick={() => { that.favCantFn('fav', (currentQues?.isFav || false)) }} style={{ fontSize: '25px', color: (currentQues?.isFav || false) ? 'orange' : '#9DA3B2', marginLeft: '15px', cursor: 'pointer' }} />
                              </Tooltip>
                              <Tooltip placement="top" arrowPointAtCenter title='我不会' color='#18A9FF'>
                                 <QuestionCircleFilled onClick={() => { that.favCantFn('cant', (currentQues?.isCant || false)) }} style={{ fontSize: '25px', color: (currentQues?.isCant || false) ? 'orange' : '#9DA3B2', marginLeft: '15px', cursor: 'pointer' }} />
                              </Tooltip>
                              <div className={s.rit_icoTips} style={{ display: currentQues.isAnswer === 3 ? '' : 'none' }}>
                                 <img className={s.zan} src={zan} alt="" />
                                 <div className={s.nice}>本题答对了</div>
                              </div>
                              <div className={s.rit_icoTips} style={{ display: currentQues.isAnswer === 2 ? '' : 'none' }}>
                                 <img className={s.zan} src={err} alt="" />
                                 <div className={s.nice}>本题答错了</div>
                              </div>
                           </div>
                           <div className={s.subject}>
                              <div className={s.txtAll} readOnly dangerouslySetInnerHTML={{ __html: currentQues?.stem }}></div>
                           </div>
                           <div className={s.vastusList} style={{ marginBottom: '20px', display: (currentQues.questionTypeClass === "主观题") ? 'none' : !isSourceOther ? 'none' : !currentQues.isShowReal ? '' : 'none' }}>
                              {(Object.keys(JSON.parse(currentQues?.options || '{}')) || []).map((key, index) => {
                                 return <div onClick={() => { otherSelOption(key) }} key={index + 1} className={s.vLi}>
                                    <div className={s.ckBox} style={{ background: (currentQues?.userAnswer instanceof Array ? '' : (currentQues?.userAnswer || '')).search(key) > -1 ? '#268fff' : '', color: (currentQues?.userAnswer instanceof Array ? '' : (currentQues?.userAnswer || '')).search(key) > -1 ? '#fff' : '' }}>{key}</div>
                                    <div className={s.vasTxt}>{Object.values(JSON.parse(currentQues?.options || '{}'))[index]}</div>
                                 </div>
                              })}
                           </div>
                           <div style={{ display: !isSourceOther ? 'none' : !(currentQues.questionTypeClass === "主观题") ? 'none' : !currentQues.isShowReal ? '' : 'none' }}>
                              <div className={s.otherTabUl}>
                                 {(Object.keys(JSON.parse(currentQues?.options || '{}')) || []).map((item, index) => {
                                    return <div onClick={() => { that.setState({ zhuguanQuesIndex: index }) }} className={s.otherTbli} key={index + 1} style={{ background: index === zhuguanQuesIndex ? '#268CFF' : '', color: index === zhuguanQuesIndex ? '#fff' : '' }}>问题{index + 1}</div>
                                 })}
                              </div>
                              <textarea value={textareaContent} ref={(textarea) => that.otherText = textarea} onBlur={(e) => { submitZG(e, zhuguanQuesIndex) }}
                                 onChange={(e) => { handleContentChange(e) }} className={s.otherTextArea} maxLength="5000" style={{ height: '210px' }}></textarea>
                           </div>
                           <Button onClick={() => { isShowRealFn() }} size='large' style={{ background: '#268fff', color: '#fff', display: !isSourceOther ? 'none' : !currentQues.isShowReal ? '' : 'none' }} type='primary' shape='round'>查看解析</Button>
                           <div className={s.vastusList} style={{ display: (currentQues.questionTypeClass === "主观题") ? 'none' : !isSourceOther ? '' : currentQues.isShowReal ? '' : 'none' }}>
                              {(Object.keys(JSON.parse(currentQues?.options || '{}')) || []).map((key, index) => {
                                 return <div key={index + 1} className={(((currentQues?.userAnswer instanceof Array ? '' : (currentQues?.userAnswer || '')).search(key) > -1) && JSON.parse(currentQues?.answer || '{}').answer.search(key) == -1) ? s.vLiErr : s.vLi}
                                    style={{ background: (JSON.parse(currentQues?.answer || '{}').answer || '').search(key) > -1 ? '#E9F5FF' : '' }}>
                                    <div className={s.ckBox}>{key}</div>
                                    <div className={s.vasTxt}>{Object.values(JSON.parse(currentQues?.options || '{}'))[index]}</div>
                                 </div>
                              })}
                           </div>
                           <div className={s.myanswer} style={{ display: isSourceOther ? currentQues.isShowReal ? '' : 'none' : '' }}>
                              <div className={s.subjective_box} style={{ display: currentQues.questionTypeClass === "主观题" ? '' : 'none' }}>
                                 <div className={s.scoreDistribution}>
                                    <div className={s.position_lt}>得分：{currentQues?.userKsData?.score || '0'} / {currentQues?.score || '0'}分</div>
                                    <div className={s.scoreListBox}>
                                       {(Object.keys(JSON.parse(currentQues?.options || '{}')) || []).map((item, index) => {
                                          return <div className={s.scoreList} key={index + 1}>
                                             <div className={s.lTxt}>问题{(index + 1) || '0'}得分：</div>
                                             <div className={s.rTxt}><span style={{ color: '#268CFF' }}>{currentQues.isZhiNeng ? currentQues.zhuguanUserExamScore[index] : '0'}</span>&nbsp;分</div>
                                          </div>
                                       })}
                                    </div>
                                 </div>
                                 <div className={s.tabUl}>
                                    {(Object.keys(JSON.parse(currentQues?.options || '{}')) || []).map((item, index) => {
                                       return <div onClick={() => { that.setState({ zhuguanQuesIndex: index }) }} className={s.tbli} key={index + 1} style={{ background: index === zhuguanQuesIndex ? '#268CFF' : '', color: index === zhuguanQuesIndex ? '#fff' : '' }}>问题{index + 1}</div>
                                    })}
                                 </div>
                                 <div className={s.problemtitleBox} readOnly dangerouslySetInnerHTML={{ __html: Object.values(JSON.parse(currentQues?.options || '{}'))[zhuguanQuesIndex] }}></div>
                              </div>
                              <div className={s.myanswerTit} style={{ display: currentQues.questionTypeClass === "主观题" ? '' : 'none' }}>我的作答</div>
                              <div className={s.zhuguanUserAnswer} style={{ display: currentQues.questionTypeClass === "主观题" ? '' : 'none' }}>
                                 {currentQues?.userAnswer ? (currentQues?.userAnswer[zhuguanQuesIndex] || '') : ''}
                              </div>
                              <div className={s._reference} style={{ display: currentQues.questionTypeClass === "主观题" ? '' : 'none' }}>
                                 <div className={s._refTitle} >参考答案</div>
                                 <div className={s._refUl} readOnly dangerouslySetInnerHTML={{ __html: ((JSON.parse(currentQues?.answer || '["{}"]')[0] || { answer: '' }).answer || '') }}></div>
                              </div>
                              <div className={s.announce} style={{ display: currentQues.questionTypeClass === "主观题" ? 'none' : '' }}>
                                 <div className={s.vast}>正确答案：{JSON.parse(currentQues?.answer || '{}').answer || ''}</div>
                                 <div className={s.yourVast}>{currentQues.userAnswer ? '您的答案为：' + currentQues.userAnswer : ''}</div>
                              </div>
                              <div className={s.textAnalysis} style={{ display: currentQues.questionTypeClass === "主观题" ? 'none' : '' }}>
                                 <div className={s.title}>文字解析</div>
                                 <div className={s.ptxt} readOnly dangerouslySetInnerHTML={{ __html: JSON.parse(currentQues?.analysisOrScore || '{}')?.Analysis }}></div>
                              </div>
                              <div className={s.testSite} style={{ display: currentQues?.testPoint ? '' : 'none' }}>
                                 <div className={s.title}>考点</div>
                                 <Button size='mini' style={{ color: '#268CFF', borderColor: '#268CFF', borderRadius: '5px' }} >{currentQues?.testPoint || ''}</Button>
                              </div>
                              <div className={s.addScorePoint} style={{ display: isCanAddScore ? '' : 'none' }}>
                                 <Button onClick={() => { addScoreFn() }} size='mini' style={{ background: '#268fff', color: '#fff', margin: '15px 0', display: currentQues.questionTypeClass === "主观题" ? '' : 'none' }} type='primary' shape='round'>{isAddScore ? '取消' : '新增'}得分点</Button>
                                 <div style={{ display: isAddScore ? '' : 'none' }}>
                                    <Row style={{ marginBottom: '5px' }}>
                                       <Col span={18} style={{ paddingRight: '5px' }} >
                                          <Input  allowClear placeholder="请输入得分关键词" onChange={(e) => { that.state.addScoreObj.kwd = e.target.value || '' }} />
                                       </Col>
                                       <Col span={6} >
                                          <InputNumber  controls={false} addonAfter="分   数" min={1} max={300} defaultValue={1} onChange={(e) => { that.state.addScoreObj.score = e || '' }} />
                                       </Col>
                                    </Row>
                                    <TextArea  allowClear autoSize={{ minRows: 3, maxRows: 6 }} placeholder="请输入您的点评" showCount maxLength={100000} onChange={(e) => { that.state.addScoreObj.teaWord = e.target.value || '' }} />
                                    <Button loading={addScoreLoading} onClick={() => { submitScoreFn() }} size='mini' style={{ background: '#268fff', color: '#fff', margin: '15px 0' }} type='primary' shape='round'>确认得分点</Button>
                                 </div>
                              </div>
                              <div className={s.noteBox}>
                                 <div className={s.notetitle} >笔记</div>
                                 <div style={{ display: isAddNote ? '' : 'none' }}>  
                                    <textarea ref={that.noteText} name="" id="" cols="30" rows="10" placeholder="请输入笔记内容"></textarea>
                                    <div className={s.subNote} onClick={() => { addNoteFn() }} >确定</div>
                                 </div>
                                 <div style={{ display: isAddNote ? 'none' : '' }}>
                                    <div className={s.nullNote} >该题目未添加笔记</div>
                                    <div className={s.addNote} onClick={() => { that.setState({ isAddNote: true }) }} > <span>+</span> 添加笔记</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </Card>
                  </Col>
               </Row>
            </div>
         </Spin>
      );
   }

}
export default withRouter(correct);



