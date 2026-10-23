(() => {
  const previousDetail = detail;
  const previousAction = actionForm;
  actionForm = async function (record, action) {
    await previousAction(record, action);
    if (
      !isMysql ||
      current !== "production-plans" ||
      action !== "edit" ||
      !document.querySelector("#materials-rows")
    )
      return;
    const button = document.createElement("button");
    for (const key of ['start_date','end_date']) {
      const input = document.querySelector('#f-'+key);
      if (input && record.latest_delivery_date) input.max=record.latest_delivery_date;
    }
    const startInput=document.querySelector('#f-start_date'), endInput=document.querySelector('#f-end_date');
    if(startInput && endInput) startInput.onchange=()=>{endInput.min=startInput.value || calendarToday();};
    button.type = "button";
    button.className = "button";
    button.id = "recalculate-plan-recipe";
    button.textContent = "Tính lại NVL theo công thức sau khi đổi lượng bánh";
    document.querySelector("#data-form .form-actions").prepend(button);
    button.onclick = async () => {
      button.disabled = true;
      try {
        const recipe = (
          await api("production-plans/recipe-estimate", "POST", {
            outputs: readLines("outputs"),
          })
        ).data;
        const items = (await options("items")).filter(
          (i) => i.kind === "MATERIAL",
        );
        const editor = lineEditor(
          "NVL gốc theo công thức — khi lưu cộng dự phòng một lần",
          items,
          "materials",
          ["required_quantity"],
          recipe.materials,
        );
        const old = document
          .querySelector("#materials-rows")
          .closest(".form-section");
        old.outerHTML = editor.html;
        editor.mount();
      } catch (e) {
        document.querySelector("#form-error").innerHTML = errorHTML(e);
      } finally {
        button.disabled = false;
      }
    };
  };
  const imageNames = (note) =>
    [
      ...(note || "").matchAll(
        /\/images\/production-reports\/([a-f0-9-]{36}\.(?:png|jpg|webp))/g,
      ),
    ].map((m) => m[1]);
  const imageUrl = (id, name) =>
    `/api/v1/production-reports/${encodeURIComponent(id)}/images/${encodeURIComponent(name)}`;
  function comparisonTable(data) {
    return (
      `<p>${esc(data.notice)}</p><p>Thời điểm đối chiếu: ${esc(format(data.checked_at))}</p><div class="table-scroll"><table id="material-comparison-table"><thead><tr><th>NVL</th><th>ĐVT</th><th>Nhu cầu KHSX</th><th>Tồn khả dụng</th><th>Còn thiếu</th></tr></thead><tbody>${data.lines.map((l) => `<tr><td>${esc(l.item_name)}</td><td>${esc(l.unit)}</td><td>${esc(l.required_quantity)}</td><td>${esc(l.available_quantity)}</td><td>${esc(l.shortage_quantity)}</td></tr>`).join("")}</tbody></table></div>` +
      (data.recipe
        ? "<details><summary>Công thức minh họa hiện tại</summary><p>" +
          esc(data.recipe.description) +
          "</p><pre>" +
          esc(
            data.recipe.formulas
              .map(
                (l) =>
                  `${l.product_name}: ${l.output_quantity} × ${l.per_unit_quantity} ${l.unit} ${l.item_name}`,
              )
              .join("\n"),
          ) +
          "</pre></details>"
        : `<p>${esc(data.recipe_warning || "")}</p>`)
    );
  }
  async function screenshot(data) {
    const c = document.createElement("canvas");
    c.width = 1100;
    c.height = 150 + data.lines.length * 40;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#111";
    ctx.font = "bold 22px Arial";
    ctx.fillText("ĐỐI CHIẾU NVL — " + data.production_plan_code, 25, 35);
    ctx.font = "16px Arial";
    ctx.fillText(format(data.checked_at), 25, 65);
    const xs = [25, 470, 590, 765, 940];
    ["Nguyên vật liệu", "ĐVT", "Nhu cầu", "Khả dụng", "Còn thiếu"].forEach(
      (s, i) => ctx.fillText(s, xs[i], 105),
    );
    data.lines.forEach((l, i) =>
      [
        l.item_name.slice(0, 43),
        l.unit,
        l.required_quantity,
        l.available_quantity,
        l.shortage_quantity,
      ].forEach((s, j) => ctx.fillText(String(s || ""), xs[j], 145 + i * 40)),
    );
    return c.toDataURL("image/png");
  }
  window.attachProductionReportImages = function (area, record, comparison) {
    const box = document.createElement("div");
    box.className = "span2 report-images";
    box.innerHTML =
      '<label>Ảnh mô tả (PNG/JPEG/WebP, tối đa 5 MB/ảnh, 6 ảnh)</label><input type="file" id="report-image-input" accept="image/png,image/jpeg,image/webp" multiple><p>Có thể dán ảnh từ clipboard vào ô mô tả. Ảnh chỉ được xem bởi người có quyền xem báo cáo.</p><div class="report-image-previews"></div>' +
      (comparison
        ? '<button type="button" class="button" id="capture-comparison">Chụp bảng đối chiếu vào mô tả</button>'
        : "");
    area.closest(".field").after(box);
    const previews = box.querySelector(".report-image-previews");
    let pending = Promise.resolve(),
      error = null;
    function preview(src, path) {
      const image = document.createElement("img");
      image.src = src;
      image.alt = "Ảnh mô tả báo cáo";
      image.style.maxWidth = "280px";
      const wrap = document.createElement("div");
      wrap.append(image);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button small";
      remove.textContent = "Bỏ ảnh";
      remove.onclick = () => {
        area.value = area.value
          .split(`![Ảnh báo cáo](${path})`)
          .join("")
          .split(path)
          .join("");
        wrap.remove();
      };
      wrap.append(remove);
      previews.append(wrap);
    }
    for (const name of imageNames(area.value))
      if (record)
        preview(
          imageUrl(record.id, name),
          "/images/production-reports/" + name,
        );
    async function upload(data) {
      if (imageNames(area.value).length >= 6)
        throw Error("Tối đa 6 ảnh/báo cáo.");
      const r = (
        await api("production-report-images", "POST", { data_url: data })
      ).data;
      area.value += "\n![Ảnh báo cáo](" + r.image_path + ")\n";
      preview(data, r.image_path);
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function enqueue(data) {
      pending = pending
        .then(() => upload(data))
        .catch((e) => {
          error = e;
          toast(e.message);
        });
    }
    function file(f) {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
        f.size > 5 * 1024 * 1024
      ) {
        toast("Chọn PNG/JPEG/WebP tối đa 5 MB.");
        return;
      }
      const reader = new FileReader();
      const wait = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(Error("Không đọc được ảnh."));
      });
      reader.readAsDataURL(f);
      pending = pending
        .then(() => wait)
        .then(upload)
        .catch((e) => {
          error = e;
          toast(e.message);
        });
    }
    box.querySelector("input").onchange = (e) => {
      for (const f of e.target.files) file(f);
    };
    area.addEventListener("paste", (e) => {
      const files = [...(e.clipboardData?.items || [])]
        .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
        .map((i) => i.getAsFile());
      if (files.length) {
        e.preventDefault();
        files.forEach(file);
      }
    });
    if (comparison)
      box.querySelector("#capture-comparison").onclick = async () =>
        enqueue(await screenshot(comparison));
    return {
      async ready() {
        await pending;
        if (error) {
          const e = error;
          error = null;
          throw e;
        }
      },
    };
  };
  detail = function (record) {
    previousDetail(record);
    if (
      isMysql &&
      current === "production-plans" &&
      ["APPROVED", "IN_PROGRESS"].includes(record.status) &&
      user.roles.some((r) =>
        ["WORKSHOP_OWNER", "PLANNER", "DIRECTOR"].includes(r),
      )
    ) {
      const button = document.createElement("button");
      button.className = "button primary";
      button.id = "compare-plan-stock";
      button.textContent = "Đối chiếu tồn kho NVL";
      modalBody.append(button);
      button.onclick = async () => {
        try {
          const data = (
            await api(`production-plans/${record.id}/material-comparison`)
          ).data;
          openModal(
            "Đối chiếu NVL — " + data.production_plan_code,
            comparisonTable(data) +
              (user.roles.includes("WORKSHOP_OWNER")
                ? '<button class="button primary" id="report-from-comparison">Lập báo cáo từ đối chiếu</button>'
                : ""),
          );
          const reportButton = document.querySelector(
            "#report-from-comparison",
          );
          if (reportButton)
            reportButton.onclick = () =>
              window.openProductionReportFromComparison(data);
        } catch (e) {
          toast(e.message);
        }
      };
    }
    if (isMysql && current === "production-plans" && record.order_lines) {
      const section = document.createElement("section");
      section.innerHTML =
        "<h3>Toàn bộ mặt hàng của đơn nguồn</h3>" +
        tableData(record.order_lines);
      modalBody.append(section);
    }
    if (isMysql && current === "production-reports")
      for (const name of imageNames(record.note)) {
        const img = document.createElement("img");
        img.src = imageUrl(record.id, name);
        img.alt = "Ảnh mô tả báo cáo";
        img.style.maxWidth = "100%";
        modalBody.append(img);
      }
  };
})();
