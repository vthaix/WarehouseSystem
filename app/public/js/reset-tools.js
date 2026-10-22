window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#reset-test-data")?.addEventListener("click", () => {
    openModal("Xóa dữ liệu test của toàn hệ thống", `<p>Thao tác này xóa đơn hàng, kế hoạch, báo cáo, lô hàng, phiếu nhập/xuất, tồn kho, QC, kiểm kê, công việc và thông báo của <strong>tất cả tài khoản</strong>.</p><p>Giữ tài khoản, khách hàng, mặt hàng, loại hàng, đơn vị, nhà cung cấp, xưởng, kho và vị trí. Hệ thống sao lưu trước khi xóa; mọi người cần đăng nhập lại.</p><form id="test-reset-form"><div class="field"><label for="reset-confirmation">Nhập XOA DU LIEU TEST để xác nhận</label><input id="reset-confirmation" required autocomplete="off" spellcheck="false" pattern="XOA DU LIEU TEST"></div><div id="reset-error" role="alert"></div><p id="reset-progress" role="status"></p><div class="form-actions"><button class="button" type="button" id="cancel-reset">Hủy</button><button class="button danger" type="submit">Xác nhận xóa dữ liệu</button></div></form>`);
    const form = document.querySelector("#test-reset-form");
    const key = crypto.randomUUID();
    document.querySelector("#cancel-reset").onclick = () => modal.close();
    form.onsubmit = async event => {
      event.preventDefault();
      const controls = [...form.querySelectorAll("button,input")];
      const confirmation = document.querySelector("#reset-confirmation").value;
      if (confirmation !== "XOA DU LIEU TEST") return;
      controls.forEach(el => { el.disabled = true; });
      document.querySelector("#close-modal").disabled = true;
      const preventClose = e => e.preventDefault();
      modal.addEventListener("cancel", preventClose);
      document.querySelector("#reset-progress").textContent = "Đang đợi thao tác đang chạy, sao lưu và xóa dữ liệu. Vui lòng chờ…";
      document.querySelector("#reset-error").textContent = "";
      try {
        const response = await api("test-data/reset", "POST", { confirmation }, key);
        sessionStorage.removeItem("production-comparison-draft");
        document.querySelector("#reset-progress").textContent = response.data.message;
        form.innerHTML = `<p>${esc(response.data.message)}</p><p>Bản sao lưu: <code>${esc(response.data.backup)}</code></p><a class="button primary" href="/login">Đăng nhập lại</a>`;
      } catch (e) {
        const region = document.querySelector("#reset-error"), progress = document.querySelector("#reset-progress");
        if (region) region.textContent = e.message + " Nếu kết quả chưa rõ, kiểm tra dữ liệu trước khi tạo lần xóa mới.";
        if (progress) progress.textContent = "";
        controls.forEach(el => { el.disabled = false; });
      } finally {
        modal.removeEventListener("cancel", preventClose);
        document.querySelector("#close-modal").disabled = false;
      }
    };
  });
});
