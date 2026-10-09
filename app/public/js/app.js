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
const labels = {
  CUSTOMER_ACCEPTED: "Đã tiếp nhận",
  ORDER_PENDING_REVIEW: "Chờ phê duyệt",
  ORDER_SUBMITTED: "Chờ tiếp nhận",
  QUALITY_CHECK: "Kiểm tra chất lượng",
  COUNT: "Kiểm đếm tồn kho",
  PROCUREMENT: "Bổ sung NVL",
  CLOSED_WITH_RETURNS: "Đã nhận, có trả NCC",
  CUSTOMER: "Khách hàng",
  PLANNER: "Lập kế hoạch",
  PURCHASER: "Mua hàng",
  WAREHOUSE_MANAGER: "Quản lý kho",
  WAREHOUSE_STAFF: "Nhân viên kho",
  QC_INSPECTOR: "QC/AC",
  STOCKTAKER: "Ban kiểm kê",
  WORKSHOP_OWNER: "Chủ xưởng",
  DIRECTOR: "Giám đốc",
  SUBMITTED: "Đã gửi",
  RECEIVED: "Đã tiếp nhận",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  PENDING_APPROVAL: "Chờ duyệt",
  PENDING: "Chờ xử lý",
  PARTIALLY_FULFILLED: "Xử lý một phần",
  FULFILLED: "Đã xử lý đủ",
  PARTIALLY_RECEIVED: "Nhận một phần",
  POSTED: "Đã ghi sổ",
  PLANNED: "Đã lên lịch",
  COUNTING: "Đang kiểm đếm",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
  VOID: "Đã hủy",
  DRAFT: "Bản nháp",
  APPLIED: "Đã áp dụng",
  AVAILABLE: "Khả dụng",
  QUARANTINE: "Cách ly",
  PASSED: "Đạt",
  PARTIAL: "Đạt một phần",
  FAILED: "Không đạt",
  IN: "Nhập",
  OUT: "Xuất",
  PURCHASE: "Mua",
  SALE: "Bán",
  MATERIAL: "Nguyên liệu",
  FINISHED_PRODUCT: "Thành phẩm",
};
const modules = [
  [
    "customer-orders",
    "Đơn hàng",
    "◫",
    ["CUSTOMER", "PLANNER", "DIRECTOR"],
    ["CUSTOMER"],
    "/customer/orders",
    "Tiếp nhận và theo dõi đơn đặt hàng.",
  ],
  [
    "business-plans",
    "Kế hoạch mua / bán",
    "▤",
    ["PLANNER", "DIRECTOR", "PURCHASER", "WORKSHOP_OWNER", "WAREHOUSE_STAFF"],
    ["PLANNER"],
    "/plans",
    "Điều phối nhu cầu mua và giao hàng.",
  ],
  [
    "purchase-orders",
    "Đơn mua hàng",
    "▧",
    ["PURCHASER", "WORKSHOP_OWNER", "WAREHOUSE_STAFF", "QC_INSPECTOR"],
    ["PURCHASER"],
    "/purchases",
    "Tạo đơn mua từ kế hoạch đã duyệt.",
  ],
  [
    "categories",
    "Danh mục",
    "▦",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/categories",
    "Phân nhóm nguyên liệu và thành phẩm.",
  ],
  [
    "items",
    "Mặt hàng",
    "◇",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/data",
    "Nguyên liệu, thành phẩm và hàng mẫu.",
  ],
  [
    "warehouses",
    "Kho hàng",
    "⌂",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/data",
    "Thông tin các kho trong hệ thống.",
  ],
  [
    "warehouse-locations",
    "Vị trí lưu kho",
    "⊞",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/data",
    "Quản lý kệ và ô lưu trữ.",
  ],
  [
    "suppliers",
    "Nhà cung cấp",
    "◎",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/data",
    "Thông tin đối tác cung ứng.",
  ],
  [
    "lots",
    "Lô hàng",
    "▥",
    ["WAREHOUSE_MANAGER"],
    ["WAREHOUSE_MANAGER"],
    "/catalog/data",
    "Theo dõi nguồn, hạn dùng và QC.",
  ],
  [
    "stock-requests",
    "Yêu cầu nhập / xuất",
    "⇄",
    ["WORKSHOP_OWNER", "WAREHOUSE_STAFF", "WAREHOUSE_MANAGER", "PLANNER"],
    ["WORKSHOP_OWNER"],
    "/workshop/requests",
    "Lập yêu cầu theo chứng từ nguồn.",
  ],
  [
    "stock-documents",
    "Phiếu nhập / xuất",
    "⇥",
    ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "DIRECTOR", "WORKSHOP_OWNER"],
    [],
    "/warehouse/documents",
    "Tra cứu chứng từ đã ghi sổ.",
  ],
  [
    "qc-inspections",
    "Kiểm tra QC / AC",
    "✓",
    ["QC_INSPECTOR", "DIRECTOR", "WORKSHOP_OWNER"],
    ["QC_INSPECTOR"],
    "/quality/inspections",
    "Số đạt và lỗi trước khi nhập kho.",
  ],
  [
    "production-plans",
    "Kế hoạch sản xuất",
    "⚒",
    ["PLANNER", "DIRECTOR", "WORKSHOP_OWNER", "WAREHOUSE_STAFF"],
    ["PLANNER"],
    "/production/plans",
    "Kế hoạch thành phẩm và nguyên liệu.",
  ],
  [
    "production-reports",
    "Báo cáo sản xuất",
    "▱",
    ["WORKSHOP_OWNER", "PLANNER"],
    ["WORKSHOP_OWNER"],
    "/production/reports",
    "Nguyên liệu hiện có và nhu cầu.",
  ],
  [
    "finished-reports",
    "Báo cáo thành phẩm",
    "▣",
    ["WORKSHOP_OWNER", "DIRECTOR"],
    ["WORKSHOP_OWNER"],
    "/production/finished-reports",
    "Sản lượng và lô hoàn thành.",
  ],
  [
    "stocktakes",
    "Kiểm kê kho",
    "≡",
    ["DIRECTOR", "STOCKTAKER", "WAREHOUSE_MANAGER", "QC_INSPECTOR"],
    ["DIRECTOR"],
    "/stocktakes",
    "Chốt snapshot và kiểm đếm từng kho.",
  ],
  [
    "stocktake-minutes",
    "Biên bản kiểm kê",
    "▨",
    ["STOCKTAKER", "DIRECTOR"],
    ["STOCKTAKER"],
    "/stocktake-minutes",
    "Tổng hợp số đếm và gửi biên bản.",
  ],
  [
    "exception-proposals",
    "Xử lý ngoại lệ",
    "△",
    ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"],
    ["WAREHOUSE_MANAGER"],
    "/approvals/exceptions",
    "Đề xuất điều chỉnh chênh lệch kiểm kê.",
  ],
  [
    "tasks",
    "Công việc",
    "▢",
    [
      "DIRECTOR",
      "WAREHOUSE_MANAGER",
      "WAREHOUSE_STAFF",
      "QC_INSPECTOR",
      "STOCKTAKER",
    ],
    ["DIRECTOR"],
    "/tasks",
    "Phân công và kiểm soát lịch nhân viên.",
  ],
  [
    "reports/inventory",
    "Báo cáo tồn kho",
    "◴",
    ["DIRECTOR"],
    [],
    "/reports/inventory",
    "Tồn kho tại một mốc thời gian.",
  ],
  [
    "reports/stock-documents",
    "Báo cáo nhập / xuất",
    "↗",
    ["DIRECTOR", "WORKSHOP_OWNER"],
    [],
    "/reports/stock-documents",
    "Đối chiếu phiếu theo kho và ngày.",
  ],
  [
    "reports/stocktakes",
    "Báo cáo kiểm kê",
    "▥",
    ["DIRECTOR"],
    [],
    "/reports/stocktakes",
    "Snapshot, thực tế và chênh lệch.",
  ],
  [
    "warehouse-records",
    "Hồ sơ kho tổng hợp",
    "▨",
    ["WAREHOUSE_MANAGER", "DIRECTOR", "WORKSHOP_OWNER"],
    ["WAREHOUSE_MANAGER"],
    "/warehouse/records",
    "Tổng hợp phiếu kho từ các nhân viên.",
  ],
  [
    "notifications",
    "Thông báo",
    "♧",
    ["*"],
    [],
    "/notifications",
    "Thông tin nghiệp vụ dành cho bạn.",
  ],
];
const has = (roles) =>
    roles.includes("*") || user.roles.some((r) => roles.includes(r)),
  available = () => modules.filter((m) => has(m[3])),
  moduleInfo = () => modules.find((m) => m[0] === current);
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
const format = (v) =>
  v === null
    ? "Chưa đếm"
    : v === undefined
      ? "—"
      : typeof v === "boolean"
        ? v
          ? "Có"
          : "Không"
        : /^\-?\d+\.\d+$/.test(String(v))
          ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 4 }).format(
              Number(v),
            )
          : labels[v] || v;
function toast(s) {
  const t = document.querySelector("#toast");
  t.textContent = s;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 4000);
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
    app.innerHTML = `<div class="login"><section class="login-art"><div class="brand"><span class="brand-icon">▦</span><span>warehouse<small>VẬN HÀNH KHO HÀNG</small></span></div><div><div class="eyebrow">MỌI NGHIỆP VỤ, MỘT NƠI</div><h1>Kho hàng rõ ràng.<br>Vận hành liền mạch.</h1><p>Kết nối đơn hàng, mua hàng, sản xuất và kiểm kê trong một không gian làm việc.</p></div><small>Warehouse System · Phiên bản phát triển</small></section><section class="login-form"><div class="login-box"><div class="eyebrow">CHÀO MỪNG TRỞ LẠI</div><h1>Đăng nhập hệ thống</h1><p class="subtitle">Sử dụng tài khoản được cấp cho bộ phận của bạn.</p><div id="login-error"></div><form id="login-form"><label for="username">Tên đăng nhập</label><input id="username" name="username" autocomplete="username" required maxlength="80" placeholder="Ví dụ: manager"><label for="password">Mật khẩu</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128"><button class="button primary" type="submit">Đăng nhập →</button></form><div class="hint">Tài khoản mẫu: <code>customer</code>, <code>planner</code>, <code>purchaser</code>, <code>manager</code>, <code>staff</code>, <code>qc</code>, <code>stocktaker</code>, <code>workshop</code>, <code>director</code>.<br>Mật khẩu lấy từ DEMO_PASSWORD đã đặt khi chạy máy chủ.</div></div></section></div>`;
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
    app.innerHTML = `<div class="layout"><aside class="sidebar"><a href="/dashboard" class="brand" data-nav="dashboard"><span class="brand-icon">▦</span><span>warehouse<small>VẬN HÀNH KHO HÀNG</small></span></a><div class="nav-label">KHÔNG GIAN LÀM VIỆC</div><nav><a class="nav-link ${current === "dashboard" ? "active" : ""}" href="/dashboard" data-nav="dashboard"><span class="nav-icon">⊞</span>Tổng quan</a>${available()
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
  return `<div class="heading"><div><div class="eyebrow">WAREHOUSE / VẬN HÀNH</div><h1>${esc(title)}</h1><div class="subtitle">${esc(sub)}</div></div>${action}</div>`;
}
async function render() {
  const content = document.querySelector("#content");
  if (current === "dashboard") {
    content.innerHTML =
      heading(
        "Không gian làm việc",
        "Các chức năng và thông báo dành cho vai trò của bạn.",
      ) +
      `<div class="intro"><div><div class="eyebrow">SẴN SÀNG CHO NGÀY LÀM VIỆC</div><h2>Xin chào, ${esc(user.full_name)}.</h2><p>Chọn một nghiệp vụ bên dưới để bắt đầu. Các thao tác phê duyệt và ghi sổ được kiểm tra theo quyền và trạng thái chứng từ.</p></div><div class="intro-mark">▦</div></div><div class="cards">${available()
        .filter((m) => m[0] !== "notifications")
        .map(
          (m) =>
            `<a class="card" href="${m[5]}" data-go="${m[0]}"><span class="card-icon">${m[2]}</span><h3>${m[1]}</h3><p>${m[6]}</p><span class="card-link">Mở chức năng →</span></a>`,
        )
        .join(
          "",
        )}</div><div class="panel"><div class="panel-title"><h2>Thông báo gần đây</h2><button class="button small" data-go="notifications">Xem tất cả →</button></div><div id="recent" class="loading">Đang tải thông báo…</div></div><div class="footer"><span>Warehouse System</span><span>Asia/Ho_Chi_Minh · Tiếng Việt</span></div>`;
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
                  `<div class="notification"><strong>${esc(n.title)}</strong><span class="subtitle">${new Date(n.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span></div>`,
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
      location.href = "/api/v1/" + current + "/export?" + filterParams();
    };
  await loadTable();
}
function filterParams() {
  const f = document.querySelector("#filters"),
    p = new URLSearchParams(f ? new FormData(f) : {});
  for (const [k, v] of [...p]) if (!v) p.delete(k);
  if (p.get("as_of"))
    p.set("as_of", new Date(p.get("as_of") + "+07:00").toISOString());
  if (current === "reports/inventory" && !p.get("as_of") && reportAsOf)
    p.set("as_of", reportAsOf);
  p.set("page", page);
  p.set("per_page", pageSize);
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
      ? `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th>${c[1]}</th>`).join("")}<th>Thao tác</th></tr></thead><tbody>${cached.map((r, i) => `<tr>${cols.map(([k]) => `<td>${["status", "qc_status"].includes(k) ? (k === "status" ? statusBadge(r[k]) : badge(r[k])) : k === "code" ? `<strong>${esc(r[k])}</strong>` : esc(format(r[k]))}</td>`).join("")}<td><div class="inline-actions"><button class="button small" data-detail="${i}">Chi tiết ↗</button>${(r.actions || []).includes("review") ? `<button class="button small" data-act="review" data-index="${i}">Duyệt</button>` : ""}${(r.actions || []).includes("post") ? `<button class="button small" data-act="post" data-index="${i}">Ghi phiếu</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>`
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
      .forEach((el) => (el.onclick = () => showDetail(cached[el.dataset.detail])));
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
      ["item_id", "Mặt hàng"],
      ["received_quantity", "Số lượng"],
      ["qc_status", "QC"],
      ["expiry_date", "Hạn dùng"],
    ];
  if (n === "reports/inventory")
    return [
      ["warehouse_id", "Kho"],
      ["item_name", "Mặt hàng"],
      ["lot_id", "Lô"],
      ["location_id", "Vị trí"],
      ["quality_bucket", "Chất lượng"],
      ["quantity", "Tồn"],
    ];
  if (n === "reports/stocktakes")
    return [
      ["warehouse_id", "Kho"],
      ["item_name", "Mặt hàng"],
      ["system_quantity", "Snapshot"],
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
      ["campaign_type", "Loại đợt"],
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
  modalBody.innerHTML = `<div class="dialog-head"><div><div class="eyebrow">WAREHOUSE / CHI TIẾT</div><h2>${esc(title)}</h2></div><button class="button small" id="close-modal" aria-label="Đóng">✕</button></div><div id="form-error"></div>${html}`;
  document.querySelector("#close-modal").onclick = () => modal.close();
  if (!modal.open) modal.showModal();
}
function detail(r) {
  const hidden = ["actions", "lines", "outputs", "materials", "warehouses"];
  openModal(
    r.name || r.title || r.code || "Chi tiết",
    `<dl class="detail-grid">${Object.entries(r)
      .filter(([k, v]) => !hidden.includes(k) && typeof v !== "object")
      .map(
        ([k, v]) =>
          `<div><dt>${esc(fieldLabel(k))}</dt><dd>${k === "status" ? statusBadge(v) : esc(format(v))}</dd></div>`,
      )
      .join("")}</dl>${["lines", "outputs", "materials", "allocations"]
      .filter((k) => r[k])
      .map(
        (k) =>
          `<div class="form-section"><h3>${fieldLabel(k)}</h3>${tableData(r[k])}</div>`,
      )
      .join(
        "",
      )}${r.warehouses ? `<div class="form-section"><h3>Phạm vi kiểm kê</h3>${r.warehouses.map((w) => `<div class="notification"><span>Kho ${esc(w.warehouse_id)} · ${badge(w.status)} · ${w.lines.filter((l) => l.actual_quantity !== null).length}/${w.lines.length} dòng đã đếm</span>${has(["STOCKTAKER"]) && w.assignee_ids.includes(user.id) ? `<button class="button small" data-count="${w.warehouse_id}">Mở bảng đếm</button>` : ""}</div>`).join("")}</div>` : ""}<div class="form-actions">${(r.actions || []).map((a) => `<button class="button ${["review", "post"].includes(a) ? "primary" : ""}" data-action="${a}">${{ edit: "Sửa", delete: "Hủy / Xóa", receive: "Tiếp nhận", review: "Phê duyệt", submit: "Gửi", start: "Bắt đầu kiểm kê", close: "Đóng đợt", post: "Ghi phiếu", progress: "Cập nhật tiến độ", dispatch: "Phân công kho", cancel: "Hủy kế hoạch", postTask: "Ghi phần hàng được giao" }[a]}</button>`).join("")}${current === "notifications" && !r.read_at ? '<button class="button" id="mark-read">Đánh dấu đã đọc</button>' : ""}</div>`,
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
    if (["customer-orders", "production-plans", "business-plans", "purchase-orders", "production-reports", "finished-reports", "qc-inspections", "stock-requests", "stock-documents", "warehouse-records"].includes(current))
      return detail((await api(current + "/" + row.id)).data);
    return detail(row);
  } catch (error) {
    toast(error.message);
  }
}
function tableData(rows) {
  if (!rows.length) return '<div class="empty">Chưa có dòng dữ liệu.</div>';
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter(
    (k) => k !== "id" && typeof rows[0][k] !== "object",
  );
  return `<div class="table-wrap"><table><thead><tr>${keys.map((k) => `<th>${esc(fieldLabel(k))}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${keys.map((k) => `<td>${esc(format(r[k]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const fieldNames = {
  campaign_type: "Loại đợt",
  quality_kind: "Loại hàng QC",
  campaign_id: "Lịch QC được giao",
  location: "Địa điểm",
  lot_ids: "Các lô cần kiểm tra",
  source_request_id: "Yêu cầu bổ sung NVL",
  production_report_id: "Báo cáo nhu cầu NVL",
  manager_id: "Quản lý kho phụ trách",
  task_id: "Công việc được giao",
  stock_request_id: "Yêu cầu kho",
  task_type: "Loại công việc",
  returned_supplier_quantity: "Lượng trả NCC",
  shortage_quantity: "Lượng thiếu",
  type: "Loại",
  decision: "Quyết định",
  difference: "Dòng chênh lệch",
  code: "Mã",
  name: "Tên",
  title: "Tên công việc",
  description: "Mô tả",
  note: "Ghi chú",
  status: "Trạng thái",
  version: "Phiên bản",
  item_id: "Mặt hàng",
  item_name: "Tên hàng",
  unit: "Đơn vị",
  quantity: "Số lượng",
  unit_price: "Đơn giá",
  fulfilled_quantity: "Đã xử lý",
  remaining_quantity: "Còn lại",
  delivery_address: "Địa chỉ giao hàng",
  latest_delivery_date: "Hạn giao hàng",
  planned_date: "Ngày kế hoạch",
  expected_delivery_date: "Ngày dự kiến nhận",
  delivery_terms: "Điều khoản giao",
  supplier_id: "Nhà cung cấp",
  customer_id: "Khách hàng",
  customer_order_id: "Đơn khách hàng",
  business_plan_id: "Kế hoạch mua / bán",
  purchase_order_id: "Đơn mua",
  production_plan_id: "Kế hoạch sản xuất",
  warehouse_id: "Kho",
  workshop_id: "Xưởng",
  category_id: "Danh mục",
  unit_id: "Đơn vị",
  kind: "Loại mặt hàng",
  reference_price: "Giá tham khảo",
  is_sample: "Hàng mẫu",
  is_published: "Đã công bố",
  is_active: "Đang hoạt động",
  received_quantity: "Lượng nhận",
  purchase_order_line_id: "Dòng đơn mua",
  manufactured_date: "Ngày sản xuất",
  expiry_date: "Hạn dùng",
  requested_date: "Ngày yêu cầu",
  purpose: "Mục đích",
  inspected_at: "Thời gian kiểm tra",
  lot_id: "Lô",
  inspected_quantity: "Số kiểm",
  passed_quantity: "Số đạt",
  failed_quantity: "Số lỗi",
  issue: "Mô tả lỗi",
  start_date: "Bắt đầu",
  end_date: "Kết thúc",
  start_at: "Bắt đầu",
  end_at: "Kết thúc",
  assignee_ids: "Người thực hiện",
  priority: "Ưu tiên",
  remarks: "Nhận xét biên bản",
  stocktake_id: "Đợt kiểm kê",
  stocktake_line_id: "Dòng chênh lệch",
  reason: "Lý do",
  resolution_note: "Phương án xử lý",
  available_quantity: "Hiện có tại xưởng",
  required_quantity: "Nhu cầu",
  used_quantity: "Đã sử dụng",
  completed_date: "Ngày hoàn thành",
  lot_code: "Mã lô",
  lines: "Chi tiết hàng",
  outputs: "Thành phẩm",
  materials: "Nguyên vật liệu",
  system_quantity: "Snapshot",
  actual_quantity: "Thực tế",
  created_at: "Ngày tạo",
  posted_at: "Ngày ghi sổ",
  quoted_total: "Tổng báo giá",
  total_amount: "Tổng tiền",
  quality_bucket: "Nhóm chất lượng",
  location_id: "Vị trí",
};
function fieldLabel(k) {
  return fieldNames[k] || k;
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
    location.href = "/api/v1/" + current + "/export?" + filterParams();
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
