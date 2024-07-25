
import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb, Card, Spin, Button } from "antd"
import s from './updateNote.module.scss';

class updateNote extends Component {

   constructor(props) {
      super(props);
      this.state = {
         pageLoading: false,
         noteData: {},
         isXG: false
      }
      updateNote._this = this;
   }

   componentDidMount() {
      let noteData = JSON.parse(this.props.history.location.query?.note || '{}')
      this.notetextarea.value = noteData.content
      this.setState({
         noteData
      })
   }

   render() {
      let that = updateNote._this
      let { isXG, noteData, pageLoading } = that.state
      const updateNoteFn = async (val) => {
         if (!that.notetextarea.value && isXG) {
            React.$message({
               type: 'warning',
               content: '笔记内容为空'
            })
            return
         }
         that.setState({ isXG: !val })
         if (val) {
            let data = {
               questionId: noteData.questionId,
               subjectNumb: noteData.subjectNumb,
               userId: noteData.userId,
               content: that.notetextarea.value,
               id: noteData.id
            }
            await React.$http.post('/notes/insertNotes', data).then(res => {
               if (res.code === 1) {
                  React.$message({
                     type: 'success',
                     content: '修改笔记成功'
                  })
               }
            })
         }
      }
      const addZero = function (num) {
         if (parseInt(num) < 10) {
            num = "0" + num
         }
         return num
      }
      function formatMsToDate(ms) {
         if (ms) {
            var oDate = new Date(ms),
               oYear = oDate.getFullYear(),
               oMonth = oDate.getMonth() + 1,
               oDay = oDate.getDate(),
               oHour = oDate.getHours(),
               oMin = oDate.getMinutes(),
               oSen = oDate.getSeconds(),
               oTime = oYear + '-' + addZero(oMonth) + '-' + addZero(oDay) + ' ' + addZero(oHour) + ':' +
                  addZero(oMin) + ':' + addZero(oSen);
            return oTime;
         } else {
            return ""
         }
      }
      return (
         <Spin size="large" spinning={pageLoading} tip='亲，正在努力加载中~'>
            <div className={s.noteOther}>
               <Breadcrumb separator=">" className={s.noteBreadcrumb}>
                  <Breadcrumb.Item key='/home/exercises'>
                     <Link to='/home/exercises'>题海</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item key='/home/exercises/other'>
                     <Link to='/home/exercises/other'>我的题库</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>我的笔记</Breadcrumb.Item>
               </Breadcrumb>
               <Card bordered={false} className={s.noteOtherCardWrap}>
                  <div className={s.noteUserData}>
                     <img src={noteData.avatar} alt="" />
                     <div className={s.nameTime}>
                        <div className={s.username}>{noteData.nickName || '学员'}</div>
                        <div className={s.dateTime}>笔记修改时间：{formatMsToDate(noteData.createAt) || ''}</div>
                     </div>
                  </div>
                  <textarea ref={(textarea) => that.notetextarea = textarea} name="" id="" cols="30" rows="2" autoFocus={isXG} readOnly={!isXG} className={s.notetextarea}></textarea>
                  <Button className={s.noteBtn} onClick={() => { updateNoteFn(isXG) }} shape='round' size='large' type='primary'>{isXG ? '确定' : '修改'}</Button>
               </Card>
            </div>
         </Spin>
      );
   }

}
export default withRouter(updateNote);



