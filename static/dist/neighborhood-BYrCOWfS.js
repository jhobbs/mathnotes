import{p as ne}from"./p5.min-DodNUE7G.js";function re(M,w){let v=null,c=[],n=1,i=null,h=!1,l=null,u=null,a="waiting";const I=.5,O=100;let D,g,P,T,A,z;const _=document.createElement("style");_.textContent=`
    #neighborhood-container .demo-button {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
    
    #neighborhood-container .demo-info {
      color: #333;
    }
    
    @media (prefers-color-scheme: dark) {
      #neighborhood-container .demo-button {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      #neighborhood-container .demo-button:hover {
        background-color: #555;
      }
      
      #neighborhood-container .demo-info {
        color: #e0e0e0;
      }
    }
  `,M.appendChild(_);const f=document.createElement("div");f.id="neighborhood-container",f.style.textAlign="center";const L=document.createElement("div");L.id=`neighborhood-sketch-holder-${Date.now()}`;const y=document.createElement("div");y.id="controls",y.style.marginTop="20px";const k=document.createElement("button");k.id=`reset-btn-${Date.now()}`,k.textContent="Reset",k.className="demo-button";const C=document.createElement("button");C.id=`zoom-toggle-${Date.now()}`,C.textContent="Toggle Zoom",C.className="demo-button",y.appendChild(k),y.appendChild(C);const x=document.createElement("div");x.id="info",x.className="demo-info",x.style.marginTop="20px",x.innerHTML=`
    <h3>Every Neighborhood is Open</h3>
    <p>This demonstration shows that every neighborhood in a metric space is an open set.</p>
    <p class="instruction" id="instruction-${Date.now()}">Click and drag to create a neighborhood.</p>
    <p>A set is <strong>open</strong> if every point in the set is an interior point. A point is an <strong>interior point</strong> if there exists a neighborhood around it that is entirely contained within the set.</p>
    <p style="font-size: 0.9em; opacity: 0.8;">Use trackpad/mouse wheel to zoom in and out</p>
  `,f.appendChild(L),f.appendChild(y),f.appendChild(x),M.appendChild(f);const H=e=>{let W;e.setup=()=>{W=e.createCanvas(600,600),W.parent(L),N(),k.addEventListener("click",G),C.addEventListener("click",q),e.smooth()};function N(){(w==null?void 0:w.darkMode)??(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?(D=e.color(30,30,30),g=e.color(200),P=e.color(60),T=e.color(100,150,255,100),A=e.color(255,150,100,120),z=e.color(220)):(D=e.color(255),g=e.color(50),P=e.color(200),T=e.color(50,100,200,80),A=e.color(200,100,50,100),z=e.color(50))}e.draw=()=>{e.background(D),e.push(),e.translate(e.width/2,e.height/2),h&&i&&(e.scale(n),e.translate(-i.x,-i.y)),V(),$();for(const t of c)F(t);if(a==="dragging_outer"&&l&&u){const t=e.dist(l.x,l.y,u.x,u.y);e.fill(T),e.noStroke(),e.circle(l.x,l.y,t*2),e.fill(g),e.circle(l.x,l.y,8/n)}e.pop(),U()};function V(){e.stroke(P),e.strokeWeight(.5/n);const t=50,o={left:-e.width/n,right:e.width/n,top:-e.height/n,bottom:e.height/n};h&&i&&(o.left+=i.x,o.right+=i.x,o.top+=i.y,o.bottom+=i.y);const r=e.max(e.width,e.height)*2,s=Math.floor(o.left/t)*t,m=Math.ceil(o.right/t)*t;for(let d=s-r;d<=m+r;d+=t)e.line(d,o.top-r,d,o.bottom+r);const b=Math.floor(o.top/t)*t,E=Math.ceil(o.bottom/t)*t;for(let d=b-r;d<=E+r;d+=t)e.line(o.left-r,d,o.right+r,d)}function $(){e.stroke(g),e.strokeWeight(2/n);const t={left:-e.width/n,right:e.width/n,top:-e.height/n,bottom:e.height/n};h&&i&&(t.left+=i.x,t.right+=i.x,t.top+=i.y,t.bottom+=i.y);const o=e.max(e.width,e.height)*2;e.line(t.left-o,0,t.right+o,0),e.line(0,t.top-o,0,t.bottom+o),n<2&&(e.fill(z),e.noStroke(),e.textAlign(e.RIGHT,e.TOP),e.text("5",e.width/2-10,10),e.text("-5",-e.width/2+30,10),e.textAlign(e.LEFT,e.BOTTOM),e.text("5",10,-e.height/2+20),e.text("-5",10,e.height/2-10))}function F(t){e.fill(T),e.noStroke(),e.circle(t.center.x,t.center.y,t.radius*2),e.noFill(),e.stroke(g),e.strokeWeight(2/n),R(t.center.x,t.center.y,t.radius*2),e.fill(g),e.noStroke(),e.circle(t.center.x,t.center.y,8/n);for(const o of t.innerPoints){e.fill(A),e.noStroke();const r=e.dist(t.center.x,t.center.y,o.x,o.y),s=t.radius-r;s>0&&(e.circle(o.x,o.y,s*2),e.noFill(),e.stroke(g),e.strokeWeight(1.5/n),R(o.x,o.y,s*2),e.fill(g),e.noStroke(),e.circle(o.x,o.y,6/n))}}function R(t,o,r){const s=r/2,m=s*n,b=e.TWO_PI*m,E=8,d=6,j=E+d,J=Math.floor(b/j),Z=E/m,K=d/m,Q=Z+K;for(let X=0;X<J;X++){const Y=X*Q,B=Y+Z,p=t+s*e.cos(Y),ee=o+s*e.sin(Y),te=t+s*e.cos(B),oe=o+s*e.sin(B);e.line(p,ee,te,oe)}}e.mousePressed=()=>{if(e.mouseX<0||e.mouseX>e.width||e.mouseY<0||e.mouseY>e.height)return;const t=S(e.mouseX,e.mouseY);if(a==="waiting")l=t,a="dragging_outer";else if(a==="waiting_inner"||a==="complete"){const o=c[c.length-1];e.dist(t.x,t.y,o.center.x,o.center.y)<o.radius&&(o.innerPoints.push({x:t.x,y:t.y}),a="complete")}},e.mouseDragged=()=>{a==="dragging_outer"&&l&&(u=S(e.mouseX,e.mouseY))},e.mouseReleased=()=>{if(a==="dragging_outer"&&l&&u){const t=e.dist(l.x,l.y,u.x,u.y);t>10?(c.push({center:e.createVector(l.x,l.y),radius:t,innerPoints:[]}),a="waiting_inner"):a="waiting",l=null,u=null}};function S(t,o){let r=t-e.width/2,s=o-e.height/2;return h&&i&&(r=r/n+i.x,s=s/n+i.y),e.createVector(r,s)}function G(){c=[],a="waiting",h=!1,n=1,i=null,l=null,u=null}function q(){if(c.length>0&&c[c.length-1].innerPoints.length>0)if(Math.abs(n-1)<.1){const t=c[c.length-1].innerPoints[c[c.length-1].innerPoints.length-1];i=e.createVector(t.x,t.y),n=3,h=!0}else n=1,h=!1,i=null}function U(){const t=x.querySelector(".instruction");if(t)switch(a){case"waiting":t.textContent="Click and drag to create a neighborhood.";break;case"dragging_outer":t.textContent="Release to set the neighborhood radius.";break;case"waiting_inner":t.textContent="Click inside the neighborhood to show it contains interior points.";break;case"complete":t.textContent="Click more points inside the neighborhood to show they are all interior points. Every point in a neighborhood is interior, so neighborhoods are open!";break}}window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",t=>{w={...w,darkMode:t.matches},N()}),e.mouseWheel=t=>{if(e.mouseX<0||e.mouseX>e.width||e.mouseY<0||e.mouseY>e.height)return;t.preventDefault();const o=S(e.mouseX,e.mouseY),r=t.delta*.01,s=e.constrain(n*(1+r),I,O);if(s!==n){const m=n;if(n=s,n!==1){h||(i=e.createVector(0,0),h=!0);const b=n/m;i.x=o.x-(o.x-i.x)/b,i.y=o.y-(o.y-i.y)/b}else h=!1,i=null}return!1}};return v=new ne(H),{cleanup:()=>{v&&(v.remove(),v=null),M.innerHTML=""},resize:()=>{}}}export{re as default};
//# sourceMappingURL=neighborhood-BYrCOWfS.js.map
