
import React, { Component } from 'react'; 
import { withRouter } from "react-router-dom"; 
import s from './lesson.module.scss';

class lesson extends Component {

  constructor(props){
     super(props);
     this.state = {
     }
     lesson._this = this;
  }
  
  componentDidMount(){

  }
  
   render() {
      let that = lesson._this
      return ( 
         <div>lesson</div>
      );
  }

}
export default withRouter(lesson);



