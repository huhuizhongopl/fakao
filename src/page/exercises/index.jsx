
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import s from './exercises.module.scss';
import { Rate, Popover, Tag, Tabs, Button, Layout, Statistic, Card, Row, Col, Input, Empty, Spin, Modal } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import calcScore from '../../util/calcScore.js'
import failBook from '../../../public/image/failBook.png'
import hisBook from '../../../public/image/hisBook.png'
import scBook from '../../../public/image/scBook.png'
import noteBook from '../../../public/image/noteBook.png'
import bskb from '../../../public/image/exercises/conEntra/bskp.png'
import ctb from '../../../public/image/exercises/conEntra/ctb.png'
import ft from '../../../public/image/exercises/conEntra/ft.png'
import lnzt from '../../../public/image/exercises/conEntra/lnzt.png'
import sctm from '../../../public/image/exercises/conEntra/sctm.png'
import znzj from '../../../public/image/exercises/conEntra/znzj.png'
const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Search } = Input;

class exercises extends Component {

   constructor(props) {
      super(props);
      this.state = {
         tabTwoKey: 1,
         hisTabKey: 1,
         typeArr: [],
         subList: [],
         pageLoading: true,
         objectiveTestTime: '', //客观题考试时间
         countInfo: {},
         isShowZnzj: false,
         questionTypeClassArr: [],
         znzjTypeClass: '',
         pageSize: 10,
         currentPage: 1,
         btmList: [],
         hisList: [],
         keyWord: '',
         subTypeArr: [], //分科练习分类
         oneTypeChildIndex: '卷一' //选中的分科练习分类
      }
      exercises._this = this;
   }

   componentDidMount() {
      this.getExercisesType()
      this.getHisList()
   }
   // 获取题海下二级分类
   async getExercisesType() {
      await React.$http.get('user/getSystemType').then(res => {
         if (res.code === 1) {
            sessionStorage.setItem('exercisesTypeArr', JSON.stringify(res.data || {}))
            let objectiveTestTime = ''
            let questionTypeClassArr = []
            let subTypeArr = []
            let typeArr = res.data.filter((item) => {
               if (item.ttype === 'objectiveTestTime') {
                  let diffTime = new Date(item.tcontent).getTime() - new Date().getTime()
                  objectiveTestTime = parseInt(diffTime / (1000 * 60 * 60 * 24));
               }
               if (item.ttype === 'questionTypeClass') {
                  questionTypeClassArr.push(item.tcontent || '')
               }
               if (item.ttype === 'questionTypeClass') {
                  subTypeArr.push(item.tcontent || '')
               }
               return item.ttype === 'type'
            })
            this.setState({
               typeArr,
               subTypeArr,
               pageLoading: false,
               objectiveTestTime,
               questionTypeClassArr
            }, () => { this.getCountInfo() })

         }

      })
   }
   async getCountInfo() {
      let countInfo = {}
      if (sessionStorage.getItem('allSubList')) {
         countInfo = calcScore(JSON.parse(sessionStorage.getItem('allSubList') || '[]'), this.state)
      } else {
         await React.$http.get('subject/subjectList').then(res => {
            if (res.code === 1) {
               sessionStorage.setItem('allSubList', JSON.stringify(res.data || []))
               countInfo = calcScore(res.data, this.state)
            } else {
               // React.$message({
               //    type: 'error',
               //    content: '请您先登录'
               // })
            }
         }).catch(err => {
            // React.$message({
            //    type: 'error',
            //    content: '请您先登录'
            // })
         })
      }
      this.filterTreeNodeList()
      this.setState({
         countInfo
      })
   }
   async znzjToExam() {
      let { typeArr, tabTwoKey, znzjTypeClass, pageLoading } = this.state
      if (pageLoading) {
         return
      }
      if (!znzjTypeClass) {
         React.$message({
            type: 'warning',
            content: '请选择需要练习的卷别分类'
         })
         return
      }
      let data = {
         examId: 0,
         examType: typeArr[tabTwoKey - 1].tcontent,
         typeClass: znzjTypeClass,
         pageNum: 1,
         pageSize: 100000
      }
      this.setState({
         pageLoading: true
      })
      await React.$http.post('questionandexam/startExam', data).then(res => {
         if (res.code === 1) {
            if (res.data?.questions.length) {
               this.props.history.push({ pathname: '/home/exam', query: { examData: JSON.stringify(res.data || {}), typeStr: '智能组卷' } })
            } else {
               React.$message({
                  type: 'warning',
                  content: '该卷别分类暂时空缺'
               })
            }
         }
         this.setState({
            pageLoading: false
         })
      }).catch(err => {
         this.setState({
            pageLoading: false
         })
      })
   }
   async getHisList() {
      let { typeArr, tabTwoKey } = this.state
      let hisData = {
         pageSize: 4,
         pageNumber: 1,
         examType: typeArr[tabTwoKey - 1]?.tcontent || ''
      }
      await React.$http.get('/questionandexam/getmyexamlist', hisData).then(res => {
         if (res.code === 1) {
            this.setState({
               hisList: res.data
            })
         }
      })
   }
   filterTreeNodeList() {
      let { oneTypeChildIndex } = this.state
      let oneLevSub = []
      let twoLevSub = []
      let allSubList = JSON.parse(sessionStorage.getItem('allSubList') || '[]')
      allSubList.forEach((item, index) => {
         if (item.layer === 1) {
            oneLevSub.push(item)
         } else if (item.layer === 2) {
            twoLevSub.push(item)
         }
      })
      sessionStorage.setItem('oneLevSub', JSON.stringify(oneLevSub))
      oneLevSub.forEach((one, oneIndex) => {
         let total = 0
         let wrongTotal = 0
         let oneArr = []
         if (one.typeClass === oneTypeChildIndex) {
            twoLevSub.forEach((two) => {
               if (two.parentId === one.id) {
                  two.u_yearNumb = two.u_yearNumb || 0
                  two.u_yearWrongNumb = two.u_yearWrongNumb || 0
                  two.trueWrongTotalStr = `${two.u_yearNumb - two.u_yearWrongNumb}/${two.u_yearWrongNumb}/${two.u_yearNumb}`
                  total += two.u_yearNumb
                  wrongTotal += two.u_yearWrongNumb
                  oneArr.push(two)
               }
            })
         }
         one.trueWrongTotalStr = `${total - wrongTotal}/${wrongTotal}/${total}` //对/错/总题数
         one.child = oneArr || []
         if (!total) {
            delete oneLevSub[oneIndex]
         }
      })
      this.setState({
         btmList: oneLevSub
      })
   }
   render() {
      let that = exercises._this
      let { hisList, subTypeArr, btmList, typeArr, pageLoading, objectiveTestTime, countInfo, isShowZnzj, questionTypeClassArr, znzjTypeClass } = that.state
      function tabExerOtherChild(val) {
         that.setState({
            oneTypeChildIndex: subTypeArr[val - 1]
         }, () => { that.filterTreeNodeList() })
      }
      function TabsClickTwo(key) {
         that.state.tabTwoKey = key
         that.getCountInfo()
         that.getHisList()
      }
      // function TabsClickHis(key) {
      //    that.state.hisTabKey = key
      // }
      // function pageChange(page, size) {
      //    that.setState({
      //       currentPage: page || 1,
      //       pageSize: size || 10
      //    })
      // }
      async function cardClickFn(item, typeStr) {//888
         let { typeArr, tabTwoKey } = that.state
         let id = false
         let data = {}
         if (typeStr == 'btm') {
            id = item // 科目ID
            data = {
               pageNum: 1,
               pageSize: 100000,
               type: typeArr[tabTwoKey - 1].tcontent || '',
               subjectNumb: id
            }
            if (!id) {
               React.$message({
                  type: 'warning',
                  content: '此分科无效'
               })
            }
            that.setState({
               pageLoading: true
            })
            await React.$http.get('/questionandexam/searchQuestions', data).then(res => {
               if (res.code === 1) {
                  if (!res.data?.QuestionsList || !res.data?.QuestionsList.length) {
                     React.$message({
                        type: 'warning',
                        content: '此分科无效'
                     })
                     return
                  }
                  res.data.questions = res.data.QuestionsList
                  that.props.history.push({ pathname: '/home/exam', query: { examData: JSON.stringify(res.data || {}), typeStr: '分科练习' } })
               } else {
                  React.$message({
                     type: 'warning',
                     content: '此分科无效'
                  })
               }
               that.setState({
                  pageLoading: false
               })
            }).catch(err => {
               React.$message({
                  type: 'warning',
                  content: '此分科无效'
               })
               that.setState({
                  pageLoading: false
               })
            })
         } else if (typeStr == 'his') {
            id = item.examId
            data = {
               examId: id,
               pageNum: 1,
               pageSize: 100000
            }
            if (!id) {
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
            }
            that.setState({
               pageLoading: true
            })
            await React.$http.post('questionandexam/startExam', data).then(res => {
               if (res.code === 1) {
                  if (!res.data?.questions || !res.data?.questions.length) {
                     React.$message({
                        type: 'warning',
                        content: '此试卷无效'
                     })
                     return
                  }
                  that.props.history.push({ pathname: '/home/exam', query: { examData: JSON.stringify(res.data || {}), typeStr: '做题历史' } })
               } else {
                  React.$message({
                     type: 'warning',
                     content: '此试卷无效'
                  })
               }
               that.setState({
                  pageLoading: false
               })
            }).catch(err => {
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
               that.setState({
                  pageLoading: false
               })
            })
         }
      }

      let znzjEle = <Modal
         className={s.znzjModal}
         centered
         closable={false}
         visible={isShowZnzj}
         onCancel={() => { that.setState({ isShowZnzj: false, znzjTypeClass: '' }) }}
         footer={null}
         destroyOnClose={true}
         width='600px'
      >
         <h2>请选择需要练习的卷别分类</h2>
         <p>搞定法考为你生成与法考考点范围，考试难度完全匹配的模块试卷</p>
         <div className={s.znzjBtnWrap}>
            {questionTypeClassArr.map((item, index) => {
               return <Button key={index + 1} onClick={() => { that.setState({ znzjTypeClass: item }) }} type="default" size='large' style={{ width: '30%', background: znzjTypeClass === (item) ? '#E9F5FF' : '', border: '1px solid #40a9ff', color: '#40a9ff' }}>{item}</Button>
            })}
         </div>
         <div className={s.znzjBtmText}><Button loading={pageLoading} onClick={() => { that.znzjToExam() }} type="primary" shape='round' size='large' style={{ width: '30%' }}>开始答题</Button></div>
      </Modal>
      return (
         <Spin size="large" spinning={pageLoading} tip='亲，正在努力加载中~'>
            <Layout className={s.exercisesWrap}>
               <Header className={s.exerHeader}>
                  <Tabs defaultActiveKey="1" size='large' onChange={TabsClickTwo} >
                     {typeArr.map((item, index) => {
                        return <TabPane tab={item.tcontent + '库'} key={index + 1}></TabPane>
                     })}
                  </Tabs>
                  <Button className={s.lawBtn}
                     onClick={() => { this.props.history.push('/home/exercises/lawCpt') }}
                     type="dashed" size='large' ghost={true}>电子法条</Button>
               </Header>
               <Layout style={{ background: 'transparent' }}>
                  <Content className={s.exerContent}>
                     <Row gutter={15} className='degest'>
                        <Col span={3}>
                           <Statistic
                              title="总题量"
                              value={countInfo.TestTotle}
                              precision={0}
                              valueStyle={{ color: '#1890ff' }}
                              suffix="道"
                           />
                        </Col>
                        <Col span={3}>
                           <Statistic
                              title="刷题量"
                              value={countInfo.yearNumb}
                              precision={0}
                              valueStyle={{ color: '#1890ff' }}
                              suffix="道"
                           />
                        </Col>
                        <Col span={3}>
                           <Statistic
                              title="正确率"
                              value={countInfo.accuracy}
                              precision={2}
                              valueStyle={{ color: '#1890ff' }}
                              suffix="%"
                           />
                        </Col>
                        <Col span={3}>
                           <Statistic
                              title="效率"
                              value={countInfo.efficient}
                              precision={2}
                              valueStyle={{ color: '#1890ff' }}
                              suffix="秒 / 道"
                           />
                        </Col>
                        <Col span={3}>
                           <Statistic
                              title="倒计时"
                              value={objectiveTestTime}
                              precision={0}
                              valueStyle={{ color: '#1890ff' }}
                              suffix="天"
                           />
                        </Col>
                     </Row>
                     <div className={s.conEntraTitle}>常用入口</div>
                     <div className={s.conEntra}>
                        <Card onClick={() => { that.setState({ isShowZnzj: true }) }} hoverable>
                           <img src={znzj} alt="" />
                           智能组卷
                        </Card>
                        <Card onClick={() => { that.props.history.push('/home/exercises/lnzt') }} hoverable>
                           <img src={lnzt} alt="" />
                           历年真题
                        </Card>
                        <Card onClick={() => { that.props.history.push('/home/exercises/other?type=history') }} hoverable>
                           <img src={ft} alt="" />
                           做题历史
                        </Card>
                        <Card onClick={() => { that.props.history.push('/home/exercises/other?type=err') }} hoverable>
                           <img src={ctb} alt="" />
                           错题本
                        </Card>
                        <Card onClick={() => { that.props.history.push('/home/exercises/other?type=fav') }} hoverable>
                           <img src={sctm} alt="" />
                           收藏本
                        </Card>
                        <Card onClick={() => { that.props.history.push('/home/exercises/other?type=no') }} hoverable>
                           <img src={bskb} alt="" />
                           我不会
                        </Card>
                     </div>
                     <div className={s.conEntraTitle}>分科刷题</div>
                     <Card className={s.exerCardBtmWrap} actions={[
                        // <Pagination
                        //    onChange={pageChange}
                        //    total={total}
                        //    showSizeChanger
                        //    showQuickJumper
                        //    current={currentPage}
                        //    pageSize={pageSize}
                        //    pageSizeOptions={[10, 30, 50, 100]}
                        //    showTotal={total => `共 ${total} 项`}
                        // />
                     ]}
                        title={
                           <Tabs defaultActiveKey='1' size='large' onChange={tabExerOtherChild} style={{ 'height': '100%' }}>
                              {subTypeArr.map((item, index) => {
                                 return <TabPane tab={item} key={index + 1}></TabPane>
                              })}
                           </Tabs>}
                     >
                        {btmList.length ? btmList.map((item, index) => {
                           return <Popover placement="top" key={index + 1} trigger="hover" content={
                              (item?.child || []).length ? <div className={s.popoverWrap}> {(item?.child || []).map((treeTwoIt, treeTwoInx) => {
                                 return <Card onClick={() => {
                                    cardClickFn(treeTwoIt.id, 'btm')
                                 }} className={s.exerCard} key={treeTwoInx + 1} >
                                    <div>{treeTwoIt.name || ''}</div>
                                    <div className={s.Txt}>重要程度<Rate size="mini" className={s.rate} disabled value={treeTwoIt.importance || 0} /></div>
                                    <div className={s.Txt}>
                                       <div style={{ color: 'green' }}>{treeTwoIt.trueWrongTotalStr.split('/')[0] || 0}</div>&nbsp;/&nbsp;
                                       <div style={{ color: 'red' }}>{treeTwoIt.trueWrongTotalStr.split('/')[1] || 0}</div>&nbsp;/&nbsp;
                                       <div style={{ color: 'blue' }}>{treeTwoIt.trueWrongTotalStr.split('/')[2] || 0}</div>&nbsp; 题</div></Card>
                              })}</div> : ''}>
                              <Card hoverable className={s.exerCard}>
                                 <div>{item.name || ''}</div>
                                 <div className={s.Txt}>
                                    <div style={{ color: 'green' }}>{item.trueWrongTotalStr.split('/')[0] || 0}</div>&nbsp;/&nbsp;
                                    <div style={{ color: 'red' }}>{item.trueWrongTotalStr.split('/')[1] || 0}</div>&nbsp;/&nbsp;
                                    <div style={{ color: 'blue' }}>{item.trueWrongTotalStr.split('/')[2] || 0}</div>&nbsp; 题
                                 </div>
                              </Card>
                           </Popover>
                        }) : <Empty description='当前分科没有试卷' style={{ margin: '50px auto' }} />}
                     </Card>
                  </Content>
                  <Sider className={s.exerSider}>
                     <Card hoverable style={{ width: '100%', marginBottom: '20px' }}>
                        <div className={s.exerSiderTitle}>搜题</div>
                        <Search loading={false} maxLength={100} placeholder="输入关键词搜索资源" enterButton allowClear size='large' />
                     </Card>
                     <Card hoverable style={{ width: '100%', marginBottom: '20px', cursor: 'default' }}>
                        <div className={s.exerSiderTitle}>
                           做题历史
                           <div onClick={() => { that.props.history.push('/home/exercises/other?type=history') }} className={s.hisRightAll}><span>全部</span><RightOutlined style={{ color: '#ccc', width: 6, height: 16 }} /></div>
                        </div>
                        {/* <Tabs defaultActiveKey="1" size='default' onChange={TabsClickHis} >
                           <TabPane tab="分科" key="1"></TabPane>
                           <TabPane tab="试卷" key="2"></TabPane>
                        </Tabs> */}
                        {hisList.length ? hisList.map((item, index) => {

                           return <div className={s.hisListItem} key={index + 1} onClick={() => { cardClickFn(item, 'his') }}>
                              <div style={{ display: 'inline-block', lineHeight: '45px' }}>{item.title.substring(0, 9) || ''}</div>
                              <Tag style={{ display: 'inline-block', marginLeft: '6px', verticalAlign: 'text-bottom' }} color="processing">{item.typeClass || ''}</Tag>
                              <Tag style={{ display: 'inline-block', marginLeft: '0', verticalAlign: 'text-bottom' }} color={item.isFinish ? 'processing' : 'error'}>{item.isFinish ? '已完成' : '未做完'}</Tag>
                              <div className={s.rightHisIcon}><RightOutlined style={{ color: '#ccc', width: 6, height: 16, marginTop: '1.5px' }} /></div>
                           </div>
                        }) : <Empty description='当前还没有练习记录' />}
                     </Card>
                     <Card hoverable style={{ width: '100%' }}>
                        <div className={s.exerSiderTitle}>我的题库</div>
                        <div className={s.failQuestion} onClick={() => { that.props.history.push('/home/exercises/other?type=err') }}>
                           <div>
                              <img src={failBook} alt="" />
                              <span style={{ fontSize: '16px' }}>错题本</span>
                           </div>
                           <div className={s.failQuesRight}><RightOutlined style={{ color: '#ccc', width: 6, height: 16, marginTop: '2px' }} /></div>
                        </div>
                        <div className={s.failQuestion} onClick={() => { that.props.history.push('/home/exercises/other?type=fav') }}>
                           <div>
                              <img src={scBook} alt="" />
                              <span style={{ fontSize: '16px' }}>收藏题目</span>
                           </div>
                           <div className={s.failQuesRight}><RightOutlined style={{ color: '#ccc', width: 6, height: 16, marginTop: '2px' }} /></div>
                        </div>
                        <div className={s.failQuestion} onClick={() => { that.props.history.push('/home/exercises/other?type=note') }} >
                           <div>
                              <img src={noteBook} alt="" />
                              <span style={{ fontSize: '16px' }}>我的笔记</span>
                           </div>
                           <div className={s.failQuesRight}><RightOutlined style={{ color: '#ccc', width: 6, height: 16, marginTop: '2px' }} /></div>
                        </div>
                        <div className={s.failQuestion} onClick={() => { that.props.history.push('/home/exercises/other?type=history') }} >
                           <div>
                              <img src={hisBook} alt="" />
                              <span style={{ fontSize: '16px' }}>做题历史</span>
                           </div>
                           <div className={s.failQuesRight}><RightOutlined style={{ color: '#ccc', width: 6, height: 16, marginTop: '2px' }} /></div>
                        </div>
                     </Card>
                  </Sider>
               </Layout>
            </Layout>
            {znzjEle}
         </Spin >
      );
   }

}
export default withRouter(exercises);



