'use strict';

const MAIN_CA = '0x548033378Be9B80DBACF7C1dD83D3ba704a2c633';
const CID = '0x38';
const MAIN_DEPLOY_BLOCK = 86655337;

const POOL_ABI_EXTRA = [
  'function survivingRooms() view returns (uint256)',
  'function getFullPageData(uint256 historyLimit) view returns (tuple(uint256 gameId,bool isFinished,uint256 totalPlayers,uint256[4] roomAmounts,uint256[4] roomPlayerCounts) snapshot,tuple(uint256 gameId,uint256 survivingRooms,uint256[4] survivingRoomFlags,uint256 totalPot,uint256 feeTaken,uint256 distributed,uint256 timestamp,uint256 blockNumber,bytes32 blockHashSnapshot,uint256 addrEntropy,uint256 seedValue,uint256[4] roomTotals,uint256[4] playerCounts)[] recentGames,tuple(uint256 totalGamesPlayed,uint256 totalHistoryCount,uint256 currentFeeRate,uint256 referralPct,uint256 rebatePct,uint256 pendingFees,uint256 contractBalance,uint256 totalVolumeAll,uint256 minDeposit,uint256 survivingRooms,uint256 version,bool isPaused,address successorContract,address mainContract) stats)',
  'function getUserDashboard(address user) view returns (tuple(bool joined,uint8 room,uint256 amount) info,tuple(address referrer,uint256 pending,uint256 totalEarned,uint256 totalWithdrawn) refInfo,tuple(uint256 totalGames,uint256 totalDeposited,uint256 totalWon,uint256 totalReferralEarned,uint256 totalRebateEarned) pStats,uint256 claimableAmount,uint256 rebateAmount,bool isMigrated,address newContract)',
];
const MAIN_ABI_EXTRA = [
  'function referrerOf(address) view returns (address)',
  'function referralCount(address) view returns (uint256)',
  'function bindReferrer(address referrer) nonpayable',
];
const COMMON_ABI = [
  'function joinRoom(uint8 room) payable',
  'function withdrawReferral() nonpayable',
  'function withdrawRebate() nonpayable',
  'function claim() nonpayable',
  'function referralPending(address) view returns (uint256)',
  'function rebatePending(address) view returns (uint256)',
  'function getHistory(uint256 offset,uint256 limit) view returns (tuple(uint256 gameId,uint256 survivingRooms,uint256[4] survivingRoomFlags,uint256 totalPot,uint256 feeTaken,uint256 distributed,uint256 timestamp,uint256 blockNumber,bytes32 blockHashSnapshot,uint256 addrEntropy,uint256 seedValue,uint256[4] roomTotals,uint256[4] playerCounts)[])',
  'function getHistoryCount() view returns (uint256)',
  'event GameFinished(uint256 indexed gameId,uint256[4] survivingRoomFlags,uint256 totalPot,uint256 feeTaken,uint256 distributed,bool empty)',
  'event PlayerJoined(uint256 indexed gameId,address indexed player,uint8 room,uint256 amount)',
  'event WinnerPaid(uint256 indexed gameId,address indexed player,uint256 amount)',
  'event ReferralEarned(address indexed referrer,address indexed player,uint256 amount)',
  'event RebateEarned(address indexed player,uint256 amount)',
];
const MAIN_ABI = [...COMMON_ABI, ...MAIN_ABI_EXTRA,
  'function getFullPageData(uint256 historyLimit) view returns (tuple(uint256 gameId,bool isFinished,uint256 totalPlayers,uint256[4] roomAmounts,uint256[4] roomPlayerCounts) snapshot,tuple(uint256 gameId,uint8 survivingRoom,uint256 totalPot,uint256 feeTaken,uint256 distributed,uint256 timestamp,uint256 blockNumber,bytes32 blockHashSnapshot,uint256 addrEntropy,uint256 seedValue,uint256[4] roomTotals,uint256[4] playerCounts)[] recentGames,tuple(uint256 totalGamesPlayed,uint256 totalHistoryCount,uint256 currentFeeRate,uint256 referralPct,uint256 rebatePct,uint256 pendingFees,uint256 contractBalance,uint256 totalVolumeAll,uint256 minDeposit,uint256 version,bool isPaused,address successorContract) stats)',
  'function getUserDashboard(address user) view returns (tuple(bool joined,uint8 room,uint256 amount) info,tuple(address referrer,uint256 pending,uint256 totalEarned,uint256 totalWithdrawn,uint256 refCount) refInfo,tuple(uint256 totalGames,uint256 totalDeposited,uint256 totalWon,uint256 totalReferralEarned,uint256 totalRebateEarned) pStats,uint256 claimableAmount,uint256 rebateAmount,bool isMigrated,address newContract)',
];
const POOL_ABI = [...COMMON_ABI, ...POOL_ABI_EXTRA];

const POOLS = [
  {id:'main',   mode:'storm', tier:'init',  label:'腥风·初级', ca:MAIN_CA,  deployBlock:MAIN_DEPLOY_BLOCK, minBnb:0.001, survivingRooms:1, isMain:true},
  {id:'s-mid',  mode:'storm', tier:'mid',   label:'腥风·中级', ca:'0x8c4d1eb6d4ec5781ab58989ce2f35de17467d579',        deployBlock:87459553,                 minBnb:0.01,  survivingRooms:1, isMain:false},
  {id:'s-high', mode:'storm', tier:'high',  label:'腥风·高级', ca:'0xe61cecbf5a6c0d06d8ad586f1b81abea5d4a4840',        deployBlock:87459692,                 minBnb:0.1,   survivingRooms:1, isMain:false},
  {id:'g-init', mode:'gentle',tier:'init',  label:'温柔·初级', ca:'0xbc12e6949e0a76e5cde351a5d1529ca55358277d',        deployBlock:87459842,                 minBnb:0.001, survivingRooms:3, isMain:false},
  {id:'g-mid',  mode:'gentle',tier:'mid',   label:'温柔·中级', ca:'0x147bfc0f37e4369af0bc5f969800f4988bbe564b',        deployBlock:87459990,                 minBnb:0.01,  survivingRooms:3, isMain:false},
  {id:'g-high', mode:'gentle',tier:'high',  label:'温柔·高级', ca:'0xadba3d79f4a9911b5413e33589ed790629c8a005',        deployBlock:87460069,                 minBnb:0.1,   survivingRooms:3, isMain:false},
];
const TIER_LABEL = {init:'初级场', mid:'中级场', high:'高级场'};
const MODE_LABEL = {storm:'腥风血雨', gentle:'温柔版'};
const MODE_DESC  = {storm:'杀3活1', gentle:'杀1活3'};

const RPC_LIST = [
  'https://bsc-dataseed1.binance.org/',
  'https://bsc-dataseed2.binance.org/',
  'https://bsc-dataseed3.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc.publicnode.com',
];

const NAMES  = ['A','B','C','D'];
const EMOJIS = ['🔴','🔵','🟣','🟡'];
const RC     = ['room-a','room-b','room-c','room-d'];
const SRT    = ['srt-a','srt-b','srt-c','srt-d'];
const SB     = ['sb-a','sb-b','sb-c','sb-d'];
const BDGC   = ['rb-a','rb-b','rb-c','rb-d'];
const CHIP   = ['chip-a','chip-b','chip-c','chip-d'];
const ECOLOR = ['var(--ra)','var(--rb)','var(--rc)','var(--rd)'];
const WICON  = {MetaMask:'🦊','Binance Wallet':'🔶','OKX Wallet':'⬛','Coinbase Wallet':'🔵',Wallet:'👛'};

let ethProvider=null, signer=null, myAddr=null;
let readProviders={};
let poolContracts={};
let poolReadContracts={};
let currentPoolId=null;
let selRoom=-1, myJoined=false, myRoom=-1;
let snap=null, pollId=null;
let myGameData={};
let lastHistRecs=[];
let myReferrer=null, myPendingRef=0;
let poolSnapshots={};
let poolStats={};
let globalHistRecs=[];
let currentFeeRate=10, currentRefPct=20, currentRebatePct=10;
let _algoLoggedIds=new Set();
let _refreshAllTimer=null;
let _pendingRefAddr=null;

async function autoReconnect(){const found=await waitForInjection(2500);if(!found)return;const wallets=gatherProviders();for(const {p} of wallets){try{const ok=await connectWith(p,true);if(ok)return;}catch(e){}}}

function initApp(){
  const _refParam=new URLSearchParams(window.location.search).get('ref');
  if(_refParam&&ethers.utils.isAddress(_refParam)){
    try{sessionStorage.setItem('pendingRef',_refParam);}catch(e){}
  }
  buildCards();
  buildPips();
  buildPresets();
  buildPoolCards();
  autoReconnect();
  initRPC();
}

function initRPC(){
  (async function(){
    for(const url of RPC_LIST){
      try{
        const rp=new ethers.providers.JsonRpcProvider(url);
        await Promise.race([rp.getBlockNumber(),new Promise((_,rej)=>setTimeout(()=>rej(),4000))]);
        document.getElementById('netDot').classList.add('ok');
        POOLS.forEach(p=>{
          if(!p.ca) return;
          const abi=p.isMain?MAIN_ABI:POOL_ABI;
          poolReadContracts[p.id]=new ethers.Contract(p.ca,abi,rp);
        });
        refreshHomeData();
        subscribeAllGlobalEvents();
        startPoll();
        return;
      }catch(e){}
    }
  })();
}

let _currentHomeMode = 'storm';
const _poolCardCache = {};

function buildPoolCards(){
  POOLS.forEach(p=>{
    const modeClass=p.mode;
    const card=document.createElement('div');
    card.className=`pool-card ${modeClass}`;
    card.id=`pc-${p.id}`;
    card.innerHTML=`
      <div class="pc-my-badge" id="pcMyBadge-${p.id}" style="display:none;">我在场</div>
      <div class="pc-header">
        <div class="pc-tier" style="font-size:.7rem;font-weight:700;">${TIER_LABEL[p.tier]}</div>
      </div>
      <div class="pc-min">最低投入 <span>${p.minBnb} BNB</span></div>
      <div class="pc-stats">
        <div class="pc-stat"><div class="pc-stat-label">当前人数</div><div class="pc-stat-val" id="pcPlayers-${p.id}">--/10</div></div>
        <div class="pc-stat"><div class="pc-stat-label">当前奖池</div><div class="pc-stat-val" id="pcPool-${p.id}">-- BNB</div></div>
        <div class="pc-stat"><div class="pc-stat-label">已完成局</div><div class="pc-stat-val" id="pcGames-${p.id}">--</div></div>
        <div class="pc-stat"><div class="pc-stat-label">总流水</div><div class="pc-stat-val" id="pcVolume-${p.id}">-- BNB</div></div>
      </div>
      <div class="pc-progress"><div class="pc-progress-fill" id="pcProg-${p.id}" style="width:0%"></div></div>
      <button class="pc-enter-btn" onclick="enterPool('${p.id}')">${p.ca?'进入场次':'待部署'}</button>
    `;
    if(!p.ca) card.style.opacity='0.5';
    _poolCardCache[p.id]=card;
  });
  renderActivePoolCards();
}

function switchMode(mode){
  _currentHomeMode=mode;
  const tabS=document.getElementById('tabStorm');
  const tabG=document.getElementById('tabGentle');
  const descBar=document.getElementById('modeDescBar');
  tabS.classList.toggle('active',mode==='storm');
  tabG.classList.toggle('active',mode==='gentle');
  descBar.className='mode-desc-bar '+mode;
  if(mode==='storm') descBar.innerHTML='<span>杀3活1</span> · 随机选1个房间存活，独吞全部奖池';
  else descBar.innerHTML='<span>杀1活3</span> · 随机淘汰1个房间，其余3个房间按投入比例分奖';
  renderActivePoolCards();
}

function renderActivePoolCards(){
  const grid=document.getElementById('activePoolsGrid');
  grid.innerHTML='';
  POOLS.filter(p=>p.mode===_currentHomeMode).forEach(p=>{
    if(_poolCardCache[p.id]) grid.appendChild(_poolCardCache[p.id]);
  });
}

function buildCards(){
  const g=document.getElementById('roomsGrid');
  g.innerHTML='';
  NAMES.forEach((n,i)=>{
    const d=document.createElement('div');
    d.className=`room-card ${RC[i]}`;d.id=`rc${i}`;d.onclick=()=>pickRoom(i);
    d.innerHTML=`
      <span class="mine-tag">我的房间</span>
      <div class="room-top">
        <div class="room-letter">${n}</div>
        <div class="room-tick" id="rtick${i}">✓</div>
      </div>
      <div class="room-data">
        <div class="rd-item"><div class="rd-label">人数</div><div class="rd-value" id="rp${i}">0</div></div>
        <div class="rd-item"><div class="rd-label">奖池</div><div class="rd-value" id="ra${i}">0 BNB</div></div>
        <div class="rd-item"><div class="rd-label">占比</div><div class="rd-value" id="rpc${i}">0%</div></div>
      </div>
      <div class="room-bar-track"><div class="room-bar-fill" id="rbar${i}"></div></div>
      <div class="room-est" id="rest${i}">
        <span class="room-est-label">若选此房间预估回报</span>
        <span class="room-est-value" id="restv${i}">-- BNB</span>
      </div>`;
    g.appendChild(d);
  });
}

function buildPips(){
  const r=document.getElementById('pipRow');r.innerHTML='';
  for(let i=0;i<10;i++){const d=document.createElement('div');d.className='ppip';d.id='pip'+i;r.appendChild(d);}
}

function buildPresets(){
  const row=document.getElementById('presetRow');
  ['0.001','0.005','0.01','0.05','0.1','0.5'].forEach(v=>{
    const b=document.createElement('button');
    b.className='preset-btn';b.textContent=v;
    b.onclick=()=>{document.getElementById('amtInput').value=v;updateCalc();};
    row.appendChild(b);
  });
}

function enterPool(poolId){
  const p=POOLS.find(x=>x.id===poolId);
  if(!p||!p.ca){toast('该场次尚未部署','warn');return;}
  currentPoolId=poolId;
  selRoom=-1;myJoined=false;myRoom=-1;snap=null;
  myGameData={};lastHistRecs=[];
  _algoLoggedIds=new Set();
  document.getElementById('algoBody').innerHTML='<div class="algo-empty">// 等待结算事件...</div>';
  buildCards();buildPips();
  const modeClass=p.mode;
  document.getElementById('detailModeBadge').textContent=MODE_LABEL[p.mode];
  document.getElementById('detailModeBadge').className=`detail-mode-badge ${modeClass}`;
  document.getElementById('detailTierBadge').textContent=TIER_LABEL[p.tier];
  document.getElementById('detailDesc').textContent=`最低 ${p.minBnb} BNB · ${MODE_DESC[p.mode]}`;
  document.getElementById('ruleMinDeposit').textContent=`最低投入 ${p.minBnb} BNB，投入金额不可撤回。`;
  document.getElementById('ruleMode').textContent=p.survivingRooms===1
    ?'结算时随机选出 1 个存活房间，其余 3 个全部淘汰。'
    :'结算时随机选出 1 个被淘汰房间，其余 3 个房间玩家按比例分奖。';
  document.getElementById('footerAddr').textContent=p.ca.slice(0,10)+'…'+p.ca.slice(-6);
  document.getElementById('bscScanLink').href=`https://bscscan.com/address/${p.ca}`;
  if(myAddr){
    const abi=p.isMain?MAIN_ABI:POOL_ABI;
    poolContracts[poolId]=new ethers.Contract(p.ca,abi,signer);
  }
  showView('viewPool');
  refreshPoolDetail();
  subscribePoolEvents(poolId);
  if(myAddr) checkMeInPool();
}

function goHome(){
  showView('viewHome');
  if(pollId) clearInterval(pollId);
  pollId=setInterval(refreshHomeData,12000);
  if(currentPoolId) unsubscribePool(currentPoolId);
  currentPoolId=null;
  refreshHomeData();
}

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

async function refreshHomeData(){
  const promises=POOLS.map(async p=>{
    if(!p.ca||!poolReadContracts[p.id]) return;
    try{
      const pd=await poolReadContracts[p.id].getFullPageData(5);
      poolSnapshots[p.id]=pd.snapshot;
      poolStats[p.id]=pd.stats;
      updatePoolCard(p.id,pd.snapshot,pd.stats);
      if(pd.recentGames&&pd.recentGames.length){
        mergeGlobalHist(p.id,pd.recentGames);
        buildGlobalAlgoLogFromHistory(p,pd.recentGames);
      }
    }catch(e){}
  });
  await Promise.allSettled(promises);
  updateGlobalStats();
  renderGlobalHist();
  if(myAddr){
    updateMyPendingGlobal();
    checkAllMyActive();
  }
}

function updatePoolCard(poolId, snapshot, stats){
  const p=POOLS.find(x=>x.id===poolId);
  if(!p||!snapshot||!stats) return;
  const np=snapshot.totalPlayers.toNumber();
  document.getElementById(`pcPlayers-${poolId}`).textContent=np+'/10';
  let tot=ethers.BigNumber.from(0);
  snapshot.roomAmounts.forEach(a=>tot=tot.add(a));
  document.getElementById(`pcPool-${poolId}`).textContent=bnb(tot)+' BNB';
  document.getElementById(`pcProg-${poolId}`).style.width=(np/10*100)+'%';
  document.getElementById(`pcGames-${poolId}`).textContent=stats.totalGamesPlayed.toNumber();
  document.getElementById(`pcVolume-${poolId}`).textContent=parseFloat(ethers.utils.formatEther(stats.totalVolumeAll)).toFixed(3)+' BNB';
}

function normalizeGameResult(r, poolId){
  let flags = r.survivingRoomFlags;
  const allZero = !flags || !flags.length || flags.every(f=>{const v=f&&f.toNumber?f.toNumber():Number(f||0);return v===0;});
  if(allZero && r.survivingRoom!=null){
    const ri = r.survivingRoom&&r.survivingRoom.toNumber ? r.survivingRoom.toNumber() : Number(r.survivingRoom);
    flags = [0,1,2,3].map(i=>i===ri?1:0);
  } else if(allZero){
    flags = [0,0,0,0];
  }
  return {...r, survivingRoomFlags:flags, _poolId:poolId};
}

function mergeGlobalHist(poolId, recs){
  recs.forEach(r=>{
    const key=poolId+'_'+r.gameId.toString();
    const existing=globalHistRecs.findIndex(x=>x._key===key);
    const item={...normalizeGameResult(r,poolId),_key:key};
    if(existing>=0) globalHistRecs[existing]=item;
    else globalHistRecs.push(item);
  });
  globalHistRecs.sort((a,b)=>b.timestamp.toNumber()-a.timestamp.toNumber());
  if(globalHistRecs.length>100) globalHistRecs=globalHistRecs.slice(0,100);
}

let _histFilterMode='storm';
let _histFilterTier='all';

function setHistMode(mode, el){
  _histFilterMode=mode;
  ['hfStorm','hfGentle','hfAll'].forEach(id=>{
    const btn=document.getElementById(id);
    if(btn){btn.classList.remove('active-storm','active-gentle','active-tier');}
  });
  if(mode==='storm') el.classList.add('active-storm');
  else if(mode==='gentle') el.classList.add('active-gentle');
  else el.classList.add('active-tier');
  renderGlobalHist();
}

function setHistTier(tier, el){
  _histFilterTier=tier;
  ['hfInit','hfMid','hfHigh','hfAllTier'].forEach(id=>{
    const btn=document.getElementById(id);
    if(btn) btn.classList.remove('active-tier');
  });
  el.classList.add('active-tier');
  renderGlobalHist();
}

function renderGlobalHist(){
  const recs=globalHistRecs.filter(r=>{
    const p=POOLS.find(x=>x.id===r._poolId);
    if(!p) return false;
    const modeOk=_histFilterMode==='all'||p.mode===_histFilterMode;
    const tierOk=_histFilterTier==='all'||p.tier===_histFilterTier;
    return modeOk&&tierOk;
  });
  document.getElementById('globalHistCount').textContent='共 '+globalHistRecs.length+' 局';
  const tb=document.getElementById('globalHistBody');
  if(!recs.length){tb.innerHTML='<tr><td colspan="9"><div class="empty-state">// 暂无历史记录</div></td></tr>';return;}
  tb.innerHTML=recs.map((r,idx)=>{
    const p=POOLS.find(x=>x.id===r._poolId)||{mode:'storm',label:'--'};
    const modeClass=p.mode;
    const _rff=r.survivingRoomFlags;
    const _rfz=!_rff||!_rff.length||_rff.every(f=>{const v=f&&f.toNumber?f.toNumber():Number(f||0);return v===0;});
    let flagsArr;
    if(_rfz&&r.survivingRoom!=null){
      const _rri=r.survivingRoom&&r.survivingRoom.toNumber?r.survivingRoom.toNumber():Number(r.survivingRoom);
      flagsArr=[0,1,2,3].map(i=>i===_rri?1:0);
    }else{flagsArr=_rff||[0,0,0,0];}
    const survivingIdxs=[];
    flagsArr.forEach((f,i)=>{const fv=f&&f.toNumber?f.toNumber():Number(f||0);if(fv===1)survivingIdxs.push(i);});
    const survivingCount=survivingIdxs.length;
    const isEmpty=r.distributed.isZero();
    const eid='ge'+idx;
    let chips='';
    NAMES.forEach((_,i)=>{const n=r.playerCounts[i].toNumber();if(n>0)chips+=`<span class="chip ${CHIP[i]}">${NAMES[i]}×${n}</span>`;});
    let survBadge='';
    if(isEmpty){
      const ri=survivingIdxs[0]??0;
      survBadge=`<span class="surv-badge ${SB[ri]}">${EMOJIS[ri]} ${NAMES[ri]}（无人）</span>`;
    }else if(survivingCount===1){
      const ri=survivingIdxs[0];
      survBadge=`<span class="surv-badge ${SB[ri]}">${EMOJIS[ri]} ${NAMES[ri]}</span>`;
    }else{
      survBadge=`<span class="surv-badge sb-multi">存活 ${survivingIdxs.map(i=>NAMES[i]).join('+')} 房间</span>`;
    }
    const paidHtml=isEmpty?'<span class="volt-cell">→ 平台</span>':`<span class="green-cell">+${bnb(r.distributed)} BNB</span>`;
    return `<tr class="data-row" onclick="togExp('${eid}')">
      <td><span class="pool-tag ${modeClass}">${p.label}</span></td>
      <td class="gid-cell">#${r.gameId}</td>
      <td>${survBadge}</td>
      <td><div class="chip-row">${chips||'—'}</div></td>
      <td><span class="mono-cell">${bnb(r.totalPot)} BNB</span></td>
      <td><span class="red-cell">-${bnb(r.feeTaken)} BNB</span></td>
      <td>${paidHtml}</td>
      <td class="muted-cell">${fmtT(r.timestamp.toNumber())}</td>
      <td class="tog-cell" id="tog${eid}">▼</td>
    </tr>
    <tr class="exp-row"><td colspan="9">
      <div class="exp-inner" id="${eid}">
        <div class="exp-grid">${buildExpRooms(r,survivingIdxs)}</div>
      </div>
    </td></tr>`;
  }).join('');
}

function buildExpRooms(r, survivingIdxs){
  let tot=ethers.BigNumber.from(0);r.roomTotals.forEach(t=>tot=tot.add(t));
  const totF=parseFloat(ethers.utils.formatEther(tot));
  return NAMES.map((_,i)=>{
    const b=parseFloat(ethers.utils.formatEther(r.roomTotals[i]));
    const pc=totF>0?(b/totF*100).toFixed(1)+'%':'0%';
    const win=survivingIdxs.includes(i);
    return `<div class="exp-room${win?' winner-room':''}">
      <div class="exp-room-header">
        <span class="exp-room-name" style="color:${ECOLOR[i]}">${NAMES[i]} 房间</span>
        ${win?'<span class="winner-pip">存活</span>':'<span class="eliminated-pip">淘汰</span>'}
      </div>
      <div class="exp-room-stats">${b.toFixed(4)} BNB · ${r.playerCounts[i].toNumber()} 人 · ${pc}</div>
    </div>`;
  }).join('');
}

function updateGlobalStats(){
  let totalGames=0,totalVol=ethers.BigNumber.from(0),activePlayers=0;
  POOLS.forEach(p=>{
    const s=poolStats[p.id];
    const sn=poolSnapshots[p.id];
    if(s){
      totalGames+=s.totalGamesPlayed.toNumber();
      totalVol=totalVol.add(s.totalVolumeAll);
    }
    if(sn){
      activePlayers+=sn.totalPlayers.toNumber();
    }
  });
  document.getElementById('gsTotalGames').textContent=totalGames;
  document.getElementById('gsTotalVolume').textContent=parseFloat(ethers.utils.formatEther(totalVol)).toFixed(3)+' BNB';
  document.getElementById('gsActivePlayers').textContent=activePlayers+' 人';
}

async function checkAllMyActive(){
  if(!myAddr) return;
  const section=document.getElementById('myActiveSection');
  const cardsEl=document.getElementById('myActiveCards');
  if(!section||!cardsEl) return;
  const active=[];
  for(const p of POOLS){
    if(!p.ca) continue;
    const c=poolReadContracts[p.id]||poolContracts[p.id];
    if(!c) continue;
    try{
      const dash=await c.getUserDashboard(myAddr);
      if(!dash.info.joined) continue;
      const snap=poolSnapshots[p.id];
      const np=snap?snap.totalPlayers.toNumber():0;
      const room=dash.info.room;
      const amt=parseFloat(ethers.utils.formatEther(dash.info.amount)).toFixed(4);
      active.push({pool:p,room,amt,np});
    }catch(e){}
  }
  if(!active.length){
    section.style.display='none';
    return;
  }
  section.style.display='block';
  cardsEl.innerHTML=active.map(a=>{
    const modeClass=a.pool.mode;
    const poolBadgeColor=modeClass==='storm'?'var(--hot)':'var(--acid)';
    return `<div class="my-active-card" onclick="enterPool('${a.pool.id}')">
      <div class="mac-dot"></div>
      <div class="mac-info">
        <div class="mac-pool">
          <span class="pool-tag ${modeClass}" style="margin-right:4px;">${a.pool.label}</span>
          房间 ${NAMES[a.room]}
        </div>
        <div class="mac-status">已投入 ${a.amt} BNB · 等待满员结算</div>
      </div>
      <div class="mac-meta">${a.np}/10 人</div>
      <button class="mac-btn">进入 →</button>
    </div>`;
  }).join('');
}

async function updateMyPendingGlobal(){
  if(!myAddr) return;
  let totalRef=0,totalRebate=0;
  const rows=[];
  for(const p of POOLS){
    if(!p.ca) continue;
    const c=poolReadContracts[p.id]||poolContracts[p.id];
    if(!c) continue;
    try{
      const [ref,rebate]=await Promise.all([
        c.referralPending(myAddr),
        c.rebatePending(myAddr)
      ]);
      const refF=parseFloat(ethers.utils.formatEther(ref));
      const rebateF=parseFloat(ethers.utils.formatEther(rebate));
      totalRef+=refF;totalRebate+=rebateF;
      rows.push({poolId:p.id,label:p.label,refF,rebateF});
    }catch(e){}
  }
  document.getElementById('refTotalPending').textContent=totalRef.toFixed(4)+' BNB';
  document.getElementById('refTotalRebate').textContent=totalRebate.toFixed(4)+' BNB';
  document.getElementById('gsMyPending').textContent=(totalRef+totalRebate).toFixed(4)+' BNB';
  const listEl=document.getElementById('refContractList');
  listEl.innerHTML=rows.map(r=>`
    <div class="ref-contract-row">
      <span class="ref-contract-name">${r.label}</span>
      <span class="ref-contract-amt ${r.refF>0?'':'zero'}">${r.refF.toFixed(4)} BNB</span>
    </div>`).join('');
  const wBtn=document.getElementById('refWithdrawAllBtn');
  const rBtn=document.getElementById('refRebateAllBtn');
  if(totalRef>0){wBtn.disabled=false;wBtn.textContent='一键提取佣金 '+totalRef.toFixed(4)+' BNB';}
  else{wBtn.disabled=true;wBtn.textContent='暂无可提取佣金';}
  if(totalRebate>0){rBtn.disabled=false;rBtn.textContent='一键提取返佣 '+totalRebate.toFixed(4)+' BNB';}
  else{rBtn.disabled=true;rBtn.textContent='暂无可提取返佣';}
  const noteEl=document.getElementById('refNoteHome');
  if(noteEl) noteEl.textContent='';
}

async function doWithdrawAll(type){
  if(!myAddr||!signer){toast('请先连接钱包','err');return;}
  const btn=document.getElementById(type==='referral'?'refWithdrawAllBtn':'refRebateAllBtn');
  btn.disabled=true;btn.innerHTML='<span class="spin"></span> 提取中…';
  let successCount=0;
  for(const p of POOLS){
    if(!p.ca) continue;
    const abi=p.isMain?MAIN_ABI:POOL_ABI;
    const c=new ethers.Contract(p.ca,abi,signer);
    try{
      const pending=await (type==='referral'?c.referralPending(myAddr):c.rebatePending(myAddr));
      if(pending.isZero()) continue;
      const tx=await (type==='referral'?c.withdrawReferral():c.withdrawRebate());
      await tx.wait();
      successCount++;
      toast(`✓ ${p.label} 提取成功`,'ok');
    }catch(e){
      if(e?.code!==4001) toast(`${p.label} 提取失败`,'warn');
    }
  }
  if(successCount===0) toast('无可提取金额','warn');
  await updateMyPendingGlobal();
  await refreshBalance();
}

async function refreshPoolDetail(){
  if(!currentPoolId) return;
  const p=POOLS.find(x=>x.id===currentPoolId);
  if(!p||!p.ca) return;
  const c=poolReadContracts[currentPoolId]||poolContracts[currentPoolId];
  if(!c) return;
  try{
    const pd=await c.getFullPageData(20);
    const s=pd.snapshot;snap=s;
    if(pd.recentGames&&pd.recentGames.length) renderHist([...pd.recentGames]);
    const cstats=pd.stats;
    if(cstats){
      currentFeeRate=cstats.currentFeeRate.toNumber();
      currentRefPct=cstats.referralPct.toNumber();
      currentRebatePct=cstats.rebatePct?cstats.rebatePct.toNumber():10;
      const distPct=100-currentFeeRate;
      const ruleDesc=document.getElementById('ruleDistDesc');
      if(ruleDesc) ruleDesc.innerHTML=`四房间全部投入之和为奖池，扣除 <b>${currentFeeRate}%</b> 手续费后，剩余 <b>${distPct}%</b> 按存活房间内各玩家投入占比分配。`;
      const ruleEx=document.getElementById('ruleExample');
      if(ruleEx){
        const exFee=(currentFeeRate/100).toFixed(2);
        const exDist=(1-currentFeeRate/100).toFixed(2);
        const exShare=((1-currentFeeRate/100)*0.3/0.4).toFixed(3);
        ruleEx.textContent=`⚠ 示例：10人总投入 1 BNB，手续费 ${exFee} BNB，奖池 ${exDist} BNB。若 A 房间存活（共投 0.4 BNB），其中投入 0.3 BNB 的玩家可分得 ${exDist} × 0.3/0.4 = ${exShare} BNB。`;
      }
      const estLabel=document.getElementById('estDistLabel');
      if(estLabel) estLabel.textContent=distPct+'% 发放';
    }
    const fin=s.isFinished;
    if(fin){
      const nextGid=s.gameId.toNumber()+1;
      document.getElementById('cGid').textContent='#'+nextGid;
      document.getElementById('cPlayers').textContent='0 / 10';
      document.getElementById('cProgTxt').textContent='0 / 10';
      document.getElementById('progBar').style.width='0%';
      document.getElementById('cStatus').innerHTML='<span class="live-ind"><span class="live-pip wait"></span>待开局</span>';
      document.getElementById('cPool').textContent='0.0000 BNB';
      for(let i=0;i<10;i++) document.getElementById('pip'+i).className='ppip';
      NAMES.forEach((_,i)=>{
        document.getElementById('rp'+i).textContent='0';
        document.getElementById('ra'+i).textContent='0.0000 BNB';
        document.getElementById('rpc'+i).textContent='0%';
        document.getElementById('rbar'+i).style.width='0%';
      });
      snap={...s,roomAmounts:[0,1,2,3].map(()=>ethers.BigNumber.from(0)),roomPlayerCounts:[0,1,2,3].map(()=>ethers.BigNumber.from(0)),totalPlayers:ethers.BigNumber.from(0)};
      myJoined=false;myRoom=-1;selRoom=-1;
      document.getElementById('myBanner').classList.remove('show');
      document.getElementById('myEst').classList.remove('show');
      NAMES.forEach((_,i)=>{
        document.getElementById('rc'+i).classList.remove('is-mine','selected');
        document.getElementById('rtick'+i)?.classList.remove('on');
      });
      const _t=document.getElementById('selRoomTag');
      if(_t){_t.className='sel-room-tag srt-none';_t.textContent='未选择房间';}
      updateDepBtn();
    }else{
      const gid=s.gameId.toNumber(),np=s.totalPlayers.toNumber();
      document.getElementById('cGid').textContent='#'+gid;
      document.getElementById('cPlayers').textContent=np+' / 10';
      document.getElementById('cProgTxt').textContent=np+' / 10';
      document.getElementById('progBar').style.width=(np/10*100)+'%';
      document.getElementById('cStatus').innerHTML='<span class="live-ind"><span class="live-pip"></span>进行中</span>';
      const counts=[0,1,2,3].map(i=>s.roomPlayerCounts[i].toNumber());
      let pipIdx=0;
      for(let r=0;r<4;r++){for(let k=0;k<counts[r];k++){const el=document.getElementById('pip'+pipIdx);if(el)el.className='ppip '+['room-a','room-b','room-c','room-d'][r];pipIdx++;}}
      for(let i=pipIdx;i<10;i++){const el=document.getElementById('pip'+i);if(el)el.className='ppip';}
      let tot=ethers.BigNumber.from(0);s.roomAmounts.forEach(a=>tot=tot.add(a));
      const tb=parseFloat(ethers.utils.formatEther(tot));
      document.getElementById('cPool').textContent=tb.toFixed(4)+' BNB';
      NAMES.forEach((_,i)=>{
        const b=parseFloat(ethers.utils.formatEther(s.roomAmounts[i]));
        const pc=tb>0?(b/tb*100):0;
        document.getElementById('rp'+i).textContent=s.roomPlayerCounts[i].toNumber();
        document.getElementById('ra'+i).textContent=b.toFixed(4)+' BNB';
        document.getElementById('rpc'+i).textContent=pc.toFixed(1)+'%';
        document.getElementById('rbar'+i).style.width=pc+'%';
      });
    }
    updateCalc();
    if(myJoined) updateMyEst();
  }catch(e){}
}

async function checkMeInPool(){
  if(!currentPoolId||!myAddr) return;
  const p=POOLS.find(x=>x.id===currentPoolId);
  if(!p||!p.ca) return;
  const c=poolContracts[currentPoolId]||poolReadContracts[currentPoolId];
  if(!c) return;
  if(snap?.isFinished){
    myJoined=false;myRoom=-1;selRoom=-1;
    document.getElementById('myBanner').classList.remove('show');
    updateDepBtn();return;
  }
  try{
    const dash=await c.getUserDashboard(myAddr);
    const r=dash.info;
    if(dash.isMigrated&&dash.newContract!=='0x0000000000000000000000000000000000000000'){
      toast('合约已升级，请前往新版本','warn');
    }
    if(dash.claimableAmount&&!dash.claimableAmount.isZero()){
      toast('你有 '+bnb(dash.claimableAmount)+' BNB 可领取（转账失败备用金）','info');
    }
    if(r.joined){
      myJoined=true;myRoom=r.room;
      const amt=parseFloat(ethers.utils.formatEther(r.amount)).toFixed(4);
      document.getElementById('myBanner').classList.add('show');
      document.getElementById('myAmtLabel').textContent=amt+' BNB';
      const bdg=document.getElementById('myRoomBadge');
      bdg.className='room-badge '+BDGC[myRoom];bdg.textContent='房间 '+NAMES[myRoom];
      document.getElementById('rc'+myRoom).classList.add('is-mine');
      const counts=[0,1,2,3].map(i=>{try{return snap?.roomPlayerCounts?.[i]?.toNumber()||0;}catch(e){return 0;}});
      let myPipIdx=0;
      for(let ri=0;ri<=myRoom;ri++) myPipIdx+=counts[ri];
      myPipIdx--;
      if(myPipIdx>=0){const myEl=document.getElementById('pip'+myPipIdx);if(myEl)myEl.className='ppip '+['room-a','room-b','room-c','room-d'][myRoom]+' mine';}
      updateMyEst();
      selRoom=myRoom;
      NAMES.forEach((_,j)=>{document.getElementById('rc'+j).classList.remove('selected');document.getElementById('rtick'+j).classList.remove('on');document.getElementById('rc'+j).style.pointerEvents='';});
      document.getElementById('rc'+myRoom).classList.add('selected');
      document.getElementById('rtick'+myRoom).classList.add('on');
      const tag=document.getElementById('selRoomTag');
      tag.className='sel-room-tag '+SRT[myRoom];tag.textContent='房间 '+NAMES[myRoom]+' 已锁定';
    }else{
      myJoined=false;myRoom=-1;
      document.getElementById('myBanner').classList.remove('show');
      document.getElementById('myEst').classList.remove('show');
      NAMES.forEach((_,i)=>{document.getElementById('rc'+i).classList.remove('is-mine');document.getElementById('rc'+i).style.pointerEvents='';});
    }
  }catch(e){}
  updateDepBtn();
}

function renderHist(recs){
  lastHistRecs=recs;
  const p=POOLS.find(x=>x.id===currentPoolId)||{survivingRooms:1};
  if(recs.length&&document.getElementById('algoBody')?.querySelector('.algo-empty')){
    buildAlgoLogFromHistory(recs);
  }
  const tb=document.getElementById('histBody');
  if(!recs.length){tb.innerHTML='<tr><td colspan="8"><div class="empty-state">// 暂无历史记录</div></td></tr>';return;}
  document.getElementById('histCount').textContent='共 '+recs.length+' 局';
  tb.innerHTML=recs.map((r,idx)=>{
    const _rawFlags=r.survivingRoomFlags;
    const _allZero=!_rawFlags||!_rawFlags.length||_rawFlags.every(f=>{const v=f&&f.toNumber?f.toNumber():Number(f||0);return v===0;});
    let flagsArr;
    if(_allZero&&r.survivingRoom!=null){
      const _ri=r.survivingRoom&&r.survivingRoom.toNumber?r.survivingRoom.toNumber():Number(r.survivingRoom);
      flagsArr=[0,1,2,3].map(i=>i===_ri?1:0);
    } else {
      flagsArr=_rawFlags||[0,0,0,0];
    }
    const survivingIdxs=[];
    flagsArr.forEach((f,i)=>{const fv=f&&f.toNumber?f.toNumber():Number(f||0);if(fv===1)survivingIdxs.push(i);});
    const isEmpty=r.distributed.isZero();
    const eid='e'+idx;
    let chips='';
    NAMES.forEach((_,i)=>{const n=r.playerCounts[i].toNumber();if(n>0)chips+=`<span class="chip ${CHIP[i]}">${NAMES[i]}×${n}</span>`;});
    let survBadge='';
    if(isEmpty){
      const ri=survivingIdxs[0]??0;
      survBadge=`<span class="surv-badge ${SB[ri]}">${EMOJIS[ri]} ${NAMES[ri]}（无人）</span>`;
    }else if(survivingIdxs.length===1){
      const ri=survivingIdxs[0];
      survBadge=`<span class="surv-badge ${SB[ri]}">${EMOJIS[ri]} ${NAMES[ri]}</span>`;
    }else{
      survBadge=`<span class="surv-badge sb-multi">存活 ${survivingIdxs.map(i=>NAMES[i]).join('+')} 房间</span>`;
    }
    const paidHtml=isEmpty?'<span class="volt-cell">→ 平台</span>':`<span class="green-cell">+${bnb(r.distributed)} BNB</span>`;
    let tot=ethers.BigNumber.from(0);r.roomTotals.forEach(t=>tot=tot.add(t));
    const totF=parseFloat(ethers.utils.formatEther(tot));
    const gidNum=r.gameId.toNumber?r.gameId.toNumber():Number(r.gameId);
    const myData=myAddr?(myGameData[gidNum]||null):null;
    const expRooms=NAMES.map((_,i)=>{
      const b=parseFloat(ethers.utils.formatEther(r.roomTotals[i]));
      const pc=totF>0?(b/totF*100).toFixed(1)+'%':'0%';
      const win=survivingIdxs.includes(i);
      const myRoomIdx=myData?(typeof myData.room==='number'?myData.room:(myData.room?.toNumber?.()??-1)):-1;
      let myRow='';
      if(myData&&myRoomIdx===i){
        if(win&&myData.payout!=null){
          const profit=(myData.payout-myData.deposit).toFixed(4);
          myRow=`<div class="exp-my-row exp-my-win">▲ 存活 · 收益 +${myData.payout.toFixed(4)} BNB (+${profit})</div>`;
        }else if(win){
          myRow=`<div class="exp-my-row exp-my-win">▲ 存活 · 投入 ${myData.deposit.toFixed(4)} BNB</div>`;
        }else{
          myRow=`<div class="exp-my-row exp-my-loss">▼ 淘汰 · 损失 -${myData.deposit.toFixed(4)} BNB</div>`;
        }
      }
      return `<div class="exp-room${win?' winner-room':''}">
        <div class="exp-room-header">
          <span class="exp-room-name" style="color:${ECOLOR[i]}">${NAMES[i]} 房间</span>
          ${win?'<span class="winner-pip">存活</span>':'<span class="eliminated-pip">淘汰</span>'}
        </div>
        <div class="exp-room-stats">${b.toFixed(4)} BNB · ${r.playerCounts[i].toNumber()} 人 · ${pc}</div>
        ${myRow}
      </div>`;
    }).join('');
    const noPayNote=isEmpty?`<div class="no-payout-note">⚠ 存活房间无人投注，${bnb(r.feeTaken)} BNB 已全额归入平台。</div>`:'';
    return `<tr class="data-row" onclick="togExp('${eid}')">
      <td class="gid-cell">#${r.gameId}</td>
      <td>${survBadge}</td>
      <td><div class="chip-row">${chips||'—'}</div></td>
      <td><span class="mono-cell">${bnb(r.totalPot)} BNB</span></td>
      <td><span class="red-cell">-${bnb(r.feeTaken)} BNB</span></td>
      <td>${paidHtml}</td>
      <td class="muted-cell">${fmtT(r.timestamp.toNumber())}</td>
      <td class="tog-cell" id="tog${eid}">▼</td>
    </tr>
    <tr class="exp-row"><td colspan="8">
      <div class="exp-inner" id="${eid}">
        <div class="exp-grid">${expRooms}${noPayNote}</div>
      </div>
    </td></tr>`;
  }).join('');
}

function togExp(id){
  const el=document.getElementById(id),tog=document.getElementById('tog'+id);
  if(!el) return;
  const open=el.classList.toggle('open');
  tog.textContent=open?'▲':'▼';
}

function pickRoom(i){
  if(myJoined) return;
  selRoom=i;
  NAMES.forEach((_,j)=>{
    document.getElementById('rc'+j).classList.remove('selected');
    document.getElementById('rtick'+j).classList.remove('on');
  });
  document.getElementById('rc'+i).classList.add('selected');
  document.getElementById('rtick'+i).classList.add('on');
  const tag=document.getElementById('selRoomTag');
  tag.className='sel-room-tag '+SRT[i];tag.textContent='房间 '+NAMES[i];
  updateDepBtn();updateCalc();
}

function updateCalc(){
  const v=parseFloat(document.getElementById('amtInput').value)||0;
  if(!v||v<=0||selRoom<0){document.getElementById('depCalc').classList.remove('show');
    NAMES.forEach((_,i)=>{document.getElementById('rest'+i).classList.remove('show');});return;}
  document.getElementById('depCalc').classList.add('show');
  const feeR=currentFeeRate/100;
  const fee=v*feeR,net=v*(1-feeR);
  document.getElementById('cFee2').textContent=v.toFixed(4)+' BNB';
  document.getElementById('cFee').textContent='-'+fee.toFixed(4)+' BNB';
  document.getElementById('cNet').textContent=net.toFixed(4)+' BNB';
  let roomBnb=[0,1,2,3].map(i=>{
    if(!snap) return 0;
    try{return parseFloat(ethers.utils.formatEther(snap.roomAmounts[i]));}catch(e){return 0;}
  });
  let newTot=roomBnb.reduce((a,b)=>a+b,0)+v;
  const newDist=newTot*(1-currentFeeRate/100);
  const nr=roomBnb[selRoom]+v;
  const est=nr>0?newDist*(v/nr):0;
  document.getElementById('cRet').textContent='≈'+est.toFixed(4)+' BNB';
  NAMES.forEach((_,i)=>{
    const nr2=roomBnb[i]+v;
    const ret=newDist*(v/nr2);
    document.getElementById('restv'+i).textContent='≈'+ret.toFixed(4)+' BNB';
    document.getElementById('rest'+i).classList.add('show');
  });
}

function updateMyEst(){
  const myEst=document.getElementById('myEst');
  if(!myJoined||!snap){myEst.classList.remove('show');return;}
  myEst.classList.add('show');
  let tot=ethers.BigNumber.from(0);
  try{snap.roomAmounts.forEach(a=>tot=tot.add(a));}catch(e){}
  const totBnb=parseFloat(ethers.utils.formatEther(tot));
  const distBnb=totBnb*(1-currentFeeRate/100);
  const roomBnb=parseFloat(ethers.utils.formatEther(snap.roomAmounts[myRoom]||ethers.BigNumber.from(0)));
  const myAmtBnb=parseFloat(document.getElementById('myAmtLabel').textContent)||0;
  const retBnb=roomBnb>0?distBnb*(myAmtBnb/roomBnb):0;
  document.getElementById('myEstPot').textContent=totBnb.toFixed(4)+' BNB';
  document.getElementById('myEstDist').textContent=distBnb.toFixed(4)+' BNB';
  document.getElementById('myEstPct').textContent=roomBnb>0?(myAmtBnb/roomBnb*100).toFixed(1)+'%':'--';
  document.getElementById('myEstRet').textContent='≈'+retBnb.toFixed(4)+' BNB';
}

function updateDepBtn(){
  const btn=document.getElementById('depBtn'),note=document.getElementById('depNote');
  if(!myAddr){btn.innerHTML='<span>投入</span>';btn.disabled=true;note.innerHTML='请先 <span class="hl">连接钱包</span> 并选择房间，输入金额后投入。';note.className='dep-note';return;}
  if(myJoined&&!snap?.isFinished){btn.innerHTML='<span>已参与</span>';btn.disabled=true;note.innerHTML='本局已参与，等待满员（10人）后链上立即原子结算。';note.className='dep-note warn';return;}
  if(selRoom<0){btn.innerHTML='<span>请先选择房间</span>';btn.disabled=true;note.innerHTML='点击上方房间卡片选择后，输入金额即可投入。';note.className='dep-note';return;}
  btn.innerHTML='<span>投入 → 房间 '+NAMES[selRoom]+'</span>';
  btn.disabled=false;
  note.innerHTML='投入后不可撤回。满员时同笔交易立即结算：奖池发放给存活房间玩家。';
  note.className='dep-note';
}

async function doDeposit(){
  if(!myAddr){toast('请先连接钱包','err');return;}
  if(selRoom<0){toast('请先选择房间','err');return;}
  const raw=document.getElementById('amtInput').value;
  if(!raw||parseFloat(raw)<=0){toast('请输入有效金额','err');return;}
  const p=POOLS.find(x=>x.id===currentPoolId);
  if(!p){toast('场次错误','err');return;}
  const btn=document.getElementById('depBtn');
  btn.innerHTML='<span class="spin"></span>发送中…';btn.disabled=true;
  document.querySelectorAll('.room-card').forEach(c=>c.style.pointerEvents='none');
  const roomSnap=selRoom;
  try{
    const _curPlayers=snap?(snap.totalPlayers?.toNumber?snap.totalPlayers.toNumber():Number(snap.totalPlayers||0)):0;
    const _isLast=(_curPlayers>=9);
    const gasLimit=ethers.BigNumber.from(_isLast?1500000:300000);
    const c=poolContracts[currentPoolId];
    if(!c){toast('请先连接钱包','err');return;}
    const tx=await c.joinRoom(roomSnap,{value:ethers.utils.parseEther(raw),gasLimit});
    toast('交易已提交，等待上链…','info');
    await tx.wait();
    const roomName=NAMES[roomSnap]||String(roomSnap);
    toast('✓ 成功投入房间 '+roomName,'ok');
    document.querySelectorAll('.room-card').forEach(c=>c.style.pointerEvents='');
    await refreshBalance();
    if(_refreshAllTimer){clearTimeout(_refreshAllTimer);_refreshAllTimer=null;}
    await refreshPoolDetail();
    if(myAddr) await checkMeInPool();
  }catch(e){
    const code=e?.code||'';
    const msg=e?.reason||e?.data?.message||e?.message||'';
    if(code===4001||msg.toLowerCase().includes('user rejected')||msg.toLowerCase().includes('denied')){
      toast('已取消','warn');
    }else{
      toast('错误：'+(msg||'交易失败').slice(0,70),'err');
    }
    document.querySelectorAll('.room-card').forEach(c=>c.style.pointerEvents='');
  }finally{
    updateDepBtn();
  }
}

function subscribeAllGlobalEvents(){
  POOLS.forEach(p=>{
    if(!p.ca) return;
    const c=poolReadContracts[p.id];
    if(!c) return;
    try{c.removeAllListeners();}catch(e){}
    c.on('GameFinished',(gid,survivingFlags,tp,ft,dist,empty,ev)=>{
      const _gidN=gid.toNumber();
      const txHash=ev?.transactionHash||null;
      const blockN=ev?.blockNumber||null;
      (async()=>{
        try{
          const recs=await c.getHistory(Math.max(0,(await c.getHistoryCount()).toNumber()-1),1);
          if(recs&&recs[0]&&recs[0].gameId.toNumber()===_gidN){
            const r0=recs[0];
            globalAlgoLog(p,_gidN,survivingFlags,tp,ft,dist,empty,txHash,r0.roomTotals,r0.playerCounts,blockN,r0.timestamp?r0.timestamp.toNumber():null,r0.seedValue?r0.seedValue.toHexString():null,r0.addrEntropy?r0.addrEntropy.toHexString():null,r0.blockHashSnapshot||null);
          }
        }catch(e){}
      })();
      mergeGlobalHist(p.id,[{...{gameId:gid,survivingRoomFlags:survivingFlags,totalPot:tp,feeTaken:ft,distributed:dist,timestamp:{toNumber:()=>Math.floor(Date.now()/1000)},playerCounts:[0,1,2,3].map(()=>ethers.BigNumber.from(0)),roomTotals:[0,1,2,3].map(()=>ethers.BigNumber.from(0))},_poolId:p.id}]);
      refreshHomeData();
    });
  });
}

const _globalAlgoLoggedIds=new Set();

function buildGlobalAlgoLogFromHistory(pool, recs){
  if(!recs||!recs.length) return;
  const recent=[...recs].filter(r=>{
    const gid=r.gameId.toNumber?r.gameId.toNumber():Number(r.gameId);
    return !_globalAlgoLoggedIds.has(pool.id+'_'+gid);
  }).slice(0,3).reverse();
  if(!recent.length) return;
  recent.forEach(r=>{
    const gid=r.gameId.toNumber?r.gameId.toNumber():Number(r.gameId);
    const flags=r.survivingRoomFlags||[0,0,0,0];
    globalAlgoLog(
      pool, gid, flags,
      r.totalPot, r.feeTaken, r.distributed,
      r.distributed&&r.distributed.isZero?r.distributed.isZero():false,
      null,
      r.roomTotals, r.playerCounts,
      r.blockNumber?r.blockNumber.toNumber():null,
      r.timestamp?r.timestamp.toNumber():null,
      r.seedValue?r.seedValue.toHexString():null,
      r.addrEntropy?r.addrEntropy.toHexString():null,
      r.blockHashSnapshot||null
    );
  });
}
function globalAlgoLog(pool,gameId,survivingFlags,totalPot,feeTaken,distributed,isEmpty,txHash,roomTotals,playerCounts,blockNum,blockTs,seedVal,addrEntropy,blockHash){
  const body=document.getElementById('globalAlgoBody');
  if(!body) return;
  const key=pool.id+'_'+gameId;
  if(_globalAlgoLoggedIds.has(key)) return;
  _globalAlgoLoggedIds.add(key);
  const emptyEl=body.querySelector('.algo-empty');
  if(emptyEl) emptyEl.remove();
  const flagsArr=survivingFlags||[];
  const survivingIdxs=[];
  flagsArr.forEach((f,i)=>{const fv=f.toNumber?f.toNumber():Number(f);if(fv===1)survivingIdxs.push(i);});
  const seedStr=seedVal?String(seedVal):'--';
  const modeClass=pool.mode;
  const survText=survivingIdxs.length===1
    ?`<span style="color:${ECOLOR[survivingIdxs[0]]}">房间 ${NAMES[survivingIdxs[0]]} 存活</span>`
    :`<span style="color:var(--acid)">房间 ${survivingIdxs.map(i=>NAMES[i]).join('+')} 存活</span>`;
  const entry=document.createElement('div');
  entry.className='algo-entry';
  entry.setAttribute('data-gkey',key);
  entry.innerHTML=`
    <div class="ae-header" onclick="toggleAlgoCalc(this)">
      <span class="pool-tag ${modeClass}" style="font-size:.5rem;">${pool.label}</span>
      <span class="ae-gid">#${gameId}</span>
      <span class="ae-rooms">${survText}</span>
      <span class="ae-seed-short">seed: ${seedStr.slice(0,14)}…</span>
      <span class="ae-arrow">▼</span>
    </div>
    <div class="ae-calc">
      <div class="ae-calc-inner">
        <div class="ae-section">
          <div class="ae-section-title">随机算法输入</div>
          <div class="ae-row"><span>blockhash: </span>${blockHash?(typeof blockHash==='string'?blockHash:blockHash._hex||'--'):'--'}</div>
          <div class="ae-row"><span>blockNum: </span>${blockNum||'--'} · <span>timestamp: </span>${blockTs?new Date(blockTs*1000).toLocaleString('zh-CN'):'-'}</div>
          <div class="ae-row"><span>addrEntropy: </span>${addrEntropy?String(addrEntropy).slice(0,20)+'…':'--'}</div>
        </div>
        <div class="ae-result-row">${survText}${txHash?`<a class="ae-txlink" href="https://bscscan.com/tx/${txHash}" target="_blank">⬡ BscScan ↗</a>`:''}</div>
      </div>
    </div>`;
  body.insertBefore(entry,body.firstChild);
  if(body.children.length>30) body.removeChild(body.lastChild);
}

function subscribePoolEvents(poolId){
  const p=POOLS.find(x=>x.id===poolId);
  if(!p||!p.ca) return;
  const c=poolContracts[poolId]||poolReadContracts[poolId];
  if(!c) return;
  c.removeAllListeners();
  c.on('GameFinished',(gid,survivingFlags,tp,ft,dist,empty,ev)=>{
    const _txHash=ev?.transactionHash||null;
    const _blockN=ev?.blockNumber||null;
    const _gidN=gid.toNumber();
    openResult(_gidN,survivingFlags,tp,ft,dist,empty);
    (async()=>{
      try{
        const rc=poolReadContracts[poolId]||c;
        const ct=(await rc.getHistoryCount()).toNumber();
        if(ct>0){
          const recs=await rc.getHistory(Math.max(0,ct-1),1);
          if(recs&&recs[0]&&recs[0].gameId.toNumber()===_gidN){
            const r0=recs[0];
            algoLog(_gidN,survivingFlags,tp,ft,dist,empty,_txHash,r0.roomTotals,r0.playerCounts,_blockN,r0.timestamp?r0.timestamp.toNumber():null,r0.seedValue?r0.seedValue.toHexString():null,r0.addrEntropy?r0.addrEntropy.toHexString():null,r0.blockHashSnapshot||null);
          }
        }
      }catch(e){}
    })();
    refreshAllDebounced(1200);refreshBalance();
  });
  c.on('PlayerJoined',(gid,player,room,amount)=>{
    refreshAllDebounced(600);
    if(player.toLowerCase()===myAddr?.toLowerCase()){
      const g=gid.toNumber();
      myGameData[g]=myGameData[g]||{};
      myGameData[g].room=typeof room==='number'?room:room.toNumber();
      myGameData[g].deposit=parseFloat(ethers.utils.formatEther(amount));
      refreshBalance();checkMeInPool();
    }
  });
  c.on('WinnerPaid',(gid,player,amount)=>{
    if(player.toLowerCase()===myAddr?.toLowerCase()){
      const g=gid.toNumber();
      myGameData[g]=myGameData[g]||{};
      myGameData[g].payout=parseFloat(ethers.utils.formatEther(amount));
    }
  });
}

function unsubscribePool(poolId){
  const c=poolContracts[poolId]||poolReadContracts[poolId];
  if(c) try{c.removeAllListeners();}catch(e){}
}

let _refreshAllTimer2=null;
function refreshAllDebounced(delay){
  if(_refreshAllTimer2) clearTimeout(_refreshAllTimer2);
  _refreshAllTimer2=setTimeout(()=>{_refreshAllTimer2=null;refreshPoolDetail();if(myAddr)checkMeInPool();},delay||800);
}

function startPoll(){
  if(pollId) clearInterval(pollId);
  pollId=setInterval(()=>{
    if(currentPoolId) refreshPoolDetail();
    else refreshHomeData();
  },12000);
}

function openResult(gameId,survivingFlags,tp,ft,dist,isEmpty){
  const flagsArr=survivingFlags||[];
  const survivingIdxs=[];
  flagsArr.forEach((f,i)=>{const fv=f.toNumber?f.toNumber():Number(f);if(fv===1)survivingIdxs.push(i);});
  let titleText='';
  if(survivingIdxs.length===1){titleText=`房间 ${NAMES[survivingIdxs[0]]} 存活！`;}
  else if(survivingIdxs.length>1){titleText=`房间 ${survivingIdxs.map(i=>NAMES[i]).join('+')} 存活！`;}
  else{titleText='结算完成';}
  document.getElementById('rEmoji').textContent=survivingIdxs.length>1?'🌸':'💥';
  document.getElementById('rTitle').textContent=isEmpty?`房间（无人）`:titleText;
  document.getElementById('rSub').innerHTML=`第 <b>#${gameId}</b> 局结束。${isEmpty?'存活房间本局无人投注。':'玩家已按比例分配奖励 🎉'}`;
  const noPay=document.getElementById('rNoPay');
  if(isEmpty){noPay.style.display='block';noPay.textContent=`⚠ 存活房间无人投注，全部 ${bnb(ft)} BNB 已归入平台。`;}
  else noPay.style.display='none';
  document.getElementById('rStats').innerHTML=`
    <div class="rstat-item"><div class="rstat-label">总奖池</div><div class="rstat-value" style="color:var(--volt)">${bnb(tp)} BNB</div></div>
    <div class="rstat-item"><div class="rstat-label">手续费</div><div class="rstat-value" style="color:var(--hot)">-${bnb(ft)} BNB</div></div>
    <div class="rstat-item"><div class="rstat-label">实际发放</div><div class="rstat-value" style="color:var(--acid)">${bnb(dist)} BNB</div></div>`;
  document.getElementById('resultBg').classList.add('show');
}
function closeResult(){document.getElementById('resultBg').classList.remove('show');}
document.getElementById('resultBg').addEventListener('click',function(e){if(e.target===this)closeResult();});

function algoLog(gameId, survivingFlags, totalPot, feeTaken, distributed, isEmpty, txHash, roomTotals, playerCounts, blockNum, blockTs, seedVal, addrEntropy, blockHash){
  const body=document.getElementById('algoBody');
  if(!body) return;
  if(_algoLoggedIds.has(gameId)){
    if(txHash){
      const exist=body.querySelector(`[data-gid="${gameId}"]`);
      if(exist){const lnk=exist.querySelector('.ae-txlink');if(!lnk){const res=exist.querySelector('.ae-result-row');if(res)res.insertAdjacentHTML('beforeend',`<a class="ae-txlink" href="https://bscscan.com/tx/${txHash}" target="_blank">⬡ BscScan 验证 ↗</a>`);}}
    }
    return;
  }
  _algoLoggedIds.add(gameId);
  const emptyEl=body.querySelector('.algo-empty');
  if(emptyEl) emptyEl.remove();
  const flagsArr=survivingFlags||[];
  const survivingIdxs=[];
  flagsArr.forEach((f,i)=>{const fv=f.toNumber?f.toNumber():Number(f);if(fv===1)survivingIdxs.push(i);});
  const seedStr=seedVal?String(seedVal):'--';
  const bHashStr=blockHash?(typeof blockHash==='string'?blockHash:blockHash._hex||'--'):'--';
  const addrEntStr=addrEntropy?String(addrEntropy):'--';
  const modText=survivingIdxs.length===1?`seed % 活跃房间数 → 存活房间 ${NAMES[survivingIdxs[0]]}`:`seed % 活跃房间数 → 淘汰一个房间，存活: ${survivingIdxs.map(i=>NAMES[i]).join('+')}`;
  const survText=survivingIdxs.length===1
    ?`<span style="color:${ECOLOR[survivingIdxs[0]]}">房间 ${NAMES[survivingIdxs[0]]} 存活</span>`
    :`<span style="color:var(--acid)">房间 ${survivingIdxs.map(i=>NAMES[i]).join('+')} 存活</span>`;
  const cls=isEmpty?'algo-entry sb-empty':'algo-entry';
  const entry=document.createElement('div');
  entry.className=cls;
  entry.setAttribute('data-gid',String(gameId));
  entry.innerHTML=`
    <div class="ae-header" onclick="toggleAlgoCalc(this)">
      <span class="ae-gid">#${gameId}</span>
      <span class="ae-rooms">${survText}</span>
      <span class="ae-seed-short">seed: ${seedStr.slice(0,18)}…</span>
      <span class="ae-arrow">▼</span>
    </div>
    <div class="ae-calc">
      <div class="ae-calc-inner">
        <div class="ae-section">
          <div class="ae-section-title">随机算法输入</div>
          <div class="ae-row"><span>blockhash: </span>${bHashStr.slice(0,20)}…</div>
          <div class="ae-row"><span>blockNum: </span>${blockNum||'--'}</div>
          <div class="ae-row"><span>timestamp: </span>${blockTs?new Date(blockTs*1000).toLocaleString('zh-CN'):'-'}</div>
          <div class="ae-row"><span>addrEntropy: </span>${addrEntStr.slice(0,20)}…</div>
        </div>
        <div class="ae-section">
          <div class="ae-section-title">种子计算</div>
          <div class="ae-row">seed = keccak256(blockhash, timestamp, blockNum, gameId, totalPot, roomTotals, addrEntropy)</div>
          <div class="ae-row"><span>seedValue: </span>${seedStr}</div>
        </div>
        <div class="ae-result-row">${modText}${txHash?`<a class="ae-txlink" href="https://bscscan.com/tx/${txHash}" target="_blank">⬡ BscScan ↗</a>`:''}</div>
      </div>
    </div>`;
  body.insertBefore(entry,body.firstChild);
  if(body.children.length>20) body.removeChild(body.lastChild);
}

function toggleAlgoCalc(header){
  const calc=header.nextElementSibling;
  const arrow=header.querySelector('.ae-arrow');
  if(!calc) return;
  const open=calc.classList.toggle('open');
  if(arrow) arrow.style.transform=open?'rotate(180deg)':'';
}

function buildAlgoLogFromHistory(recs){
  if(!recs||!recs.length) return;
  const recent=[...recs].filter(r=>{const gid=r.gameId.toNumber?r.gameId.toNumber():Number(r.gameId);return !_algoLoggedIds.has(gid);}).slice(0,5).reverse();
  if(!recent.length) return;
  recent.forEach(r=>{
    const gid=r.gameId.toNumber?r.gameId.toNumber():Number(r.gameId);
    const _af=r.survivingRoomFlags;
    const _afz=!_af||!_af.length||_af.every(f=>{const v=f&&f.toNumber?f.toNumber():Number(f||0);return v===0;});
    let flags;
    if(_afz&&r.survivingRoom!=null){
      const _ari=r.survivingRoom&&r.survivingRoom.toNumber?r.survivingRoom.toNumber():Number(r.survivingRoom);
      flags=[0,1,2,3].map(i=>i===_ari?1:0);
    }else{flags=_af||[0,0,0,0];}
    algoLog(gid,flags,r.totalPot,r.feeTaken,r.distributed,r.distributed.isZero(),null,r.roomTotals,r.playerCounts,r.blockNumber?r.blockNumber.toNumber():null,r.timestamp?r.timestamp.toNumber():null,r.seedValue?r.seedValue.toHexString():null,r.addrEntropy?r.addrEntropy.toHexString():null,r.blockHashSnapshot||null);
  });
}

function waitForInjection(ms=3000){return new Promise(resolve=>{if(window.ethereum||window.BinanceChain)return resolve(true);const t0=Date.now();const iv=setInterval(()=>{if(window.ethereum||window.BinanceChain){clearInterval(iv);resolve(true);}else if(Date.now()-t0>ms){clearInterval(iv);resolve(false);}},60);});}
function gatherProviders(){const out=[],seen=new Set();const push=(label,p)=>{if(p&&!seen.has(p)){seen.add(p);out.push({label,p});}};if(window.BinanceChain)push('Binance Wallet',window.BinanceChain);const eth=window.ethereum;if(!eth)return out;const list=(eth.providers&&eth.providers.length)?eth.providers:[eth];list.forEach(p=>{if(p.isBinance||p.isBinanceChain)push('Binance Wallet',p);else if(p.isOKExWallet||p.isOKXWallet)push('OKX Wallet',p);else if(p.isCoinbaseWallet)push('Coinbase Wallet',p);else if(p.isMetaMask)push('MetaMask',p);else push('Wallet',p);});return out;}
async function switchToBSC(p,silent=false){try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:CID}]});}catch(e){if(e.code===4001)throw e;if(e.code===4902||(e.message||'').includes('Unrecognized chain')){await p.request({method:'wallet_addEthereumChain',params:[{chainId:CID,chainName:'BNB Smart Chain',nativeCurrency:{name:'BNB',symbol:'BNB',decimals:18},rpcUrls:RPC_LIST,blockExplorerUrls:['https://bscscan.com/']}]});}}}

async function connectWith(rawP,silent=false){
  if(!silent){if(rawP.isBinance||rawP.isBinanceChain){await rawP.enable();}else{await rawP.request({method:'eth_requestAccounts'});}}
  if(silent){const accs=await rawP.request({method:'eth_accounts'});if(!accs||!accs.length)return false;}
  await switchToBSC(rawP,silent);
  ethProvider=new ethers.providers.Web3Provider(rawP,'any');
  await ethProvider.ready;
  signer=ethProvider.getSigner();
  myAddr=await signer.getAddress();
  POOLS.forEach(p=>{
    if(!p.ca) return;
    const abi=p.isMain?MAIN_ABI:POOL_ABI;
    poolContracts[p.id]=new ethers.Contract(p.ca,abi,signer);
  });
  if(currentPoolId&&POOLS.find(x=>x.id===currentPoolId)?.ca){
    const p=POOLS.find(x=>x.id===currentPoolId);
    const abi=p.isMain?MAIN_ABI:POOL_ABI;
    poolContracts[currentPoolId]=new ethers.Contract(p.ca,abi,signer);
  }
  const btn=document.getElementById('conBtn');
  btn.textContent=myAddr.slice(0,6)+'…'+myAddr.slice(-4);
  btn.classList.add('connected');btn.disabled=false;
  document.getElementById('balChip').classList.add('show');
  await refreshBalance();
  if(currentPoolId){await refreshPoolDetail();await checkMeInPool();}
  else{await refreshHomeData();}
  startPoll();
  if(currentPoolId) subscribePoolEvents(currentPoolId);
  if(!silent) toast('钱包已连接 ✓','ok');
  refreshReferral();
  checkAllMyActive();
  checkAndBindReferral();
  if(rawP.on){rawP.on('accountsChanged',()=>location.reload());rawP.on('chainChanged',()=>location.reload());}
  return true;
}

async function connectWallet(){
  const btn=document.getElementById('conBtn');btn.disabled=true;btn.innerHTML='<span class="spin"></span>';
  const found=await waitForInjection(3000);
  if(!found){toast('未检测到钱包插件，请安装 MetaMask 或 Binance Wallet','err');btn.disabled=false;btn.textContent='连接钱包';return;}
  const wallets=gatherProviders();btn.disabled=false;
  if(!wallets.length){toast('未找到可用钱包','err');btn.textContent='连接钱包';return;}
  if(wallets.length===1){try{await connectWith(wallets[0].p,false);}catch(e){btn.textContent='连接钱包';if(e.code===4001)toast('用户取消连接','warn');else toast('连接失败：'+(e.message||'').slice(0,60),'err');}return;}
  btn.textContent='连接钱包';openWPick(wallets);
}
function openWPick(wallets){document.getElementById('wpickList').innerHTML=wallets.map((w,i)=>`<button class="wpick-item" onclick="pickWallet(${i})"><span class="wpick-icon">${WICON[w.label]||'👛'}</span><span>${w.label}</span></button>`).join('');window._wl=wallets;document.getElementById('wpickBg').classList.add('show');}
function closeWPick(){document.getElementById('wpickBg').classList.remove('show');}
async function pickWallet(i){closeWPick();try{await connectWith(window._wl[i].p,false);}catch(e){if(e.code===4001)toast('用户取消连接','warn');else toast('连接失败：'+(e.message||'').slice(0,60),'err');document.getElementById('conBtn').textContent='连接钱包';}}

async function refreshBalance(){if(!ethProvider||!myAddr)return;try{const b=await ethProvider.getBalance(myAddr);document.getElementById('balChip').textContent=parseFloat(ethers.utils.formatEther(b)).toFixed(4)+' BNB';}catch(e){}}

async function refreshReferral(){
  if(!myAddr) return;
  buildRefLink();
  const noteEl=document.getElementById('refNoteHome');
  if(noteEl) noteEl.textContent='';
  const mainC=poolReadContracts['main']||poolContracts['main'];
  if(!mainC) return;
  try{
    const zero='0x0000000000000000000000000000000000000000';
    const [referrer,refCount]=await Promise.all([mainC.referrerOf(myAddr),mainC.referralCount(myAddr)]);
    myReferrer=referrer===zero?null:referrer;
    document.getElementById('refMyRefHome').textContent=myReferrer?myReferrer.slice(0,8)+'…'+myReferrer.slice(-6):'未绑定';
    document.getElementById('refCountHome').textContent=refCount.toNumber()+' 人';
    await updateMyPendingGlobal();
  }catch(e){}
}

function buildRefLink(){
  if(!myAddr) return;
  const url=window.location.origin+window.location.pathname+'?ref='+myAddr;
  document.getElementById('refLinkHome').textContent=url;
}

function copyRefLink(){
  const url=document.getElementById('refLinkHome').textContent;
  if(!url||url.includes('连接钱包')){toast('请先连接钱包','warn');return;}
  navigator.clipboard.writeText(url).then(()=>toast('邀请链接已复制 ✓','ok')).catch(()=>{const inp=document.createElement('input');inp.value=url;document.body.appendChild(inp);inp.select();document.execCommand('copy');document.body.removeChild(inp);toast('邀请链接已复制 ✓','ok');});
}

function toggleRef(bodyId,arrowId){
  const b=document.getElementById(bodyId),a=document.getElementById(arrowId);
  if(!b) return;
  const open=b.classList.toggle('open');
  if(a) a.classList.toggle('open',open);
}

function closeBindRef(confirmed){
  document.getElementById('bindRefBg').classList.remove('show');
  if(confirmed&&_pendingRefAddr) _doBindReferrer(_pendingRefAddr);
  else _pendingRefAddr=null;
}
async function _doBindReferrer(refAddr){
  const mainC=poolContracts['main'];
  if(!mainC){toast('请先连接钱包','err');return;}
  try{
    const tx=await mainC.bindReferrer(refAddr);
    toast('绑定中…','info');await tx.wait();
    toast('✓ 邀请关系已绑定','ok');
    try{sessionStorage.removeItem('pendingRef');}catch(e){}
    window.history.replaceState({},'',window.location.pathname);
    _pendingRefAddr=null;
    await refreshReferral();
  }catch(e){toast('错误：'+(e?.reason||e?.message||'绑定失败').slice(0,60),'err');}
}
async function checkAndBindReferral(){
  if(!poolContracts['main']||!myAddr) return;
  let refAddr=new URLSearchParams(window.location.search).get('ref');
  if(!refAddr||!ethers.utils.isAddress(refAddr)){try{refAddr=sessionStorage.getItem('pendingRef');}catch(e){}}
  if(!refAddr||!ethers.utils.isAddress(refAddr)) return;
  if(refAddr.toLowerCase()===myAddr.toLowerCase()) return;
  try{
    const mainC=poolReadContracts['main']||poolContracts['main'];
    const referrer=await mainC.referrerOf(myAddr);
    const zero='0x0000000000000000000000000000000000000000';
    if(referrer!==zero){try{sessionStorage.removeItem('pendingRef');}catch(e){}return;}
    _pendingRefAddr=refAddr;
    document.getElementById('bindRefAddrTxt').textContent=refAddr.slice(0,10)+'…'+refAddr.slice(-8);
    document.getElementById('bindBenefitRebateTxt').innerHTML=`每次投入手续费 <b>${currentRebatePct}% 返佣</b>给自己`;
    document.getElementById('bindBenefitRefTxt').textContent=currentRefPct+'%';
    document.getElementById('bindRefBg').classList.add('show');
  }catch(e){}
}

function toggleHomeRules(){
  const b=document.getElementById('homeRulesBody'),a=document.getElementById('homeRulesArrow');
  if(!b) return;
  const open=b.classList.toggle('open');
  if(a) a.classList.toggle('open',open);
}

function toggleRules(){
  const b=document.getElementById('rulesBody'),a=document.getElementById('rulesArrow');
  const open=b.classList.toggle('open');
  if(a) a.classList.toggle('open',open);
}

function toggleTheme(){
  const day=document.documentElement.classList.toggle('day');
  document.getElementById('themeBtn').textContent=day?'☀️':'🌙';
  try{localStorage.setItem('theme',day?'day':'night');}catch(e){}
}
window.toggleTheme=toggleTheme;
window.connectWallet=connectWallet;
window.closeWPick=closeWPick;
window.pickWallet=pickWallet;
window.closeResult=closeResult;
window.closeBindRef=closeBindRef;
window.enterPool=enterPool;
window.goHome=goHome;
window.switchMode=switchMode;
window.pickRoom=pickRoom;
window.doDeposit=doDeposit;
window.toggleHomeRules=toggleHomeRules;
window.toggleRules=toggleRules;
window.toggleRef=toggleRef;
window.copyRefLink=copyRefLink;
window.doWithdrawAll=doWithdrawAll;
window.setHistMode=setHistMode;
window.setHistTier=setHistTier;
window.togExp=togExp;
window.toggleAlgoCalc=toggleAlgoCalc;

(function(){
  try{if(localStorage.getItem('theme')==='day'){document.documentElement.classList.add('day');document.getElementById('themeBtn').textContent='☀️';}}catch(e){}
})();

document.addEventListener('input',e=>{if(e.target.id==='amtInput')updateCalc();});

function startPoll(){if(pollId)clearInterval(pollId);pollId=setInterval(()=>{if(currentPoolId)refreshPoolDetail();else refreshHomeData();},12000);}
function toast(msg,type='info'){const s=document.getElementById('toastStack');const el=document.createElement('div');el.className='t-item '+type;el.textContent=msg;s.appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),320);},4500);}
function bnb(bn){try{return parseFloat(ethers.utils.formatEther(bn)).toFixed(4);}catch(e){return '0.0000';}}
function fmtT(ts){return new Date(ts*1000).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});}
