
import React, { Component } from 'react'; 
import { withRouter } from "react-router-dom"; 

class LawCpt extends Component {

  constructor(props){
     super(props);
     this.state = {
     }
     LawCpt._this = this;
  }
  
  componentDidMount(){

  }
  
   render() {
      let that = LawCpt._this
      return ( 
            <iframe style={{ width: '100%', height: '105%',border:0 ,minHeight:'86vh'}} importance='high' src="http://hu0416.cn/lawDoc/" ></iframe>
        
      );
  }

}
export default withRouter(LawCpt);



