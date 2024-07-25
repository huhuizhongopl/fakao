
import React, { Component } from 'react'; 
import { Modal, Button, Divider, Input  } from 'antd'; 
import { LockOutlined, WechatOutlined, CloseCircleOutlined, LeftOutlined, LockFilled, MobileOutlined, InsuranceOutlined, InsuranceFilled } from '@ant-design/icons';
import s from './loginCpt.module.scss';
let timeId
export default class LoginCpt extends Component {

   constructor(props){
      super(props);
      this.state={
         pwdLogin:false,
         codeLogin:false,
         logPhoneStatu:'',
         logCodeStatu:'',
         getCodeStatu:false,
         logPwdStatu:false,
         codeSecond:60,
         logPhone: '',
         logCode: '',
         logPwd:''
      }
      LoginCpt._this = this;
   }
   
   componentDidMount() {
   }
   async logCodeFn(){
      const regex = /^1[3456789]\d{9}$/;
      if (!this.state.logPhone || !regex.test(this.state.logPhone)) {
         this.setState({
            logPhoneStatu: true
         })
         return
      }else{
         this.setState({
            logPhoneStatu: false
         })
      }
      if (this.state.codeLogin){
         if (!this.state.logCode) {
            this.setState({
               logCodeStatu: true
            })
            return
         }else {
            this.setState({
               logCodeStatu: false
            })
         }
      }
      if (this.state.pwdLogin) {
         if (!this.state.logPwd) {
            this.setState({
               logPwdStatu: true
            })
            return
         } else {
            this.setState({
               logPwdStatu: false
            })
         }
      }
      let obj={}
      if (this.state.codeLogin) {
         obj = { phone: this.state.logPhone, code: this.state.logCode, clientType: 'web' }
      }
      if (this.state.pwdLogin){
         obj = { phone: this.state.logPhone, password: this.state.logPwd, clientType: 'web' }
      }
      //先用测试数据
      obj = { phone: 15268133808, password: 111111, clientType: 'web' }
      await React.$http.get('/user/login', obj).then(res=>{
         if (res.code === 1) {
            React.$message({
               type: 'success',
               content: '登录成功'
            }) 
            this.props.loginFn(false)
            let obj = JSON.stringify(res.data || {})
            sessionStorage.setItem('token', res.data.token)
            sessionStorage.setItem('fkUserData', obj)
         } else {
            React.$message({
               type: 'error',
               content: res.message
            }) 
         }
      })
      
   }
   //登录发送验证码
   async sendLogCode() {
      const regex = /^1[3456789]\d{9}$/;
      if (!this.state.logPhone || !regex.test(this.state.logPhone)){
         this.setState({
            logPhoneStatu:true
         })
         return
      }else {
         this.setState({
            logPhoneStatu: false
         })
      }
      this.setState({
         getCodeStatu: true,
         codeSecond: 60
      })
      timeId=setInterval(()=>{
         if (this.state.codeSecond <=1){
            clearInterval(timeId)
            this.setState({
               getCodeStatu: false,
               codeSecond: 60
            })
         }
         this.state.codeSecond--
         this.setState({
            codeSecond: this.state.codeSecond
         })
      },1000)
      let res = await React.$http.get('/user/sendCodeForRegister?phone='+this.state.logPhone)
      if(res.code===1){
         React.$message({
            type: 'success',
            content: '发送验证码成功'
         }) 
      }
   }
   render() {
      let that = LoginCpt._this
      const { showLogin } = that.props
      let { pwdLogin, codeLogin, logPhoneStatu, logCodeStatu, getCodeStatu, codeSecond,logPwdStatu} = that.state
      let logEle = <div className={s.logEleWrap}>
         <img style={{ width: '88px', height: '88px', marginBottom: '16px' }} src="https://img.juexiaotime.com/userAdmin/login/logo-fk.png" alt="" />
         <img style={{ width: '220px', height: '26px', marginBottom: '20px' }} src="https://img.juexiaotime.com/userAdmin/login/title-fk.png" alt="" />
         <Button onClick={() => { that.setState({ codeLogin:true,pwdLogin:false})}} style={{ width: '300px', marginBottom: '16px' }} type="primary" size='large' shape='round' >验证码登录</Button>
         <Button onClick={() => { that.setState({ codeLogin: false, pwdLogin: true })}} style={{ width: '300px', marginBottom: '16px' }} size='large' shape='round' >密码登录</Button>
         <Divider className={s.DividerOne} plain>其他登录方式</Divider>
         <WechatOutlined className={s.logWeChatIcon} />
         <p className={s.btmText}>登录注册代表同意《<span>觉晓科技用户协议</span>》、《<span>隐私政策</span>》</p>
         <CloseCircleOutlined className={s.btmCloseCircle} onClick={() => { that.props.loginFn(false) }} />
         </div>
      let codeEle = <div className={s.logEleWrap}>
         <h2 className={s.logModalTitle}><LeftOutlined onClick={() => { that.setState({ codeLogin: false, pwdLogin: false }) }} className={s.logLeftArrow}/>验证码登录</h2>
         <Input type='number' status={logPhoneStatu ? 'error' : ''} onBlur={(val) => { that.state.logPhone = val.target.value }} allowClear maxLength={11} style={{ borderRadius: '20px' }} size="large" placeholder="请输入手机号" prefix={<MobileOutlined style={{ color: '#ccc', appearance: 'none'}}/>}/>
         <p className={s.logErrTip}> {logPhoneStatu?'请输入正确的手机号':''}</p>
         <Input onBlur={(val) => { that.state.logCode = val.target.value }} suffix={getCodeStatu ? <span className={s.getLogNameFalse}>重新获取({codeSecond})</span> : <span onClick={() => { that.sendLogCode() }} className={s.getLogName}>获取验证码</span>} status={logCodeStatu?'error':''} allowClear maxLength={6} style={{ borderRadius: '20px' }} size="large" placeholder="请输入验证码" prefix={< InsuranceOutlined style={{ color: '#ccc' }} />} />
         <p className={s.logErrTip}>{logCodeStatu?'请输入正确的验证码':''}</p>
         <Button style={{ width: '100%', marginBottom: '20px' }} type="primary" size='large' shape='round' onClick={() => { that.logCodeFn() }}>注册/登录</Button>
         <p className={s.btmText}>未注册的用户验证通过后将自动注册，登录注册代表同意《<span>觉晓科技用户协议</span>》、《<span>隐私政策</span>》</p>
         <Divider className={s.DividerOne} plain>其他登录方式</Divider>
         <div className={s.logBtmIcon}><LockFilled onClick={() => { that.setState({ codeLogin: false, pwdLogin: true }) }}  className={s.logLockFill}/><WechatOutlined className={s.logWeChatIcon}/></div>
         <CloseCircleOutlined className={s.btmCloseCircle} onClick={() => { that.props.loginFn(false) }} />
         </div>
      let pwdEle = <div className={s.logEleWrap}>
         <h2 className={s.logModalTitle}><LeftOutlined onClick={() => { that.setState({ codeLogin: false, pwdLogin: false }) }} className={s.logLeftArrow} />账号密码登录</h2>
         <Input type='number' status={logPhoneStatu ? 'error' : ''} onBlur={(val) => { that.state.logPhone = val.target.value }} allowClear maxLength={11} style={{ borderRadius: '20px' }} size="large" placeholder="请输入手机号" prefix={<MobileOutlined style={{ color: '#ccc', appearance: 'none' }} />} />
         <p className={s.logErrTip}> {logPhoneStatu ? '请输入正确的手机号' : ''}</p>
         <Input.Password status={logPwdStatu ? 'error' : ''} onBlur={(val) => { that.state.logPwd = val.target.value }} 
             allowClear maxLength={8} style={{ borderRadius: '20px' }} size="large" placeholder="请输入密码" prefix={<LockOutlined  style={{ color: '#ccc' }} />} />
         <p className={s.logErrTip} style={{marginBottom:'16px'}}>{logPwdStatu ? '请输入正确的密码' : ''}<span>忘记密码</span></p>
         <Button style={{ width: '100%', marginBottom: '20px' }} type="primary" size='large' shape='round' onClick={() => { that.logCodeFn() }}>登录</Button>
         <Divider className={s.DividerOne} plain>其他登录方式</Divider>
         <div className={s.logBtmIcon}><InsuranceFilled onClick={() => { that.setState({ codeLogin: true, pwdLogin: false }) }} className={s.logLockFill} /><WechatOutlined className={s.logWeChatIcon} /></div>
         <CloseCircleOutlined className={s.btmCloseCircle} onClick={() => { that.props.loginFn(false) }} />
      </div>
      return (
            <Modal
               className={s.loginModal}
               centered
               closable={false}
               visible={showLogin}
               onCancel={() => { that.props.loginFn(false) }} 
               footer={null}
               maskClosable={false}
               destroyOnClose={true} 
               width='400px'
            >
            {codeLogin ? codeEle : pwdLogin ? pwdEle : logEle}
            </Modal>
      );
  }

}



