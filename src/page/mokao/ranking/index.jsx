
import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb, Pagination, Card, Layout, Table, Input, Image, Button } from 'antd';
import s from './ranking.module.scss';
import scBook from '../../../../public/image/scBook.png'
import topOne from '../../../../public/image/topOne.png'
const { Sider, Content } = Layout;
const { Search } = Input;
const { Column } = Table;
class ranking extends Component {

   constructor(props) {
      super(props);
      this.state = {
         pageLoading: true,
         pageSize: 10,
         currentPage: 1,
         total: 0,
         examId: '',
         titleStr: '',
         keyWord: '',
         dataSource: [
            {
               key: 1,
               rankIndex: 1,
               avatar: '',
               nickName: '学员',
               startTime: '',
               endTime: '',
               usedTime: 3600,
               score: '0'
            }
         ],
         isManage: false,
         judgeState:null
      }
      ranking._this = this;
   }

   componentDidMount() {
      if (JSON.parse(sessionStorage.getItem('fkUserData') || '{}')?.role > 0) {//当前用户是否有权限
         this.state.isManage = true
      }
      this.props.location.query.data.examId && this.setState({
         examId: this.props.location.query.data.examId,
         titleStr: this.props.location.query.data.title
      }, () => {
         this.getRankList();
      })
   }
   formatSeconds(value) {//根据秒数转为分钟小时单位
      var theTime = parseInt(value);// 秒
      var theTime1 = 0;// 分
      var theTime2 = 0;// 小时
      if (theTime > 60) {
         theTime1 = parseInt(theTime / 60);
         theTime = parseInt(theTime % 60);
         if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
         }
      }
      var result = "" + parseInt(theTime) + "秒";
      if (theTime1 > 0) {
         result = "" + parseInt(theTime1) + "分" + result;
      }
      if (theTime2 > 0) {
         result = "" + parseInt(theTime2) + "小时" + result;
      }
      return result;
   }
   formatDate(time) {//格式化日期
      let date = new Date(time);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
   }
   async toCorrect() {
      let that = this
      const { pageSize, currentPage, examId, isManage } = that.state
      let obj = {
         pageSize: pageSize,
         pageNumber: currentPage,
         examId: examId
      }
      await React.$http.get('questionandexam/selectUserExamListTop', obj).then(res => {
         if (res.code === 1) {
            let arr = res.data
            console.log(arr, 'arr')
         } else {
         }
      }).catch(err => {
      })

   }
   async getRankList() {
      let that = this
      const { pageSize, currentPage, examId, isManage, judgeState} = that.state
      let obj = {
         pageSize: pageSize,
         pageNumber: currentPage,
         examId: examId
      }
      if (judgeState){
         obj.judgeState = judgeState
      }
      await React.$http.get('questionandexam/selectUserExamListTop', obj).then(res => {
         if (res.code === 1) {
            let arr = res.data
            arr.forEach((item, index) => {
               item.key = index + 1;
               item.icon = index === 0 ? 1 : 0;
               item.rankIndex = index + 1;
               item.avatar = item.avatar ? item.avatar : '';
               item.nickName = item.nickName ? item.nickName : '学员'
               item.startTime = item.startTime ? this.formatDate(item.startTime) : '';
               item.endTime = item.endTime ? this.formatDate(item.endTime) : '';
               item.usedTime = item.usedTime ? this.formatSeconds(item.usedTime) : 0;
               item.score = item.score ? item.score + '分' : 0 + '分';
               item.isManage = isManage
            })
            console.log(arr, 'arr')
            that.setState({
               dataSource: arr || [{}],
               total: res.total || 0
            })
         } else {
         }
         that.setState({
            pageLoading: false
         })
      }).catch(err => {
         that.setState({
            pageLoading: false
         })
      })
   }
   render() {
      let that = ranking._this
      let { judgeState, pageLoading, total, currentPage, pageSize, titleStr, dataSource } = that.state
      function pageChange(page, size) {
         that.setState({
            currentPage: page || 1,
            pageSize: size || 10
         }, () => {
            that.getRankList()
         })
      }
      function filterRank(val){
         that.setState({
            judgeState:val
         }, () => { that.getRankList() })
      }
      return (
         <div className={s.rankWrap}>
            <Breadcrumb separator=">" className={s.rankBreadcrumb}>
               <Breadcrumb.Item key='/home/mokao'>
                  <Link to='/home/mokao'>模考</Link>
               </Breadcrumb.Item>
               <Breadcrumb.Item>{titleStr}</Breadcrumb.Item>
            </Breadcrumb>
            <Layout style={{ background: 'transparent' }}>
               <Content className={s.rankContent}>
                  <h1>高  分  榜  单</h1>
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
                  ]} className={s.rankCardWrap}>
                     <Table pagination={false} loading={pageLoading} style={{ width: '100%' }} dataSource={dataSource} >;
                        <Column title="" dataIndex="icon" key="icon" render={(val) => (
                           <Image width={55} src={val===1 ? topOne : ''} fallback />
                        )} />
                        <Column title="序号" dataIndex="rankIndex" key="rankIndex" />
                        <Column title="头像" dataIndex="avatar" key="avatar" render={(avatar) => (
                           <Image width={55} src={avatar} fallback />
                        )} />
                        <Column title="昵称" dataIndex="nickName" key="nickName" />
                        <Column title="开始时间" dataIndex="startTime" key="startTime" />
                        <Column title="结束时间" dataIndex="endTime" key="endTime" />
                        <Column title="用时" dataIndex="usedTime" key="usedTime" />
                        <Column title="得分" dataIndex="score" key="score" />
                        <Column title="操作" dataIndex="isManage" key="isManage" render={(isManage) => (
                           <Button type='primary' style={{ display: isManage?'':'none'}}>批改</Button>
                        )} />
                     </Table>
                  </Card>
               </Content>
               <Sider className={s.rankSider}>
                  <Card hoverable style={{ width: '100%', marginBottom: '20px' }}>
                     <div className={s.rankSiderTitle}>搜考生</div>
                     <Search loading={false} maxLength={100} placeholder="输入关键词搜索" enterButton allowClear size='large' />
                  </Card>
                  <Card hoverable style={{ width: '100%', marginBottom: '20px', cursor: 'default' }}>
                     <div className={s.rankSiderTitle}>常用</div>
                     <div className={s.rankListItem} onClick={() => { }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>高分榜单</div>
                     </div>
                     <div className={s.rankListItem} onClick={() => { }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>效率榜单</div>
                     </div>
                     <div className={s.rankListItem} onClick={() => { }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>最新参加</div>
                     </div>
                     <div className={s.rankListItem} onClick={() => { }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>进行中</div>
                     </div>
                  </Card>
                  <Card hoverable style={{ width: '100%', marginBottom: '20px', cursor: 'default' }}>
                     <div className={s.rankSiderTitle}>管理</div>
                     <div className={s.rankListItem} onClick={() => {filterRank(0) }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>未批改</div>
                     </div>
                     <div className={s.rankListItem} onClick={() => { filterRank(1) }}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>批改中</div>
                     </div>
                     <div className={s.rankListItem} onClick={() => { filterRank(2)}}>
                        <img src={scBook} alt="" />
                        <div style={{ display: 'inline-block', lineHeight: '45px' }}>已批改</div>
                     </div>
                  </Card>
               </Sider>
            </Layout>
         </div>
      );
   }

}
export default withRouter(ranking);



