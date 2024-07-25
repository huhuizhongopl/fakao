import React, { Component } from 'react';
import { Route, Switch, withRouter } from "react-router-dom";
import { message } from 'antd'
import './App.css';
import Home from '@/page/home';
import http from './http_request.js'
import PubSub from 'pubsub-js'
// const  = lazy(() => import(''));
// 全局挂载组件
React.$message = function (arg) {// 默认部分参数
  const { type = 'success', content, duration = 1, onclose } = { ...arg }
  message[type](content, duration, onclose)
}
React.$http = http
// 未匹配路由  
function NoMatch() {
  return <div>没匹配到路由!!!</div>
}

class App extends Component {

  render() {
    let url = this.props.history.location.pathname || ''
    if (!url.includes('/home/test') && !sessionStorage.getItem('token')) {
      PubSub.publish('loginFn', true)
      React.$message({ type: 'error', content: '请您先登录' })
    }
    return (

      <div className="app">

        <div className='body'>
          {/* <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#fff' }}></div>}> */}
          <Switch>
            <Route path='/' component={Home} />
            <Route component={NoMatch} />
          </Switch>
          {/* </Suspense > */}
        </div>

      </div>
    );
  }

}


export default withRouter(App);
