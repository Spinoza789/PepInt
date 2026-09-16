import {Pause,Play,RotateCcw} from 'lucide-react';
import {Area,AreaChart,CartesianGrid,ReferenceDot,ReferenceLine,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {usePKModel} from '../../hooks/usePKModel';
import {useExperienceStore} from '../../state/useExperienceStore';
import {ABSORPTION_DAYS,doseDays} from '../../lib/pk';
export function HalfLifeExperience(){
 const s=useExperienceStore(),{series,concentration}=usePKModel();
 const ymax=Math.max(1.1,...series.map(p=>p.concentration))*1.1;
 return <section className="body-timeline" aria-label="Peptide concentration timeline">
  <div className="timeline-heading"><div><span className="panel-kicker">SIMPLIFIED PHARMACOKINETIC MODEL</span><h2>Retatrutide over time <span>· illustrative</span></h2></div><div className="timeline-reading">Day <strong>{s.currentTimeDays.toFixed(1)}</strong><small>{concentration.toFixed(2)} relative units</small></div></div>
  <div className="timeline-graph"><ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{top:9,right:20,left:-15,bottom:0}}>
   <defs><linearGradient id="pkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42c8c4" stopOpacity={.3}/><stop offset="1" stopColor="#42c8c4" stopOpacity={0}/></linearGradient></defs>
   <CartesianGrid stroke="#24313a" vertical={false}/><XAxis type="number" dataKey="day" domain={[0,42]} ticks={[0,7,14,21,28,35,42]} tick={{fill:'#a1b5be',fontSize:10}} tickFormatter={v=>`${v}d`} axisLine={false} tickLine={false}/>
   <YAxis type="number" domain={[0,ymax]} tick={{fill:'#8fa7b1',fontSize:10}} tickCount={4} tickFormatter={v=>v.toFixed(1)} axisLine={false} tickLine={false}/>
   <Tooltip contentStyle={{background:'#10212b',border:'1px solid #37505a',fontSize:11}} labelFormatter={v=>`Day ${v}`} formatter={v=>[Number(v).toFixed(2),'Relative concentration']}/>
   {doseDays(s.dosingMode).map(day=><ReferenceLine key={day} x={day} stroke="#517278" strokeDasharray="2 5"/>)}
   <ReferenceLine x={s.currentTimeDays} stroke="#e3b47e"/>
   <Area dataKey="concentration" type="linear" stroke="#4bd1cc" strokeWidth={2} fill="url(#pkFill)" isAnimationActive={false}/>
   <ReferenceDot x={s.currentTimeDays} y={concentration} r={4} fill="#e3b47e" stroke="#07111c"/>
  </AreaChart></ResponsiveContainer></div>
  <label className="timeline-slider" htmlFor="pk-time"><span>Day {s.currentTimeDays.toFixed(1)}</span><input id="pk-time" type="range" min="0" max="42" step=".1" value={s.currentTimeDays} onChange={e=>s.setCurrentTimeDays(+e.target.value)}/><span>42</span></label>
  <div className="timeline-actions"><button className="icon-action" aria-label={s.timelinePlaying?'Pause timeline':'Play timeline'} onClick={()=>s.setTimelinePlaying(!s.timelinePlaying)}>{s.timelinePlaying?<Pause size={15}/>:<Play size={15}/>} {s.timelinePlaying?'Pause':'Play'}</button><button className="icon-action" aria-label="Reset timeline" onClick={()=>{s.setTimelinePlaying(false);s.setCurrentTimeDays(0);}}><RotateCcw size={14}/></button>
   <select aria-label="Illustrative dose mode" value={s.dosingMode} onChange={e=>s.setDosingMode(e.target.value as 'single'|'weekly')}><option value="single">Single illustrative dose</option><option value="weekly">Illustrative weekly repeats</option></select>
   <label className="half-life-setting">Example half-life <input aria-label="Educational half-life in days" type="number" min={3} max={12} step={.5} value={s.halfLifeDays} onChange={e=>s.setHalfLifeDays(+e.target.value)}/> days</label>
  </div>
  <details className="model-notes"><summary>How to read this model · not a dosing calculator</summary><p>1.0 is the isolated-dose peak reference in both modes. Repeats add together and may exceed 1.0. The first {ABSORPTION_DAYS} day is an invented rise phase, followed by exponential elimination. During elimination, one half-life reduces the remaining concentration by half.</p><p>The 6-day example is approximate. Cyan particle brightness is an illustrative encoding of relative concentration, not measured organ exposure, receptor occupancy, efficacy, or a clinical outcome. The weekly pattern is only an arithmetic example. Real pharmacokinetics vary.</p></details>
 </section>;
}
