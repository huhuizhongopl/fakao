
import React, { Component } from 'react'; 
import { withRouter } from "react-router-dom";
import s from './download.module.scss';

class download extends Component {

  constructor(props){
     super(props);
     this.state = {
     }
     download._this = this;
  }
  
  componentDidMount(){

  }
  
   render() {
      let that = download._this
      return ( 
         <div>download</div>
      );
  }

}
export default withRouter(download);



