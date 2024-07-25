import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import s from './exerOtherTab.module.scss';
import { Row, Col, Select, Input, Breadcrumb, Card, Spin, Pagination, Tabs, Button, Empty, Tooltip, Tag } from 'antd';
import hisIcon from '../../../../public/image/exercises/other/hisIcon.png'
import noteIcon from '../../../../public/image/exercises/other/noteIcon.png'
import ctb from '../../../../public/image/exercises/conEntra/ctb.png'
import ft from '../../../../public/image/exercises/conEntra/ft.png'
import scIcon from '../../../../public/image/exercises/other/scIcon.png'
const { TabPane } = Tabs;
const { Search } = Input;
//const { Option } = Select;

class exerOther extends Component {

   constructor(props) {
      super(props);
      this.state = {
         exerOtherList: [],
         pageSize: 10,
         currentPage: 1,
         total: 0,
         tabKeyType: 1,
         allSubList: [],
         subTypeArr: [],
         oneTabArr: [],
         oneTypeIndex: "真题",
         oneTypeChildIndex: "卷一",
         WrongCountArr: [{ label: `错 1 次`, value: 1 }],
         totleWrong: 1,
         keyword: '', //关键词
         conLoading: true, //内容卡片loading
         title: 'err'
      }
      exerOther._this = this;
   }

   componentDidMount() {
      let type = this.props.history.location.search.split('=')[1] || ''
      if (type === 'err') {
         this.setState({ tabKeyType: 1 }, () => { this.getDataList(); this.getWrongCount() })
      } else if (type === 'fav') {
         this.setState({ tabKeyType: 2 }, () => { this.getDataList() })
      } else if (type === 'note') {
         this.setState({ tabKeyType: 3 }, () => { this.getDataList() })
      } else if (type === 'history') {
         this.setState({ tabKeyType: 4 }, () => { this.getDataList() })
      } else if (type === 'no') {
         this.setState({ tabKeyType: 5 }, () => { this.getDataList() })
      } else {
         this.setState({ tabKeyType: 1 }, () => { this.getDataList() })
      }
      let allSubList = JSON.parse(sessionStorage.getItem('allSubList') || [])
      let exercisesTypeArr = JSON.parse(sessionStorage.getItem('exercisesTypeArr') || [])
      let subTypeArr = []
      let oneTabArr = []
      exercisesTypeArr.forEach((item) => {
         if (item.ttype === 'questionTypeClass') {
            subTypeArr.push(item.tcontent || '')
         }
         if (item.ttype === 'type') {
            oneTabArr.push(item.tcontent || '')
         }
      })
      this.setState({ subTypeArr, allSubList, oneTabArr, title: type })

   }
   // 错误题目次数
   async getWrongCount() {
      await React.$http.get('/questionandexam/getWrongCount', { type: this.state.oneTypeIndex }).then(res => {
         if (res.code === 1) {
            this.setState({
               WrongCountArr: res.data.split(',').map(item => { return { label: `错 ${item || 0} 次`, value: item } })
            })
         }
      });
   }
   async getDataList() {
      let { conLoading, keyword, totleWrong, tabKeyType, allSubList, pageSize, currentPage, oneTypeIndex, oneTypeChildIndex } = this.state
      if (!conLoading) {
         return
      }
      this.setState({
         conLoading: false
      })
      if (tabKeyType === 4) {// 做题历史
         let hisData = {
            pageSize: pageSize,
            pageNumber: currentPage,
            examType: oneTypeIndex,
            typeClass: oneTypeChildIndex
         }
         await React.$http.get('/questionandexam/getmyexamlist', hisData).then(res => {
            if (res.code === 1 && res.data) {
               this.setState({
                  exerOtherList: res.data,
                  total: res.total
               })
            }
            this.setState({
               conLoading: true
            })
         }).catch(() => {
            this.setState({
               exerOtherList: [],
               conLoading: true
            })
         })
      } else if (tabKeyType === 3) {// 我的笔记
         await React.$http.get('notes/selectUserNotes').then(res => {
            if (res.code === 1) {
               let data = []
               res?.data.forEach((item) => {
                  allSubList.forEach((it) => {
                     if (item.subjectNumb === it.id) {
                        item.title = it.name
                        data.push(item)
                     }
                  })
               })
               this.setState({
                  exerOtherList: data
               })
            }
            this.setState({
               conLoading: true
            })
         }).catch(() => {
            this.setState({
               exerOtherList: [],
               conLoading: true
            })
         })
      } else {// 收藏，我不会，错题
         let errData = {
            // pageSize: pageSize,
            // pageNumber: currentPage,
            typeClass: oneTypeChildIndex,
            type: oneTypeIndex,
            getType: tabKeyType === 1 ? 'mywrong' : tabKeyType === 2 ? 'myscollect' : tabKeyType === 5 ? 'mycant' : 'mywrong'
         }
         if (tabKeyType === 1) {
            if (totleWrong)
               errData.totleWrong = totleWrong
            else
               errData.totleWrong = 1;
         }
         if (keyword)
            errData.keyword = keyword

         await React.$http.get('/questionandexam/getMyQuestions', errData).then(res => {
            if (res.code === 1) {
               let lastList = []
               let questionsList = res?.data?.questionsList || [{}]
               Array.from(new Set(allSubList)).forEach((itm) => {
                  let obj = { tiMu: [], numTol: 0, title: '' }
                  questionsList.forEach((it) => {
                     if ((it.subjectNumb === itm.id) && (it.questionTypeClass == oneTypeChildIndex) && (itm.u_type === oneTypeIndex)) {
                        obj.title = itm.name
                        obj.tiMu.push(it)
                        obj.numTol++;
                     }
                  })
                  obj.tiMu = Array.from(new Set(obj.tiMu))
                  if (obj.numTol > 0) {
                     lastList.push(obj);
                  }
               })
               lastList = Array.from(new Set(lastList))
               this.setState({
                  exerOtherList: lastList
               })
            }
            this.setState({
               conLoading: true
            })
         }).catch(() => {
            this.setState({
               exerOtherList: [],
               conLoading: true
            })
         })
      }
   }
   render() {
      let that = exerOther._this
      let { title, conLoading, WrongCountArr, oneTabArr, subTypeArr, exerOtherList, total, currentPage, pageSize, tabKeyType } = that.state
      function searchFn(val) {
         that.setState({
            keyword: val || ''
         }, () => { that.getDataList() })
      }
      function tabExerOther(val) {
         that.setState({
            oneTypeIndex: oneTabArr[val - 1]
         }, () => { that.getDataList(); that.getWrongCount() })
      }
      function tabExerOtherChild(val) {
         that.setState({
            oneTypeChildIndex: subTypeArr[val - 1]
         }, () => { that.getDataList() })
      }
      function pageChange(page, size) {
         that.setState({
            currentPage: page || 1,
            pageSize: size || 10
         }, () => {
            that.getDataList()
         })
      }
      function exerTabTwoChange(val) {
         let title = val === 1 ? 'err' : val === 2 ? 'fav' : val === 5 ? 'no' : 'err'
         that.setState({ tabKeyType: val, title }, () => { that.getDataList() })
      }
      async function cardClickFn(item) {
         if (tabKeyType === 3) {// 我的笔记
            that.props.history.push({ pathname: '/home/exercises/other/updateNote', query: { note: JSON.stringify(item || {}) } })
         } else if (tabKeyType === 4) {//做题历史
            if (!item.examId) {
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
               return
            }
            let data = {
               examId: item.examId,
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
                  that.props.history.push({ pathname: '/home/exam', query: { examData: JSON.stringify(res.data || {}), typeStr: '做题历史' } })
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
         } else {
            //let typeStr = that.props.history.location.search.split('=')[1] || ''
            item.tiMu.forEach((item) => {
               item.isAnswer = 1
            })
            sessionStorage.setItem('examTotal', JSON.stringify(item?.tiMu || []))
            that.props.history.push({ pathname: '/home/exercises/correct', query: { typeStr: title, isSourceOther: true, resultInfo: JSON.stringify({}), examLimitTime: new Date(), examId: '' } })

         }
      }
      function wrongChange(val) {
         that.setState({
            totleWrong: val || 1
         }, () => { that.getDataList() })
      }
      return (
         <Spin size="large" spinning={oneTabArr.length > 0 ? false : true} tip='亲，正在努力加载中~'>
            <div className={s.exerOther}>
               <Breadcrumb separator=">" className={s.exerBreadcrumb}>
                  <Breadcrumb.Item key='/home/exercises'>
                     <Link to='/home/exercises'>题海</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>我的题库</Breadcrumb.Item>
               </Breadcrumb>
               <Card bordered={false} className={s.exerOtherCardWrap}>
                  <Tabs defaultActiveKey='1' size='large' onChange={tabExerOther} style={{ 'height': '100%' }}>
                     {
                        oneTabArr.map((item, index) => {
                           return <TabPane tab={item == "速记" ? item + '题库' : item + '库'} key={index + 1}></TabPane>
                        })
                     }
                  </Tabs>
                  <Row style={{ display: (tabKeyType === 1 || tabKeyType === 2 || tabKeyType === 5) ? '' : 'none' }}>
                     <Col span={10}>
                        <Search onChange={(val) => { that.state.keyword = val }} onSearch={searchFn} style={{ width: '100%', marginTop: '20px' }} loading={!conLoading} maxLength={100} placeholder="输入关键词搜索资源" enterButton allowClear size='large' />
                     </Col>
                     <Col span={14}>
                        <Select defaultValue={1} options={WrongCountArr} bordered={false} style={{ display: tabKeyType === 1 ? '' : 'none', marginTop: '20px', width: '110px', marginLeft: '10px' }} size='large' onChange={wrongChange} disabled={!conLoading}>
                        </Select>
                     </Col>
                  </Row>
                  <div className={s.exerOtherType}>
                     <Button disabled={!conLoading} onClick={() => { exerTabTwoChange(1) }} style={{ backgroundColor: tabKeyType === 1 ? '#E9F5FF' : '' }} icon={<img src={ctb} alt="" />} size='large' shape='round' >错题本</Button>
                     <Button disabled={!conLoading} onClick={() => { exerTabTwoChange(2) }} style={{ backgroundColor: tabKeyType === 2 ? '#E9F5FF' : '' }} icon={<img src={scIcon} alt="" />} size='large' shape='round' >收藏题目</Button>
                     <Button disabled={!conLoading} onClick={() => { exerTabTwoChange(3) }} style={{ backgroundColor: tabKeyType === 3 ? '#E9F5FF' : '' }} icon={<img src={noteIcon} alt="" />} size='large' shape='round' >我的笔记</Button>
                     <Button disabled={!conLoading} onClick={() => { exerTabTwoChange(4) }} style={{ backgroundColor: tabKeyType === 4 ? '#E9F5FF' : '' }} icon={<img src={hisIcon} alt="" />} size='large' shape='round' >做题历史</Button>
                     <Button disabled={!conLoading} onClick={() => { exerTabTwoChange(5) }} style={{ backgroundColor: tabKeyType === 5 ? '#E9F5FF' : '' }} icon={<img src={ft} alt="" />} size='large' shape='round' >我不会</Button>
                  </div>
               </Card>
               <Card bordered={false} className={s.exerOtherCardBtmWrap} actions={
                  tabKeyType === 4 ? [<Pagination
                     onChange={pageChange}
                     total={total}
                     showSizeChanger
                     showQuickJumper
                     current={currentPage}
                     pageSize={pageSize}
                     pageSizeOptions={[10, 30, 50, 100]}
                     showTotal={total => `共 ${total} 项`}
                  />] : ['']
               } title={tabKeyType !== 3 ?
                  <Tabs defaultActiveKey='1' size='large' onChange={tabExerOtherChild} style={{ 'height': '100%' }}>
                     {subTypeArr.map((item, index) => {
                        return <TabPane tab={item} key={index + 1}></TabPane>
                     })}
                  </Tabs> : ''
               }>
                  < Spin size="large" spinning={!conLoading} tip='亲，正在努力加载中~' style={{ width: '100%', display: 'flex' }} >
                     {exerOtherList.length ? exerOtherList.map((item, index) => {
                        return <Tooltip placement="top" arrowPointAtCenter title={item.title} color='#18A9FF' key={index + 1}>
                           <Card onClick={() => { cardClickFn(item) }} hoverable key={index + 1} className={s.exerOtherCard}>
                              <div>{item.title.substring(0, 9) || '空'}</div>
                              <Tag style={{ display: tabKeyType === 4 ? '' : 'none', marginTop: '5px', verticalAlign: 'text-bottom' }} color={item.isFinish ? 'processing' : 'error'}>{item.isFinish ? '已完成' : '未做完'}</Tag>
                              <Tag style={{ display: (tabKeyType === 3 || tabKeyType === 4) ? 'none' : '', marginTop: '5px', verticalAlign: 'text-bottom' }} color='processing'>{item.numTol || '0'}道</Tag>
                           </Card>
                        </Tooltip>
                     }) : <Empty description={`当前还没有${tabKeyType === 1 ? '错题' : tabKeyType === 2 ? '收藏' : tabKeyType === 3 ? '笔记' : tabKeyType === 4 ? '历史' : '练习'}记录`} style={{ margin: '100px auto' }} />}
                  </Spin>
               </Card>
            </div>
         </Spin>
      );
   }

}
export default withRouter(exerOther);



