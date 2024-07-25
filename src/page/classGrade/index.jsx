
import React, { Component } from 'react'; 
import { withRouter } from "react-router-dom"; 
import s from './classGrade.module.scss';

class classGrade extends Component {

  constructor(props){
     super(props);
     this.state = {
     }
     classGrade._this = this;
  }
  
  componentDidMount(){

  }
  
   render() {
      let that = classGrade._this
      return ( 
         <div>classGrade</div>
      );
  }

}
export default withRouter(classGrade);



