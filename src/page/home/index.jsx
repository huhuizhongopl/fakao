
import React, { lazy, Suspense, Component } from 'react';
import { Route, Switch, withRouter } from "react-router-dom";
import { Layout, Tabs, Button } from 'antd';
import s from './home.module.scss';
import LoginCpt from '@/components/loginCpt'
import scBook from '../../../public/image/scBook.png'
import PubSub from 'pubsub-js'
import beianIcon from '../../../public/image/beianIcon.png'
const first = lazy(() => import('@/page/first'));
const lesson = lazy(() => import('@/page/lesson'));
const classGrade = lazy(() => import('@/page/classGrade'));
const exercises = lazy(() => import('@/page/exercises'));
const download = lazy(() => import('@/page/download'));
const mokao = lazy(() => import('@/page/mokao'));
const ranking = lazy(() => import('@/page/mokao/ranking'));
const exam = lazy(() => import('@/page/exercises/exam'));
const exerLnzt = lazy(() => import('@/page/exercises/lnzt'));
const exerOther = lazy(() => import('@/page/exercises/exerOtherTab'));
const correct = lazy(() => import('@/page/exercises/correct'));
const lawCpt = lazy(() => import('@/components/lawCpt'));
const updateNote = lazy(() => import('@/page/exercises/exerOtherTab/updateNote'));
const examBefore = lazy(() => import('@/page/exercises/exam/examBefore'));
const { Header, Footer, Content } = Layout;
const { TabPane } = Tabs;
// 未匹配路由  
function NoMatch() {
   return <div>没匹配到路由!!!</div>
}
class Home extends Component {

   constructor(props) {
      super(props);
      this.state = {
         tabOneKey: '1',
         showLogin: false
      }
      Home._this = this;
   }

   componentDidMount() {
      if (this.state.tabOneKey === '1') {
         this.props.history.push('/home/first')
      } else if (this.state.tabOneKey === '2') {
         this.props.history.push('/home/lesson')
      } else if (this.state.tabOneKey === '3') {
         this.props.history.push('/home/classGrade')
      } else if (this.state.tabOneKey === '4') {
         this.props.history.push('/home/exercises')
      } else if (this.state.tabOneKey === '5') {
         this.props.history.push('/home/mokao')
      } else if (this.state.tabOneKey === '6') {
         this.props.history.push('/home/download')
      }
      PubSub.subscribe('loginFn', (val) => { // 订阅登录弹框事件
         this.loginFn(val)
      })
   }
   loginFn(val) {
      this.setState({
         showLogin: val
      })
   }
   render() {
      let that = Home._this
      let { showLogin, tabOneKey } = that.state
      let url = window.location.hash
      if (url.search('/home/first') > -1) {
         tabOneKey = '1'
      } else if (url.search('/home/lesson') > -1) {
         tabOneKey = '2'
      } else if (url.search('/home/classGrade') > -1) {
         tabOneKey = '3'
      } else if (url.search('/home/exercises') > -1) {
         tabOneKey = '4'
      } else if (url.search('/home/mokao') > -1) {
         tabOneKey = '5'
      } else if (url.search('/home/download') > -1) {
         tabOneKey = '6'
      }
      function TabsClickOne(key) {
         if (key === '1') {
            that.props.history.push('/home/first')
         } else if (key === '2') {
            that.props.history.push('/home/lesson')
         } else if (key === '3') {
            that.props.history.push('/home/classGrade')
         } else if (key === '4') {
            that.props.history.push('/home/exercises')
         } else if (key === '5') {
            that.props.history.push('/home/mokao')
         } else if (key === '6') {
            that.props.history.push('/home/download')
         }
         that.setState({
            tabOneKey: key
         })
      }
      let Ele = <Layout style={{ height: '100vh', position: 'relative' }}>
         <Header className={s.Header}>
            <img className={s.logo} src="https://zhonghefakao.oss-cn-zhangjiakou.aliyuncs.com/logo/head-logo.png" alt="logo" />
            <Tabs defaultActiveKey={tabOneKey} size='large' onChange={TabsClickOne} style={{ 'height': '100%' }}>
               <TabPane tab="首页" key="1"></TabPane>
               <TabPane tab="课程" key="2"></TabPane>
               <TabPane tab="班级" key="3"></TabPane>
               <TabPane tab="题海" key="4"></TabPane>
               <TabPane tab="模考" key="5"></TabPane>
               <TabPane tab="下载" key="6"></TabPane>
            </Tabs>
            <Button className={s.loginBtn} onClick={() => { that.setState({ showLogin: true }) }} type="dashed" size='large' shape='round' ghost={true}>登&nbsp;&nbsp;录</Button>
         </Header>
         <Content className={s.Content} style={{ overflowY: 'auto' }}>
            <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#fff' }}></div>}>
               <Switch>
                  <Route exact path={'/home/first'} component={first} />
                  <Route exact path={'/home/lesson'} component={lesson} />
                  <Route exact path={'/home/classGrade'} component={classGrade} />
                  <Route exact path={'/home/exercises'} component={exercises} />
                  <Route exact path={'/home/exercises/lnzt'} component={exerLnzt} />
                  <Route exact path={'/home/exercises/other'} component={exerOther} />
                  <Route exact path={'/home/exercises/other/updateNote'} component={updateNote} />
                  <Route exact path={'/home/exercises/correct'} component={correct} />
                  <Route exact path={'/home/exercises/lawCpt'} component={lawCpt} />
                  <Route exact path={'/home/mokao'} component={mokao} />
                  <Route exact path={'/home/mokao/ranking'} component={ranking} />
                  <Route exact path={'/home/download'} component={download} />
                  <Route component={NoMatch} />
               </Switch>
            </Suspense >
            <LoginCpt showLogin={showLogin} loginFn={this.loginFn.bind(this)} />
            <Footer className={s.footer} >
               <div className="footerIn" style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex' }}>
                     <div style={{ marginRight: '80px' }}><img style={{ width: '81px' }} src="https://zhonghefakao.oss-cn-zhangjiakou.aliyuncs.com/images/question/head-logo.png" alt="" /></div>
                     <div>
                        <ul style={{ display: 'flex' }}>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/first" target="_blank">首页</a></li>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/lesson" target="_blank">课程</a></li>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/classGrade" target="_blank">班级</a></li>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/exercises" target="_blank">题海</a></li>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/mokao" target="_blank">模考</a></li>
                           <li style={{ marginRight: '60px', fontSize: '16px', color: '#666' }}><a style={{ fontSize: '14px', color: '#eee' }} href="/home/download" target="_blank">下载</a></li>
                        </ul>
                        <p style={{ display: 'flex', fontSize: '14px', color: '#888', marginTop: '30px' }}>
                           <a target="_blank" href="#" style={{ fontSize: '12px', color: '#999', textDecoration: 'none', height: '20px', lineHeight: '20px', marginRight: '50px' }}>
                              <img src={scBook} style={{ display: 'inline', width: '15px', float: 'left', marginTop: '1px', background: 'yellow' }} />
                              <span style={{ margin: '0px 0px 0px 5px', lineHeight: '20px' }}>Axxxxxxxxxxxx</span>
                           </a>
                           <a href="#" style={{ fontSize: '12px', color: '#999' }} target="_blank">Axxxxxxxxxxxxx</a>
                        </p>
                     </div>
                  </div>
                  <ul style={{ display: 'flex', margin: '0' }}>
                     <li style={{ position: 'relative', textAlign: 'center' }}>
                        <img src={scBook} style={{ cursor: 'pointer', width: '100px', height: '100px' }} alt="" />
                        <p style={{ fontSize: '14px', color: '#fff', margin: '0' }}>搞定法考APP下载</p>
                     </li>
                     <li style={{ marginLeft: '40px', position: 'relative', textAlign: 'center' }}>
                        <img src={scBook} style={{ cursor: 'pointer', width: '100px', height: '100px' }} alt="" />
                        <p style={{ fontSize: '14px', color: '#fff', margin: '0' }}>微信公众号</p>
                     </li>
                  </ul>
               </div>
            </Footer>
         </Content>
      </Layout>
      let examEle = <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#fff' }}></div>}>
         <Switch>
            <Route exact path={'/home/exam'} component={exam} />
            <Route exact path={'/home/exam/examBefore'} component={examBefore} />
         </Switch>
      </Suspense >
      let endEle = window.location.hash.search('/home/exam') > -1 ? examEle : Ele
      return endEle
   }
}
export default withRouter(Home);



