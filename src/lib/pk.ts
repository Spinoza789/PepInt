export type DosingMode = 'single' | 'weekly';
export const ABSORPTION_DAYS = .75;
export const MAX_DAYS = 42;
/** Educational, piecewise absorption followed by exponential elimination.
 * 1 = the SAME isolated-dose peak reference in both modes. Accumulation may exceed 1.
 * No dose amounts, clinical units, or experimentally measured occupancy parameters.
 */
export function singleCurve(elapsed:number,halfLifeDays:number):number {
  if (elapsed<=0) return 0;
  if (!Number.isFinite(halfLifeDays)||halfLifeDays<=0) throw new RangeError('Half-life must be positive.');
  if (elapsed<ABSORPTION_DAYS) return elapsed/ABSORPTION_DAYS;
  return Math.exp(-Math.LN2*(elapsed-ABSORPTION_DAYS)/halfLifeDays);
}
export function doseDays(mode:DosingMode){return mode==='single'?[0]:[0,7,14,21,28,35];}
export function concentrationAt(timeDays:number,halfLifeDays:number,dosingMode:DosingMode){
  return doseDays(dosingMode).reduce((sum,day)=>sum+singleCurve(timeDays-day,halfLifeDays),0);
}
/** Arbitrary saturating VISUAL response. EC50 is not a measured retatrutide value. */
export function effectAt(concentration:number,illustrativeEC50=.5){return Math.max(0,concentration)/(Math.max(0,concentration)+illustrativeEC50);}
export function makePKSeries(halfLifeDays:number,mode:DosingMode,maxDays=MAX_DAYS){
 return Array.from({length:maxDays*8+1},(_,i)=>{const day=i/8,concentration=concentrationAt(day,halfLifeDays,mode);return {day,concentration,effect:effectAt(concentration)};});
}
