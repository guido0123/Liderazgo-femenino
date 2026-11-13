const assert=require('node:assert/strict');
const level=n=>n<=7?1:n<=11?2:3;
const priorities=scores=>scores.slice().sort((a,b)=>a.score-b.score).slice(0,3);
assert.equal(level(3),1);assert.equal(level(7),1);assert.equal(level(8),2);assert.equal(level(11),2);assert.equal(level(12),3);assert.equal(level(15),3);
const s=[{id:'a',score:9},{id:'b',score:3},{id:'c',score:8},{id:'d',score:6},{id:'e',score:12},{id:'f',score:11},{id:'g',score:10},{id:'h',score:7}];
assert.deepEqual(priorities(s).map(x=>x.id),['b','d','h']);
const totals=[1,2,3].map((_,i)=>[i+1,i+1,i+1].reduce((a,b)=>a+b,0));assert.deepEqual(totals,[3,6,9]);
console.log('OK: rangos de nivel, selección de tres prioridades y suma por dominio.');
