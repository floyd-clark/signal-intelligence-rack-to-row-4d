import{g as Ie,u as b,r as h,j as p,B as Re,C as ge,a as Pe,h as P,V as v,S as Ce,b as we,c as Oe,d as Ue,R as Te,I as De,F as re,e as Y,f as O,W as ze,i as te,k as ve,l as Be,U as se,m as ae,n as be,M as Se,o as U,L as Ne,p as We,q as Fe,s as He,H as Ge,t as ce,D as qe,v as Ve,P as $e,w as Ke,x as Xe,y as L}from"./index-CPvhn5I6.js";import{a as Je,A as T,m as D,r as V,p as N,u as R,b as z,c as Qe,_ as Z,C as Ye,O as Ze,R as et}from"./OrbitControls-4IETX8Tw.js";function Ee(i,e,o,r=1){const t=i.find(l=>l.type==="pump").id;i.find(l=>l.type==="cdu").id;const n=Ie(i).filter(l=>l.from===t&&l.kind==="coolant"),s=[],a=o?-(e-1)*.95-2.1:-2.1;for(const l of n){const u=Number(l.to.match(/\/R(\d+)\//)[1]);if(!o&&u!==r)continue;const c=o?(u-1-(e-1)/2)*1.9:0;for(const[f,d,m,y]of[[-.62,4.65,-1.9,"supply"],[.62,4.42,-2.1,"return"]])s.push({source:t,target:l.to,kind:"coolant",points:[[a+.58,2.8,y==="supply"?-1.4:-1.6],[a+.58,3.2,m],[a+.58,d,m],[c+f,d,m],[c+f,4,-1.48]],radius:.038,material:y})}return s}function B({asset:i}){const e=b(u=>u.selected),o=b(u=>u.set),r=b(u=>u.drill),[t,n]=h.useState(""),s=i.owners.get(t||e),a=s&&(!s.kind.startsWith("Rack cabinet")||t)?s:void 0,l=h.useMemo(()=>a?new Re(a.bounds,new ge(t?"#d5eaff":"#66baff")):null,[a,t]);return h.useEffect(()=>{const u=Pe(i.group.uuid,i.owners);return()=>{u(),i.dispose()}},[i]),h.useEffect(()=>()=>{l?.geometry.dispose(),l?.material?.dispose()},[l]),p.jsxs("group",{onClick:u=>{const c=V(u.object,u.faceIndex);if(c){u.stopPropagation();const f=Number(c.match(/\/R(\d+)\//)?.[1]);o({selected:c,...f?{rack:f}:{}})}},onDoubleClick:u=>{const c=V(u.object,u.faceIndex);if(c){u.stopPropagation();const f=Number(c.match(/\/R(\d+)\//)?.[1]);f&&o({rack:f}),r(c)}},onPointerMove:u=>{const c=V(u.object,u.faceIndex);c&&(u.stopPropagation(),c!==t&&(n(c),o({hovered:c})),document.body.style.cursor="pointer")},onPointerOut:()=>{n(""),o({hovered:""}),document.body.style.cursor="auto"},children:[p.jsx("primitive",{object:i.group,dispose:null}),l&&p.jsx("primitive",{object:l,raycast:()=>null,dispose:null})]})}function tt({records:i,focus:e}){const o=b(),r=e.type==="accelerator"?e:i.find(n=>n.id===e.parentId),t=h.useMemo(()=>{const n=new T,s=i.filter(l=>l.parentId===r.id&&l.type==="hbm"),a=i.find(l=>l.parentId===r.id&&l.type==="cold-plate");return Je(n,r.id,s.map(l=>l.id),a.id,{cutaway:e.type==="cold-plate"?!1:o.cutaway,explode:o.explode?o.explosion:0,selected:e.id,architecture:r.vendorProfile==="GOOGLE_IRONWOOD_TPU_REFERENCE"?"ironwood":"gpu"}),P.scope="Package/interposer — conceptual exposed section, original geometry",n.finish(D(o.quality))},[r.id,e.id,o.cutaway,o.explode,o.explosion,o.quality]);return p.jsx(B,{asset:t})}function G(i,e,o,r,t,n){i.box(e,"steel",[0,o,0],[1.23,r,2.01],.1),i.box(e,t==="compute"?"aluminum":"steel",[0,o,1.02],[1.24,r*.88,.035],.1);for(const s of[-.58,.58])i.box(e,"polymer",[s,o,1.058],[.065,r*.72,.04],.15),i.pipe(e,"edge",[[s-.013,o-r*.28,1.08],[s-.013,o+r*.28,1.12],[s+.013,o+r*.28,1.12],[s+.013,o-r*.28,1.08]],.006,5),i.box(e,"supply",[s,o-r*.23,1.12],[.04,.018,.008]);if(t==="storage")for(let s=0;s<12;s++){const a=-.49+s*.089;i.box(e,"polymer",[a,o,1.055],[.074,r*.72,.035],.1),i.box(e,"label",[a,o+r*.16,1.079],[.045,.012,.002]),i.box(e,"supply",[a,o-r*.2,1.08],[.028,.01,.003])}else if(t==="switch"){for(let s=0;s<3;s++)N(i,e,[.2+s*.12,o,1.045],.07,r*.5);for(let s=0;s<18;s++)i.box(e,"black",[-.49+s*.026,o,1.045],[.01,r*.55,.007])}else if(t==="network")for(let a=0;a<16;a++){const l=-.5+a*.0625;N(i,e,[l,o,1.045],.055,r*.46),n&&i.pipe(e,"polymer",[[l,o,1.12],[l,o-.03,1.23],[l*1.02,o-.09,1.25]],.006,5)}else{for(let s=0;s<(n?16:8);s++)for(let a=0;a<2;a++)i.box(e,"black",[-.49+s*(n?.026:.05),o+(a-.5)*r*.25,1.04],[.012,r*.16,.004]);for(let s=0;s<4;s++)N(i,e,[.03+s*.102,o,1.05],.077,r*.46);N(i,e,[.46,o,1.05],.05,r*.44)}if(i.box(e,"led",[-.51,o+r*.25,1.05],[.012,.012,.008]),n)for(const s of[-.54,.54])i.cylinder(e,"edge",[s,o,1.063],.009,.005,[Math.PI/2,0,0],6);i.owners.get(e).kind=`${t} service chassis, recessed faceplate, ports/perforations, extraction tabs and status lamp`}function ke(i,e,o,r,t,n){i.box(e,"steel",[0,r,0],[1.25,t,1.85],.1),o.forEach((s,a)=>{const l=-.51+a*.205;if(i.box(s,"aluminum",[l,r,.85],[.187,t*.8,.21],.12),i.cylinder(s,"black",[l-.025,r,.966],Math.min(t*.32,.065),.01,[Math.PI/2,0,0]),n){i.ring(s,"edge",[l-.025,r,.974],Math.min(t*.32,.065),.003,[0,0,0]);for(let u=0;u<4;u++)i.box(s,"steel",[l-.075+u*.026,r,.979],[.003,t*.55,.004])}i.box(s,"polymer",[l+.058,r,.98],[.024,t*.65,.025]),i.box(s,"supply",[l+.058,r-t*.22,1.001],[.018,.01,.008]),i.box(s,"led",[l+.055,r+t*.22,1.001],[.008,.008,.005]),i.owners.get(s).kind="Rectifier/PSU module with fan aperture, extraction latch and status LED"})}function le(i,e,o){i.withTransform(o,[1,1,1],()=>{i.box(e,"steel",[0,-.2,0],[.8,.08,.48],.1),i.cylinder(e,"aluminum",[0,0,0],.16,.5,[0,0,Math.PI/2],16),i.ring(e,"steel",[-.28,0,0],.2,.06,[0,Math.PI/2,0]),i.cylinder(e,"steel",[-.28,0,0],.15,.1,[0,0,Math.PI/2]);for(let r=0;r<8;r++)i.box(e,"edge",[-.16+r*.045,.15,0],[.015,.07,.22]);i.pipe(e,"aluminum",[[-.28,0,0],[-.5,0,0],[-.5,.6,0]],.06),i.pipe(e,"aluminum",[[-.28,.13,0],[-.28,.33,0],[.42,.33,0]],.06);for(const r of[-.3,.3])i.bolt(e,[r,-.15,.17],.035)}),i.owners.get(e).kind="Motor-driven secondary pump with finned motor, volute, suction/discharge ports and bolted mounting foot"}function _e(i,e,o,r){i.withTransform(o,[1,1,1],()=>{const t=e.cdu;i.box(t,"steel",[0,.12,0],[1.3,.18,1.55],.12),i.box(t,"aluminum",[0,3.35,0],[1.3,.09,1.55],.1);for(const n of[-.62,.62])for(const s of[-.72,.72])i.box(t,"steel",[n,1.75,s],[.045,3.3,.045]);i.box(t,"steel",[0,1.75,-.73],[1.25,3.1,.03]),r||i.box(t,"steel",[-.64,1.75,0],[.025,3.1,1.5]),i.box(t,"aluminum",[0,2.96,.75],[1.23,.6,.04],.08),i.box(t,"black",[-.24,3.02,.78],[.51,.25,.02],.08),i.box(t,"supply",[-.24,3.02,.792],[.43,.16,.005]);for(let n=0;n<8;n++)i.box(t,"black",[.35,2.8+n*.045,.78],[.3,.018,.01]);le(i,e.pump,[-.06,.7,.1]),le(i,e["spare-pump"],[-.06,1.46,.1]);for(let n=0;n<14;n++)i.box(e["heat-exchanger"],"aluminum",[-.38+n*.055,2.35,-.23],[.033,.87,.65],.08);for(const n of[-.46,.46])i.pipe(e["secondary-loop"],n<0?"supply":"return",[[n,.4,.5],[n,2,.5],[n,2.8,.25],[.58,2.8,n<0?-.7:-.9]],.05);for(const n of[1.9,2.6])i.cylinder(e["secondary-loop"],"aluminum",[.46,n,.56],.11,.06,[Math.PI/2,0,0]),i.cylinder(e["secondary-loop"],"label",[.46,n,.6],.09,.01,[Math.PI/2,0,0]),i.box(e["secondary-loop"],"black",[.47,n+.015,.608],[.006,.09,.004]),i.ring(e["secondary-loop"],"return",[.46,n-.22,.5],.11,.013,[0,0,0]);i.owners.get(t).kind="CDU service cabinet with control panel, redundant pump pair, plate heat exchanger, gauges, isolation wheels and connected loop pipes"})}function nt({records:i,focus:e}){const o=b(),r=h.useMemo(()=>{const t=new T,n=e.id;if(e.type==="psu"){t.box(n,"aluminum",[0,.2,0],[1.1,.5,2],.1),t.cylinder(n,"black",[-.15,.2,1.02],.2,.025,[Math.PI/2,0,0]),t.ring(n,"steel",[-.15,.2,1.05],.2,.014,[0,0,0]);for(let s=0;s<8;s++)t.box(n,"aluminum",[-.33+s*.052,.2,1.065],[.008,.38,.008]);t.pipe(n,"edge",[[.32,.04,1.07],[.32,.4,1.23],[.48,.4,1.23],[.48,.04,1.07]],.025),t.box(n,"supply",[.4,.05,1.1],[.16,.08,.04]),t.box(n,"gold",[0,.15,-1.05],[.42,.22,.08]);for(let s=0;s<8;s++)t.box(n,"black",[-.2+s*.055,.15,-1.1],[.02,.2,.01]);t.owners.get(n).kind="Service PSU cartridge with fan grille, retention handle and blind-mate power contacts"}else if(e.type==="power-shelf")t.withTransform([0,0,0],[4,4,4],()=>ke(t,n,i.filter(s=>s.parentId===n&&s.type==="psu").map(s=>s.id),.1,.16,!0));else if(["pump","spare-pump","cdu","heat-exchanger","primary-loop","secondary-loop"].includes(e.type)){const s=Object.fromEntries(i.filter(a=>a.physicalLocation.rack==="SHARED").map(a=>[a.type,a.id]));_e(t,s,[0,0,0],!0)}else if(e.family==="network")t.withTransform([0,0,0],[3,3,3],()=>G(t,n,.2,.18,"network",!0));else{t.box(n,"pcb",[0,0,0],[1.6,.07,1.1],.08),t.box(n,"polymer",[0,.22,0],[.56,.35,.55],.12),t.cylinder(n,"edge",[0,.46,0],.2,.09);for(let s=0;s<8;s++)t.box(n,"gold",[-.65+s*.18,.06,.4],[.07,.025,.09]),t.box(n,"ceramic",[-.65+s*.18,.08,-.4],[.07,.05,.09]);for(const s of[-.67,.67])for(const a of[-.42,.42])t.bolt(n,[s,.07,a],.04);t.owners.get(n).kind="Illustrative instrumentation/service module in board context; not a vendor mechanical drawing"}return t.finish(D(o.quality))},[e.id,i,o.quality]);return p.jsx(B,{asset:r})}const ue=new Map;function ot({records:i}){const e=b(),{camera:o,controls:r,size:t}=R();h.useEffect(()=>{const d=m=>{if(["INPUT","SELECT","TEXTAREA"].includes(m.target.tagName)||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","-","="].includes(m.key))return;m.preventDefault();const y=r&&"target"in r?r.target:new v(0,2,0),x=new Ce().setFromVector3(o.position.clone().sub(y));m.key==="ArrowLeft"&&(x.theta-=.12),m.key==="ArrowRight"&&(x.theta+=.12),m.key==="ArrowUp"&&(x.phi-=.1),m.key==="ArrowDown"&&(x.phi+=.1),(m.key==="+"||m.key==="=")&&(x.radius*=.9),m.key==="-"&&(x.radius*=1.1),x.makeSafe(),o.position.copy(new v().setFromSpherical(x).add(y)),o.lookAt(y),r&&r.update()};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[o,r]);const n=h.useRef(!1),s=h.useRef(null),a=h.useRef(new v(0,2,0)),l=`${e.profile}:${e.view}:${e.view==="row"?"all":e.rack}:${e.focus}`,u=i.find(d=>d.id===e.focus),c=h.useRef(l),f=h.useRef(e.cameraKey);return h.useEffect(()=>{const d=c.current!==l;n.current=!!u&&!["tray","board","accelerator","hbm","cold-plate"].includes(u.type),d&&(ue.set(c.current,{position:o.position.clone(),target:r&&"target"in r?r.target.clone():a.current.clone()}),c.current=l);const m=ue.get(l);if(m&&d)n.current=!1,s.current=m.position.clone(),a.current.copy(m.target);else{const y=e.view==="row",x={isometric:[6,4.7,7],front:[0,2.2,8],orthographic:[0,2.2,8],rear:[0,2.2,-8],"rear-service":[-5.5,4.7,-7],left:[-8,2.2,0],right:[8,2.2,0],top:[0,10,.01],inside:[2,4,3],plumbing:[3,3,-5],aisle:[10,5,13],graph:[0,9,9]},g=x[e.camera]||x.isometric;if(s.current=new v(g[0]*(y?1.8:e.focus?.5:1),g[1]*(y?1.5:e.focus?.5:1),g[2]*(y?1.8:e.focus?.5:1)),a.current.set(0,e.focus?1:e.height,0),y&&(a.current.set(-.9,2.45,-.3),s.current.set(e.camera.startsWith("rear")?-e.racks*1.4:e.racks*1.4,7,e.camera.startsWith("rear")?-e.racks*1.8:e.racks*1.8)),u&&["tray","board"].includes(u.type)&&(a.current.set(0,.1,0),s.current.set(6.8,6.4,8.5),e.camera==="top"&&s.current.set(.01,11,.01),e.camera==="rear"&&s.current.set(-6.8,6.4,-8.5)),u&&["accelerator","hbm","cold-plate"].includes(u.type)&&(a.current.set(0,.15,0),s.current.set(2.8,2.7,3.5),u.type==="hbm")){const M=Number(u.id.split(".").at(-1))-1;a.current.set(M<2?-.65:.65,.15+(e.explode?e.explosion*.3:0),M%2?-.37:.37),s.current.copy(a.current).add(new v(...{front:[0,.3,1],rear:[-.3,.6,-1],top:[.01,1,.01],right:[1,.4,.1]}[e.camera]||[.6,.65,.8]).normalize().multiplyScalar((e.explode?2:1.4)/(2*Math.tan(38*Math.PI/360)*(t.width/t.height))))}}f.current=e.cameraKey},[e.camera,e.cameraKey,l,e.height,e.explode,e.explosion,o,r,t.width,t.height]),z((d,m)=>{const y=e.reduced?1:1-Math.exp(-8*m);if(n.current&&u&&P.owners[u.id]){const x=P.owners[u.id].bounds;a.current.set((x[0]+x[3])/2,(x[1]+x[4])/2,(x[2]+x[5])/2);const g=new v(x[3]-x[0],x[4]-x[1],x[5]-x[2]).length();s.current=a.current.clone().add(new v(1,.85,1.2).normalize().multiplyScalar(Math.max(.65,g*1.5))),n.current=!1}P.camera=o.position.toArray(),P.target=r&&"target"in r?r.target.toArray():a.current.toArray(),s.current&&(o.position.lerp(s.current,y),r&&"target"in r?(r.target.lerp(a.current,y),r.update()):o.lookAt(a.current),o.position.distanceTo(s.current)<.01&&(!r||!("target"in r)||r.target.distanceTo(a.current)<.01)&&(s.current=null))}),null}function it({records:i}){const e=b(),o=h.useMemo(()=>{const r=new T,t=e.view==="row",n=t?-(e.racks-1)*.95-2.1:-2.1,s=t?(e.racks-1)*.95+.7:.7,a=Object.fromEntries(i.filter(u=>u.physicalLocation.rack==="SHARED").map(u=>[u.type,u.id]));if(e.showCoolant&&e.level>=4&&(t||e.rack<=e.racks-2)){_e(r,a,[n,0,-.7],e.cutaway);const u=Ee(i,e.racks,t,e.rack);for(const c of["supply","return"]){const f=u.filter(m=>m.material===c),d=f.at(-1);d&&r.pipe(d.source,c,d.points,d.radius,24);for(const m of f.slice(0,-1))r.pipe(m.source,c,m.points.slice(-2),m.radius,8)}for(let c=n+.65;c<s;c+=1.9)r.box(a.cdu,"steel",[c,4.78,-2],[.06,.08,.5]),r.box(a.cdu,"steel",[c,4.95,-2],[.04,.4,.04])}if(e.showPower&&e.level>=2){const u=a["row-pdu"];r.box(u,"steel",[n-.25,1.4,1.3],[.8,2.65,.58],.1),r.box(u,"aluminum",[n-.25,1.5,1.61],[.68,2.33,.025]);for(let c=0;c<12;c++)r.box(u,"black",[n-.25,.48+c*.16,1.64],[.12,.08,.035]);r.pipe(u,"black",[[n-.25,2.8,1.3],[n-.25,5.2,.1],[s,5.2,.1]],.065),r.box(u,"steel",[(n+s)/2,5.2,.1],[s-n,.16,.23]);for(let c=0;c<(t?e.racks:1);c++){const f=t?(c-(e.racks-1)/2)*1.9:0;r.pipe(u,"black",[[f+.3,5.14,.1],[f+.3,4.58,.1],[f+.3,4.35,-1.1],[f+.3,4.2,-.7]],.028)}}if(e.showNetwork&&e.level>=3){const u=i.find(c=>c.type==="cable-tray")?.id||a.cdu;for(const c of[.55,1.05])r.box(u,"aluminum",[(n+s)/2,5.65,c],[s-n,.075,.045]);for(let c=n;c<s;c+=.27)r.box(u,"steel",[c,5.61,.8],[.022,.035,.52]);for(let c=0;c<(t?e.racks:1);c++){const f=t?(c-(e.racks-1)/2)*1.9:0;for(const d of[-.03,.03])r.pipe(u,"polymer",[[f-.63+d,4.48,1.15],[f-.63+d,5.3,1.15],[f-.63+d,5.62,.8],[n,5.62,.8]],.009,15)}}const l=a.floor;for(const u of[2.5,4.1,-2.8,-4.4])r.box(l,"aluminum",[(n+s)/2,.006,u],[s-n,.006,.018]);for(let u=Math.floor(n);u<s+1;u++)for(let c=-5;c<6;c++)r.box(l,"steel",[u,.004,c],[.008,.005,1]);return r.box(l,"polymer",[(n+s)/2,.002,3.3],[s-n,.003,1.6]),r.finish(D(e.quality))},[i,e.view,e.racks,e.showCoolant,e.showPower,e.showNetwork,e.cutaway,e.level,e.rack,e.quality]);return p.jsx(B,{asset:o})}function rt(i,e,o){const r=`RACK-${String(e).padStart(2,"0")}`,t=i.find(d=>d.type==="rack"&&d.physicalLocation.rack===r),n=i.filter(d=>d.parentId===t.id&&d.type==="tray"),s=i.filter(d=>d.parentId===t.id&&d.type==="power-shelf"),a=i.filter(d=>d.parentId===t.id&&["scale-up-switch","switch-asic"].includes(d.type)),l=e<=o-2?"compute":e===o-1?"network":"storage",u=t.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE"&&l==="compute",c=u?[...s.slice(0,4),...n.slice(0,10),...a,...n.slice(10),...s.slice(4)]:[...s,...n,...a],f=u?.101:3.5/(c.length+1);return c.map((d,m)=>({record:d,y:.34+m*f,height:f*.87,role:d.type==="power-shelf"?"power":d.type==="tray"?l:"switch"}))}function st(i,e,o){i.box(e,"steel",[0,.12,0],[1.48,.23,2.3],.12),i.box(e,"steel",[0,4.14,0],[1.48,.15,2.3],.12);const r=o.railId||e;for(const t of[-.7,.7])for(const n of[-1.1,1.1])if(i.box(r,"steel",[t,2.13,n],[.055,4.04,.085]),i.box(r,"edge",[t+Math.sign(t)*.012,2.13,n],[.018,4.04,.1]),i.cylinder(e,"black",[t,.01,n],.065,.08),o.detail)for(let s=0;s<38;s++)i.box(e,"black",[t,.31+s*.1,n+.047],[.025,.028,.005]);for(const t of[.27,4.02])for(const n of[-1.07,1.07])i.box(e,"aluminum",[0,t,n],[1.4,.028,.045]);if(o.shell)for(const t of[-.745,.745]){i.box(e,"steel",[t,2.15,0],[.025,3.9,2.1],.08);for(let n=0;n<10;n++)i.box(e,"black",[t+Math.sign(t)*.014,.5+n*.065,.65],[.003,.025,.5])}i.withTransform([-.735,.27,1.15],[1,1,1],()=>{for(const t of[0,1.43])i.box(o.doorId||e,"steel",[t,1.91,0],[.035,3.82,.035]);for(const t of[0,3.82])i.box(o.doorId||e,"steel",[.715,t,0],[1.43,.035,.035]);for(let t=.15;t<3.7;t+=.12)i.box(o.doorId||e,"black",[.715,t,0],[1.38,.008,.008]);i.box(o.doorId||e,"edge",[1.34,1.8,.025],[.027,.28,.03],.1)},[0,o.doors?-Math.PI*.54:0,0]),i.owners.get(e).kind="Rack cabinet with deep service envelope, slotted uprights, plinth, feet and hinged perforated door"}function at(i,e,o,r){const t=`RACK-${String(o).padStart(2,"0")}`,n=e.find(c=>c.type==="rack"&&c.physicalLocation.rack===t),s=c=>e.find(f=>f.type===c&&f.physicalLocation.rack===t)?.id||n.id,a=rt(e,o,r.racks);r.chassis?st(i,n.id,{shell:!r.cutaway,doors:r.doors,detail:r.detail,doorId:s("door"),railId:s("rail")}):i.box(n.id,"steel",[0,.12,0],[1.48,.23,2.3]);let l=a.find(c=>c.record.id===r.selected);if(!l){let c=e.find(f=>f.id===r.selected);for(;c?.parentId&&(l=a.find(f=>f.record.id===c?.parentId),!l);)c=e.find(f=>f.id===c?.parentId)}if(a.filter(c=>c.record.level<=r.level).forEach((c,f)=>{const d=r.explode&&(l?.record.id===c.record.id||!l&&f===4)?r.explode*1.25:0;if(i.withTransform([0,0,d],[1,1,1],()=>{c.role==="power"?ke(i,c.record.id,e.filter(m=>m.parentId===c.record.id&&m.type==="psu").map(m=>m.id),c.y,c.height,r.detail):G(i,c.record.id,c.y,c.height,c.role,r.detail)}),r.coolant&&o<=r.racks-2&&r.level>=4&&c.role==="compute"&&!d){const m=e.find(y=>y.type==="quick-disconnect"&&y.physicalLocation.rack===t&&y.id.endsWith(`-${f+1}`))?.id||s("hose");for(const y of[-.62,.62])i.cylinder(m,"edge",[y,c.y,-1.07],.024,.11,[Math.PI/2,0,0]),i.ring(m,y<0?"supply":"return",[y,c.y,-1.14],.026,.005,[0,0,0]),i.pipe(m,"polymer",[[y,c.y,-1.13],[y*.86,c.y+.045,-1.34],[y*.86,c.y+.065,-1.46],[y,c.y+.08,-1.48]],.014,8)}}),r.coolant&&o<=r.racks-2&&r.level>=4)for(const[c,f,d]of[[-.62,"manifold-supply","supply"],[.62,"manifold-return","return"]]){i.cylinder(s(f),d,[c,2.12,-1.48],.038,3.75);for(const m of[.27,2,3.95])i.ring(s(f),"edge",[c,m,-1.48],.044,.01),i.box(s(f),"steel",[c,m,-1.35],[.1,.06,.2]);i.pipe(s(f),d,[[c,.25,-1.48],[c,.15,-1.6],[c,.15,-1.85]],.038),i.cylinder(s(f),"steel",[c,.15,-1.85],.042,.025,[Math.PI/2,0,0])}if(r.power&&r.level>=2){const c=s("busbar");for(const f of[-.15,.02,.19]){i.box(c,"copper",[f,2.1,-1.22],[.055,3.65,.018]);for(const d of[.45,1.4,2.5,3.7])i.box(c,"black",[f,d,-1.19],[.11,.07,.06]),r.detail&&i.cylinder(c,"edge",[f,d,-1.24],.014,.012,[Math.PI/2,0,0],6)}i.pipe(s("feed-a"),"black",[[.3,4.2,-.7],[.3,4.35,-.7],[.3,4.35,-1.1]],.035)}if(r.network&&r.level>=9){const c=s("fiber");for(let f=0;f<(r.detail?8:3);f++)i.pipe(c,"polymer",[[-.48+f*.11,3.86,1.1],[-.48+f*.11,3.9,1.38],[-.63,4.15,1.38],[-.63,4.48,1.15]],.008,8);if(n.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE")for(let f=0;f<6;f++)i.box(s("scale-up"),"polymer",[-.45+f*.18,2.1,-1.08],[.12,2.9,.13]),i.box(s("scale-up"),"aluminum",[-.45+f*.18,3.6,-1.08],[.13,.08,.14])}const u=s("tor");G(i,u,3.99,.075,"network",r.detail),n.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE"&&G(i,u,3.9,.075,"network",r.detail),i.box(s("asset-tag"),"label",[.56,4.04,1.12],[.12,.04,.005])}function $({records:i,rack:e,offset:o=0,detail:r=!0,affected:t=!1}){const n=b(),s=h.useMemo(()=>{const a=new T;if(at(a,i,e,{racks:n.racks,level:n.level,detail:r&&n.quality!=="Performance",cutaway:n.cutaway||n.xray,doors:n.doors,selected:n.selected,explode:n.explode?n.explosion:0,coolant:n.showCoolant,power:n.showPower,network:n.showNetwork,chassis:n.showChassis}),t&&n.showFaults){const l=i.find(u=>u.type==="rack"&&u.physicalLocation.rack===`RACK-${String(e).padStart(2,"0")}`).id;for(const u of[-.73,.73])a.box(l,"amber",[u,2.12,1.14],[.018,3.95,.018])}return P.scope="Rack cabinet / service equipment — original illustrative dimensions",a.finish(D(n.quality))},[i,e,n.level,n.quality,n.cutaway,n.xray,n.doors,n.explode,n.explosion,n.showCoolant,n.showPower,n.showNetwork,n.showChassis,n.showFaults,t,r]);return p.jsx("group",{position:[o,0,0],children:p.jsx(B,{asset:s})})}function ct({index:i,position:e}){const o=h.useMemo(()=>{const r=document.createElement("canvas");r.width=320,r.height=64;const t=r.getContext("2d");t.fillStyle="#0c1b23",t.fillRect(0,0,320,64),t.strokeStyle="#719695",t.lineWidth=3,t.strokeRect(1.5,1.5,317,61),t.font="36px sans-serif",t.fillStyle="#e6f5f2",t.textAlign="center",t.textBaseline="middle",t.fillText(`Ironwood TPU ${i}`,160,32);const n=new we(r);return n.colorSpace=Oe,new Ue({map:n,depthTest:!1,depthWrite:!1,toneMapped:!1})},[i]);return h.useEffect(()=>()=>{o.map?.dispose(),o.dispose()},[o]),p.jsx("sprite",{position:e,scale:[.92,.184,1],material:o,renderOrder:20,raycast:()=>null})}function fe({records:i,focus:e}){const o=b(),r=e.type==="tray"?e:i.find(a=>a.id===e.parentId),t=h.useMemo(()=>{const a=new T;return Qe(a,i,r,{cutaway:o.cutaway,explode:o.explode?o.explosion:0,level:o.level,quality:o.quality}),P.scope="Compute sled / populated board — original illustrative mechanical arrangement",a.finish(D(o.quality))},[r.id,o.cutaway,o.explode,o.explosion,o.level,o.quality]),n=i.find(a=>a.parentId===r.id&&a.type==="board"),s=i.filter(a=>a.parentId===n?.id&&a.type==="accelerator"&&a.vendorProfile==="GOOGLE_IRONWOOD_TPU_REFERENCE"&&a.level<=o.level);return p.jsxs(p.Fragment,{children:[p.jsx(B,{asset:t}),o.cutaway&&s.map((a,l)=>p.jsx(ct,{index:l+1,position:[l%2?1.43:-1.43,.42+(o.explode?o.explosion*.2:0),Math.floor(l/2)?-.85:.65]},a.id))]})}const Le=parseInt(Te.replace(/\D+/g,"")),Me=Le>=125?"uv1":"uv2",de=new te,W=new v;class ne extends De{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],o=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],r=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(r),this.setAttribute("position",new re(e,3)),this.setAttribute("uv",new re(o,2))}applyMatrix4(e){const o=this.attributes.instanceStart,r=this.attributes.instanceEnd;return o!==void 0&&(o.applyMatrix4(e),r.applyMatrix4(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let o;e instanceof Float32Array?o=e:Array.isArray(e)&&(o=new Float32Array(e));const r=new Y(o,6,1);return this.setAttribute("instanceStart",new O(r,3,0)),this.setAttribute("instanceEnd",new O(r,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,o=3){let r;e instanceof Float32Array?r=e:Array.isArray(e)&&(r=new Float32Array(e));const t=new Y(r,o*2,1);return this.setAttribute("instanceColorStart",new O(t,o,0)),this.setAttribute("instanceColorEnd",new O(t,o,o)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new ze(e.geometry)),this}fromLineSegments(e){const o=e.geometry;return this.setPositions(o.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new te);const e=this.attributes.instanceStart,o=this.attributes.instanceEnd;e!==void 0&&o!==void 0&&(this.boundingBox.setFromBufferAttribute(e),de.setFromBufferAttribute(o),this.boundingBox.union(de))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ve),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,o=this.attributes.instanceEnd;if(e!==void 0&&o!==void 0){const r=this.boundingSphere.center;this.boundingBox.getCenter(r);let t=0;for(let n=0,s=e.count;n<s;n++)W.fromBufferAttribute(e,n),t=Math.max(t,r.distanceToSquared(W)),W.fromBufferAttribute(o,n),t=Math.max(t,r.distanceToSquared(W));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class Ae extends ne{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const o=e.length-3,r=new Float32Array(2*o);for(let t=0;t<o;t+=3)r[2*t]=e[t],r[2*t+1]=e[t+1],r[2*t+2]=e[t+2],r[2*t+3]=e[t+3],r[2*t+4]=e[t+4],r[2*t+5]=e[t+5];return super.setPositions(r),this}setColors(e,o=3){const r=e.length-o,t=new Float32Array(2*r);if(o===3)for(let n=0;n<r;n+=o)t[2*n]=e[n],t[2*n+1]=e[n+1],t[2*n+2]=e[n+2],t[2*n+3]=e[n+3],t[2*n+4]=e[n+4],t[2*n+5]=e[n+5];else for(let n=0;n<r;n+=o)t[2*n]=e[n],t[2*n+1]=e[n+1],t[2*n+2]=e[n+2],t[2*n+3]=e[n+3],t[2*n+4]=e[n+4],t[2*n+5]=e[n+5],t[2*n+6]=e[n+6],t[2*n+7]=e[n+7];return super.setColors(t,o),this}fromLine(e){const o=e.geometry;return this.setPositions(o.attributes.position.array),this}}class oe extends Be{constructor(e){super({type:"LineMaterial",uniforms:se.clone(se.merge([ae.common,ae.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new be(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${Le>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(o){this.uniforms.diffuse.value=o}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(o){o===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(o){this.uniforms.linewidth.value=o}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(o){!!o!="USE_DASH"in this.defines&&(this.needsUpdate=!0),o===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(o){this.uniforms.dashScale.value=o}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(o){this.uniforms.dashSize.value=o}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(o){this.uniforms.dashOffset.value=o}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(o){this.uniforms.gapSize.value=o}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(o){this.uniforms.opacity.value=o}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(o){this.uniforms.resolution.value.copy(o)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(o){!!o!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),o===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const K=new U,pe=new v,me=new v,S=new U,E=new U,A=new U,X=new v,J=new We,k=new Ne,he=new v,F=new te,H=new ve,j=new U;let I,C;function ye(i,e,o){return j.set(0,0,-e,1).applyMatrix4(i.projectionMatrix),j.multiplyScalar(1/j.w),j.x=C/o.width,j.y=C/o.height,j.applyMatrix4(i.projectionMatrixInverse),j.multiplyScalar(1/j.w),Math.abs(Math.max(j.x,j.y))}function lt(i,e){const o=i.matrixWorld,r=i.geometry,t=r.attributes.instanceStart,n=r.attributes.instanceEnd,s=Math.min(r.instanceCount,t.count);for(let a=0,l=s;a<l;a++){k.start.fromBufferAttribute(t,a),k.end.fromBufferAttribute(n,a),k.applyMatrix4(o);const u=new v,c=new v;I.distanceSqToSegment(k.start,k.end,c,u),c.distanceTo(u)<C*.5&&e.push({point:c,pointOnLine:u,distance:I.origin.distanceTo(c),object:i,face:null,faceIndex:a,uv:null,[Me]:null})}}function ut(i,e,o){const r=e.projectionMatrix,n=i.material.resolution,s=i.matrixWorld,a=i.geometry,l=a.attributes.instanceStart,u=a.attributes.instanceEnd,c=Math.min(a.instanceCount,l.count),f=-e.near;I.at(1,A),A.w=1,A.applyMatrix4(e.matrixWorldInverse),A.applyMatrix4(r),A.multiplyScalar(1/A.w),A.x*=n.x/2,A.y*=n.y/2,A.z=0,X.copy(A),J.multiplyMatrices(e.matrixWorldInverse,s);for(let d=0,m=c;d<m;d++){if(S.fromBufferAttribute(l,d),E.fromBufferAttribute(u,d),S.w=1,E.w=1,S.applyMatrix4(J),E.applyMatrix4(J),S.z>f&&E.z>f)continue;if(S.z>f){const w=S.z-E.z,_=(S.z-f)/w;S.lerp(E,_)}else if(E.z>f){const w=E.z-S.z,_=(E.z-f)/w;E.lerp(S,_)}S.applyMatrix4(r),E.applyMatrix4(r),S.multiplyScalar(1/S.w),E.multiplyScalar(1/E.w),S.x*=n.x/2,S.y*=n.y/2,E.x*=n.x/2,E.y*=n.y/2,k.start.copy(S),k.start.z=0,k.end.copy(E),k.end.z=0;const x=k.closestPointToPointParameter(X,!0);k.at(x,he);const g=Fe.lerp(S.z,E.z,x),M=g>=-1&&g<=1,q=X.distanceTo(he)<C*.5;if(M&&q){k.start.fromBufferAttribute(l,d),k.end.fromBufferAttribute(u,d),k.start.applyMatrix4(s),k.end.applyMatrix4(s);const w=new v,_=new v;I.distanceSqToSegment(k.start,k.end,_,w),o.push({point:_,pointOnLine:w,distance:I.origin.distanceTo(_),object:i,face:null,faceIndex:d,uv:null,[Me]:null})}}}class je extends Se{constructor(e=new ne,o=new oe({color:Math.random()*16777215})){super(e,o),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,o=e.attributes.instanceStart,r=e.attributes.instanceEnd,t=new Float32Array(2*o.count);for(let s=0,a=0,l=o.count;s<l;s++,a+=2)pe.fromBufferAttribute(o,s),me.fromBufferAttribute(r,s),t[a]=a===0?0:t[a-1],t[a+1]=t[a]+pe.distanceTo(me);const n=new Y(t,2,1);return e.setAttribute("instanceDistanceStart",new O(n,1,0)),e.setAttribute("instanceDistanceEnd",new O(n,1,1)),this}raycast(e,o){const r=this.material.worldUnits,t=e.camera;t===null&&!r&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const n=e.params.Line2!==void 0&&e.params.Line2.threshold||0;I=e.ray;const s=this.matrixWorld,a=this.geometry,l=this.material;C=l.linewidth+n,a.boundingSphere===null&&a.computeBoundingSphere(),H.copy(a.boundingSphere).applyMatrix4(s);let u;if(r)u=C*.5;else{const f=Math.max(t.near,H.distanceToPoint(I.origin));u=ye(t,f,l.resolution)}if(H.radius+=u,I.intersectsSphere(H)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),F.copy(a.boundingBox).applyMatrix4(s);let c;if(r)c=C*.5;else{const f=Math.max(t.near,F.distanceToPoint(I.origin));c=ye(t,f,l.resolution)}F.expandByScalar(c),I.intersectsBox(F)!==!1&&(r?lt(this,o):ut(this,t,o))}onBeforeRender(e){const o=this.material.uniforms;o&&o.resolution&&(e.getViewport(K),this.material.uniforms.resolution.value.set(K.z,K.w))}}class ft extends je{constructor(e=new Ae,o=new oe({color:Math.random()*16777215})){super(e,o),this.isLine2=!0,this.type="Line2"}}const ee=h.forwardRef(function({points:e,color:o=16777215,vertexColors:r,linewidth:t,lineWidth:n,segments:s,dashed:a,...l},u){var c,f;const d=R(M=>M.size),m=h.useMemo(()=>s?new je:new ft,[s]),[y]=h.useState(()=>new oe),x=(r==null||(c=r[0])==null?void 0:c.length)===4?4:3,g=h.useMemo(()=>{const M=s?new ne:new Ae,q=e.map(w=>{const _=Array.isArray(w);return w instanceof v||w instanceof U?[w.x,w.y,w.z]:w instanceof be?[w.x,w.y,0]:_&&w.length===3?[w[0],w[1],w[2]]:_&&w.length===2?[w[0],w[1],0]:w});if(M.setPositions(q.flat()),r){o=16777215;const w=r.map(_=>_ instanceof ge?_.toArray():_);M.setColors(w.flat(),x)}return M},[e,s,r,x]);return h.useLayoutEffect(()=>{m.computeLineDistances()},[e,m]),h.useLayoutEffect(()=>{a?y.defines.USE_DASH="":delete y.defines.USE_DASH,y.needsUpdate=!0},[a,y]),h.useEffect(()=>()=>{g.dispose(),y.dispose()},[g]),h.createElement("primitive",Z({object:m,ref:u},l),h.createElement("primitive",{object:g,attach:"geometry"}),h.createElement("primitive",Z({object:y,attach:"material",color:o,vertexColors:!!r,resolution:[d.width,d.height],linewidth:(f=t??n)!==null&&f!==void 0?f:1,dashed:a,transparent:x===4},l)))});function dt(i,e,o){const r=R(m=>m.size),t=R(m=>m.viewport),n=typeof i=="number"?i:r.width*t.dpr,s=r.height*t.dpr,a=(typeof i=="number"?o:i)||{},{samples:l=0,depth:u,...c}=a,f=u??a.depthBuffer,d=h.useMemo(()=>{const m=new He(n,s,{minFilter:ce,magFilter:ce,type:Ge,...c});return f&&(m.depthTexture=new qe(n,s,Ve)),m.samples=l,m},[]);return h.useLayoutEffect(()=>{d.setSize(n,s),l&&(d.samples=l)},[l,d,n,s]),h.useEffect(()=>()=>d.dispose(),[]),d}const pt=i=>typeof i=="function",mt=h.forwardRef(({envMap:i,resolution:e=256,frames:o=1/0,children:r,makeDefault:t,...n},s)=>{const a=R(({set:g})=>g),l=R(({camera:g})=>g),u=R(({size:g})=>g),c=h.useRef(null);h.useImperativeHandle(s,()=>c.current,[]);const f=h.useRef(null),d=dt(e);h.useLayoutEffect(()=>{n.manual||c.current.updateProjectionMatrix()},[u,n]),h.useLayoutEffect(()=>{c.current.updateProjectionMatrix()}),h.useLayoutEffect(()=>{if(t){const g=l;return a(()=>({camera:c.current})),()=>a(()=>({camera:g}))}},[c,t,a]);let m=0,y=null;const x=pt(r);return z(g=>{x&&(o===1/0||m<o)&&(f.current.visible=!1,g.gl.setRenderTarget(d),y=g.scene.background,i&&(g.scene.background=i),g.gl.render(g.scene,c.current),g.scene.background=y,g.gl.setRenderTarget(null),f.current.visible=!0,m++)}),h.createElement(h.Fragment,null,h.createElement("orthographicCamera",Z({left:u.width/-2,right:u.width/2,top:u.height/2,bottom:u.height/-2,ref:c},n),!x&&r),h.createElement("group",{ref:f},x&&r(d.texture)))});function ht(){const i=b(r=>r.quality),{gl:e,scene:o}=R();return h.useEffect(()=>{if(i==="Performance"){o.environment=null;return}const r=new $e(e),t=new et,n=r.fromScene(t,.04);return o.environment=n.texture,o.environmentIntensity=.65,()=>{o.environment=null,n.dispose(),t.dispose(),r.dispose()}},[e,o,i]),null}function yt(){const i=b(o=>o.camera),{size:e}=R();return i==="orthographic"?p.jsx(mt,{makeDefault:!0,position:[0,2.2,8],zoom:e.height/5.35,near:.005,far:100}):null}function xt(){const{gl:i,scene:e}=R(),o=h.useRef(0),r=h.useRef(0);return z(({clock:t})=>{if(o.current++,t.elapsedTime-r.current>=1){L.fps=Math.round(o.current/(t.elapsedTime-r.current)),L.fpsSamples.push(L.fps),L.fpsSamples.length>120&&L.fpsSamples.shift(),L.dpr=i.getPixelRatio(),L.quality=b.getState().quality,P.quality=L.quality;const n=new Set;e.traverse(l=>{if(l.material)for(const u of Array.isArray(l.material)?l.material:[l.material])n.add(u.uuid)}),L.materials=n.size;const s=i.getContext(),a=s.getExtension("WEBGL_debug_renderer_info");L.renderer=a?s.getParameter(a.UNMASKED_RENDERER_WEBGL):s.getParameter(s.RENDERER),L.calls=i.info.render.calls,L.triangles=i.info.render.triangles,L.geometries=i.info.memory.geometries,L.textures=i.info.memory.textures,o.current=0,r.current=t.elapsedTime}}),null}function ie({text:i,position:e=[0,0,0]}){const o=h.useMemo(()=>{const r=document.createElement("canvas");r.width=768,r.height=80;const t=r.getContext("2d");return t.fillStyle="#132634",t.fillRect(0,0,768,80),t.strokeStyle="#55798b",t.strokeRect(1,1,766,78),t.fillStyle="#d0e8e7",t.font="26px Segoe UI",t.textAlign="center",t.fillText(i,384,50),new we(r)},[i]);return h.useEffect(()=>()=>o.dispose(),[o]),p.jsx("sprite",{position:e,scale:[1.85,.19,1],children:p.jsx("spriteMaterial",{map:o,depthTest:!1})})}function xe({record:i,position:e,size:o,affected:r=!1}){const t=b(),[n,s]=h.useState(!1),a=h.useRef(null);z(()=>{a.current&&a.current.position.lerp(new v(...e),t.reduced?1:.15)});const l=t.selected===i.id;let u=i.type==="tray"?"#334550":Xe[i.family];return t.overlay!=="Hardware"&&!({Power:["power","facility","safety"],"Liquid Cooling":["cooling","safety"],Airflow:["cooling"],Network:["network"],"Management/Telemetry":["management"],Storage:["storage"],Dependencies:["facility","network","cooling","power"]}[t.overlay]||[]).includes(i.family)&&(u="#26323e"),r&&(u="#df9860"),p.jsxs("mesh",{ref:a,name:i.id,position:e,onClick:c=>{c.stopPropagation(),t.set({selected:i.id})},onDoubleClick:c=>{c.stopPropagation(),i.type==="rack"?t.set({view:"rack",rack:Number(i.physicalLocation.rack.slice(-2)),focus:null}):t.drill(i.id)},onPointerOver:c=>{c.stopPropagation(),s(!0),document.body.style.cursor="pointer"},onPointerOut:()=>{s(!1),document.body.style.cursor="auto"},children:[["manifold-supply","manifold-return","hose","pump","spare-pump","quick-disconnect"].includes(i.type)?p.jsx("cylinderGeometry",{args:[Math.max(o[0],o[2])/2,Math.max(o[0],o[2])/2,o[1],12]}):p.jsx("boxGeometry",{args:o}),p.jsx("meshStandardMaterial",{color:l?"#e0f1ff":n?"#d5eaff":u,metalness:i.type==="tray"?.35:.62,roughness:.34,transparent:!0,opacity:t.xray?.35:i.type==="door"?.12:1,emissive:l?"#287dc2":r?"#6f3518":"#000",emissiveIntensity:.25}),n&&p.jsx(ie,{text:`${i.displayName} / ${r?"affected":"illustrative"}`,position:[0,.25,0]})]})}function Q({color:i,points:e}){const o=b(),r=h.useRef(null),t=h.useMemo(()=>e.map(n=>new v(...n)),[e]);return z(({clock:n})=>{if(r.current){const s=(o.reduced?.5:n.elapsedTime*.2%1)*(t.length-1),a=Math.min(t.length-2,Math.floor(s));r.current.position.lerpVectors(t[a],t[a+1],s-a)}}),p.jsxs(p.Fragment,{children:[p.jsx(ee,{points:e,color:i,lineWidth:2,dashed:["Power","Network","Management/Telemetry"].includes(o.overlay),dashSize:.12,gapSize:.08}),p.jsxs("mesh",{ref:r,children:[p.jsx("sphereGeometry",{args:[.035,8,8]}),p.jsx("meshBasicMaterial",{color:i})]})]})}function gt({records:i}){const e=b(),o=e.view==="row";return e.overlay==="Liquid Cooling"?p.jsx(p.Fragment,{children:Ee(i,e.racks,o,e.rack).map((r,t)=>p.jsx(Q,{color:r.material==="supply"?"#69bbd0":"#d2ad82",points:r.points},t))}):p.jsx(p.Fragment,{children:Array.from({length:o?e.racks:1},(r,t)=>{const n=o?(t-(e.racks-1)/2)*1.9:0,s=o?-(e.racks-1)*.95-2.1:-2.1;return e.overlay==="Airflow"?p.jsx("group",{children:[1,2,3].map(a=>p.jsx(Q,{color:"#a7bec9",points:[[n,a,1.5],[n,a,0],[n,a,-1.2]]},a))},t):p.jsx(Q,{color:e.overlay==="Power"?"#d6b47a":e.overlay==="Management/Telemetry"?"#a698c4":"#80baa3",points:e.overlay==="Power"?[[n+.3,5.2,.1],[n+.3,4.35,-1.1],[n+.19,.35,-1.22]]:[[n-.63,4.48,1.15],[n-.63,5.62,.8],[s,5.62,.8]]},t)})})}function wt({records:i}){const e=b(),o=i.filter(a=>a.type==="accelerator"&&a.physicalLocation.rack===`RACK-${String(e.rack).padStart(2,"0")}`),r=e.profile==="GOOGLE_IRONWOOD_TPU_REFERENCE",t=new Map(o.map((a,l)=>[a.id,r?[l%4-1.5,1+Math.floor(l/4)%4,Math.floor(l/16)-1.5]:[(l%8-3.5)*.55,1+Math.floor(l/8)*.35,0]])),n=Ke(i).filter(a=>a.fabric==="ICI"&&t.has(a.from)&&t.has(a.to)),s=i.filter(a=>a.type==="scale-up-switch"&&a.physicalLocation.rack===`RACK-${String(e.rack).padStart(2,"0")}`);return p.jsxs("group",{children:[p.jsx(ie,{text:r?"64-chip cube / ICI 3D torus":`${o.length} accelerators / sampled schematic fabric edges`,position:[0,5,0]}),o.map(a=>p.jsx(xe,{record:a,position:t.get(a.id),size:[.18,.12,.18]},a.id)),r?n.map((a,l)=>p.jsx(ee,{points:[t.get(a.from),t.get(a.to)],color:["#4daab4","#c1a878","#9b8dc4"][a.axis||0],lineWidth:1},l)):s.map((a,l)=>p.jsxs("group",{children:[p.jsx(xe,{record:a,position:[(l-4)*.5,.35,-1],size:[.3,.1,.3]}),o.filter((u,c)=>c%s.length===l).map(u=>p.jsx(ee,{points:[t.get(u.id),[(l-4)*.5,.35,-1]],color:"#80b5a1",lineWidth:1},u.id))]},a.id))]})}function vt({asset:i,binding:e}){const o=b(),r=h.useMemo(()=>{const t=i.object.clone(!0);return t.traverse(n=>{if(n instanceof Se){const s=(Array.isArray(n.material)?n.material:[n.material]).map(a=>{const l=a.clone();return l.transparent=e.xray,l.opacity=e.xray?.4:1,l});n.material=s.length===1?s[0]:s}}),t},[i,e.xray]);return p.jsx("group",{scale:e.scale,rotation:[0,e.rotation*Math.PI/180,0],onClick:t=>{t.stopPropagation();const n=e.meshes[t.object.name];n&&o.set({selected:n})},children:p.jsx("primitive",{object:r})})}class bt extends h.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(){b.getState().set({fallback:!0})}render(){return this.state.failed?p.jsx("div",{className:"fallback",children:"WebGL unavailable. Use the accessible component tree and 2D diagram."}):this.props.children}}function kt({records:i,affected:e,asset:o,binding:r}){const t=b(),n=h.useRef(null),[s,a]=h.useState(!0);h.useEffect(()=>{const d=new IntersectionObserver(m=>a(m[0]?.isIntersecting??!0),{rootMargin:"300px"});return n.current&&d.observe(n.current),()=>d.disconnect()},[]);const l=i.find(d=>d.id===t.focus),u=l?i.find(d=>d.id===l.parentId&&d.type==="board"):void 0,c=l?i.find(d=>d.id===l.parentId&&d.type==="rack"):void 0;let f=l?i.filter(d=>d.parentId===l.id&&d.level<=t.level):[];return l&&!f.length&&(f=[l]),p.jsx("div",{ref:n,style:{width:"100%",height:"100%"},children:p.jsx(bt,{children:p.jsxs(Ye,{"aria-label":"Interactive 3D hardware model; use component tree as keyboard alternative",frameloop:s?"always":"never",shadows:!1,dpr:t.quality==="Performance"?1:t.quality==="Detail"?1.5:1.25,camera:{position:[6,4.7,7],fov:38,near:.005},gl:{antialias:!0,powerPreference:"high-performance"},children:[p.jsx("color",{attach:"background",args:["#0b141e"]}),p.jsx("hemisphereLight",{args:["#dce8f4","#464a42",1.1]}),p.jsx("ambientLight",{intensity:.65}),p.jsx("directionalLight",{position:[3,8,5],intensity:3}),p.jsx("directionalLight",{position:[-5,4,-3],intensity:2,color:"#6c9caf"}),p.jsxs(h.Suspense,{fallback:null,children:[p.jsx(Ze,{makeDefault:!0,enableDamping:!t.reduced,minDistance:.08,maxDistance:50}),p.jsx(yt,{}),p.jsx(ht,{}),p.jsx(ot,{records:i}),p.jsx(xt,{}),!l&&p.jsx("gridHelper",{args:[40,40,"#304254","#1b2b3b"]}),p.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.015,0],children:[p.jsx("planeGeometry",{args:[80,80]}),p.jsx("meshStandardMaterial",{color:"#111e2a",roughness:.8})]}),t.camera==="graph"&&!l?p.jsx(wt,{records:i}):o&&r&&t.view==="rack"&&!l?p.jsx(vt,{asset:o,binding:r}):l?.type==="rack"?p.jsx($,{records:i,rack:t.rack}):l&&["accelerator","hbm","cold-plate"].includes(l.type)?p.jsx(tt,{records:i,focus:l}):l&&["tray","board"].includes(l.type)?p.jsx(fe,{records:i,focus:l}):u?p.jsx(fe,{records:i,focus:u}):c&&!["power-shelf","tray"].includes(l.type)?p.jsx($,{records:i,rack:t.rack}):l?p.jsx(nt,{records:i,focus:l}):p.jsxs(p.Fragment,{children:[Array.from({length:t.view==="row"?t.racks:1},(d,m)=>{const y=t.view==="row"?m+1:t.rack;return p.jsxs("group",{children:[p.jsx($,{records:i,rack:y,affected:e.includes(y),detail:t.view==="rack"||y===t.rack,offset:t.view==="row"?(m-(t.racks-1)/2)*1.9:0}),p.jsx(ie,{position:[t.view==="row"?(m-(t.racks-1)/2)*1.9:0,4.35,1.08],text:`R${String(y).padStart(2,"0")} / ${y<=t.racks-2?"COMPUTE":y===t.racks-1?"NETWORK":"STORAGE"}${t.showIds?" / illustrative":""}`})]},y)}),p.jsx(it,{records:i})]}),t.overlay!=="Hardware"&&p.jsx(gt,{records:i})]})]})})})}export{kt as Scene};
