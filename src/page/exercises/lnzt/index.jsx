
import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb, Card, Spin, Pagination, Empty } from 'antd';
import s from './lnzt.module.scss';

class lnzt extends Component {

   constructor(props) {
      super(props);
      this.state = {
         lnztList: [],
         pageLoading: true,
         pageSize: 10,
         currentPage: 1,
         total: 0,
         isStartExam: false
      }
      lnzt._this = this;
   }

   componentDidMount() {
      this.getLnztList()
   }
   async getLnztList() {
      const { pageSize, currentPage } = this.state
      let obj = {
         pageSize: pageSize,
         pageNumber: currentPage,
         ownerType: '公用'
      }

      await React.$http.get('/questionandexam/getexamlist', obj).then(res => {
         if (res.code === 1) {
            this.setState({
               lnztList: res.data || [],
               total: res.total || 0,
               pageLoading: false
            })
         } else {
            this.props.history.push('/home/first')
            // React.$message({
            //    type: 'error',
            //    content: '请您先登录'
            // })
         }
      }).catch(err => {
         this.props.history.push('/home/first')
         // React.$message({
         //    type: 'error',
         //    content: '请您先登录'
         // })
      })
   }
   async lnztToExam(id) {
      if (!id) {
         return
      }
      let { isStartExam } = this.state
      if (!isStartExam) {
      }
      let data = {
         examId: id,
         pageNum: 1,
         pageSize: 100000
      }
      this.state.isStartExam = false
      await React.$http.post('questionandexam/startExam', data).then(res => {
         if (res.code === 1) {
            this.setState({
               isStartExam: false
            })
            if (!res.data?.questions || !res.data?.questions.length) {
               React.$message({
                  type: 'warning',
                  content: '此试卷无效'
               })
               return
            }
            this.props.history.push({ pathname: '/home/exam', query: { examData: JSON.stringify(res.data || {}), typeStr: '历年真题' } })
         }
      }).catch(err => {
         this.setState({
            isStartExam: false
         })
      })
   }
   render() {
      let that = lnzt._this
      let { lnztList, pageLoading, total, currentPage, pageSize } = that.state
      function pageChange(page, size) {
         that.setState({
            currentPage: page || 1,
            pageSize: size || 10
         }, () => {
            that.getLnztList()
         })
      }
      return (
         <Spin size="large" spinning={pageLoading} style={{ width: '100vw', height: '100vh' }} tip='亲，正在努力加载中~'>
            <div className={s.exerLnzt}>
               <Breadcrumb separator=">" className={s.exerBreadcrumb}>
                  <Breadcrumb.Item key='/home/exercises'>
                     <Link to='/home/exercises'>题海</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>历年真题</Breadcrumb.Item>
               </Breadcrumb>
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
               ]} className={s.exerLnztCardWrap}>
                  {lnztList.length ? lnztList.map((item, index) => {
                     return <Card onClick={() => { that.lnztToExam(item.id) }} hoverable className={s.exerLnztCard} key={index + 1} >
                        <h3>{item.title || '空'}</h3>
                        <div style={{ display: 'flex' }}>
                           <div className={s.exerLnztCardTag}>{item.typeClass || ''}</div>
                        </div>
                     </Card>
                  }) : <Empty description='当前还没有练习记录' style={{ margin: '100px auto' }} />}

               </Card>
            </div>
         </Spin>
      );
   }

}
export default withRouter(lnzt);



