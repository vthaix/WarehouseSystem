(() => {
  const previousCreate = createForm,
    previousAction = actionForm;
  async function form(record) {
    const plans = (await options("production-plans")).filter((p) =>
      ["APPROVED", "IN_PROGRESS"].includes(p.status),
    );
    const materials = (await options("items")).filter(
      (i) => i.kind === "MATERIAL",
    );
    openModal(
      record ? "Sửa báo cáo sản xuất" : "Báo cáo khi đang sản xuất",
      formWrap(
        (record
          ? ""
          : inputField("production_plan_id", "select", true, [
              { id: "", name: "Chọn kế hoạch đang sản xuất" },
              ...plans,
            ])) +
          inputField(
            "report_purpose",
            "select",
            true,
            [
              { id: "TIEN_DO", name: "Báo cáo tiến độ" },
              { id: "SU_CO", name: "Báo cáo sự cố" },
              { id: "NHU_CAU", name: "Báo cáo thiếu / nhu cầu NVL" },
            ],
            record?.report_purpose || "TIEN_DO",
          ) +
          inputField(
            "progress_percentage",
            "number",
            false,
            [],
            record?.progress_percentage ?? "",
          ) +
          inputField("note", "textarea", true, [], record?.note || "") +
          inputField(
            "send_to_planner",
            "select",
            true,
            [
              { id: "false", name: "Chỉ gửi Ban giám đốc" },
              { id: "true", name: "Gửi Ban giám đốc và Bộ phận lập kế hoạch" },
            ],
            String(record?.send_to_planner ?? false),
          ) +
          '<div class="span2 notice">Ban giám đốc luôn nhận khi gửi báo cáo. Sự cố/tiến độ không bắt nhập NVL. Báo cáo thành phẩm được lập riêng khi hoàn tất toàn bộ.</div><div class="span2" id="report-materials"></div>',
      ),
    );
    const progress = document.querySelector("#f-progress_percentage");
    progress.step = "0.01";
    progress.max = "99.99";
    if (record) document.querySelector("#f-report_purpose").disabled = true;
    let seq = 0;
    const sync = async () => {
      const token = ++seq,
        el = document.querySelector("#report-materials"),
        purpose = document.querySelector("#f-report_purpose").value;
      el.innerHTML = "";
      if (purpose !== "NHU_CAU") return;
      let lines = record?.lines || [];
      const id = document.querySelector("#f-production_plan_id")?.value;
      if (!record && id) {
        try {
          const r = (
            await api("source-imports/production-reports?source_id=" + id)
          ).data;
          if (token !== seq) return;
          lines = r.lines;
        } catch (e) {
          document.querySelector("#form-error").innerHTML = errorHTML(e);
          return;
        }
      }
      if (token !== seq) return;
      const editor = lineEditor(
        "Nhu cầu NVL ước lượng — tồn khả dụng do hệ thống đối chiếu",
        materials,
        "lines",
        ["required_quantity"],
        lines,
      );
      el.innerHTML = editor.html;
      editor.mount();
    };
    document.querySelector("#f-report_purpose").onchange = sync;
    if (!record)
      document.querySelector("#f-production_plan_id").onchange = sync;
    bindForm(
      (d) => ({
        ...(record
          ? { version: record.version }
          : {
              production_plan_id: d.production_plan_id,
              report_purpose: d.report_purpose,
            }),
        note: d.note,
        send_to_planner: d.send_to_planner === "true",
        ...(d.progress_percentage !== ""
          ? { progress_percentage: d.progress_percentage }
          : {}),
        ...(document.querySelector("#f-report_purpose").value === "NHU_CAU"
          ? { lines: readLines() }
          : {}),
      }),
      record ? "production-reports/" + record.id : "production-reports",
      record ? "PATCH" : "POST",
    );
    await sync();
  }
  createForm = async function () {
    if (isMysql && current === "production-reports") {
      try {
        await form();
      } catch (e) {
        toast(e.message);
      }
      return;
    }
    return previousCreate();
  };
  actionForm = async function (r, action) {
    if (isMysql && current === "production-reports" && action === "edit") {
      try {
        await form(r);
      } catch (e) {
        toast(e.message);
      }
      return;
    }
    return previousAction(r, action);
  };
})();
