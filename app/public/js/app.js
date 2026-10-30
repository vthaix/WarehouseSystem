const app = document.querySelector("#app"),
  modal = document.querySelector("#modal"),
  modalBody = document.querySelector("#modal-body");
let user,
  csrf,
  current = "dashboard",
  page = 1,
  cached = [],
  retryKey,
  reportAsOf;
const pageSize = 20;
const isMysql = JSON.parse(app.dataset.boot || "{}").storage === "mysql";
const labels = warehouseNavigation.labels;
const modules = warehouseNavigation.modules;
const has = (roles) =>
    roles.includes("*") || user.roles.some((r) => roles.includes(r)),
  available = () => modules.filter((m) => has(m[3])).map(m=>{const copy=[...m];for(const role of user.roles){const name=warehouseNavigation.roleLabels?.[role]?.[m[0]];if(name){copy[1]=name;break;}}return copy;}),
  moduleInfo = () => available().find((m) => m[0] === current);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const badge = (v) =>
  `<span class="badge ${esc(v)}">${esc(labels[v] || v || "—")}</span>`;
const format = warehousePresentation.format;
function toast(s) {
  const t = document.querySelector("#toast");
  t.textContent = s;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 4000);
}
function confirmPlanQuantity(message) {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = 'planning-confirm-dialog';
    dialog.setAttribute('aria-labelledby', 'planning-confirm-title');
    dialog.setAttribute('aria-describedby', 'planning-confirm-message');
    dialog.innerHTML = `<div class="planning-confirm-content"><button type="button" class="planning-confirm-close" aria-label="Đóng thông báo">×</button><div class="planning-confirm-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m10.3 4.3-7.5 13a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 3h.01"/></svg></div><span class="planning-confirm-eyebrow">XÁC NHẬN KẾ HOẠCH</span><h2 id="planning-confirm-title">Số lượng vượt mức dự kiến</h2><p id="planning-confirm-message"></p><div class="planning-confirm-note">Nếu tiếp tục, hệ thống sẽ giữ nguyên số lượng bạn đã nhập.</div></div><div class="planning-confirm-actions"><button type="button" class="button" data-confirm-cancel autofocus>Quay lại chỉnh sửa</button><button type="button" class="button primary" data-confirm-accept>Xác nhận tiếp tục</button></div>`;
    dialog.querySelector('#planning-confirm-message').textContent = message;
    dialog.querySelector('[data-confirm-cancel]').onclick = () => dialog.close('cancel');
    dialog.querySelector('.planning-confirm-close').onclick = () => dialog.close('cancel');
    dialog.querySelector('[data-confirm-accept]').onclick = () => dialog.close('accept');
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close('cancel'); } });
    dialog.addEventListener('close', () => { const accepted=dialog.returnValue==='accept'; dialog.remove(); resolve(accepted); }, {once:true});
    document.body.append(dialog);
    dialog.showModal();
  });
}
async function api(path, method = "GET", body, key) {
  const res = await fetch("/api/v1/" + path, {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 204) return {};
  const r = await res.json();
  if (!res.ok) {
    if (r.error?.code === "PLAN_CONFIRMATION_REQUIRED" && body && body.confirm_plan_overage !== true && /^(production-plans|business-plans)(\/|$)/.test(path)) {
      if (await confirmPlanQuantity(r.error.message)) return api(path,method,{...body,confirm_plan_overage:true},crypto.randomUUID());
      const cancelled=new Error("Đã hủy lưu. Bạn có thể điều chỉnh số lượng rồi lưu lại."); cancelled.code="CONFIRMATION_CANCELLED"; throw cancelled;
    }
    const e = new Error(r.error.message);
    Object.assign(e, {
      fields: r.error.fields,
      status: res.status,
      request_id: r.meta?.request_id,
    });
    if (res.status === 401 && user) {
      user = null;
      modal.close();
      login();
    }
    throw e;
  }
  return r;
}
function errorHTML(e) {
  return `<div class="error" role="alert">${esc(e.message)}${Object.entries(
    e.fields || {},
  )
    .map(([k, v]) => `\n${esc(fieldLabel(k))}: ${esc(v.join(", "))}`)
    .join("")}${e.request_id ? `\nMã hỗ trợ: ${esc(e.request_id)}` : ""}</div>`;
}
function login(preserve = false) {
  if (!preserve)
    app.innerHTML = `<div class="login"><section class="login-art"><div class="brand"><span class="brand-icon">✿</span><span>sweet bakery<small>XƯỞNG BÁNH ĐÓNG GÓI</small></span></div><div><div class="eyebrow">TỪ MẺ BÁNH ĐẾN TỪNG GÓI HÀNG</div><h1>Mẻ bánh ngọt ngào.<br>Vận hành chỉn chu.</h1><p>Từ nguyên liệu đến từng gói bánh quy, bánh bông lan — quản lý sản xuất, chất lượng và giao hàng trong một không gian.</p></div><small>Sweet Bakery · Phiên bản phát triển</small></section><section class="login-form"><div class="login-box"><div class="eyebrow">CHÀO MỪNG TRỞ LẠI</div><h1>Đăng nhập hệ thống</h1><p class="subtitle">Sử dụng tài khoản được cấp cho bộ phận của bạn.</p><div id="login-error"></div><form id="login-form"><label for="username">Tên đăng nhập</label><input id="username" name="username" autocomplete="username" required maxlength="80" placeholder="Ví dụ: manager"><label for="password">Mật khẩu</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128"><button class="button primary" type="submit">Đăng nhập →</button></form><div class="hint">Tài khoản mẫu: <code>customer</code>, <code>planner</code>, <code>purchaser</code>, <code>manager</code>, <code>staff</code>, <code>qc</code>, <code>stocktaker</code>, <code>workshop</code>, <code>director</code>.<br>Mật khẩu lấy từ DEMO_PASSWORD đã đặt khi chạy máy chủ.</div></div></section></div>`;
  document.querySelector("#login-form").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try {
      csrf = (await api("auth/csrf")).data.csrf_token;
      const d = (
        await api("auth/login", "POST", {
          username: e.target.elements.username.value,
          password: e.target.elements.password.value,
        })
      ).data;
      csrf = d.csrf_token;
      user = d;
      current = "dashboard";
      location.assign("/dashboard");
    } catch (err) {
      document.querySelector("#login-error").innerHTML = errorHTML(err);
    } finally {
      btn.disabled = false;
    }
  };
}
function shell(preserve = false) {
  if (!preserve)
    app.innerHTML = `<div class="layout"><aside class="sidebar"><a href="/dashboard" class="brand" data-nav="dashboard"><span class="brand-icon">✿</span><span>sweet bakery<small>XƯỞNG BÁNH ĐÓNG GÓI</small></span></a><div class="nav-label">KHÔNG GIAN LÀM VIỆC</div><nav><a class="nav-link ${current === "dashboard" ? "active" : ""}" href="/dashboard" data-nav="dashboard"><span class="nav-icon">⊞</span>Tổng quan</a>${available()
      .map(
        (m) =>
          `<a class="nav-link ${current === m[0] ? "active" : ""}" href="${m[5]}?module=${m[0]}" data-nav="${m[0]}"><span class="nav-icon">${m[2]}</span>${m[1]}</a>`,
      )
      .join(
        "",
      )}</nav><div class="sidebar-note">Theo dõi nguồn chứng từ.<br>Kiểm soát lô và chất lượng.<br>Đối chiếu từng lần ghi sổ.</div></aside><main><header class="topbar"><span class="topbar-left">Không gian làm việc / ${esc(current === "dashboard" ? "Tổng quan" : moduleInfo()?.[1])}</span><div class="profile"><button class="button small" data-nav="notifications" aria-label="Thông báo">♧</button><span class="avatar">${esc(user.full_name.slice(0, 1))}</span><div class="profile-text">${esc(user.full_name)}<small>${user.roles.map((r) => esc(labels[r])).join(", ")}</small></div><button class="button small" id="logout">Đăng xuất</button></div></header><div class="content" id="content"></div></main></div>`;
  app.querySelectorAll("[data-nav]").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        navigate(el.dataset.nav);
      }),
  );
  document.querySelector("#logout").onclick = async (event) => {
    event.preventDefault();
    try {
      await api("auth/logout", "POST", {});
      user = null;
      location.assign("/login");
    } catch (e) {
      toast(e.message);
    }
  };
  if (!preserve) render();
}
function navigate(n) {
  if (n !== "dashboard" && !available().some((m) => m[0] === n)) return;
  const m = modules.find((m) => m[0] === n);
  location.assign(
    n === "dashboard"
      ? "/dashboard"
      : m[5] + "?module=" + encodeURIComponent(n),
  );
}

function heading(title, sub, action = "") {
  return `<div class="heading"><div><div class="eyebrow">SWEET BAKERY / VẬN HÀNH</div><h1>${esc(title)}</h1><div class="subtitle">${esc(sub)}</div></div>${action}</div>`;
}
async function render() {
  const content = document.querySelector("#content");
  if (current === "dashboard") {
    content.innerHTML =
      heading(
        "Không gian làm việc",
        "Theo dõi nguyên liệu, những mẻ bánh và đơn hàng theo vai trò của bạn.",
      ) +
      `<div class="intro"><div><div class="eyebrow">SẴN SÀNG CHO NGÀY LÀM VIỆC</div><h2>Xin chào, ${esc(user.full_name)}.</h2><p>Chọn một nghiệp vụ bên dưới để bắt đầu. Các thao tác phê duyệt và ghi sổ được kiểm tra theo quyền và trạng thái chứng từ.</p></div><div class="intro-mark" aria-hidden="true">✿</div></div><div class="cards">${available()
        .filter((m) => m[0] !== "notifications")
        .map(
          (m) =>
            `<a class="card" href="${m[5]}" data-go="${m[0]}"><span class="card-icon">${m[2]}</span><h3>${m[1]}</h3><p>${m[6]}</p><span class="card-link">Mở chức năng →</span></a>`,
        )
        .join(
          "",
        )}</div><div class="panel"><div class="panel-title"><h2>Thông báo gần đây</h2><button class="button small" data-go="notifications">Xem tất cả →</button></div><div id="recent" class="loading">Đang tải thông báo…</div></div><div class="footer"><span>Sweet Bakery</span><span>Asia/Ho_Chi_Minh · Tiếng Việt</span></div>`;
    content.querySelectorAll("[data-go]").forEach(
      (el) =>
        (el.onclick = (e) => {
          e.preventDefault();
          navigate(el.dataset.go);
        }),
    );
    try {
      const rows = (await api("notifications?per_page=5")).data;
      const recent = document.querySelector("#recent");
      if (recent)
        recent.innerHTML = rows.length
          ? rows
              .map(
                (n) =>
                  `<div class="notification"><strong>${esc(n.title)}</strong><span class="subtitle">${esc(format(n.created_at))}</span></div>`,
              )
              .join("")
          : '<div class="empty">Bạn chưa có thông báo mới.</div>';
    } catch (e) {
      const recent = document.querySelector("#recent");
      if (recent) recent.innerHTML = errorHTML(e);
    }
    return;
  }
  const m = moduleInfo(),
    report = current.startsWith("reports/");
  content.innerHTML =
    heading(
      m[1],
      m[6],
      m[4].length && has(m[4])
        ? '<button class="button primary" id="create">＋ Tạo mới</button>'
        : report
          ? '<button class="button" id="export">↗ Xuất CSV</button>'
          : "",
    ) +
    `<div class="panel"><form class="filters" id="filters">${report ? "" : `<div><label for="q">Tìm kiếm</label><input id="q" name="q" placeholder="Tìm mã, tên chứng từ…"></div><div><label for="status">Trạng thái</label><select id="status" name="status"><option value="">Tất cả trạng thái</option>${["SUBMITTED", "RECEIVED", "PENDING", "PENDING_APPROVAL", "APPROVED", "DRAFT", "IN_PROGRESS", "COMPLETED", "POSTED", "CLOSED", "REJECTED"].map((s) => `<option value="${s}">${labels[s]}</option>`).join("")}</select></div>`}${report ? '<div><label for="warehouse_id">Mã kho</label><input name="warehouse_id" id="warehouse_id" placeholder="Ví dụ: 1"></div>' + (current === "reports/inventory" ? '<div><label for="as_of">Mốc thời gian</label><input type="datetime-local" name="as_of" id="as_of"></div>' : '<div><label for="from">Từ ngày</label><input type="date" name="from" id="from"></div><div><label for="to">Đến ngày</label><input type="date" name="to" id="to"></div>') : ""}<button class="button" type="submit">Lọc dữ liệu</button><button class="button" type="button" id="reset">Xóa lọc</button></form><div id="table" class="loading">Đang tải dữ liệu…</div></div>`;
  document
    .querySelector("#create")
    ?.addEventListener("click", () => createForm());
  document.querySelector("#filters").onsubmit = (e) => {
    e.preventDefault();
    page = 1;
    reportAsOf = null;
    loadTable();
  };
  document.querySelector("#reset").onclick = () => {
    document.querySelector("#filters").reset();
    page = 1;
    reportAsOf = null;
    loadTable();
  };
  if (report)
    document.querySelector("#export").onclick = () => {
      location.href = "/api/v1/" + current + "/export?format=csv&" + filterParams();
    };
  await loadTable();
}
function filterParams() {
  const f = document.querySelector("#filters"),
    p = new URLSearchParams(f ? new FormData(f) : {});
  // This hidden field selects an SSR screen, not an API filter.
  p.delete("module");
  for (const [k, v] of [...p]) if (!v) p.delete(k);
  if (p.get("as_of"))
    p.set("as_of", new Date(p.get("as_of") + "+07:00").toISOString());
  if (current === "reports/inventory" && !p.get("as_of") && reportAsOf)
    p.set("as_of", reportAsOf);
  p.set("page", page);
  p.set("per_page", pageSize);
  for(const key of ['kind','category_id']){const v=new URLSearchParams(location.search).get(key);if(v)p.set(key,v);}
  if(current==='categories'&&!p.get('kind'))p.set('kind','FINISHED_PRODUCT');
  return p;
}
async function loadTable() {
  const target = document.querySelector("#table"),
    resource = current;
  target.innerHTML = '<div class="loading">Đang tải dữ liệu…</div>';
  try {
    const result = await api(resource + "?" + filterParams());
    if (resource !== current) return;
    cached = result.data;
    if (resource === "reports/inventory") reportAsOf = result.meta.as_of;
    const cols = columnsFor(current);
    target.className = "";
    target.innerHTML = cached.length
      ? `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th>${c[1]}</th>`).join("")}<th>Thao tác</th></tr></thead><tbody>${cached.map((r, i) => `<tr>${cols.map(([k]) => `<td>${["status", "qc_status"].includes(k) ? (k === "status" ? statusBadge(r[k]) : badge(r[k])) : k === "code" ? `<strong>${esc(format(r[k],k,r))}</strong>` : esc(format(r[k],k,r))}</td>`).join("")}<td><div class="inline-actions"><button class="button small" data-detail="${i}">Chi tiết ↗</button>${(r.actions || []).includes("review") ? `<button class="button small" data-act="review" data-index="${i}">Duyệt</button>` : ""}${(r.actions || []).includes("post") ? `<button class="button small" data-act="post" data-index="${i}">Ghi phiếu</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>`
      : '<div class="empty"><div class="empty-icon">▤</div>Chưa có dữ liệu phù hợp.<br><span class="hint">Tạo chứng từ mới hoặc thay đổi bộ lọc để tiếp tục.</span></div>';
    const meta = result.meta;
    target.innerHTML += `<div class="pagination"><span>${meta.total ?? cached.length} kết quả · Trang ${page}</span><div class="inline-actions"><button class="button small" id="prev" ${page <= 1 ? "disabled" : ""}>← Trước</button><button class="button small" id="next" ${!meta.total_pages || page >= meta.total_pages ? "disabled" : ""}>Sau →</button></div></div>`;
    document.querySelector("#prev").onclick = () => {
      page--;
      loadTable();
    };
    document.querySelector("#next").onclick = () => {
      page++;
      loadTable();
    };
    target
      .querySelectorAll("[data-detail]")
      .forEach(
        (el) => (el.onclick = () => showDetail(cached[el.dataset.detail])),
      );
    target
      .querySelectorAll("[data-act]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            actionForm(cached[el.dataset.index], el.dataset.act)),
      );
  } catch (e) {
    if (user && resource === current) {
      target.innerHTML =
        errorHTML(e) +
        '<button class="button" id="reload">Thử tải lại</button>';
      document.querySelector("#reload").onclick = loadTable;
    }
  }
}
function columnsFor(n) {
  if(['warehouse-inbound','warehouse-outbound'].includes(n))return [['code','Mã tiếp nhận'],['purpose','Nghiệp vụ'],['requested_at','Ngày giờ thực hiện'],['status','Trạng thái']];
  if(n==='material-prices')return [['code','Mã nguyên vật liệu'],['name','Nguyên vật liệu'],['unit','Đơn vị tính'],['reference_price','Giá tham khảo (đ/đơn vị)']];
  if(n==='accounts')return [['username','Tên đăng nhập'],['full_name','Họ và tên'],['roles','Vai trò'],['status','Trạng thái']];
  if(n==='production-plans')return [['code','Kế hoạch sản xuất'],['customer_order_code','Đơn khách hàng'],['workshop_name','Xưởng phụ trách'],['order_total','Tổng giá trị đơn hàng'],['start_date','Ngày bắt đầu'],['end_date','Ngày hoàn thành'],['status','Trạng thái']];
  if(n==='business-plans')return [['code','Kế hoạch'],['type','Loại kế hoạch'],['planned_date','Ngày kế hoạch'],['status','Trạng thái']];
  if(n==='purchase-orders')return [['code','Đơn mua nguyên vật liệu'],['expected_delivery_date','Ngày dự kiến nhận'],['status','Trạng thái']];
  if(n==='stock-requests')return [['code','Yêu cầu'],['purpose','Nghiệp vụ'],['requested_at','Ngày giờ thực hiện'],['status','Trạng thái']];
  if(n==='stock-documents')return [['code','Phiếu kho'],['type','Loại phiếu'],['posted_at','Ngày giờ ghi phiếu'],['status','Trạng thái']];
  if(n==='inspection-counts')return [['code','Mã công việc'],['title','Công việc'],['start_at','Bắt đầu'],['status','Trạng thái']];
  if(n==='exception-proposals')return [['code','Mã ngoại lệ'],['type','Nguồn'],['reason','Vấn đề cần xử lý'],['status','Trạng thái']];
  if(n==='categories')return [['image_path','Ảnh'],['code','Mã'],['name','Tên'],['is_active','Hoạt động']];
  if(n==='production-reports')return [['code','Mã báo cáo'],['production_plan_code','Kế hoạch'],['report_purpose','Mục đích'],['progress_percentage','Tiến độ (%)'],['status','Trạng thái']];
  if(n === "customer-returns")return [["code","Mã hàng trả"],["return_warehouse_name","Kho nhận"],["return_receiver_name","Nhân viên nhận"],["status","Trạng thái"],["created_at","Ngày lập"]];
  if (n === "items")
    return [
      ["code", "Mã hàng"],
      ["name", "Tên mặt hàng"],
      ["kind", "Loại"],
      ["unit", "Đơn vị"],
      ["reference_price", "Giá tham khảo"],
    ];
  if (
    ["categories", "warehouses", "warehouse-locations", "suppliers"].includes(n)
  )
    return [
      ["code", "Mã"],
      ["name", "Tên"],
      ["is_active", "Hoạt động"],
    ];
  if (n === "lots")
    return [
      ["code", "Mã lô"],
      ["item_name", "Mặt hàng"],
      ["received_quantity", "Số lượng"],
      ["qc_status", "QC"],
      ["expiry_date", "Hạn dùng"],
    ];
  if (n === "reports/inventory")
    return [
      ["warehouse_name", "Kho"],
      ["item_name", "Mặt hàng"],
      ["lot_code", "Lô"],
      ["location_code", "Vị trí"],
      ["quality_bucket", "Chất lượng"],
      ["quantity", "Tồn"],
    ];
  if (n === "reports/stocktakes")
    return [
      ["warehouse_name", "Kho"],
      ["item_name", "Mặt hàng"],
      ["system_quantity", "Số lượng ghi nhận"],
      ["actual_quantity", "Thực tế"],
      ["difference", "Chênh lệch"],
    ];
  if (n === "notifications")
    return [
      ["title", "Nội dung"],
      ["created_at", "Thời điểm"],
      ["read_at", "Đã đọc"],
    ];
  if (n === "customer-orders")
    return [
      ["code", "Mã đơn"],
      ["customer_name", "Khách hàng"],
      ["latest_delivery_date", "Hạn giao"],
      ["quoted_total", "Giá trị"],
      ["status", "Trạng thái"],
    ];
  if (n === "stocktakes")
    return [
      ["code", "Mã đợt"],
      ["quality_kind", "Nhóm hàng"],
      ["planned_date", "Ngày"],
      ["location", "Địa điểm"],
      ["status", "Trạng thái"],
    ];
  if (n === "tasks")
    return [
      ["code", "Mã việc"],
      ["title", "Công việc"],
      ["start_at", "Bắt đầu"],
      ["priority", "Ưu tiên"],
      ["status", "Trạng thái"],
    ];
  return [
    ["code", "Mã chứng từ"],
    ["type", "Loại"],
    ["source_code", "Nguồn"],
    ["status", "Trạng thái"],
    ["version", "Phiên bản"],
  ];
}
function openModal(title, html) {
  modalBody.innerHTML = `<div class="dialog-head"><div><div class="eyebrow">SWEET BAKERY / CHI TIẾT</div><h2>${esc(title)}</h2></div><button class="button small" id="close-modal" aria-label="Đóng">✕</button></div><div id="form-error"></div>${html}`;
  document.querySelector("#close-modal").onclick = () => modal.close();
  if (!modal.open) modal.showModal();
}
function detailValue(key, value, record) {
  if(key==='image_path'&&value)return `<a href="${esc(value)}" target="_blank" rel="noopener noreferrer">Xem ảnh ↗</a>`;
  if (key === 'status') return statusBadge(value);
  if (key === 'note' && typeof value === 'string') {
    const attachment = value.match(/\[Ảnh báo cáo\]\((\/images\/[a-zA-Z0-9._/-]+)\)/);
    const note = attachment ? value.replace(attachment[0], '').trim() : value;
    return `${esc(format(note || null, key, record))}${attachment ? `<br><a href="${esc(attachment[1])}" target="_blank" rel="noopener noreferrer">Xem ảnh báo cáo</a>` : ''}`;
  }
  return esc(format(value, key, record));
}
function detail(r) {
  const hidden = ["actions", "lines", "outputs", "materials", "warehouses", "campaign_type"];
  openModal(
    r.name || r.title || r.display_code || r.code || "Chi tiết",
    `<dl class="detail-grid">${Object.entries(r)
      .filter(([k, v]) => !hidden.includes(k) && k !== 'id' && k !== 'version' && !k.endsWith('_id') && k !== 'created_by' && fieldNames[k] && (v===null||typeof v !== "object"))
      .map(
        ([k, v]) =>
          `<div><dt>${esc(k === 'code' ? `Mã ${moduleInfo()?.[1]?.toLowerCase() || 'chứng từ'}` : fieldLabel(k))}</dt><dd>${detailValue(k,v,r)}</dd></div>`,
      )
      .join("")}</dl>${["lines", "outputs", "materials", "allocations", "decision_history", "reinspections", "inspection_lots", "source_lots", "documents", "document_lines"]
      .filter((k) => r[k])
      .map(
        (k) =>
          `<div class="form-section"><h3>${fieldLabel(k)}</h3>${tableData(r[k])}</div>`,
      )
      .join(
        "",
      )}${r.warehouses ? `<div class="form-section"><h3>Phạm vi kiểm kê</h3>${r.warehouses.map((w) => `<div class="notification"><span>Kho ${esc(w.warehouse_id)} · ${badge(w.status)} · ${w.lines.filter((l) => l.actual_quantity !== null).length}/${w.lines.length} dòng đã đếm</span>${has(["STOCKTAKER", "QC_INSPECTOR"]) && w.assignee_ids.includes(user.id) ? `<button class="button small" data-count="${w.warehouse_id}">Mở bảng đếm</button>` : ""}</div>`).join("")}</div>` : ""}<div class="form-actions">${(r.actions || []).map((a) => `<button class="button ${["review", "post"].includes(a) ? "primary" : ""}" data-action="${a}">${{ handleMinuteException: "Xử lý ngoại lệ", reviewMinuteException: "Phê duyệt phương án", recordCount: "Ghi số lượng kiểm đếm", startInspection: "Bắt đầu đợt kiểm kê", bindInspection: "Chọn lô nguyên vật liệu đã nhận", recordInspection: "Ghi kết quả kiểm tra", bindLots: "Chọn phần lô thực tế", receiveReturn: "Nhận vào khu cách ly", cancelReturn: "Hủy hàng trả chưa nhận", reinspect: "Tái kiểm chất lượng", correct: "Chứng từ bù QC", apply: "Thực hiện", cancelAllocation: "Giải phóng phân công", edit: "Sửa", delete: "Hủy / Xóa", receive: "Tiếp nhận", review: "Phê duyệt", submit: "Gửi", start: "Bắt đầu kiểm kê", close: "Đóng đợt", post: "Ghi phiếu", progress: "Cập nhật tiến độ", dispatch: "Phân công kho", cancel: "Hủy kế hoạch", postTask: "Ghi phần hàng được giao" }[a]}</button>`).join("")}${current === "notifications" && !r.read_at ? '<button class="button" id="mark-read">Đánh dấu đã đọc</button>' : ""}</div>`,
  );
  modalBody
    .querySelectorAll("[data-action]")
    .forEach((el) => (el.onclick = () => actionForm(r, el.dataset.action)));
  modalBody
    .querySelectorAll("[data-count]")
    .forEach((el) => (el.onclick = () => countForm(r, el.dataset.count)));
  if (document.querySelector("#mark-read"))
    document.querySelector("#mark-read").onclick = async () => {
      try {
        await api("notifications/" + r.id + "/read", "PATCH", {});
        modal.close();
        loadTable();
      } catch (e) {
        document.querySelector("#form-error").innerHTML = errorHTML(e);
      }
    };
}
async function showDetail(row) {
  try {
    if (
      [
        'warehouse-inbound','warehouse-outbound',
        "customer-orders",
        "production-plans",
        "business-plans",
        "purchase-orders",
        "production-reports",
        "finished-reports",
        "qc-inspections",
        "stock-requests",
        "stock-documents",
        "warehouse-records",
      ].includes(current)
    )
      return detail((await api(current + "/" + row.id)).data);
    return detail(row);
  } catch (error) {
    toast(error.message);
  }
}
function tableData(rows) {
  if (!rows.length) return '<div class="empty">Chưa có dòng dữ liệu.</div>';
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter(
    (k) => k !== "id" && k !== 'version' && !k.endsWith('_id') && fieldNames[k] && typeof rows[0][k] !== "object",
  );
  return `<div class="table-wrap"><table><thead><tr>${keys.map((k) => `<th>${esc(fieldLabel(k))}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${keys.map((k) => `<td>${esc(format(r[k],k,r))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const fieldNames = warehouseNavigation.fieldNames;
function fieldLabel(k) {
  return warehousePresentation.fieldLabel(k);
}
window.addEventListener("popstate", () => {
  current =
    new URLSearchParams(location.search).get("module") ||
    modules.find((m) => m[5] === location.pathname)?.[0] ||
    "dashboard";
  if (user) {
    if (current !== "dashboard" && !available().some((m) => m[0] === current))
      current = "dashboard";
    shell();
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const boot = JSON.parse(app.dataset.boot || "{}");
  user = boot.user;
  csrf = boot.csrf;
  if (!user) {
    login(true);
    return;
  }
  current = boot.current || "dashboard";
  page = boot.page || 1;
  cached = boot.rows || [];
  reportAsOf = boot.meta?.as_of;
  shell(true);
  if (boot.form) return;
  document.querySelectorAll("[data-go]").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        navigate(el.dataset.go);
      }),
  );
  document
    .querySelector("#create")
    ?.addEventListener("click", () => createForm());
  const filters = document.querySelector("#filters");
  if (filters)
    filters.onsubmit = (e) => {
      e.preventDefault();
      page = 1;
      reportAsOf = null;
      loadTable();
    };
  document.querySelector("#reset")?.addEventListener("click", () => {
    filters.reset();
    page = 1;
    reportAsOf = null;
    loadTable();
  });
  document.querySelector("#export")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "/api/v1/" + current + "/export?format=csv&" + filterParams();
  });
  const prev = document.querySelector("#prev"),
    next = document.querySelector("#next");
  if (prev)
    prev.onclick = (e) => {
      e.preventDefault();
      if (page > 1) {
        page--;
        loadTable();
      }
    };
  if (next)
    next.onclick = (e) => {
      e.preventDefault();
      if (page < (boot.meta?.total_pages || 1)) {
        page++;
        loadTable();
      }
    };
  document.querySelectorAll("[data-detail]").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        showDetail(cached[el.dataset.detail]);
      }),
  );
  document
    .querySelectorAll("[data-act]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          actionForm(cached[el.dataset.index], el.dataset.act)),
    );
});

function statusBadge(value) {
  if (current === "customer-orders") {
    if (value === "APPROVED" && has(["CUSTOMER"]))
      return badge("CUSTOMER_ACCEPTED");
    if (value === "RECEIVED") return badge("ORDER_PENDING_REVIEW");
    if (value === "SUBMITTED") return badge("ORDER_SUBMITTED");
  }
  return badge(value);
}
