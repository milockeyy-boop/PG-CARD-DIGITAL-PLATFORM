(() => {
  const cfg = window.PG_CONFIG || {API_BASE_URL:"", DEMO_MODE:true};
  const $ = id => document.getElementById(id);
  const showStatus = (id, msg) => { const el=$(id); if(el) el.textContent=msg; };
  const api = async (path, payload) => {
    if (!cfg.API_BASE_URL) throw new Error("Backend belum dikonfigurasi. Tampilan ini belum dapat memproses akun sungguhan.");
    const res = await fetch(cfg.API_BASE_URL.replace(/\/$/,"")+path, {
  method:"POST",
  headers:{"Content-Type":"text/plain;charset=utf-8"},
  body:JSON.stringify(payload)
});
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.message || "Permintaan gagal diproses.");
    return data;
  };
  const loginTab=$("loginTab"), activateTab=$("activateTab");
  const loginForm=$("loginForm"), activateForm=$("activateForm");
  function setMode(mode){
    if(!loginForm || !activateForm) return;
    const login=mode==="login";
    loginForm.classList.toggle("hidden",!login);
    activateForm.classList.toggle("hidden",login);
    loginTab.classList.toggle("active",login);
    activateTab.classList.toggle("active",!login);
  }
  if(loginTab){loginTab.addEventListener("click",()=>setMode("login"));activateTab.addEventListener("click",()=>setMode("activate"));}
  if(loginForm) loginForm.addEventListener("submit",async e=>{
    e.preventDefault(); showStatus("loginStatus","");
    try{
      const data=await api("/auth/login",{memberNumber:$("loginCard").value.trim(),password:$("loginPassword").value});
      if(!data.token || !data.member) throw new Error("Respons backend tidak lengkap.");
      sessionStorage.setItem("pg_session",JSON.stringify({token:data.token,member:data.member}));
      renderDashboard(data.member);
    }catch(err){showStatus("loginStatus",err.message);}
  });
  if(activateForm) activateForm.addEventListener("submit",async e=>{
    e.preventDefault(); showStatus("activateStatus","");
    if($("newPassword").value!==$("confirmPassword").value){showStatus("activateStatus","Konfirmasi password belum sama.");return;}
    if($("newPassword").value.length<10){showStatus("activateStatus","Password minimal 10 karakter.");return;}
    try{
      const data=await api("/auth/activate",{memberNumber:$("memberCard").value.trim(),postalCode:$("postalCode").value.trim(),password:$("newPassword").value});
      showStatus("activateStatus",data.message || "Aktivasi berhasil. Silakan login.");
      activateForm.reset(); setMode("login");
    }catch(err){showStatus("activateStatus",err.message);}
  });
  function renderDashboard(member){
    if(!$("dashboard")) return;
    $("authPanel").classList.add("hidden"); $("dashboard").classList.remove("hidden");
    $("memberName").textContent=member.name || "Member";
    $("dashCardNumber").textContent=member.memberNumber || member.cardNumber || "PG CARD";
    $("memberStatus").textContent=member.status || "Aktif";
    $("memberPoints").textContent=member.points ?? "—";
  }
  if($("logoutBtn")) $("logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("pg_session");location.reload();});
  if($("adminForm")) $("adminForm").addEventListener("submit",async e=>{
    e.preventDefault();showStatus("adminStatus","");
    try{
      const data=await api("/admin/login",{username:$("adminUser").value.trim(),password:$("adminPass").value});
      if(!data.token) throw new Error("Token admin tidak diterima.");
      sessionStorage.setItem("pg_admin_session",data.token);
      $("adminForm").classList.add("hidden");$("adminDashboard").classList.remove("hidden");
    }catch(err){showStatus("adminStatus",err.message);}
  });
  if($("adminLogout")) $("adminLogout").addEventListener("click",()=>{sessionStorage.removeItem("pg_admin_session");location.reload();});
})();
