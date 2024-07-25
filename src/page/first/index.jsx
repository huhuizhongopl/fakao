
import React, { Component } from 'react'; 
import { withRouter } from "react-router-dom"; 
import s from './first.module.scss';

class first extends Component {

  constructor(props){
     super(props);
     this.state = {
     }
     first._this = this;
  }
  
  componentDidMount(){

  }
  
   render() {
      let that = first._this
      return ( 
         <div>first</div>
      );
  }

}
export default withRouter(first);



