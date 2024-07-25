import React, { lazy, Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom'
import s from './exam.module.scss';
import sqbt from '../../../../public/image/exam/sqbt.png'
import zkbt from '../../../../public/image/exam/zkbt.png'
import datika from '../../../../public/image/exam/datika.png'
import shouqi from '../../../../public/image/exam/shouqi.png'
import zhankai from '../../../../public/image/exam/zhankai.png'
import hideSider from '../../../../public/image/exam/hideSider.gif'
import showSider from '../../../../public/image/exam/showSider.gif'
import topBtnBig from '../../../../public/image/exam/topBtnBig.png'
import topBtn from '../../../../public/image/exam/topBtn.jpg'
import prevBtnImg from '../../../../public/image/exam/prevBtn.jpg'
import fzzt from '../../../../public/image/exam/fzzt.jpg'
import fangda from '../../../../public/image/exam/fangda.png'
import suoxiao from '../../../../public/image/exam/suoxiao.png'
import eSubBg from '../../../../public/image/exam/eSubBg.gif'
import eSubMsg from '../../../../public/image/exam/eSubMsg.gif'
import eSubIcon from '../../../../public/image/exam/eSubIcon.gif'
import eSubBtn from '../../../../public/image/exam/eSubBtn.png'
import lawZXH from '../../../../public/image/exam/lawZXH.png'
import lawFD from '../../../../public/image/exam/lawFD.png'
import lawClose from '../../../../public/image/exam/lawClose.png'
const LawCpt = lazy(() => import('@/components/lawCpt'))
// 生成26个大写字母数组
const upperLetters = []
for (let i = 65; i <= 90; i++) {
   upperLetters.push(String.fromCharCode(i))
}
class Exam extends Component {

   constructor(props) {
      super(props);
      this.state = {
         examData: { questions: [] },
         isShowTop: true,
         isShowSider: true,
         oneSelList: [],
         twoSelList: [],
         isHideZg: false,
         styleBgColor: '#DEEBF6',
         quesFontSize: '20px',
         currentQues: {},
         activeIndex: 1,
         isMaxWinDow: false,
         zhuguanQuesIndex: 0,
         examTime: '00:00:00',
         startExamTime: '00:00:00',
         endHandleTime: new Date(),
         budingList: [],
         lunshuList: [],
         wenbenList: [],
         anliList: [],
         isHideSiderIndex: '',
         typeStr: '',
         isEndExam: false,
         userData: {},
         isEndExamStr: '本考试科目尚未作答，请返回继续作答',
         isAllDo: 1, //1没做2没做完3全做完
         resultInfo: {}, // 提交试卷传的参
         examTotalArr: [],
         isShowLawList: false,
         isFDLaw: false,
         addTimer: 0, //练习计时器,
         singleUseTime: 0 //单个题目练习用时
      }
      Exam._this = this;
   }

   componentDidMount() {
      // (function () {
      //    if (window.history && window.history.pushState) {
      //       window.onpopstate = function () {
      //          window.history.pushState('forward', null, '');
      //          window.history.forward(1);
      //       };
      //    }
      //    window.history.pushState('forward', null, '');//在IE中必须得有这两行
      //    window.history.forward(1);
      // })();
      window.addEventListener('beforeunload', ev => {
         ev.preventDefault();
         ev.returnValue = '确定退出当前考试吗？';
      });
      document.oncontextmenu = function (e) {/*屏蔽浏览器默认右键事件*/
         e = e || window.event;
         return false;
      };
      let currentQues = {};
      let oneSelList = [];
      let twoSelList = [];
      let budingList = [];
      let lunshuList = [];
      let wenbenList = [];
      let anliList = [];
      let tempArr = [];
      let testTypeArr = [];
      this.state.isEndExam = false
      try {
         this.state.startExamTime = new Date()
         const userData = JSON.parse(sessionStorage.getItem('fkUserData') || '{}')
         let typeStr = this.props.location.query.typeStr
         let examData = { questions: [] }
         let finishedQuestions=JSON.parse(this.props.location.query.finishedQuestions || '{}')
         if (typeStr.search('继续考试') > -1) {
            examData.questions = JSON.parse(sessionStorage.getItem('examTotal') || '[]')
            examData.limitTime = parseInt(sessionStorage.getItem('examLimitTime'))
            examData.examId = sessionStorage.getItem('examId')
         } else {
            examData = JSON.parse(this.props.location.query.examData || '{}')
         }
         sessionStorage.setItem('examLimitTime', parseInt(examData.limitTime))
         if (typeStr.search('模拟考试') > -1) {
            this.realCalcTime(examData.limitTime)
         } else {
            this.calcTime(examData.limitTime)
         }
         if (!examData.questions || !examData.questions.length) {
            React.$message({
               type: 'error',
               content: '此试卷无效'
            })
            this.props.history.goBack()
         } 
         (examData?.questions || []).forEach((item) => {
            item.isMark = false
            item.userAnswer = ""
            item.isAnswer = 1 // 1没答 2答错 3答错
            item.userKsData = { score: 0, point: 0, credit: 0 } // 用户答题结果
            if (item.questionType === "单选") {
               oneSelList.push(item)
            } else if (item.questionType === "多选") {
               twoSelList.push(item)
            } else if (item.questionType === "不定项") {
               budingList.push(item)
            } else if (item.questionType === "论述") {
               lunshuList.push(item)
            } else if (item.questionType === "文书写作") {
               wenbenList.push(item)
            } else if (item.questionType === "案例分析") {
               anliList.push(item)
            } else {
               tempArr.push(item)
            }
            testTypeArr.push(item.questionType)
            Object.keys(finishedQuestions).forEach((his,hisIndex)=>{
               if(his==item.id){
                  if(item.questionTypeClass == "主观题"){
                     item.userAnswer = Object.values(Object.values(finishedQuestions)[hisIndex])
                  } else {
                     item.userAnswer = Object.values(finishedQuestions)[hisIndex].answer
                  }
               }
            })
         })
         console.log('noShowQuesType', tempArr)
         // console.log('所有的题型', Array.from(new Set(testTypeArr)))
         if (oneSelList.length) {
            currentQues = oneSelList[0]
         } else if (twoSelList.length) {
            currentQues = twoSelList[0]
         } else if (budingList.length) {
            currentQues = budingList[0]
         } else if (lunshuList.length) {
            currentQues = lunshuList[0]
         } else if (wenbenList.length) {
            currentQues = wenbenList[0]
         } else if (anliList.length) {
            currentQues = anliList[0]
         }
         this.setState({
            oneSelList,
            twoSelList,
            budingList,
            lunshuList,
            wenbenList,
            anliList,
            currentQues,
            anliList,
            examData,
            typeStr,
            userData,
            activeIndex: examData?.currentIndex || 1
         })
      } catch (err) {
         console.log('进入考试页面报错', err)
         this.props.history.goBack()
      }
   }
   componentWillUnmount() {
      window.removeEventListener('beforeunload', ev => {
         ev.preventDefault();
         ev.returnValue = '确定退出当前考试吗？';
      })
      document.oncontextmenu = function (e) {/*屏蔽浏览器默认右键事件*/
         // e = e || window.event;
         // return false;
      };
      this.updateUserExam()
   }

   async updateUserExam() {//更新考试进度
      if (this.state.isEndExam) {
         return
      }
      let { examData, activeIndex, startExamTime } = this.state
      let obj = {
         //userExamId: examData.userExamId,//用户试卷ID
         examId: examData.examId, //考试模式时需传此参数
         usedTime: parseInt(((new Date()).getTime() - startExamTime.getTime()) / 1000), //考试已经用时总共S，考试模式时需传此参数
         currentIndex: activeIndex//答题卡索引定位，由于定位做到第几题
      }
      await React.$http.post('/questionandexam/updateUserExam', obj).then(res => {
         if (res.code === 1) {
            React.$message({
               type: 'success',
               content: '更新考试进度成功'
            })
         }
      });
   }
   // 正式考试根据已给时间倒计时
   realCalcTime(limitTime) {
      let that = Exam._this
      var n_hour = parseInt(limitTime / 3600); //时
      var n_min = parseInt((limitTime - n_hour * 3600) / 60); //分
      var n_sec = parseInt(limitTime - n_hour * 3600 - n_min * 60); //秒
      var time = ''
      let timer = setInterval(function () {
         var str_sec = n_sec;
         var str_min = n_min;
         var str_hour = n_hour;
         if (n_sec < 10) {
            str_sec = "0" + n_sec;
         }
         if (n_min < 10) {
            str_min = "0" + n_min;
         }
         if (n_hour < 10) {
            str_hour = "0" + n_hour;
         }
         if ((n_hour * (60 * 60) + n_min * (60) + n_sec) <= 0) {
            that.isEndExamFn(true)
            clearInterval(timer)
            return
         }
         time = str_hour + ":" + str_min + ":" + str_sec;
         that.setState({
            examTime: time
         })
         n_sec--;
         if (n_sec < 0) {
            if (n_min > 0) {
               n_sec = 59;
               n_min--;
               if (n_min < 0) {
                  if (n_hour > 0) {
                     n_hour--;
                     n_min = 59;
                     if (n_hour < 0) {
                        n_hour = 0;
                     }
                  } else {

                  }
               }
            } else {
               if (n_hour > 0) {
                  n_hour--;
                  n_min = 59;
                  n_sec = 59;
                  if (n_hour < 0) {
                     n_hour = 0;
                  }
               } else {

               }
            }
         }
      }, 1000);
   }
   calcTime(limitTime) {// 练习正计时
      let that = Exam._this
      clearInterval(that.state.addTimer)
      var n_sec = 0; //秒
      var n_min = 0; //分
      var n_hour = 0; //时
      var time = ''
      that.state.addTimer = setInterval(function () {
         var str_sec = n_sec;
         var str_min = n_min;
         var str_hour = n_hour;
         if (n_sec < 10) {
            str_sec = "0" + n_sec;
         }
         if (n_min < 10) {
            str_min = "0" + n_min;
         }
         if (n_hour < 10) {
            str_hour = "0" + n_hour;
         }
         if ((n_hour * (60 * 60) + n_min * (60) + n_sec) >= limitTime) {
            that.isEndExamFn(true)
            clearInterval(that.state.addTimer)
            return
         }
         time = str_hour + ":" + str_min + ":" + str_sec;
         that.setState({
            singleUseTime: (n_hour * (60 * 60) + n_min * (60) + n_sec),
            examTime: time
         })
         n_sec++;
         if (n_sec > 59) {
            n_sec = 0;
            n_min++;
         }
         if (n_min > 59) {
            n_sec = 0;
            n_hour++;
         }
      }, 1000);
   }
   submitExam() {
      let that = Exam._this
      that.singleSubApi()
      let lastScore = 0
      let lastPoint = 0
      let lastCredit = 0
      that.state.examTotalArr.forEach((item) => {
         lastScore += item.userKsData?.score
         lastPoint += item.userKsData?.point
         lastCredit += item.userKsData?.credit
      })
      let usedTime = that.state.examData.limitTime - parseInt(((that.state.endHandleTime).getTime() - (that.state.startExamTime).getTime()) / 1000)
      let resultInfo = {
         examId: that.state.examData?.examId || '',
         userExamId: that.state.examData?.userExamId || '',
         usedTime,//最后一次回答问题操作到提交结束期间的时间
         score: lastScore,//分数
         getCredit: lastPoint,//获得学分
         getPoint: lastCredit//获得积分
      }
      that.props.history.push({ pathname: '/home/exercises/correct', query: { typeStr: that.state.typeStr, resultInfo: JSON.stringify(resultInfo), examLimitTime: that.state.examData.limitTime, examId: that.state.examData.examId } })

   }
   isEndExamFn(isForce) {
      let { oneSelList, twoSelList, budingList, lunshuList, wenbenList, anliList } = this.state
      let totalArr = [...oneSelList, ...twoSelList, ...budingList, ...lunshuList, ...wenbenList, ...anliList]

      let noNumber = 0
      totalArr.forEach((item) => {
         if (item.questionTypeClass === '主观题') {
            if (!(item?.userAnswer instanceof Array && item?.userAnswer?.some(function (item) { return item.length }))) {
               noNumber++
               item.isAnswer = 1
            } else {

            }
         } else {
            if (!item.userAnswer) {
               noNumber++
               item.isAnswer = 1
            } else {

            }
         }
      })
      sessionStorage.setItem('examTotal', JSON.stringify(totalArr))
      let str = ''
      let isAllDo = 1
      if (noNumber <= 0) {
         isAllDo = 3
         str = '再次确认是否现在交卷!交卷后不能返回继续做题!'
      } else if (noNumber === totalArr.length) {
         str = '本考试科目尚未作答，请返回继续作答'
      } else {
         isAllDo = 2
         str = `本考试科目有 ${noNumber} 题 尚未作答，请确认全部作答完毕后交卷！`
      }
      if (isForce) {
         this.setState({
            isEndExam: true,
            isAllDo,
            examTotalArr: totalArr
         }, () => { this.submitExam() })
      } else {
         this.setState({
            isEndExam: true,
            isEndExamStr: str,
            isAllDo,
            examTotalArr: totalArr
         })
      }
   }
   async singleSubApi() {// TODO单题提交练习与考试区别
      let { currentQues, activeIndex, singleUseTime ,typeStr} = this.state
      let lastAnswer = ''
      if (currentQues.questionTypeClass != "主观题") {
         lastAnswer = { answer: currentQues.userAnswer }
      } else {
         if (currentQues.userAnswer instanceof Array) {
            let obj = {}
            currentQues.userAnswer.forEach((item, index) => {
               obj[`answer${upperLetters[index]}`] = item
            })
            lastAnswer = obj
         } else {
            lastAnswer = { answerA: "" }
         }
      }
      var data = {
         questionId: currentQues.id,
         subjectNumb: currentQues.subjectNumb,
         type: currentQues.type,
         lastAnswer: JSON.stringify(lastAnswer),
         lastGetScore: (currentQues.userKsData?.score || 0),
         currentIndex: activeIndex
      }
      if (typeStr.search('模拟考试') > -1) {
         let yearNumb = 0
         let yearWrongNumb = 0
         let weekNumb = 0
         let weekWrongNumb = 0
         if (currentQues.lastCorrect === null || typeof(currentQues.lastCorrect) === 'undefined')//没做过该题
         {
            yearNumb = 1
            weekNumb = 1
            if ((currentQues.userKsData?.score || 0) < currentQues.score * 0.6)//做错
            {
               yearWrongNumb = 1
               weekWrongNumb = 1
            }
         }
         else//曾做过该题
         {
            if ((currentQues.userKsData?.score || 0) < currentQues.score * 0.6 && currentQues.lastCorrect == "正确")//原来做对，现在做错
            {
               yearWrongNumb = 1
               weekWrongNumb = 1
            }
            if ((currentQues.userKsData?.score || 0) > currentQues.score * 0.6 && currentQues.lastCorrect == "错误")//原来做错，现在做对
            {
               yearWrongNumb = -1
               weekWrongNumb = -1
            }
         }
         data.yearNumb = yearNumb;
         data.weekNumb = weekNumb;
         data.yearWrongNumb = yearWrongNumb;
         data.weekWrongNumb = weekWrongNumb;
         data.usedTime = this.state.examData.limitTime - parseInt(((this.state.endHandleTime).getTime() - (this.state.startExamTime).getTime()) / 1000)
      }else{
         data.lastTimesUesd = singleUseTime
      }
      await React.$http.post('/questionandexam/questionOperation', data).then(res => {
         if (res.code === 1) {

         } else {
            
         }
         this.calcTime()
      }).catch(err => {
         this.calcTime()
      })
   }
   render() {
      let that = Exam._this
      let { isFDLaw, isShowLawList, isAllDo, isEndExamStr, isEndExam, userData, typeStr, isHideSiderIndex, examData, anliList, wenbenList, lunshuList, budingList, examTime, zhuguanQuesIndex, textareaContent, isMaxWinDow, activeIndex, currentQues, quesFontSize, styleBgColor, isShowTop, isShowSider, oneSelList, twoSelList } = that.state
      let currentQuesIndex = 0
      if (currentQues?.questionType === '单选') {
         currentQuesIndex = activeIndex
      } else if (currentQues?.questionType === '多选') {
         currentQuesIndex = oneSelList.length + activeIndex
      } else if (currentQues?.questionType === '不定项') {
         currentQuesIndex = twoSelList.length + oneSelList.length + activeIndex
      } else if (currentQues?.questionType === '论述') {
         currentQuesIndex = budingList.length + twoSelList.length + oneSelList.length + activeIndex
      } else if (currentQues?.questionType === '文书写作') {
         currentQuesIndex = lunshuList.length + budingList.length + twoSelList.length + oneSelList.length + activeIndex
      } else if (currentQues?.questionType === '案例分析') {
         currentQuesIndex = wenbenList.length + lunshuList.length + budingList.length + twoSelList.length + oneSelList.length + activeIndex
      }
      function nextPrevQues(obj, str) {
         if ((currentQuesIndex >= (examData.questions.length || 0)) && str === 'next') {
            return
         }
         if ((currentQuesIndex <= 1) && str === 'prev') {
            return
         }
         that.singleSubApi()
         if (str === 'next') {
            activeIndex++
         }
         if (str === 'prev') {
            activeIndex--
         }
         let currentQuesT = currentQues
         let nameArr = ['单选', '多选', '不定项', '论述', '文书写作', '案例分析']
         let typeArr = ['oneSelList', 'twoSelList', 'budingList', 'lunshuList', 'wenbenList', 'anliList']
         let state = that.state
         for (let i = 0; i < nameArr.length; i++) {
            if (obj.questionType === nameArr[i]) {
               if ((activeIndex > state[typeArr[i]].length)) {// 跳下一题型
                  if (i === (nameArr.length - 1)) {
                     return
                  } else {
                     for (let j = i + 1; j < nameArr.length; j++) {
                        if (state[typeArr[j]].length) {
                           activeIndex = 1
                           currentQuesT = state[typeArr[j]][activeIndex - 1]
                           break;
                        }
                     }
                  }

               } else if (activeIndex <= 0) {// 转上一题型
                  if (i === 0) {
                     return
                  } else {
                     for (let j = i - 1; j >= 0; j--) {
                        if (state[typeArr[j]].length) {
                           activeIndex = state[typeArr[j]].length
                           currentQuesT = state[typeArr[j]][activeIndex - 1]
                           break;
                        }
                     }
                  }
               } else {
                  currentQuesT = state[typeArr[i]][activeIndex - 1]
               }
               break;
            }
         }
         that.setState({
            currentQues: currentQuesT,
            activeIndex,
            zhuguanQuesIndex: 0,
            textareaContent: currentQuesT?.userAnswer[0] || ''
         })
      }
      function submitZG(e, zgIndex) {
         that.state.endHandleTime = new Date()
         let arr = []
         if (currentQues.userAnswer instanceof Array) {
            arr = currentQues.userAnswer
         }
         let userAnswerArr = JSON.parse(currentQues?.answer || '[]')
         arr[zgIndex] = e.target.value || ''
         if (currentQues?.questionType === '论述') {
            if ((currentQues?.answer || '').search('kwd') === -1) {
               lunshuList[activeIndex - 1].userKsData = { score: 0, point: 0, credit: 0 }
               return
            }
            lunshuList[activeIndex - 1].userAnswer = arr
            lunshuList[activeIndex - 1].isAnswer = 4
            let lastGetScore = 0
            userAnswerArr[zgIndex].score.forEach((item) => {
               if ((e.target.value || '').search(item.kwd) > -1) {
                  lastGetScore += Number(item.score)
               }
            })
            if (e.target.value) {
               lunshuList[activeIndex - 1].userKsData = { score: lastGetScore, point: lunshuList[activeIndex - 1].point, credit: lunshuList[activeIndex - 1].credit }
            } else {
               lunshuList[activeIndex - 1].userKsData = { score: lastGetScore, point: 0, credit: 0 }
            }

         } else if (currentQues?.questionType === '文书写作') {
            if ((currentQues?.answer || '').search('kwd') === -1) {
               wenbenList[activeIndex - 1].userKsData = { score: 0, point: 0, credit: 0 }
               return
            }
            wenbenList[activeIndex - 1].userAnswer = arr
            wenbenList[activeIndex - 1].isAnswer = 4
            let lastGetScore = 0
            userAnswerArr[zgIndex].score.forEach((item) => {
               if ((e.target.value || '').search(item.kwd) > -1) {
                  lastGetScore += Number(item.score)
               }
            })
            if (e.target.value) {
               wenbenList[activeIndex - 1].userKsData = { score: lastGetScore, point: wenbenList[activeIndex - 1].point, credit: wenbenList[activeIndex - 1].credit }
            } else {
               wenbenList[activeIndex - 1].userKsData = { score: lastGetScore, point: 0, credit: 0 }
            }
         } else if (currentQues?.questionType === '案例分析') {
            if ((currentQues?.answer || '').search('kwd') === -1) {
               anliList[activeIndex - 1].userKsData = { score: 0, point: 0, credit: 0 }
               return
            }
            anliList[activeIndex - 1].userAnswer = arr
            anliList[activeIndex - 1].isAnswer = 4
            let lastGetScore = 0
            userAnswerArr[zgIndex].score.forEach((item) => {
               if ((e.target.value || '').search(item.kwd) > -1) {
                  lastGetScore += Number(item.score)
               }
            })
            if (e.target.value) {
               anliList[activeIndex - 1].userKsData = { score: lastGetScore, point: anliList[activeIndex - 1].point, credit: anliList[activeIndex - 1].credit }
            } else {
               anliList[activeIndex - 1].userKsData = { score: lastGetScore, point: 0, credit: 0 }
            }
         }
      }
      function maskQues(ques, index, e) {
         console.log(ques, index, e, '标记')
         if (ques?.questionType === '单选') {
            oneSelList[index - 1].isMark = e.target.checked
         } else if (ques?.questionType === '多选') {
            twoSelList[index - 1].isMark = e.target.checked
         } else if (ques?.questionType === '不定项') {
            budingList[index - 1].isMark = e.target.checked
         } else if (ques?.questionType === '论述') {
            lunshuList[index - 1].isMark = e.target.checked
         } else if (ques?.questionType === '文书写作') {
            wenbenList[index - 1].isMark = e.target.checked
         } else if (ques?.questionType === '案例分析') {
            anliList[index - 1].isMark = e.target.checked
         }
         that.setState({
            oneSelList,
            twoSelList,
            budingList,
            lunshuList,
            wenbenList,
            anliList
         })
      }
      function eSelChange(e, index, str) {
         that.state.endHandleTime = new Date()
         if (str === '单选') {
            (that.state.oneSelList[index - 1] || {}).userAnswer = e.target.value
            if (e.target.value == (JSON.parse(that.state.oneSelList[index - 1].answer || '{}'))?.answer) {
               that.state.oneSelList[index - 1].isAnswer = 3
               that.state.oneSelList[index - 1].userKsData = { score: that.state.oneSelList[index - 1].score, point: that.state.oneSelList[index - 1].point, credit: that.state.oneSelList[index - 1].credit }
            } else {
               that.state.oneSelList[index - 1].isAnswer = 2
               that.state.oneSelList[index - 1].userKsData = { score: 0, point: 0, credit: 0 }
            }
         } else if (str === '多选') {
            if (e.target.checked) {
               that.state.twoSelList[index - 1].userAnswer += e.target.value
            } else {
               let strTemp = that.state.twoSelList[index - 1].userAnswer
               let inx = strTemp.indexOf(e.target.value)
               if (inx > -1) {
                  strTemp = strTemp.split('')
                  strTemp.splice(inx, 1)
                  strTemp = Array.from(new Set(strTemp))
                  strTemp = strTemp.join('')
                  that.state.twoSelList[index - 1].userAnswer = strTemp
               }
            }
            let arr = that.state.twoSelList[index - 1].userAnswer.split('')
            let flag = arr.every((item) => {
               return (JSON.parse(that.state.twoSelList[index - 1].answer || '{}'))?.answer.indexOf(item) > -1
            })
            if (flag && that.state.twoSelList[index - 1].userAnswer.length == (JSON.parse(that.state.twoSelList[index - 1].answer || '{}'))?.answer.replace(/[^A-Z]/g, '').length) {
               that.state.twoSelList[index - 1].isAnswer = 3
               that.state.twoSelList[index - 1].userKsData = { score: that.state.twoSelList[index - 1].score, point: that.state.twoSelList[index - 1].point, credit: that.state.twoSelList[index - 1].credit }
            } else {
               that.state.twoSelList[index - 1].isAnswer = 2
               that.state.twoSelList[index - 1].userKsData = { score: 0, point: 0, credit: 0 }
            }
         } else if (str === '不定项') {
            if (e.target.checked) {
               that.state.budingList[index - 1].userAnswer += e.target.value
            } else {
               let strTemp = that.state.budingList[index - 1].userAnswer
               let inx = strTemp.indexOf(e.target.value)
               if (inx > -1) {
                  strTemp = strTemp.split('')
                  strTemp.splice(inx, 1)
                  strTemp = Array.from(new Set(strTemp))
                  strTemp = strTemp.join('')
                  that.state.budingList[index - 1].userAnswer = strTemp
               }
            }
            let arr = that.state.budingList[index - 1].userAnswer.split('')
            let flag = arr.every((item) => {
               return (JSON.parse(that.state.budingList[index - 1].answer || '{}'))?.answer.indexOf(item) > -1
            })
            if (flag && that.state.budingList[index - 1].userAnswer.length == (JSON.parse(that.state.budingList[index - 1].answer || '{}'))?.answer.replace(/[^A-Z]/g, '').length) {
               that.state.budingList[index - 1].isAnswer = 3
               that.state.budingList[index - 1].userKsData = { score: that.state.budingList[index - 1].score, point: that.state.budingList[index - 1].point, credit: that.state.budingList[index - 1].credit }
            } else {
               that.state.budingList[index - 1].isAnswer = 2
               that.state.budingList[index - 1].userKsData = { score: 0, point: 0, credit: 0 }
            }
         }
         that.forceUpdate()
      }
      function handleContentChange(e) {
         that.setState({
            textareaContent: e.target.value || ''
         })
      }
      function fuZhiZhanTie(type) {
         if (type === 'copy') {
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.setAttribute('value', textareaContent);
            input.select();
            if (document.execCommand('copy')) {
               document.execCommand('copy');
               React.$message({
                  type: 'success',
                  content: '复制成功！'
               })
            }
            document.body.removeChild(input);
         }
         if (type === 'paste') {
            that.textarea.focus()
            navigator.clipboard
               .readText()
               .then((v) => {
                  that.setState({
                     textareaContent: textareaContent += v
                  }, () => {
                     React.$message({
                        type: 'success',
                        content: '粘贴成功！'
                     })
                  })
               })
               .catch((v) => {
                  console.log("获取剪贴板失败: ", v);
               });
         }
      }
      function isHideSiderIndexFn(val) {
         let str = isHideSiderIndex
         if (str.search(val) > -1) {
            let arr = str.split(',')
            if (arr.indexOf(val) > -1) {
               arr.splice(arr.indexOf(val), 1)
               str = arr.join(',')
            }
         } else {
            str = str + (str ? ',' + val : val)
         }
         that.setState({
            isHideSiderIndex: str
         })
      }

      return (
         <div className={s.examWrap} >
            <div> <Prompt when={!isEndExam} message={() => '确定退出当前考试吗？'} /> </div>
            <div style={{ display: isShowLawList ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center' }} className={s.submitModalMask}>
               <div style={{ width: isFDLaw ? '100vw' : '80vw', height: isFDLaw ? '100vh' : '85vh', overflow: 'hidden', position: 'relative' }}>
                  <img style={{ width: '15px', height: '15px', position: 'absolute', top: '15px', right: '15px' }} src={lawClose} onClick={() => { that.setState({ isShowLawList: false }) }} alt="" />
                  <img style={{ display: isFDLaw ? 'none' : '', width: '15px', height: '15px', position: 'absolute', top: '15px', right: '45px' }} src={lawFD} onClick={() => { that.setState({ isFDLaw: true }) }} alt="" />
                  <img style={{ display: isFDLaw ? '' : 'none', width: '15px', height: '15px', position: 'absolute', top: '15px', right: '45px' }} src={lawZXH} onClick={() => { that.setState({ isFDLaw: false }) }} alt="" />
                  {isShowLawList ? <LawCpt></LawCpt> : ''}
               </div>
            </div>
            <div style={{ display: isEndExam ? '' : 'none' }} className={s.submitModalMask} onClick={(e) => { e.stopPropagation(); e.preventDefault(); return false; }}>
               <div className={s.submitModal} style={{ background: `url(${eSubBg}) no-repeat` }}>
                  <div className={s.submitMsg} style={{ background: `url(${eSubMsg}) no-repeat` }}></div>
                  <div className={s.submitModalCon}>
                     <img className={s.eSubIcon} src={eSubIcon} alt="" />
                     <div className={s.eSubConRight}>
                        <p className={s.eSubText} style={{ color: '#FF4642' }}>{isEndExamStr}</p>
                        <div className={s.eSubBtn} onClick={() => { that.setState({ isEndExam: false }) }} style={{ background: `url(${eSubBtn}) no-repeat`, display: isAllDo === 3 ? 'none' : '' }}>返回做题</div>
                        <div className={s.eSubBtn} onClick={() => { that.submitExam() }} style={{ background: `url(${eSubBtn}) no-repeat`, marginLeft: '5px', display: isAllDo === 1 ? 'none' : '' }}>交卷</div>
                     </div>
                  </div>
               </div>
            </div>
            <div style={{ position: 'relative' }}>
               <div className={s.Etop} style={{ display: isShowTop ? 'block' : 'none' }}>
                  <p className={s.eTopJiaojuan}>答题耗时:&nbsp; {examTime || '00:00:00'}</p>
                  <div className={s.avatar}><img src={userData.avatar} alt="" /></div>
                  <div className={s.userMsg}>
                     <div>姓名: {userData.nickName || '学员'}</div>
                     <div style={{ marginTop: '5px' }}>手机号: {((userData?.phone || '').substring(0, 4) + '****' + (userData?.phone || '').substring(8)) || ''}</div>
                  </div>
                  <div className={s.topTitle}>
                     <a href="/" target="_blank" className={s.topToFirst}>首页</a>
                     <span style={{ marginTop: '3px!important' }}>  {'>'}  </span>
                     <span>{typeStr}</span>
                  </div>
                  <div className={s.eTopRight}>
                     <p className={s.eTopJiaojuanBox}><span className={s.eTopJiaojuanText}></span><img onClick={() => { that.isEndExamFn() }} className={s.eTopJiaojuanImg} src={datika} /></p>
                  </div>
               </div>
               <img onClick={() => { this.setState({ isShowTop: !isShowTop }) }} className={s.eTopHeaderImg} src={isShowTop ? sqbt : zkbt} />
            </div>
            <div className={s.eContent} style={{ backgroundColor: styleBgColor }}>
               <div className={s.eConLeft} style={{ display: isShowSider ? 'flex' : 'none' }}>
                  <div className={s.eConSel} style={{ display: oneSelList.length ? '' : 'none' }}>
                     <h3>单项选择题</h3>
                     <div onClick={() => { isHideSiderIndexFn('单选') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('单选') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('单选') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('单选') > -1 ? 'none' : 'flex' }}>
                        {oneSelList.map((item, index) => {
                           return <div onClick={() => { that.singleSubApi(); that.setState({ currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || '' }) }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{index + 1}
                              <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                              <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                           </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.eConSel} style={{ display: twoSelList.length ? '' : 'none' }}>
                     <h3>多项选择题</h3>
                     <div onClick={() => { isHideSiderIndexFn('多选') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('多选') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('多选') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('多选') > -1 ? 'none' : 'flex' }}>
                        {twoSelList.map((item, index) => {
                           return <div onClick={() => {
                              that.singleSubApi(); that.setState({ currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || '' })
                           }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{oneSelList.length + index + 1}
                                 <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                                 <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                              </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.eConSel} style={{ display: budingList.length ? '' : 'none' }}>
                     <h3>不定项选择题</h3>
                     <div onClick={() => { isHideSiderIndexFn('不定项') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('不定项') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('不定项') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('不定项') > -1 ? 'none' : 'flex' }}>
                        {budingList.map((item, index) => {
                           return <div onClick={() => {
                              that.singleSubApi();
                              that.setState({
                                 currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || ''
                              })
                           }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{twoSelList.length + oneSelList.length + index + 1}
                                 <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                                 <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                              </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.eConSel} style={{ display: lunshuList.length ? '' : 'none' }}>
                     <h3>论述题</h3>
                     <div onClick={() => { isHideSiderIndexFn('论述') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('论述') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('论述') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('论述') > -1 ? 'none' : 'flex' }}>
                        {lunshuList.map((item, index) => {
                           return <div onClick={() => {
                              that.singleSubApi();
                              that.setState({
                                 currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || ''
                              })
                           }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{budingList.length + twoSelList.length + oneSelList.length + index + 1}
                                 <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                                 <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                              </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.eConSel} style={{ display: wenbenList.length ? '' : 'none' }}>
                     <h3>文书写作题</h3>
                     <div onClick={() => { isHideSiderIndexFn('文书写作') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('文书写作') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('文书写作') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('文书写作') > -1 ? 'none' : 'flex' }}>
                        {wenbenList.map((item, index) => {
                           return <div onClick={() => {
                              that.singleSubApi();
                              that.setState({
                                 currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || ''
                              })
                           }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{lunshuList.length + budingList.length + twoSelList.length + oneSelList.length + index + 1}
                                 <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                                 <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                              </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.eConSel} style={{ display: anliList.length ? '' : 'none' }}>
                     <h3>案例分析题</h3>
                     <div onClick={() => { isHideSiderIndexFn('案例分析') }} className={s.eConOneSelSq}>
                        <img src={isHideSiderIndex.search('案例分析') > -1 ? zhankai : shouqi} alt="" />
                        <span>{isHideSiderIndex.search('案例分析') > -1 ? '展开' : '收起'}</span>
                     </div>
                     <div className={s.qlist} style={{ display: isHideSiderIndex.search('案例分析') > -1 ? 'none' : 'flex' }}>
                        {anliList.map((item, index) => {
                           return <div onClick={() => {
                              that.singleSubApi();
                              that.setState({
                                 currentQues: item, activeIndex: index + 1, zhuguanQuesIndex: 0, textareaContent: item?.userAnswer[0] || ''
                              })
                           }} key={index + 1} className={s.qlistItem} style={{ backgroundColor: styleBgColor, color: item?.userAnswer.length ? '#008000' : '' }}><div className={s.qlistItemText}>{wenbenList.length + lunshuList.length + budingList.length + twoSelList.length + oneSelList.length + index + 1}
                                 <div style={{ display: item?.isMark ? '' : 'none' }} className={s.qlistItemXing}>?</div>
                                 <div style={{ display: item?.userAnswer.length ? 'none' : '' }} className={s.qlistItemXing}>{item?.isMark ? '' : '*'}</div>
                              </div></div>
                        })}
                     </div>
                  </div>
                  <div className={s.examTip}>
                     <ul>
                        <li>说明</li>
                        <li>1.题号右方的“*”符号代表该小题尚未选择答案。</li>
                        <li>2.题号右方的“?”符号代表该小题做过标记。</li>
                        <li>3.选择选项的同时自动保存答案。</li>
                        <li>4.蓝色为未做题目，绿色为已做题目。</li>
                     </ul>
                  </div>
                  <div className={s.enterLaw} onClick={() => { that.setState({ isShowLawList: true }) }}>法律法规汇编</div>
               </div>
               <div className={s.isShowSider} onClick={() => { that.setState({ isShowSider: !isShowSider }) }}><img src={isShowSider ? hideSider : showSider} alt="" /></div>
               <div className={s.eConRight}>
                  <div className={s.eConRightBtnGroup}>
                     <span className={s.ePaper} style={{ background: `url(${topBtnBig}) no-repeat` }} >试卷</span>
                     <span className={s.efengeWrap}>
                        <div className={s.efengeBtn} onClick={() => { maskQues(currentQues, activeIndex, { target: { checked: true } }) }} style={{ display: currentQues?.questionTypeClass === '主观题' ? '' : 'none', background: `url(${topBtn}) no-repeat` }}>标记题干</div>
                        <div className={s.efengeBtn} onClick={() => { maskQues(currentQues, activeIndex, { target: { checked: false } }) }} style={{ display: currentQues?.questionTypeClass === '主观题' ? '' : 'none', background: `url(${topBtn}) no-repeat` }}>取消标记</div>
                     </span>
                     <span className={s.efengeWrap}>
                        <div className={s.efengeBtn} style={{ background: `url(${topBtn}) no-repeat` }}>风格</div>
                        <div onClick={() => { that.setState({ styleBgColor: '#DEEBF6' }) }} style={{ backgroundColor: '#DEEBF6' }} className={s.efengeBtnMini}>风格一</div>
                        <div onClick={() => { that.setState({ styleBgColor: '#CBE0E0' }) }} style={{ backgroundColor: '#CBE0E0' }} className={s.efengeBtnMini}>风格二</div>
                        <div onClick={() => { that.setState({ styleBgColor: '#F5E9DD' }) }} style={{ backgroundColor: '#F5E9DD' }} className={s.efengeBtnMini}>风格三</div>
                        <div onClick={() => { that.setState({ styleBgColor: '#F5DCE4' }) }} style={{ backgroundColor: '#F5DCE4' }} className={s.efengeBtnMini}>风格四</div>
                        <div onClick={() => { that.setState({ styleBgColor: '#DEDEF5' }) }} style={{ backgroundColor: '#DEDEF5' }} className={s.efengeBtnMini}>风格五</div>
                     </span>
                     <span className={s.efengeWrap}>
                        <div className={s.efengeBtn} style={{ background: `url(${topBtn}) no-repeat` }}>字体</div>
                        <div onClick={() => { that.setState({ quesFontSize: '14px' }) }} style={{ width: '30px' }} className={s.efengeBtnMini}>小</div>
                        <div onClick={() => { that.setState({ quesFontSize: '16px' }) }} style={{ width: '30px' }} className={s.efengeBtnMini}>中</div>
                        <div onClick={() => { that.setState({ quesFontSize: '18px' }) }} style={{ width: '30px' }} className={s.efengeBtnMini}>大</div>
                        <div onClick={() => { that.setState({ quesFontSize: '22px' }) }} style={{ width: '30px' }} className={s.efengeBtnMini}>超大</div>
                        <div onClick={() => { that.setState({ quesFontSize: '26px' }) }} style={{ width: '30px' }} className={s.efengeBtnMini}>更大</div>
                     </span>
                  </div>
                  <section style={{ fontSize: quesFontSize, position: 'relative' }}>
                     <div className={s.eQuesTip}>
                        <span>{currentQues?.questionType === '单选' ? '单项选择题。每题所设选项中只有一个正确答案，多选、错选或不选均不得分。' : currentQues?.questionType === '多选' ? '多项选择题。每题所设选项中至少有两个正确答案，多选、少选、错选或不选均不得分。' : (currentQues?.questionType || '') + '题'}</span>
                        <div className={s.eMaxBtn} style={{ display: currentQues?.questionTypeClass === '主观题' ? '' : 'none' }}>
                           <span onClick={() => { that.setState({ isMaxWinDow: !isMaxWinDow }) }} style={{ background: `url(${isMaxWinDow ? suoxiao : fangda}) no-repeat` }}>{isMaxWinDow ? '恢复' : '放大'}窗口</span>
                        </div>
                     </div>
                     <div className={s.eQuesIndex} style={{ display: currentQues?.questionTypeClass === '主观题' ? '' : '' }}>第&nbsp;{currentQuesIndex || '0'}&nbsp;题</div>
                     <div style={{ display: currentQues?.questionTypeClass === '主观题' ? 'none' : 'flex' }} readOnly dangerouslySetInnerHTML={{ __html: currentQues?.stem }} className={s.eQuesStem}></div>
                     <div className={s.eQuesOptionWrap} style={{ display: currentQues?.questionTypeClass === '主观题' ? 'none' : '' }}>
                        {Object.keys(JSON.parse(currentQues?.options || '{}')).map((item, index) => {
                           return <div key={index + 1}>{item + '.'} {Object.values(JSON.parse(currentQues?.options || '{}'))[index]}</div>
                        })}
                     </div>
                     <div style={{ display: currentQues?.questionTypeClass === '主观题' ? '' : 'none' }}>
                        <div style={{ height: isMaxWinDow ? '700px' : '380px', position: 'relative', overflow: 'scroll', backgroundColor: '#fff' }}>
                           <div className={s.zhuguanQues} readOnly dangerouslySetInnerHTML={{ __html: currentQues?.stem }}></div>
                        </div>
                        <div style={{ display: isMaxWinDow ? 'none' : '', position: 'relative' }}>
                           <div style={{ display: 'flex', paddingRight: '200px', width: '100%', flexWrap: 'wrap' }}>
                              {Object.keys(JSON.parse(currentQues?.options || '{}')).map((key, index) => {
                                 return <span key={index + 1} style={{ color: zhuguanQuesIndex === index ? '#fff' : '', backgroundColor: zhuguanQuesIndex === index ? '#3794FE' : '' }} onClick={() => { that.setState({ zhuguanQuesIndex: index, textareaContent: (currentQues?.userAnswer[index] || '') }) }} className={s.eQuesNum}>{key || ''}</span>
                              })}
                           </div>
                           <span className={s.eMaxBtnZG} onClick={() => { fuZhiZhanTie('paste') }} style={{ right: '20px', background: `url(${fzzt}) no-repeat ` }}>粘贴</span>
                           <span className={s.eMaxBtnZG} onClick={() => { fuZhiZhanTie('copy') }} style={{ right: '85px', background: `url(${fzzt}) no-repeat` }}>复制</span>
                           <div className={s.eQuesTipZG}>
                              <span>{Object.values(JSON.parse(currentQues?.options || '{}'))[zhuguanQuesIndex] || '请结合所学知识，回答相关要点。'}</span>
                              <p className={s.prompt}><span>请在下方答题区内答题</span><span style={{ color: '#FF4642', marginLeft: '16px' }}>已输入字数为：{textareaContent?.length || 0}</span></p>
                           </div>
                           <textarea value={textareaContent} ref={(textarea) => that.textarea = textarea} onBlur={(e) => { submitZG(e, zhuguanQuesIndex) }}
                              onChange={(e) => { handleContentChange(e) }} className={s.eQuesTextArea} maxLength="5000" style={{ height: '210px' }}></textarea>
                        </div>
                     </div>
                  </section>
                  <div className={s.quesBtmBtnWrap} style={{ position: 'fixed', backgroundColor: styleBgColor }}>
                     <input checked={currentQues?.isMark || false} onChange={(e) => { maskQues(currentQues, activeIndex, e) }} type="checkbox" name="markedcheckbox" style={{ display: 'inline-block', verticalAlign: 'middle' }} /><span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px', fontSize: '14px', paddingLeft: '10px' }}>标记</span>
                     <div className={s.prevBtn} onClick={() => { nextPrevQues(currentQues, 'prev') }} style={{ cursor: currentQuesIndex <= 1 ? 'not-allowed' : 'pointer', color: currentQuesIndex <= 1 ? '#999' : '#000', background: `url(${prevBtnImg}) no-repeat` }}>上一题</div>
                     <span style={{ display: currentQues?.questionTypeClass === '主观题' ? 'none' : 'inline-block', verticalAlign: 'middle', fontSize: '18px', marginRight: '20px' }}>第&nbsp;{currentQuesIndex || 'n'}&nbsp;题</span>
                     <ul className={s.eSelOptionWrap} onChange={(e) => { eSelChange(e, activeIndex, currentQues?.questionType) }} style={{ display: currentQues?.questionType === '单选' ? currentQues?.questionTypeClass !== '主观题' ? '' : 'none' : 'none' }}>
                        {Object.keys(JSON.parse(currentQues?.options || '{}')).map((item, index) => {
                           return <li key={index + 1}><input checked={currentQues?.userAnswer === item || false} onChange={() => { }} type="radio" name="questionradio" value={item} />&nbsp;{item}</li>
                        })}
                        {/* <li><input checked={currentQues?.userAnswer === "A" || false} onChange={() => { }} type="radio" name="questionradio" value="A" />&nbsp;A</li>
                        <li><input checked={currentQues?.userAnswer === "B" || false} onChange={() => { }} type="radio" name="questionradio" value="B" />&nbsp;B</li>
                        <li><input checked={currentQues?.userAnswer === "C" || false} onChange={() => { }} type="radio" name="questionradio" value="C" />&nbsp;C</li>
                        <li><input checked={currentQues?.userAnswer === "D" || false} onChange={() => { }} type="radio" name="questionradio" value="D" />&nbsp;D</li> */}
                     </ul>
                     <ul className={s.eSelOptionWrap} onChange={(e) => { eSelChange(e, activeIndex, currentQues?.questionType) }} style={{ display: (currentQues?.questionType === '多选' || currentQues?.questionType === '不定项') ? '' : 'none' }}>
                        {Object.keys(JSON.parse(currentQues?.options || '{}')).map((item, index) => {
                           return <li key={index + 1}><input checked={(currentQues?.userAnswer || '').toString().search(item) > -1} onChange={() => { }} type="checkbox" name="questioncheckbox" value={item} />&nbsp;{item}</li>
                        })}
                        {/* <li><input checked={(currentQues?.userAnswer || '').toString().search("A") > -1} onChange={() => { }} type="checkbox" name="questioncheckbox" value="A" />&nbsp;A</li>
                        <li><input checked={(currentQues?.userAnswer || '').toString().search("B") > -1} onChange={() => { }} type="checkbox" name="questioncheckbox" value="B" />&nbsp;B</li>
                        <li><input checked={(currentQues?.userAnswer || '').toString().search("C") > -1} onChange={() => { }} type="checkbox" name="questioncheckbox" value="C" />&nbsp;C</li>
                        <li><input checked={(currentQues?.userAnswer || '').toString().search("D") > -1} onChange={() => { }} type="checkbox" name="questioncheckbox" value="D" />&nbsp;D</li> */}
                     </ul>
                     <div onClick={() => { nextPrevQues(currentQues, 'next') }} style={{ cursor: currentQuesIndex >= (examData.questions.length || 0) ? 'not-allowed' : 'pointer', color: currentQuesIndex >= (examData.questions.length || 0) ? '#999' : '#000', background: `url(${prevBtnImg}) no-repeat` }} className={s.nextBtn}>下一题</div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

}
export default withRouter(Exam);


