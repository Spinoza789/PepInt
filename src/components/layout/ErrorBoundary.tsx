import {Component,type ErrorInfo,type ReactNode} from 'react';
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error,info:ErrorInfo){console.error('Interactive scene failed',error,info.componentStack);}
 render(){if(this.state.failed)return <div className="scene-loading" role="alert"><h2>This interactive view could not start.</h2><p>Your browser may not support the required graphics features. The text explanations and sources remain available after reloading.</p><button className="icon-action" onClick={()=>window.location.reload()}>Reload experience</button></div>;return this.props.children;}
}
