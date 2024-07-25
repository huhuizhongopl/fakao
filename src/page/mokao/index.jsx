
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Row, Col, Card, Spin, Pagination, Empty, Tabs, Tooltip, Tag, Button, Input } from 'antd';
import s from './mokao.module.scss';
const { TabPane } = Tabs;
const { Search } = Input;

class mokao extends Component {

   constructor(props) {
      super(props);
      this.state = {
         mokaoList: [],
         pageLoading: true,
         pageSize: 10,
         currentPage: 1,
         total: 0,
         topBtnIndex: 1,//顶部筛选项顶部按钮活跃Index
         keyWord: '',// 关键词
         oneLevSub: [], // 一级科目选项
         midBtnOneIndex: 1, //顶部筛选项中部按钮活跃Index
         midBtnTwoIndex: 1, //顶部筛选项中部按钮活跃Index
         midBtnThreeIndex: 'all', //顶部筛选项中部按钮活跃Index
         midBtnTwoText: '客观', //顶部筛选项中部按钮活跃text客观主观整体
         year: 2022,
         subjectNumb:null,
         examType: null,
         orderByTestCount: 0,// 人气
         orderByCreatedTime: 1,// 最新
         isMoRen: 0 //是否默认排序
      }
      mokao._this = this;
   }

   async componentDidMount() {
      let tempArr = JSON.parse(sessionStorage.getItem('exercisesTypeArr') || '[]')
      if (!tempArr.length) {
         await React.$http.get('user/getSystemType').then(res => {
            if (res.code === 1) {
               sessionStorage.setItem('exercisesTypeArr', JSON.stringify(res.data || {}))
               tempArr = res.data
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
      if (!sessionStorage.getItem('allSubList')) {
         await React.$http.get('subject/subjectList').then(res => {
            if (res.code === 1) {
               sessionStorage.setItem('allSubList', JSON.stringify(res.data || []))
            } else {
            }
         }).catch(err => {
         })
      }
      this.filterOneLev()
      this.getmokaoList()
   }
   filterOneLev() {// 筛选类型
      let { midBtnTwoText } = this.state
      let oneLevSub = []
      let allSubList = JSON.parse(sessionStorage.getItem('allSubList') || '[]')
      allSubList.forEach((item) => {
         if (item.layer === 1) {
            oneLevSub.push(item)
         }
      })
      if (midBtnTwoText == '整体') {
         oneLevSub = []
      } else {
         if (midBtnTwoText == '主观') {
            oneLevSub = oneLevSub.filter(item => {
               return item.typeClass === "主观题"
            })
         } else {
            oneLevSub = oneLevSub.filter(item => {
               return item.typeClass !== "主观题"
            })
         }
      }
      this.setState({
         oneLevSub
      })
   }
   async getmokaoList() {
      if (!this.state.pageLoading) {
         return
      }
      this.state.pageLoading = false
      let { midBtnThreeIndex, topBtnIndex, midBtnTwoIndex, pageSize, currentPage, examType, subjectNumb, keyWord, year, orderByTestCount, orderByCreatedTime, isMoRen } = this.state
      let data = {
         pageSize: pageSize,
         pageNumber: currentPage,
         year,
         keyWord
      }
      let typeClass = '客观单科专项'
      if (topBtnIndex == 1) {
         if (midBtnTwoIndex == 1) {
            typeClass = '客观单科专项'
         } else if (midBtnTwoIndex == 2) {
            typeClass = '卷一'
         } else if (midBtnTwoIndex == 3) {
            typeClass = '卷二'
         }
      } else if (topBtnIndex == 2) {
         if (midBtnTwoIndex == 1) {
            typeClass = '主观单科专项'
         } else if (midBtnTwoIndex == 2) {
            typeClass = '主观题'
         }

      } else if (topBtnIndex == 3) {
         if (midBtnTwoIndex == 1) {
            typeClass ="客观单科专项"
         } else if (midBtnTwoIndex == 2) {
            typeClass = '主观单科专项'
         } else if (midBtnTwoIndex == 3) {
            typeClass = '卷一'
         } else if (midBtnTwoIndex == 4) {
            typeClass = '卷二'
         } else if (midBtnTwoIndex == 5) {
            typeClass = '主观题'
         }

      }
      if (typeClass) {
         data.typeClass = typeClass
      }
      if(midBtnThreeIndex != 'all'){
         if (examType) {
            data.examType = examType
         }
         if (subjectNumb) {
            data.subjectNumb = subjectNumb
         }
      }
      if (!isMoRen) {
         if (orderByTestCount) {
            data.orderByTestCount = orderByTestCount
         }
         if (orderByCreatedTime) {
            data.orderByCreatedTime = orderByCreatedTime
         }
      }
      let url=''
      if (topBtnIndex == 3) {
         url = 'questionandexam/getmyexamlist' // 我参与
      }else{
         url = '/questionandexam/getexamlist'
      }
      await React.$http.get(url, data).then(res => {
         if (res.code === 1) {
            this.setState({
               mokaoList: res.data,
               total: res.total
            })
         }
         this.setState({
            pageLoading: true
         })
      }).catch(err => {
         this.setState({
            pageLoading: true
         })
      })
   }
   toRanking(item) {// 跳转排名
      this.props.history.push({ pathname: '/home/mokao/ranking', query: { data: item }})
   }
   async cardClickFn(item, typeStr) {// 开始模考
      if (typeStr == 'restart') {
         let obj = {
            examId: item.examId,
            // examType: typeArr[tabTwoKey - 1].tcontent,
            // typeClass: znzjTypeClass,
            pageNum: 1,
            pageSize: 100000
         }
         await React.$http.post('questionandexam/restartExam', obj).then(res => {
            console.log(res, '重新考试')
            if (res.code === 1) {
               this.props.history.push({ pathname: '/home/exam', query: { finishedQuestions: res.finishedQuestions, examData: JSON.stringify(res.data || {}), typeStr: '重新模考' } })
            }
         });
         return
      }
      if (typeStr == 'continue') {
         let data = {
            examId: item.examId,
            // examType: typeArr[tabTwoKey - 1].tcontent,
            // typeClass: znzjTypeClass,
            pageNum: 1,
            pageSize: 100000
         }
         await React.$http.post('questionandexam/startExam', data).then(res => {
            if (res.code === 1) {
               if (res.data?.questions.length) {
                  //alert(JSON.stringify(item))
                  this.props.history.push({ pathname: '/home/exam', query: { finishedQuestions: item.finishedQuestions, examData: JSON.stringify(res.data || {}), typeStr: '继续模考' } })
               } else {
                  React.$message({
                     type: 'warning',
                     content: '此试卷无效'
                  })
               }
            }else{
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
            }
         }).catch(err => {
            React.$message({
               type: 'warning',
               content: '此试卷无效'
            })
         })
         return
      }
      let id = false
      if (typeStr == 'mokao') {
         id = item.id
      }
      if (!id) {
         React.$message({
            type: 'warning',
            content: '此试卷无效'
         })
      }
      let data = {
         examId: id,
         pageNum: 1,
         pageSize: 100000
      }
      await React.$http.post('questionandexam/startExam', data).then(res => {
         if (res.code === 1) {
            if (!res.data?.questions || !res.data?.questions.length) {
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
               return
            }
            this.props.history.push({ pathname: '/home/exam/examBefore', query: { examData: JSON.stringify(res.data || {}), typeStr: '模拟考试' } })
         } else {
            React.$message({
               type: 'warning',
               content: '此试卷无效'
            })
         }
      }).catch(err => {
         React.$message({
            type: 'warning',
            content: '此试卷无效'
         })
      })
   }
   render() {
      let that = mokao._this
      let { isMoRen, orderByCreatedTime, orderByTestCount, midBtnTwoText, oneLevSub, mokaoList, pageLoading, total, currentPage, pageSize, topBtnIndex, midBtnOneIndex, midBtnTwoIndex, midBtnThreeIndex } = that.state
      function pageChange(page, size) {
         that.setState({
            currentPage: page || 1,
            pageSize: size || 10
         }, () => {
            that.getmokaoList()
         })
      }
      function tabExerOtherChild(val) {
         if (val == 2) {
            that.state.midBtnTwoText = '主观'
            that.state.midBtnTwoIndex = 1
            that.state.midBtnThreeIndex = 'all'
         } else {
            that.state.midBtnTwoText = '客观'
            that.state.midBtnTwoIndex = 1
            that.state.midBtnThreeIndex = 'all'
         }
         that.state.examType = null
         that.state.subjectNumb = null
         that.setState({
            topBtnIndex: val || 1,
         }, () => { that.filterOneLev(); that.getmokaoList() })
      }
      function midBtnClick(val, typeStr, subjId) {
         let { topBtnIndex, midBtnTwoText } = that.state
         if (typeStr == 'year') {
            that.setState({
               midBtnOneIndex: val || 1,
               year: val == 1 ? 2022 : 2021
            }, () => { that.getmokaoList() })
         }
         if (typeStr == 'type') {
            let str = '客观'
            if (topBtnIndex == 1) {
               if (val == 1) {
                  str = '客观'
               } else {
                  str = '整体'
               }
            } else if (topBtnIndex == 2) {
               if (val == 1) {
                  str = '主观'
               } else {
                  str = '整体'
               }
            } else if (topBtnIndex == 3) {
               if (val == 1) {
                  str = '客观'
               } else if (val == 2) {
                  str = '主观'
               } else {
                  str = '整体'
               }
            }
            that.setState({
               midBtnTwoIndex: val || 1,
               midBtnThreeIndex: 'all',
               examType:null,
               subjectNumb:null,
               midBtnTwoText: str
            }, () => { that.filterOneLev(); that.getmokaoList() })
         }
         if (typeStr == 'subj') {
            if (midBtnTwoText == '整体') {
               if (val == 'all') {
                  that.state.examType = null
               } else if (val == 2) {
                  that.state.examType = '真题'
               } else if (val == 3) {
                  that.state.examType = '金题,押题,速记'
               }
               that.state.subjectNumb = null
            } else {
               if (val == 'all') {
                  that.state.subjectNumb = null
               } else {
                  that.state.subjectNumb = subjId
               }
               that.state.examType = null
            }
            that.setState({
               midBtnThreeIndex: val || 'all'
            }, () => { that.getmokaoList() })
         }
      }
      function btmBtnClick(val) {
         let { orderByCreatedTime, isMoRen, orderByTestCount } = that.state
         if (val == 'isMoRen') {
            if (!isMoRen) {
               that.setState({
                  isMoRen: 1,
                  orderByCreatedTime: 0,
                  orderByTestCount: 0
               }, () => { that.getmokaoList() })
            } else {
            }
         } else if (val == 'orderByCreatedTime') {
            if (!orderByCreatedTime) {
               that.setState({
                  isMoRen: 0,
                  orderByCreatedTime: 1,
                  orderByTestCount: 0
               }, () => { that.getmokaoList() })
            } else {
            }

         } else if (val == 'orderByTestCount') {
            if (!orderByTestCount) {
               that.setState({
                  isMoRen: 0,
                  orderByCreatedTime: 0,
                  orderByTestCount: 1
               }, () => { that.getmokaoList() })
            } else {
            }
         }
      }
      function searchFn(val) {
         that.setState({
            keyWord: val || ''
         }, () => { that.getmokaoList() })
      }
      return (
         <Spin size="large" spinning={!pageLoading} style={{ width: '100vw', height: '100vh' }} tip='亲，正在努力加载中~'>
            <div className={s.exermokao}>
               {/* <Breadcrumb separator=">" className={s.exerBreadcrumb}>
                 <Breadcrumb.Item key='/home/exercises'>
                     <Link to='/home/exercises'>题海</Link>
                  </Breadcrumb.Item> 
                  <Breadcrumb.Item>模拟考试</Breadcrumb.Item>
               </Breadcrumb>*/}
               <Card style={{ marginBottom: '20px' }} bordered={false} actions={[
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '20px' }}>
                     <Button disabled={!pageLoading} onClick={() => { btmBtnClick('isMoRen') }} style={{ background: isMoRen ? '#268CFF' : '', color: isMoRen ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>默认排序</Button>
                     <Button disabled={!pageLoading} onClick={() => { btmBtnClick('orderByCreatedTime') }} style={{ background: orderByCreatedTime ? '#268CFF' : '', color: orderByCreatedTime ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>最新</Button>
                     <Button disabled={!pageLoading} onClick={() => { btmBtnClick('orderByTestCount') }} style={{ background: orderByTestCount ? '#268CFF' : '', color: orderByTestCount ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>人气</Button>
                     <Search  onChange={(val) => { that.state.keyword = val }} onSearch={searchFn} style={{ width: '500px' }} loading={!pageLoading} maxLength={100} placeholder="输入关键字" enterButton allowClear />
                  </div>
               ]}
                  title={
                     <Tabs defaultActiveKey='1' size='large' onChange={tabExerOtherChild} style={{ 'height': '100%' }}>
                        <TabPane tab="客观题" key="1"></TabPane>
                        <TabPane tab="主观题" key="2"></TabPane>
                        <TabPane tab="我参与" key="3"></TabPane>
                     </Tabs>} className={s.exermokaoCardWrap}>
                  <Row style={{ width: '100%', marginBottom: '15px' }}>
                     <Col span={1}>
                        年份：
                     </Col>
                     <Col span={23}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(1, 'year') }} style={{ background: midBtnOneIndex === 1 ? '#268CFF' : '', color: midBtnOneIndex === 1 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>2022</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(2, 'year') }} style={{ background: midBtnOneIndex === 2 ? '#268CFF' : '', color: midBtnOneIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>2021</Button>
                     </Col>
                  </Row>
                  <Row style={{ width: '100%', marginBottom: '15px' }}>
                     <Col span={1}>
                        类型：
                     </Col>
                     <Col span={23} style={{ display: topBtnIndex == 1 ? '' : 'none' }}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(1, 'type') }} style={{ background: midBtnTwoIndex === 1 ? '#268CFF' : '', color: midBtnTwoIndex === 1 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>客观单科专项</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(2, 'type') }} style={{ background: midBtnTwoIndex === 2 ? '#268CFF' : '', color: midBtnTwoIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>卷一</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(3, 'type') }} style={{ background: midBtnTwoIndex === 3 ? '#268CFF' : '', color: midBtnTwoIndex === 3 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>卷二</Button>
                     </Col>
                     <Col span={23} style={{ display: topBtnIndex == 2 ? '' : 'none' }}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(1, 'type') }} style={{ background: midBtnTwoIndex === 1 ? '#268CFF' : '', color: midBtnTwoIndex === 1 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>主观单科专项</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(2, 'type') }} style={{ background: midBtnTwoIndex === 2 ? '#268CFF' : '', color: midBtnTwoIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>主观题</Button>
                     </Col>
                     <Col span={23} style={{ display: topBtnIndex == 3 ? '' : 'none' }}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(1, 'type') }} style={{ background: midBtnTwoIndex === 1 ? '#268CFF' : '', color: midBtnTwoIndex === 1 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>客观单科专项</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(2, 'type') }} style={{ background: midBtnTwoIndex === 2 ? '#268CFF' : '', color: midBtnTwoIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>主观单科专项</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(3, 'type') }} style={{ background: midBtnTwoIndex === 3 ? '#268CFF' : '', color: midBtnTwoIndex === 3 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>卷一</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(4, 'type') }} style={{ background: midBtnTwoIndex === 4 ? '#268CFF' : '', color: midBtnTwoIndex === 4 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>卷二</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(5, 'type') }} style={{ background: midBtnTwoIndex === 5 ? '#268CFF' : '', color: midBtnTwoIndex === 5 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>主观题</Button>
                     </Col>
                  </Row>
                  <Row style={{ width: '100%', marginBottom: '15px' }}>
                     <Col span={1}>
                        科目：
                     </Col>
                     <Col span={23} style={{ display: midBtnTwoText == '整体' ? 'none' : '' }}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick('all', 'subj') }} style={{ background: midBtnThreeIndex === 'all' ? '#268CFF' : '', color: midBtnThreeIndex === 'all' ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>全部</Button>
                        {
                           (oneLevSub.length ? oneLevSub : []).map((item, index) => {
                              return <Button disabled={!pageLoading} key={index + 1} onClick={() => { midBtnClick(index + 1, 'subj', item.id) }} style={{ background: midBtnThreeIndex === (index + 1) ? '#268CFF' : '', color: midBtnThreeIndex === (index + 1) ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px', marginBottom: '10px' }} shape='round'>{item.name || ''}（{item.typeClass || ''}）</Button>
                           })
                        }
                     </Col>
                     <Col span={23} style={{ display: midBtnTwoText == '整体' ? '' : 'none' }}>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick('all', 'subj') }} style={{ background: midBtnThreeIndex === 'all' ? '#268CFF' : '', color: midBtnThreeIndex === 'all' ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>全部</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(2, 'subj') }} style={{ background: midBtnThreeIndex === 2 ? '#268CFF' : '', color: midBtnThreeIndex === 2 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>真题卷</Button>
                        <Button disabled={!pageLoading} onClick={() => { midBtnClick(3, 'subj') }} style={{ background: midBtnThreeIndex === 3 ? '#268CFF' : '', color: midBtnThreeIndex === 3 ? '#fff' : '#268CFF', borderColor: '#268CFF', marginRight: '20px' }} shape='round'>模考卷</Button>
                     </Col>
                  </Row>
               </Card>
               <Card bordered={false} actions={[
                  <Pagination
                     onChange={pageChange}
                     total={total}
                     showSizeChanger
                     showQuickJumper
                     current={currentPage}
                     pageSize={pageSize}
                     pageSizeOptions={[10, 30, 50, 100]}
                     showTotal={total => `共 ${total} 项`}
                  />
               ]}
                  title={''} className={s.exermokaoCardWrap}>
                  {mokaoList.length ? mokaoList.map((item, index) => {
                     return <Tooltip placement="top" arrowPointAtCenter title={item.tips} color='#18A9FF' key={index + 1}>
                        <Card hoverable style={{ background: (topBtnIndex == 3 && item.isFinish) ? '#AEDD81' : (topBtnIndex == 3 && !item.isFinish) ?'#FFFF77':''}} key={index + 1} className={s.exermokaoCard}>
                           <div style={{ lineHeight: '2', fontSize: '17px', fontWeight: 'bold' }}>{item.title || '空'}</div>
                           <div style={{ display: 'flex' }}>
                              <Tag style={{ display: topBtnIndex != 3 ?'':'none'}} onClick={() => { that.cardClickFn(item, 'mokao') }} color="processing" >立即开始</Tag>
                              <Tag style={{ display: (topBtnIndex == 3 && item.isFinish) ? '' : 'none' }} onClick={() => { that.cardClickFn(item, 'restart') }} color="processing" >重新开始</Tag>
                              <Tag style={{ display: (topBtnIndex == 3 && !item.isFinish) ? '' : 'none' }} onClick={() => { that.cardClickFn(item, 'continue') }} color="processing" >继续考试</Tag>
                              <Tag onClick={() => { that.toRanking(item) }} color="processing" style={{ marginLeft: '5px' }}>考试排名</Tag>
                              <Tag color="processing" style={{ display: (topBtnIndex == 3 && item.isFinish) ? '' : 'none' }}>得分：{item.score || 0}</Tag>
                              <Tag color="processing" style={{ display: (topBtnIndex == 3 && !item.isFinish) ? '' : 'none' }}>进度：{((Object.keys(JSON.parse(item.finishedQuestions || '{}'))).length || 0)} / {(((item.questions.split(',')).filter(item=>item)).length || 0)} 题</Tag>
                              <Tag onClick={() => { }} color="processing" >详情</Tag>
                           </div>
                        </Card>
                     </Tooltip>
                  }) : <Empty description='当前没有试卷' style={{ margin: '50px auto' }} />}

               </Card>
            </div>
         </Spin>
      );
   }

}
export default withRouter(mokao);



