import{g as je,u as b,r as h,j as p,B as Ie,C as xe,a as Re,h as P,V as v,S as Pe,b as we,c as Ce,d as Oe,R as Ue,I as Te,F as re,e as Y,f as O,W as De,i as te,k as ve,l as ze,U as se,m as ae,n as be,M as Be,o as U,L as Ne,p as We,q as He,s as Fe,H as Ge,t as ce,D as qe,v as Ve,P as $e,w as Ke,x as Xe,y as L}from"./index-pGVUAE_L.js";import{a as Je,A as T,m as D,r as V,p as N,u as R,b as z,c as Qe,_ as Z,C as Ye,O as Ze,R as et,I as tt}from"./ImportedHardware-COoiQJyQ.js";function Se(o,e,n,r=1){const t=o.find(l=>l.type==="pump").id;o.find(l=>l.type==="cdu").id;const i=je(o).filter(l=>l.from===t&&l.kind==="coolant"),s=[],a=n?-(e-1)*.95-2.1:-2.1;for(const l of i){const u=Number(l.to.match(/\/R(\d+)\//)[1]);if(!n&&u!==r)continue;const c=n?(u-1-(e-1)/2)*1.9:0;for(const[f,d,m,y]of[[-.62,4.65,-1.9,"supply"],[.62,4.42,-2.1,"return"]])s.push({source:t,target:l.to,kind:"coolant",points:[[a+.58,2.8,y==="supply"?-1.4:-1.6],[a+.58,3.2,m],[a+.58,d,m],[c+f,d,m],[c+f,4,-1.48]],radius:.038,material:y})}return s}function B({asset:o}){const e=b(u=>u.selected),n=b(u=>u.set),r=b(u=>u.drill),[t,i]=h.useState(""),s=o.owners.get(t||e),a=s&&(!s.kind.startsWith("Rack cabinet")||t)?s:void 0,l=h.useMemo(()=>a?new Ie(a.bounds,new xe(t?"#d5eaff":"#66baff")):null,[a,t]);return h.useEffect(()=>{const u=Re(o.group.uuid,o.owners);return()=>{u(),o.dispose()}},[o]),h.useEffect(()=>()=>{l?.geometry.dispose(),l?.material?.dispose()},[l]),p.jsxs("group",{onClick:u=>{const c=V(u.object,u.faceIndex);if(c){u.stopPropagation();const f=Number(c.match(/\/R(\d+)\//)?.[1]);n({selected:c,...f?{rack:f}:{}})}},onDoubleClick:u=>{const c=V(u.object,u.faceIndex);if(c){u.stopPropagation();const f=Number(c.match(/\/R(\d+)\//)?.[1]);f&&n({rack:f}),r(c)}},onPointerMove:u=>{const c=V(u.object,u.faceIndex);c&&(u.stopPropagation(),c!==t&&(i(c),n({hovered:c})),document.body.style.cursor="pointer")},onPointerOut:()=>{i(""),n({hovered:""}),document.body.style.cursor="auto"},children:[p.jsx("primitive",{object:o.group,dispose:null}),l&&p.jsx("primitive",{object:l,raycast:()=>null,dispose:null})]})}function nt({records:o,focus:e}){const n=b(),r=e.type==="accelerator"?e:o.find(i=>i.id===e.parentId),t=h.useMemo(()=>{const i=new T,s=o.filter(l=>l.parentId===r.id&&l.type==="hbm"),a=o.find(l=>l.parentId===r.id&&l.type==="cold-plate");return Je(i,r.id,s.map(l=>l.id),a.id,{cutaway:e.type==="cold-plate"?!1:n.cutaway,explode:n.explode?n.explosion:0,selected:e.id,architecture:r.vendorProfile==="GOOGLE_IRONWOOD_TPU_REFERENCE"?"ironwood":"gpu"}),P.scope="Package/interposer — conceptual exposed section, original geometry",i.finish(D(n.quality))},[r.id,e.id,n.cutaway,n.explode,n.explosion,n.quality]);return p.jsx(B,{asset:t})}function G(o,e,n,r,t,i){o.box(e,"steel",[0,n,0],[1.23,r,2.01],.1),o.box(e,t==="compute"?"aluminum":"steel",[0,n,1.02],[1.24,r*.88,.035],.1);for(const s of[-.58,.58])o.box(e,"polymer",[s,n,1.058],[.065,r*.72,.04],.15),o.pipe(e,"edge",[[s-.013,n-r*.28,1.08],[s-.013,n+r*.28,1.12],[s+.013,n+r*.28,1.12],[s+.013,n-r*.28,1.08]],.006,5),o.box(e,"supply",[s,n-r*.23,1.12],[.04,.018,.008]);if(t==="storage")for(let s=0;s<12;s++){const a=-.49+s*.089;o.box(e,"polymer",[a,n,1.055],[.074,r*.72,.035],.1),o.box(e,"label",[a,n+r*.16,1.079],[.045,.012,.002]),o.box(e,"supply",[a,n-r*.2,1.08],[.028,.01,.003])}else if(t==="switch"){for(let s=0;s<3;s++)N(o,e,[.2+s*.12,n,1.045],.07,r*.5);for(let s=0;s<18;s++)o.box(e,"black",[-.49+s*.026,n,1.045],[.01,r*.55,.007])}else if(t==="network")for(let a=0;a<16;a++){const l=-.5+a*.0625;N(o,e,[l,n,1.045],.055,r*.46),i&&o.pipe(e,"polymer",[[l,n,1.12],[l,n-.03,1.23],[l*1.02,n-.09,1.25]],.006,5)}else{for(let s=0;s<(i?16:8);s++)for(let a=0;a<2;a++)o.box(e,"black",[-.49+s*(i?.026:.05),n+(a-.5)*r*.25,1.04],[.012,r*.16,.004]);for(let s=0;s<4;s++)N(o,e,[.03+s*.102,n,1.05],.077,r*.46);N(o,e,[.46,n,1.05],.05,r*.44)}if(o.box(e,"led",[-.51,n+r*.25,1.05],[.012,.012,.008]),i)for(const s of[-.54,.54])o.cylinder(e,"edge",[s,n,1.063],.009,.005,[Math.PI/2,0,0],6);o.owners.get(e).kind=`${t} service chassis, recessed faceplate, ports/perforations, extraction tabs and status lamp`}function Ee(o,e,n,r,t,i){o.box(e,"steel",[0,r,0],[1.25,t,1.85],.1),n.forEach((s,a)=>{const l=-.51+a*.205;if(o.box(s,"aluminum",[l,r,.85],[.187,t*.8,.21],.12),o.cylinder(s,"black",[l-.025,r,.966],Math.min(t*.32,.065),.01,[Math.PI/2,0,0]),i){o.ring(s,"edge",[l-.025,r,.974],Math.min(t*.32,.065),.003,[0,0,0]);for(let u=0;u<4;u++)o.box(s,"steel",[l-.075+u*.026,r,.979],[.003,t*.55,.004])}o.box(s,"polymer",[l+.058,r,.98],[.024,t*.65,.025]),o.box(s,"supply",[l+.058,r-t*.22,1.001],[.018,.01,.008]),o.box(s,"led",[l+.055,r+t*.22,1.001],[.008,.008,.005]),o.owners.get(s).kind="Rectifier/PSU module with fan aperture, extraction latch and status LED"})}function le(o,e,n){o.withTransform(n,[1,1,1],()=>{o.box(e,"steel",[0,-.2,0],[.8,.08,.48],.1),o.cylinder(e,"aluminum",[0,0,0],.16,.5,[0,0,Math.PI/2],16),o.ring(e,"steel",[-.28,0,0],.2,.06,[0,Math.PI/2,0]),o.cylinder(e,"steel",[-.28,0,0],.15,.1,[0,0,Math.PI/2]);for(let r=0;r<8;r++)o.box(e,"edge",[-.16+r*.045,.15,0],[.015,.07,.22]);o.pipe(e,"aluminum",[[-.28,0,0],[-.5,0,0],[-.5,.6,0]],.06),o.pipe(e,"aluminum",[[-.28,.13,0],[-.28,.33,0],[.42,.33,0]],.06);for(const r of[-.3,.3])o.bolt(e,[r,-.15,.17],.035)}),o.owners.get(e).kind="Motor-driven secondary pump with finned motor, volute, suction/discharge ports and bolted mounting foot"}function ke(o,e,n,r){o.withTransform(n,[1,1,1],()=>{const t=e.cdu;o.box(t,"steel",[0,.12,0],[1.3,.18,1.55],.12),o.box(t,"aluminum",[0,3.35,0],[1.3,.09,1.55],.1);for(const i of[-.62,.62])for(const s of[-.72,.72])o.box(t,"steel",[i,1.75,s],[.045,3.3,.045]);o.box(t,"steel",[0,1.75,-.73],[1.25,3.1,.03]),r||o.box(t,"steel",[-.64,1.75,0],[.025,3.1,1.5]),o.box(t,"aluminum",[0,2.96,.75],[1.23,.6,.04],.08),o.box(t,"black",[-.24,3.02,.78],[.51,.25,.02],.08),o.box(t,"supply",[-.24,3.02,.792],[.43,.16,.005]);for(let i=0;i<8;i++)o.box(t,"black",[.35,2.8+i*.045,.78],[.3,.018,.01]);le(o,e.pump,[-.06,.7,.1]),le(o,e["spare-pump"],[-.06,1.46,.1]);for(let i=0;i<14;i++)o.box(e["heat-exchanger"],"aluminum",[-.38+i*.055,2.35,-.23],[.033,.87,.65],.08);for(const i of[-.46,.46])o.pipe(e["secondary-loop"],i<0?"supply":"return",[[i,.4,.5],[i,2,.5],[i,2.8,.25],[.58,2.8,i<0?-.7:-.9]],.05);for(const i of[1.9,2.6])o.cylinder(e["secondary-loop"],"aluminum",[.46,i,.56],.11,.06,[Math.PI/2,0,0]),o.cylinder(e["secondary-loop"],"label",[.46,i,.6],.09,.01,[Math.PI/2,0,0]),o.box(e["secondary-loop"],"black",[.47,i+.015,.608],[.006,.09,.004]),o.ring(e["secondary-loop"],"return",[.46,i-.22,.5],.11,.013,[0,0,0]);o.owners.get(t).kind="CDU service cabinet with control panel, redundant pump pair, plate heat exchanger, gauges, isolation wheels and connected loop pipes"})}function ot({records:o,focus:e}){const n=b(),r=h.useMemo(()=>{const t=new T,i=e.id;if(e.type==="psu"){t.box(i,"aluminum",[0,.2,0],[1.1,.5,2],.1),t.cylinder(i,"black",[-.15,.2,1.02],.2,.025,[Math.PI/2,0,0]),t.ring(i,"steel",[-.15,.2,1.05],.2,.014,[0,0,0]);for(let s=0;s<8;s++)t.box(i,"aluminum",[-.33+s*.052,.2,1.065],[.008,.38,.008]);t.pipe(i,"edge",[[.32,.04,1.07],[.32,.4,1.23],[.48,.4,1.23],[.48,.04,1.07]],.025),t.box(i,"supply",[.4,.05,1.1],[.16,.08,.04]),t.box(i,"gold",[0,.15,-1.05],[.42,.22,.08]);for(let s=0;s<8;s++)t.box(i,"black",[-.2+s*.055,.15,-1.1],[.02,.2,.01]);t.owners.get(i).kind="Service PSU cartridge with fan grille, retention handle and blind-mate power contacts"}else if(e.type==="power-shelf")t.withTransform([0,0,0],[4,4,4],()=>Ee(t,i,o.filter(s=>s.parentId===i&&s.type==="psu").map(s=>s.id),.1,.16,!0));else if(["pump","spare-pump","cdu","heat-exchanger","primary-loop","secondary-loop"].includes(e.type)){const s=Object.fromEntries(o.filter(a=>a.physicalLocation.rack==="SHARED").map(a=>[a.type,a.id]));ke(t,s,[0,0,0],!0)}else if(e.family==="network")t.withTransform([0,0,0],[3,3,3],()=>G(t,i,.2,.18,"network",!0));else{t.box(i,"pcb",[0,0,0],[1.6,.07,1.1],.08),t.box(i,"polymer",[0,.22,0],[.56,.35,.55],.12),t.cylinder(i,"edge",[0,.46,0],.2,.09);for(let s=0;s<8;s++)t.box(i,"gold",[-.65+s*.18,.06,.4],[.07,.025,.09]),t.box(i,"ceramic",[-.65+s*.18,.08,-.4],[.07,.05,.09]);for(const s of[-.67,.67])for(const a of[-.42,.42])t.bolt(i,[s,.07,a],.04);t.owners.get(i).kind="Illustrative instrumentation/service module in board context; not a vendor mechanical drawing"}return t.finish(D(n.quality))},[e.id,o,n.quality]);return p.jsx(B,{asset:r})}const ue=new Map;function it({records:o}){const e=b(),{camera:n,controls:r,size:t}=R();h.useEffect(()=>{const d=m=>{if(["INPUT","SELECT","TEXTAREA"].includes(m.target.tagName)||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","-","="].includes(m.key))return;m.preventDefault();const y=r&&"target"in r?r.target:new v(0,2,0),g=new Pe().setFromVector3(n.position.clone().sub(y));m.key==="ArrowLeft"&&(g.theta-=.12),m.key==="ArrowRight"&&(g.theta+=.12),m.key==="ArrowUp"&&(g.phi-=.1),m.key==="ArrowDown"&&(g.phi+=.1),(m.key==="+"||m.key==="=")&&(g.radius*=.9),m.key==="-"&&(g.radius*=1.1),g.makeSafe(),n.position.copy(new v().setFromSpherical(g).add(y)),n.lookAt(y),r&&r.update()};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[n,r]);const i=h.useRef(!1),s=h.useRef(null),a=h.useRef(new v(0,2,0)),l=`${e.profile}:${e.view}:${e.view==="row"?"all":e.rack}:${e.focus}`,u=o.find(d=>d.id===e.focus),c=h.useRef(l),f=h.useRef(e.cameraKey);return h.useEffect(()=>{const d=c.current!==l;i.current=!!u&&!["tray","board","accelerator","hbm","cold-plate"].includes(u.type),d&&(ue.set(c.current,{position:n.position.clone(),target:r&&"target"in r?r.target.clone():a.current.clone()}),c.current=l);const m=ue.get(l);if(m&&d)i.current=!1,s.current=m.position.clone(),a.current.copy(m.target);else{const y=e.view==="row",g={isometric:[6,4.7,7],front:[0,2.2,8],orthographic:[0,2.2,8],rear:[0,2.2,-8],"rear-service":[-5.5,4.7,-7],left:[-8,2.2,0],right:[8,2.2,0],top:[0,10,.01],inside:[2,4,3],plumbing:[3,3,-5],aisle:[10,5,13],graph:[0,9,9]},x=g[e.camera]||g.isometric;if(s.current=new v(x[0]*(y?1.8:e.focus?.5:1),x[1]*(y?1.5:e.focus?.5:1),x[2]*(y?1.8:e.focus?.5:1)),a.current.set(0,e.focus?1:e.height,0),y&&(a.current.set(-.9,2.45,-.3),s.current.set(e.camera.startsWith("rear")?-e.racks*1.4:e.racks*1.4,7,e.camera.startsWith("rear")?-e.racks*1.8:e.racks*1.8)),u&&["tray","board"].includes(u.type)&&(a.current.set(0,.1,0),s.current.set(6.8,6.4,8.5),e.camera==="top"&&s.current.set(.01,11,.01),e.camera==="rear"&&s.current.set(-6.8,6.4,-8.5)),u&&["accelerator","hbm","cold-plate"].includes(u.type)&&(a.current.set(0,.15,0),s.current.set(2.8,2.7,3.5),u.type==="hbm")){const M=Number(u.id.split(".").at(-1))-1;a.current.set(M<2?-.65:.65,.15+(e.explode?e.explosion*.3:0),M%2?-.37:.37),s.current.copy(a.current).add(new v(...{front:[0,.3,1],rear:[-.3,.6,-1],top:[.01,1,.01],right:[1,.4,.1]}[e.camera]||[.6,.65,.8]).normalize().multiplyScalar((e.explode?2:1.4)/(2*Math.tan(38*Math.PI/360)*(t.width/t.height))))}}f.current=e.cameraKey},[e.camera,e.cameraKey,l,e.height,e.explode,e.explosion,n,r,t.width,t.height]),z((d,m)=>{const y=e.reduced?1:1-Math.exp(-8*m);if(i.current&&u&&P.owners[u.id]){const g=P.owners[u.id].bounds;a.current.set((g[0]+g[3])/2,(g[1]+g[4])/2,(g[2]+g[5])/2);const x=new v(g[3]-g[0],g[4]-g[1],g[5]-g[2]).length();s.current=a.current.clone().add(new v(1,.85,1.2).normalize().multiplyScalar(Math.max(.65,x*1.5))),i.current=!1}P.camera=n.position.toArray(),P.target=r&&"target"in r?r.target.toArray():a.current.toArray(),s.current&&(n.position.lerp(s.current,y),r&&"target"in r?(r.target.lerp(a.current,y),r.update()):n.lookAt(a.current),n.position.distanceTo(s.current)<.01&&(!r||!("target"in r)||r.target.distanceTo(a.current)<.01)&&(s.current=null))}),null}function rt({records:o}){const e=b(),n=h.useMemo(()=>{const r=new T,t=e.view==="row",i=t?-(e.racks-1)*.95-2.1:-2.1,s=t?(e.racks-1)*.95+.7:.7,a=Object.fromEntries(o.filter(u=>u.physicalLocation.rack==="SHARED").map(u=>[u.type,u.id]));if(e.showCoolant&&e.level>=4&&(t||e.rack<=e.racks-2)){ke(r,a,[i,0,-.7],e.cutaway);const u=Se(o,e.racks,t,e.rack);for(const c of["supply","return"]){const f=u.filter(m=>m.material===c),d=f.at(-1);d&&r.pipe(d.source,c,d.points,d.radius,24);for(const m of f.slice(0,-1))r.pipe(m.source,c,m.points.slice(-2),m.radius,8)}for(let c=i+.65;c<s;c+=1.9)r.box(a.cdu,"steel",[c,4.78,-2],[.06,.08,.5]),r.box(a.cdu,"steel",[c,4.95,-2],[.04,.4,.04])}if(e.showPower&&e.level>=2){const u=a["row-pdu"];r.box(u,"steel",[i-.25,1.4,1.3],[.8,2.65,.58],.1),r.box(u,"aluminum",[i-.25,1.5,1.61],[.68,2.33,.025]);for(let c=0;c<12;c++)r.box(u,"black",[i-.25,.48+c*.16,1.64],[.12,.08,.035]);r.pipe(u,"black",[[i-.25,2.8,1.3],[i-.25,5.2,.1],[s,5.2,.1]],.065),r.box(u,"steel",[(i+s)/2,5.2,.1],[s-i,.16,.23]);for(let c=0;c<(t?e.racks:1);c++){const f=t?(c-(e.racks-1)/2)*1.9:0;r.pipe(u,"black",[[f+.3,5.14,.1],[f+.3,4.58,.1],[f+.3,4.35,-1.1],[f+.3,4.2,-.7]],.028)}}if(e.showNetwork&&e.level>=3){const u=o.find(c=>c.type==="cable-tray")?.id||a.cdu;for(const c of[.55,1.05])r.box(u,"aluminum",[(i+s)/2,5.65,c],[s-i,.075,.045]);for(let c=i;c<s;c+=.27)r.box(u,"steel",[c,5.61,.8],[.022,.035,.52]);for(let c=0;c<(t?e.racks:1);c++){const f=t?(c-(e.racks-1)/2)*1.9:0;for(const d of[-.03,.03])r.pipe(u,"polymer",[[f-.63+d,4.48,1.15],[f-.63+d,5.3,1.15],[f-.63+d,5.62,.8],[i,5.62,.8]],.009,15)}}const l=a.floor;for(const u of[2.5,4.1,-2.8,-4.4])r.box(l,"aluminum",[(i+s)/2,.006,u],[s-i,.006,.018]);for(let u=Math.floor(i);u<s+1;u++)for(let c=-5;c<6;c++)r.box(l,"steel",[u,.004,c],[.008,.005,1]);return r.box(l,"polymer",[(i+s)/2,.002,3.3],[s-i,.003,1.6]),r.finish(D(e.quality))},[o,e.view,e.racks,e.showCoolant,e.showPower,e.showNetwork,e.cutaway,e.level,e.rack,e.quality]);return p.jsx(B,{asset:n})}function st(o,e,n){const r=`RACK-${String(e).padStart(2,"0")}`,t=o.find(d=>d.type==="rack"&&d.physicalLocation.rack===r),i=o.filter(d=>d.parentId===t.id&&d.type==="tray"),s=o.filter(d=>d.parentId===t.id&&d.type==="power-shelf"),a=o.filter(d=>d.parentId===t.id&&["scale-up-switch","switch-asic"].includes(d.type)),l=e<=n-2?"compute":e===n-1?"network":"storage",u=t.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE"&&l==="compute",c=u?[...s.slice(0,4),...i.slice(0,10),...a,...i.slice(10),...s.slice(4)]:[...s,...i,...a],f=u?.101:3.5/(c.length+1);return c.map((d,m)=>({record:d,y:.34+m*f,height:f*.87,role:d.type==="power-shelf"?"power":d.type==="tray"?l:"switch"}))}function at(o,e,n){o.box(e,"steel",[0,.12,0],[1.48,.23,2.3],.12),o.box(e,"steel",[0,4.14,0],[1.48,.15,2.3],.12);const r=n.railId||e;for(const t of[-.7,.7])for(const i of[-1.1,1.1])if(o.box(r,"steel",[t,2.13,i],[.055,4.04,.085]),o.box(r,"edge",[t+Math.sign(t)*.012,2.13,i],[.018,4.04,.1]),o.cylinder(e,"black",[t,.01,i],.065,.08),n.detail)for(let s=0;s<38;s++)o.box(e,"black",[t,.31+s*.1,i+.047],[.025,.028,.005]);for(const t of[.27,4.02])for(const i of[-1.07,1.07])o.box(e,"aluminum",[0,t,i],[1.4,.028,.045]);if(n.shell)for(const t of[-.745,.745]){o.box(e,"steel",[t,2.15,0],[.025,3.9,2.1],.08);for(let i=0;i<10;i++)o.box(e,"black",[t+Math.sign(t)*.014,.5+i*.065,.65],[.003,.025,.5])}o.withTransform([-.735,.27,1.15],[1,1,1],()=>{for(const t of[0,1.43])o.box(n.doorId||e,"steel",[t,1.91,0],[.035,3.82,.035]);for(const t of[0,3.82])o.box(n.doorId||e,"steel",[.715,t,0],[1.43,.035,.035]);for(let t=.15;t<3.7;t+=.12)o.box(n.doorId||e,"black",[.715,t,0],[1.38,.008,.008]);o.box(n.doorId||e,"edge",[1.34,1.8,.025],[.027,.28,.03],.1)},[0,n.doors?-Math.PI*.54:0,0]),o.owners.get(e).kind="Rack cabinet with deep service envelope, slotted uprights, plinth, feet and hinged perforated door"}function ct(o,e,n,r){const t=`RACK-${String(n).padStart(2,"0")}`,i=e.find(c=>c.type==="rack"&&c.physicalLocation.rack===t),s=c=>e.find(f=>f.type===c&&f.physicalLocation.rack===t)?.id||i.id,a=st(e,n,r.racks);r.chassis?at(o,i.id,{shell:!r.cutaway,doors:r.doors,detail:r.detail,doorId:s("door"),railId:s("rail")}):o.box(i.id,"steel",[0,.12,0],[1.48,.23,2.3]);let l=a.find(c=>c.record.id===r.selected);if(!l){let c=e.find(f=>f.id===r.selected);for(;c?.parentId&&(l=a.find(f=>f.record.id===c?.parentId),!l);)c=e.find(f=>f.id===c?.parentId)}if(a.filter(c=>c.record.level<=r.level).forEach((c,f)=>{const d=r.explode&&(l?.record.id===c.record.id||!l&&f===4)?r.explode*1.25:0;if(o.withTransform([0,0,d],[1,1,1],()=>{c.role==="power"?Ee(o,c.record.id,e.filter(m=>m.parentId===c.record.id&&m.type==="psu").map(m=>m.id),c.y,c.height,r.detail):G(o,c.record.id,c.y,c.height,c.role,r.detail)}),r.coolant&&n<=r.racks-2&&r.level>=4&&c.role==="compute"&&!d){const m=e.find(y=>y.type==="quick-disconnect"&&y.physicalLocation.rack===t&&y.id.endsWith(`-${f+1}`))?.id||s("hose");for(const y of[-.62,.62])o.cylinder(m,"edge",[y,c.y,-1.07],.024,.11,[Math.PI/2,0,0]),o.ring(m,y<0?"supply":"return",[y,c.y,-1.14],.026,.005,[0,0,0]),o.pipe(m,"polymer",[[y,c.y,-1.13],[y*.86,c.y+.045,-1.34],[y*.86,c.y+.065,-1.46],[y,c.y+.08,-1.48]],.014,8)}}),r.coolant&&n<=r.racks-2&&r.level>=4)for(const[c,f,d]of[[-.62,"manifold-supply","supply"],[.62,"manifold-return","return"]]){o.cylinder(s(f),d,[c,2.12,-1.48],.038,3.75);for(const m of[.27,2,3.95])o.ring(s(f),"edge",[c,m,-1.48],.044,.01),o.box(s(f),"steel",[c,m,-1.35],[.1,.06,.2]);o.pipe(s(f),d,[[c,.25,-1.48],[c,.15,-1.6],[c,.15,-1.85]],.038),o.cylinder(s(f),"steel",[c,.15,-1.85],.042,.025,[Math.PI/2,0,0])}if(r.power&&r.level>=2){const c=s("busbar");for(const f of[-.15,.02,.19]){o.box(c,"copper",[f,2.1,-1.22],[.055,3.65,.018]);for(const d of[.45,1.4,2.5,3.7])o.box(c,"black",[f,d,-1.19],[.11,.07,.06]),r.detail&&o.cylinder(c,"edge",[f,d,-1.24],.014,.012,[Math.PI/2,0,0],6)}o.pipe(s("feed-a"),"black",[[.3,4.2,-.7],[.3,4.35,-.7],[.3,4.35,-1.1]],.035)}if(r.network&&r.level>=9){const c=s("fiber");for(let f=0;f<(r.detail?8:3);f++)o.pipe(c,"polymer",[[-.48+f*.11,3.86,1.1],[-.48+f*.11,3.9,1.38],[-.63,4.15,1.38],[-.63,4.48,1.15]],.008,8);if(i.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE")for(let f=0;f<6;f++)o.box(s("scale-up"),"polymer",[-.45+f*.18,2.1,-1.08],[.12,2.9,.13]),o.box(s("scale-up"),"aluminum",[-.45+f*.18,3.6,-1.08],[.13,.08,.14])}const u=s("tor");G(o,u,3.99,.075,"network",r.detail),i.vendorProfile==="NVIDIA_GB200_NVL72_REFERENCE"&&G(o,u,3.9,.075,"network",r.detail),o.box(s("asset-tag"),"label",[.56,4.04,1.12],[.12,.04,.005])}function $({records:o,rack:e,offset:n=0,detail:r=!0,affected:t=!1}){const i=b(),s=h.useMemo(()=>{const a=new T;if(ct(a,o,e,{racks:i.racks,level:i.level,detail:r&&i.quality!=="Performance",cutaway:i.cutaway||i.xray,doors:i.doors,selected:i.selected,explode:i.explode?i.explosion:0,coolant:i.showCoolant,power:i.showPower,network:i.showNetwork,chassis:i.showChassis}),t&&i.showFaults){const l=o.find(u=>u.type==="rack"&&u.physicalLocation.rack===`RACK-${String(e).padStart(2,"0")}`).id;for(const u of[-.73,.73])a.box(l,"amber",[u,2.12,1.14],[.018,3.95,.018])}return P.scope="Rack cabinet / service equipment — original illustrative dimensions",a.finish(D(i.quality))},[o,e,i.level,i.quality,i.cutaway,i.xray,i.doors,i.explode,i.explosion,i.showCoolant,i.showPower,i.showNetwork,i.showChassis,i.showFaults,t,r]);return p.jsx("group",{position:[n,0,0],children:p.jsx(B,{asset:s})})}function lt({index:o,position:e}){const n=h.useMemo(()=>{const r=document.createElement("canvas");r.width=320,r.height=64;const t=r.getContext("2d");t.fillStyle="#0c1b23",t.fillRect(0,0,320,64),t.strokeStyle="#719695",t.lineWidth=3,t.strokeRect(1.5,1.5,317,61),t.font="36px sans-serif",t.fillStyle="#e6f5f2",t.textAlign="center",t.textBaseline="middle",t.fillText(`Ironwood TPU ${o}`,160,32);const i=new we(r);return i.colorSpace=Ce,new Oe({map:i,depthTest:!1,depthWrite:!1,toneMapped:!1})},[o]);return h.useEffect(()=>()=>{n.map?.dispose(),n.dispose()},[n]),p.jsx("sprite",{position:e,scale:[.92,.184,1],material:n,renderOrder:20,raycast:()=>null})}function fe({records:o,focus:e}){const n=b(),r=e.type==="tray"?e:o.find(a=>a.id===e.parentId),t=h.useMemo(()=>{const a=new T;return Qe(a,o,r,{cutaway:n.cutaway,explode:n.explode?n.explosion:0,level:n.level,quality:n.quality}),P.scope="Compute sled / populated board — original illustrative mechanical arrangement",a.finish(D(n.quality))},[r.id,n.cutaway,n.explode,n.explosion,n.level,n.quality]),i=o.find(a=>a.parentId===r.id&&a.type==="board"),s=o.filter(a=>a.parentId===i?.id&&a.type==="accelerator"&&a.vendorProfile==="GOOGLE_IRONWOOD_TPU_REFERENCE"&&a.level<=n.level);return p.jsxs(p.Fragment,{children:[p.jsx(B,{asset:t}),n.cutaway&&s.map((a,l)=>p.jsx(lt,{index:l+1,position:[l%2?1.43:-1.43,.42+(n.explode?n.explosion*.2:0),Math.floor(l/2)?-.85:.65]},a.id))]})}const _e=parseInt(Ue.replace(/\D+/g,"")),Le=_e>=125?"uv1":"uv2",de=new te,W=new v;class ne extends Te{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],r=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(r),this.setAttribute("position",new re(e,3)),this.setAttribute("uv",new re(n,2))}applyMatrix4(e){const n=this.attributes.instanceStart,r=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(e),r.applyMatrix4(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const r=new Y(n,6,1);return this.setAttribute("instanceStart",new O(r,3,0)),this.setAttribute("instanceEnd",new O(r,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,n=3){let r;e instanceof Float32Array?r=e:Array.isArray(e)&&(r=new Float32Array(e));const t=new Y(r,n*2,1);return this.setAttribute("instanceColorStart",new O(t,n,0)),this.setAttribute("instanceColorEnd",new O(t,n,n)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new De(e.geometry)),this}fromLineSegments(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new te);const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;e!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(e),de.setFromBufferAttribute(n),this.boundingBox.union(de))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ve),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(e!==void 0&&n!==void 0){const r=this.boundingSphere.center;this.boundingBox.getCenter(r);let t=0;for(let i=0,s=e.count;i<s;i++)W.fromBufferAttribute(e,i),t=Math.max(t,r.distanceToSquared(W)),W.fromBufferAttribute(n,i),t=Math.max(t,r.distanceToSquared(W));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class Me extends ne{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const n=e.length-3,r=new Float32Array(2*n);for(let t=0;t<n;t+=3)r[2*t]=e[t],r[2*t+1]=e[t+1],r[2*t+2]=e[t+2],r[2*t+3]=e[t+3],r[2*t+4]=e[t+4],r[2*t+5]=e[t+5];return super.setPositions(r),this}setColors(e,n=3){const r=e.length-n,t=new Float32Array(2*r);if(n===3)for(let i=0;i<r;i+=n)t[2*i]=e[i],t[2*i+1]=e[i+1],t[2*i+2]=e[i+2],t[2*i+3]=e[i+3],t[2*i+4]=e[i+4],t[2*i+5]=e[i+5];else for(let i=0;i<r;i+=n)t[2*i]=e[i],t[2*i+1]=e[i+1],t[2*i+2]=e[i+2],t[2*i+3]=e[i+3],t[2*i+4]=e[i+4],t[2*i+5]=e[i+5],t[2*i+6]=e[i+6],t[2*i+7]=e[i+7];return super.setColors(t,n),this}fromLine(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}}class oe extends ze{constructor(e){super({type:"LineMaterial",uniforms:se.clone(se.merge([ae.common,ae.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new be(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
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
					#include <${_e>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(n){this.uniforms.diffuse.value=n}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(n){n===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(n){this.uniforms.linewidth.value=n}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(n){!!n!="USE_DASH"in this.defines&&(this.needsUpdate=!0),n===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(n){this.uniforms.dashScale.value=n}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(n){this.uniforms.dashSize.value=n}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(n){this.uniforms.dashOffset.value=n}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(n){this.uniforms.gapSize.value=n}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(n){this.uniforms.opacity.value=n}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(n){this.uniforms.resolution.value.copy(n)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(n){!!n!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),n===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const K=new U,pe=new v,me=new v,S=new U,E=new U,A=new U,X=new v,J=new We,k=new Ne,he=new v,H=new te,F=new ve,j=new U;let I,C;function ye(o,e,n){return j.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),j.multiplyScalar(1/j.w),j.x=C/n.width,j.y=C/n.height,j.applyMatrix4(o.projectionMatrixInverse),j.multiplyScalar(1/j.w),Math.abs(Math.max(j.x,j.y))}function ut(o,e){const n=o.matrixWorld,r=o.geometry,t=r.attributes.instanceStart,i=r.attributes.instanceEnd,s=Math.min(r.instanceCount,t.count);for(let a=0,l=s;a<l;a++){k.start.fromBufferAttribute(t,a),k.end.fromBufferAttribute(i,a),k.applyMatrix4(n);const u=new v,c=new v;I.distanceSqToSegment(k.start,k.end,c,u),c.distanceTo(u)<C*.5&&e.push({point:c,pointOnLine:u,distance:I.origin.distanceTo(c),object:o,face:null,faceIndex:a,uv:null,[Le]:null})}}function ft(o,e,n){const r=e.projectionMatrix,i=o.material.resolution,s=o.matrixWorld,a=o.geometry,l=a.attributes.instanceStart,u=a.attributes.instanceEnd,c=Math.min(a.instanceCount,l.count),f=-e.near;I.at(1,A),A.w=1,A.applyMatrix4(e.matrixWorldInverse),A.applyMatrix4(r),A.multiplyScalar(1/A.w),A.x*=i.x/2,A.y*=i.y/2,A.z=0,X.copy(A),J.multiplyMatrices(e.matrixWorldInverse,s);for(let d=0,m=c;d<m;d++){if(S.fromBufferAttribute(l,d),E.fromBufferAttribute(u,d),S.w=1,E.w=1,S.applyMatrix4(J),E.applyMatrix4(J),S.z>f&&E.z>f)continue;if(S.z>f){const w=S.z-E.z,_=(S.z-f)/w;S.lerp(E,_)}else if(E.z>f){const w=E.z-S.z,_=(E.z-f)/w;E.lerp(S,_)}S.applyMatrix4(r),E.applyMatrix4(r),S.multiplyScalar(1/S.w),E.multiplyScalar(1/E.w),S.x*=i.x/2,S.y*=i.y/2,E.x*=i.x/2,E.y*=i.y/2,k.start.copy(S),k.start.z=0,k.end.copy(E),k.end.z=0;const g=k.closestPointToPointParameter(X,!0);k.at(g,he);const x=He.lerp(S.z,E.z,g),M=x>=-1&&x<=1,q=X.distanceTo(he)<C*.5;if(M&&q){k.start.fromBufferAttribute(l,d),k.end.fromBufferAttribute(u,d),k.start.applyMatrix4(s),k.end.applyMatrix4(s);const w=new v,_=new v;I.distanceSqToSegment(k.start,k.end,_,w),n.push({point:_,pointOnLine:w,distance:I.origin.distanceTo(_),object:o,face:null,faceIndex:d,uv:null,[Le]:null})}}}class Ae extends Be{constructor(e=new ne,n=new oe({color:Math.random()*16777215})){super(e,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,n=e.attributes.instanceStart,r=e.attributes.instanceEnd,t=new Float32Array(2*n.count);for(let s=0,a=0,l=n.count;s<l;s++,a+=2)pe.fromBufferAttribute(n,s),me.fromBufferAttribute(r,s),t[a]=a===0?0:t[a-1],t[a+1]=t[a]+pe.distanceTo(me);const i=new Y(t,2,1);return e.setAttribute("instanceDistanceStart",new O(i,1,0)),e.setAttribute("instanceDistanceEnd",new O(i,1,1)),this}raycast(e,n){const r=this.material.worldUnits,t=e.camera;t===null&&!r&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const i=e.params.Line2!==void 0&&e.params.Line2.threshold||0;I=e.ray;const s=this.matrixWorld,a=this.geometry,l=this.material;C=l.linewidth+i,a.boundingSphere===null&&a.computeBoundingSphere(),F.copy(a.boundingSphere).applyMatrix4(s);let u;if(r)u=C*.5;else{const f=Math.max(t.near,F.distanceToPoint(I.origin));u=ye(t,f,l.resolution)}if(F.radius+=u,I.intersectsSphere(F)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),H.copy(a.boundingBox).applyMatrix4(s);let c;if(r)c=C*.5;else{const f=Math.max(t.near,H.distanceToPoint(I.origin));c=ye(t,f,l.resolution)}H.expandByScalar(c),I.intersectsBox(H)!==!1&&(r?ut(this,n):ft(this,t,n))}onBeforeRender(e){const n=this.material.uniforms;n&&n.resolution&&(e.getViewport(K),this.material.uniforms.resolution.value.set(K.z,K.w))}}class dt extends Ae{constructor(e=new Me,n=new oe({color:Math.random()*16777215})){super(e,n),this.isLine2=!0,this.type="Line2"}}const ee=h.forwardRef(function({points:e,color:n=16777215,vertexColors:r,linewidth:t,lineWidth:i,segments:s,dashed:a,...l},u){var c,f;const d=R(M=>M.size),m=h.useMemo(()=>s?new Ae:new dt,[s]),[y]=h.useState(()=>new oe),g=(r==null||(c=r[0])==null?void 0:c.length)===4?4:3,x=h.useMemo(()=>{const M=s?new ne:new Me,q=e.map(w=>{const _=Array.isArray(w);return w instanceof v||w instanceof U?[w.x,w.y,w.z]:w instanceof be?[w.x,w.y,0]:_&&w.length===3?[w[0],w[1],w[2]]:_&&w.length===2?[w[0],w[1],0]:w});if(M.setPositions(q.flat()),r){n=16777215;const w=r.map(_=>_ instanceof xe?_.toArray():_);M.setColors(w.flat(),g)}return M},[e,s,r,g]);return h.useLayoutEffect(()=>{m.computeLineDistances()},[e,m]),h.useLayoutEffect(()=>{a?y.defines.USE_DASH="":delete y.defines.USE_DASH,y.needsUpdate=!0},[a,y]),h.useEffect(()=>()=>{x.dispose(),y.dispose()},[x]),h.createElement("primitive",Z({object:m,ref:u},l),h.createElement("primitive",{object:x,attach:"geometry"}),h.createElement("primitive",Z({object:y,attach:"material",color:n,vertexColors:!!r,resolution:[d.width,d.height],linewidth:(f=t??i)!==null&&f!==void 0?f:1,dashed:a,transparent:g===4},l)))});function pt(o,e,n){const r=R(m=>m.size),t=R(m=>m.viewport),i=typeof o=="number"?o:r.width*t.dpr,s=r.height*t.dpr,a=(typeof o=="number"?n:o)||{},{samples:l=0,depth:u,...c}=a,f=u??a.depthBuffer,d=h.useMemo(()=>{const m=new Fe(i,s,{minFilter:ce,magFilter:ce,type:Ge,...c});return f&&(m.depthTexture=new qe(i,s,Ve)),m.samples=l,m},[]);return h.useLayoutEffect(()=>{d.setSize(i,s),l&&(d.samples=l)},[l,d,i,s]),h.useEffect(()=>()=>d.dispose(),[]),d}const mt=o=>typeof o=="function",ht=h.forwardRef(({envMap:o,resolution:e=256,frames:n=1/0,children:r,makeDefault:t,...i},s)=>{const a=R(({set:x})=>x),l=R(({camera:x})=>x),u=R(({size:x})=>x),c=h.useRef(null);h.useImperativeHandle(s,()=>c.current,[]);const f=h.useRef(null),d=pt(e);h.useLayoutEffect(()=>{i.manual||c.current.updateProjectionMatrix()},[u,i]),h.useLayoutEffect(()=>{c.current.updateProjectionMatrix()}),h.useLayoutEffect(()=>{if(t){const x=l;return a(()=>({camera:c.current})),()=>a(()=>({camera:x}))}},[c,t,a]);let m=0,y=null;const g=mt(r);return z(x=>{g&&(n===1/0||m<n)&&(f.current.visible=!1,x.gl.setRenderTarget(d),y=x.scene.background,o&&(x.scene.background=o),x.gl.render(x.scene,c.current),x.scene.background=y,x.gl.setRenderTarget(null),f.current.visible=!0,m++)}),h.createElement(h.Fragment,null,h.createElement("orthographicCamera",Z({left:u.width/-2,right:u.width/2,top:u.height/2,bottom:u.height/-2,ref:c},i),!g&&r),h.createElement("group",{ref:f},g&&r(d.texture)))});function yt(){const o=b(r=>r.quality),{gl:e,scene:n}=R();return h.useEffect(()=>{if(o==="Performance"){n.environment=null;return}const r=new $e(e),t=new et,i=r.fromScene(t,.04);return n.environment=i.texture,n.environmentIntensity=.65,()=>{n.environment=null,i.dispose(),t.dispose(),r.dispose()}},[e,n,o]),null}function gt(){const o=b(n=>n.camera),{size:e}=R();return o==="orthographic"?p.jsx(ht,{makeDefault:!0,position:[0,2.2,8],zoom:e.height/5.35,near:.005,far:100}):null}function xt(){const{gl:o,scene:e}=R(),n=h.useRef(0),r=h.useRef(0);return z(({clock:t})=>{if(n.current++,t.elapsedTime-r.current>=1){L.fps=Math.round(n.current/(t.elapsedTime-r.current)),L.fpsSamples.push(L.fps),L.fpsSamples.length>120&&L.fpsSamples.shift(),L.dpr=o.getPixelRatio(),L.quality=b.getState().quality,P.quality=L.quality;const i=new Set;e.traverse(l=>{if(l.material)for(const u of Array.isArray(l.material)?l.material:[l.material])i.add(u.uuid)}),L.materials=i.size;const s=o.getContext(),a=s.getExtension("WEBGL_debug_renderer_info");L.renderer=a?s.getParameter(a.UNMASKED_RENDERER_WEBGL):s.getParameter(s.RENDERER),L.calls=o.info.render.calls,L.triangles=o.info.render.triangles,L.geometries=o.info.memory.geometries,L.textures=o.info.memory.textures,n.current=0,r.current=t.elapsedTime}}),null}function ie({text:o,position:e=[0,0,0]}){const n=h.useMemo(()=>{const r=document.createElement("canvas");r.width=768,r.height=80;const t=r.getContext("2d");return t.fillStyle="#132634",t.fillRect(0,0,768,80),t.strokeStyle="#55798b",t.strokeRect(1,1,766,78),t.fillStyle="#d0e8e7",t.font="26px Segoe UI",t.textAlign="center",t.fillText(o,384,50),new we(r)},[o]);return h.useEffect(()=>()=>n.dispose(),[n]),p.jsx("sprite",{position:e,scale:[1.85,.19,1],children:p.jsx("spriteMaterial",{map:n,depthTest:!1})})}function ge({record:o,position:e,size:n,affected:r=!1}){const t=b(),[i,s]=h.useState(!1),a=h.useRef(null);z(()=>{a.current&&a.current.position.lerp(new v(...e),t.reduced?1:.15)});const l=t.selected===o.id;let u=o.type==="tray"?"#334550":Xe[o.family];return t.overlay!=="Hardware"&&!({Power:["power","facility","safety"],"Liquid Cooling":["cooling","safety"],Airflow:["cooling"],Network:["network"],"Management/Telemetry":["management"],Storage:["storage"],Dependencies:["facility","network","cooling","power"]}[t.overlay]||[]).includes(o.family)&&(u="#26323e"),r&&(u="#df9860"),p.jsxs("mesh",{ref:a,name:o.id,position:e,onClick:c=>{c.stopPropagation(),t.set({selected:o.id})},onDoubleClick:c=>{c.stopPropagation(),o.type==="rack"?t.set({view:"rack",rack:Number(o.physicalLocation.rack.slice(-2)),focus:null}):t.drill(o.id)},onPointerOver:c=>{c.stopPropagation(),s(!0),document.body.style.cursor="pointer"},onPointerOut:()=>{s(!1),document.body.style.cursor="auto"},children:[["manifold-supply","manifold-return","hose","pump","spare-pump","quick-disconnect"].includes(o.type)?p.jsx("cylinderGeometry",{args:[Math.max(n[0],n[2])/2,Math.max(n[0],n[2])/2,n[1],12]}):p.jsx("boxGeometry",{args:n}),p.jsx("meshStandardMaterial",{color:l?"#e0f1ff":i?"#d5eaff":u,metalness:o.type==="tray"?.35:.62,roughness:.34,transparent:!0,opacity:t.xray?.35:o.type==="door"?.12:1,emissive:l?"#287dc2":r?"#6f3518":"#000",emissiveIntensity:.25}),i&&p.jsx(ie,{text:`${o.displayName} / ${r?"affected":"illustrative"}`,position:[0,.25,0]})]})}function Q({color:o,points:e}){const n=b(),r=h.useRef(null),t=h.useMemo(()=>e.map(i=>new v(...i)),[e]);return z(({clock:i})=>{if(r.current){const s=(n.reduced?.5:i.elapsedTime*.2%1)*(t.length-1),a=Math.min(t.length-2,Math.floor(s));r.current.position.lerpVectors(t[a],t[a+1],s-a)}}),p.jsxs(p.Fragment,{children:[p.jsx(ee,{points:e,color:o,lineWidth:2,dashed:["Power","Network","Management/Telemetry"].includes(n.overlay),dashSize:.12,gapSize:.08}),p.jsxs("mesh",{ref:r,children:[p.jsx("sphereGeometry",{args:[.035,8,8]}),p.jsx("meshBasicMaterial",{color:o})]})]})}function wt({records:o}){const e=b(),n=e.view==="row";return e.overlay==="Liquid Cooling"?p.jsx(p.Fragment,{children:Se(o,e.racks,n,e.rack).map((r,t)=>p.jsx(Q,{color:r.material==="supply"?"#69bbd0":"#d2ad82",points:r.points},t))}):p.jsx(p.Fragment,{children:Array.from({length:n?e.racks:1},(r,t)=>{const i=n?(t-(e.racks-1)/2)*1.9:0,s=n?-(e.racks-1)*.95-2.1:-2.1;return e.overlay==="Airflow"?p.jsx("group",{children:[1,2,3].map(a=>p.jsx(Q,{color:"#a7bec9",points:[[i,a,1.5],[i,a,0],[i,a,-1.2]]},a))},t):p.jsx(Q,{color:e.overlay==="Power"?"#d6b47a":e.overlay==="Management/Telemetry"?"#a698c4":"#80baa3",points:e.overlay==="Power"?[[i+.3,5.2,.1],[i+.3,4.35,-1.1],[i+.19,.35,-1.22]]:[[i-.63,4.48,1.15],[i-.63,5.62,.8],[s,5.62,.8]]},t)})})}function vt({records:o}){const e=b(),n=o.filter(a=>a.type==="accelerator"&&a.physicalLocation.rack===`RACK-${String(e.rack).padStart(2,"0")}`),r=e.profile==="GOOGLE_IRONWOOD_TPU_REFERENCE",t=new Map(n.map((a,l)=>[a.id,r?[l%4-1.5,1+Math.floor(l/4)%4,Math.floor(l/16)-1.5]:[(l%8-3.5)*.55,1+Math.floor(l/8)*.35,0]])),i=Ke(o).filter(a=>a.fabric==="ICI"&&t.has(a.from)&&t.has(a.to)),s=o.filter(a=>a.type==="scale-up-switch"&&a.physicalLocation.rack===`RACK-${String(e.rack).padStart(2,"0")}`);return p.jsxs("group",{children:[p.jsx(ie,{text:r?"64-chip cube / ICI 3D torus":`${n.length} accelerators / sampled schematic fabric edges`,position:[0,5,0]}),n.map(a=>p.jsx(ge,{record:a,position:t.get(a.id),size:[.18,.12,.18]},a.id)),r?i.map((a,l)=>p.jsx(ee,{points:[t.get(a.from),t.get(a.to)],color:["#4daab4","#c1a878","#9b8dc4"][a.axis||0],lineWidth:1},l)):s.map((a,l)=>p.jsxs("group",{children:[p.jsx(ge,{record:a,position:[(l-4)*.5,.35,-1],size:[.3,.1,.3]}),n.filter((u,c)=>c%s.length===l).map(u=>p.jsx(ee,{points:[t.get(u.id),[(l-4)*.5,.35,-1]],color:"#80b5a1",lineWidth:1},u.id))]},a.id))]})}function bt({asset:o,binding:e}){const n=b();return p.jsx(tt,{asset:o,binding:e,onSelect:r=>n.set({selected:r})})}class St extends h.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(){b.getState().set({fallback:!0})}render(){return this.state.failed?p.jsx("div",{className:"fallback",children:"WebGL unavailable. Use the accessible component tree and 2D diagram."}):this.props.children}}function _t({records:o,affected:e,asset:n,binding:r}){const t=b(),i=h.useRef(null),[s,a]=h.useState(!0);h.useEffect(()=>{const d=new IntersectionObserver(m=>a(m[0]?.isIntersecting??!0),{rootMargin:"300px"});return i.current&&d.observe(i.current),()=>d.disconnect()},[]);const l=o.find(d=>d.id===t.focus),u=l?o.find(d=>d.id===l.parentId&&d.type==="board"):void 0,c=l?o.find(d=>d.id===l.parentId&&d.type==="rack"):void 0;let f=l?o.filter(d=>d.parentId===l.id&&d.level<=t.level):[];return l&&!f.length&&(f=[l]),p.jsx("div",{ref:i,style:{width:"100%",height:"100%"},children:p.jsx(St,{children:p.jsxs(Ye,{"aria-label":"Interactive 3D hardware model; use component tree as keyboard alternative",frameloop:s?"always":"never",shadows:!1,dpr:t.quality==="Performance"?1:t.quality==="Detail"?1.5:1.25,camera:{position:[6,4.7,7],fov:38,near:.005},gl:{antialias:!0,powerPreference:"high-performance"},children:[p.jsx("color",{attach:"background",args:["#0b141e"]}),p.jsx("hemisphereLight",{args:["#dce8f4","#464a42",1.1]}),p.jsx("ambientLight",{intensity:.65}),p.jsx("directionalLight",{position:[3,8,5],intensity:3}),p.jsx("directionalLight",{position:[-5,4,-3],intensity:2,color:"#6c9caf"}),p.jsxs(h.Suspense,{fallback:null,children:[p.jsx(Ze,{makeDefault:!0,enableDamping:!t.reduced,minDistance:.08,maxDistance:50}),p.jsx(gt,{}),p.jsx(yt,{}),p.jsx(it,{records:o}),p.jsx(xt,{}),!l&&p.jsx("gridHelper",{args:[40,40,"#304254","#1b2b3b"]}),p.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.015,0],children:[p.jsx("planeGeometry",{args:[80,80]}),p.jsx("meshStandardMaterial",{color:"#111e2a",roughness:.8})]}),t.camera==="graph"&&!l?p.jsx(vt,{records:o}):n&&r&&t.view==="rack"&&!l?p.jsx(bt,{asset:n,binding:r}):l?.type==="rack"?p.jsx($,{records:o,rack:t.rack}):l&&["accelerator","hbm","cold-plate"].includes(l.type)?p.jsx(nt,{records:o,focus:l}):l&&["tray","board"].includes(l.type)?p.jsx(fe,{records:o,focus:l}):u?p.jsx(fe,{records:o,focus:u}):c&&!["power-shelf","tray"].includes(l.type)?p.jsx($,{records:o,rack:t.rack}):l?p.jsx(ot,{records:o,focus:l}):p.jsxs(p.Fragment,{children:[Array.from({length:t.view==="row"?t.racks:1},(d,m)=>{const y=t.view==="row"?m+1:t.rack;return p.jsxs("group",{children:[p.jsx($,{records:o,rack:y,affected:e.includes(y),detail:t.view==="rack"||y===t.rack,offset:t.view==="row"?(m-(t.racks-1)/2)*1.9:0}),p.jsx(ie,{position:[t.view==="row"?(m-(t.racks-1)/2)*1.9:0,4.35,1.08],text:`R${String(y).padStart(2,"0")} / ${y<=t.racks-2?"COMPUTE":y===t.racks-1?"NETWORK":"STORAGE"}${t.showIds?" / illustrative":""}`})]},y)}),p.jsx(rt,{records:o})]}),t.overlay!=="Hardware"&&p.jsx(wt,{records:o})]})]})})})}export{_t as Scene};
