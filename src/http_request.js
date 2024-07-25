import axios from 'axios';

axios.defaults.timeout = 8000; // 8秒超时;
axios.defaults.baseURL ="http://dt.80gd.cn:9999"
// 请求拦截器;
axios.interceptors.request.use(function(config) {
  
  // 如果是登录接口，是不需要携带token
  if (!config.url.includes('/user/login')) {
    // 在请求头携带token"Bearer "+-path+json
    config.headers['access-token'] =  sessionStorage.getItem('token');
    config.headers['content-type'] = "application/json"; 
  }
  return config; 
});

// 响应拦截器 
axios.interceptors.response.use(function(res) {
  // 对响应的数据结果进行加工处理
  return res.data; 
});

class Http {

  // get请求封装
  get(url, params){ 
    return new Promise((resolve, reject) =>{  
      axios.get(url, {            
          params: params        
      })        
      .then(res => {            
          resolve(res);        
      })        
      .catch(err => {            
          reject(err.data)        
      })
    });
  }

  // post封装
  post(url, params) { 

    return new Promise((resolve, reject) => {         
        axios.post(url, params)        
        .then(res => {            
            resolve(res);        
        })        
        .catch(err => {            
            reject(err.data)        
        })    
    });
    
  }
  
}

export default new Http();

