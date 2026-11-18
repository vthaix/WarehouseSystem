// UC-15 Thực hiện kiểm kê — danh sách kho được phân công đếm.
//
// Ban kiểm kê không mở được trang "Lập đợt kiểm kê" (chức năng của Ban giám đốc),
// nên trên trang "Thực hiện kiểm kê" ta liệt kê các kho đang mở đếm được giao
// cho người đăng nhập. Nút "Mở bảng đếm" dùng lại countForm() trong forms.js,
// nơi đã có Lưu số đếm (lưu tạm) và Hoàn tất đếm.
(() => {
  const PANEL_ID = "warehouse-count-assignments";

  function isCountPage() {
    return isMysql && current === "inspection-counts" && has(["STOCKTAKER"]);
  }

  // Lấy các kho thuộc đợt kiểm kê đang diễn ra mà người dùng được giao đếm.
  async function loadAssignments() {
    const campaigns = (await api("stocktakes?campaign_type=COUNT&status=IN_PROGRESS&per_page=100")).data;
    const assignments = [];
    for (const campaign of campaigns) {
      const detail = (await api("stocktakes/" + campaign.id)).data;
      for (const warehouse of detail.warehouses) {
        const isMine = warehouse.assignee_ids.includes(String(user.id));
        if (!isMine) continue;
        const counted = warehouse.lines.filter((line) => line.actual_quantity !== null).length;
        assignments.push({ campaign: detail, warehouse, counted, total: warehouse.lines.length });
      }
    }
    return assignments;
  }

  function assignmentRow({ campaign, warehouse, counted, total }) {
    const canCount = warehouse.status === "COUNTING";
    return (
      '<div class="notification">' +
      "<span><strong>" + esc(warehouse.warehouse_name || warehouse.warehouse_code) + "</strong>" +
      " · Đợt " + esc(campaign.code) +
      " · " + badge(warehouse.status) +
      " · " + counted + "/" + total + " dòng đã đếm</span>" +
      '<button class="button small' + (canCount ? " primary" : "") + '"' +
      ' data-open-count="' + esc(campaign.id) + '" data-warehouse="' + esc(warehouse.warehouse_id) + '">' +
      (canCount ? "Mở bảng đếm" : "Xem số đếm") +
      "</button></div>"
    );
  }

  async function render() {
    if (!isCountPage()) return;
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = PANEL_ID;
      panel.className = "panel form-section";
      document.querySelector("#content .panel")?.before(panel);
    }
    try {
      const assignments = await loadAssignments();
      panel.innerHTML =
        "<h3>Kho được phân công kiểm đếm</h3>" +
        (assignments.length
          ? assignments.map(assignmentRow).join("")
          : '<div class="empty">Chưa có kho nào đang mở đếm cho bạn.</div>');
      panel.querySelectorAll("[data-open-count]").forEach((button) => {
        button.onclick = () => countForm({ id: button.dataset.openCount }, button.dataset.warehouse);
      });
    } catch (error) {
      panel.innerHTML = "<h3>Kho được phân công kiểm đếm</h3>" + errorHTML(error);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    render();
    // Sau khi lưu hoặc hoàn tất đếm, hộp thoại đóng lại: cập nhật tiến độ.
    modal.addEventListener("close", render);
  });
})();
