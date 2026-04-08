// 全局变量
let selectedFoods = []; // 已选食材
let myChart = null; // 图表实例

// 初始化食材下拉框
function initFoodSelect() {
  const select = document.getElementById("foodSelect");
  if (!select) return;
  select.innerHTML = '<option value="">请选择食材</option>';

  FULL_FOOD_DATA.forEach(item => {
    const name = item["食物名称"];
    if (!name) return;
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// 绑定搜索功能
function bindSearch() {
  const searchInput = document.getElementById("searchInput");
  const select = document.getElementById("foodSelect");
  if (!searchInput || !select) return;

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    select.innerHTML = '<option value="">请选择食材</option>';

    FULL_FOOD_DATA.forEach(item => {
      const name = item["食物名称"];
      if (name && name.toLowerCase().includes(keyword)) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      }
    });
  });
}

// 绑定添加食材按钮
function bindAddFood() {
  const addBtn = document.getElementById("addFoodBtn");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    const foodName = document.getElementById("foodSelect").value;
    const weight = document.getElementById("foodWeight").value || 100;
    const meal = document.getElementById("mealSelect").value;

    if (!foodName) {
      alert("请先选择食材！");
      return;
    }

    const food = FULL_FOOD_DATA.find(item => item["食物名称"] === foodName);
    if (!food) return;

    // 添加到已选列表
    selectedFoods.push({ ...food, weight, meal });
    renderSelectedFoods();
    // 清空选择
    document.getElementById("foodSelect").value = "";
    document.getElementById("foodWeight").value = "100";
  });
}

// 渲染已选食材列表
function renderSelectedFoods() {
  const breakfastList = document.getElementById("breakfastList");
  const lunchList = document.getElementById("lunchList");
  const dinnerList = document.getElementById("dinnerList");
  const snackList = document.getElementById("snackList");

  // 清空列表
  [breakfastList, lunchList, dinnerList, snackList].forEach(el => el.innerHTML = "");

  // 按餐次分类渲染
  const mealMap = {
    "早餐": breakfastList,
    "午餐": lunchList,
    "晚餐": dinnerList,
    "加餐": snackList
  };

  selectedFoods.forEach((item, index) => {
    const listEl = mealMap[item.meal];
    if (!listEl) return;

    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <span>${item["食物名称"]}（${item.weight}g）</span>
      <button onclick="removeFood(${index})" style="background:#e53e3e;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">×</button>
    `;
    listEl.appendChild(div);
  });
}

// 删除食材
function removeFood(index) {
  selectedFoods.splice(index, 1);
  renderSelectedFoods();
}
// 暴露给全局
window.removeFood = removeFood;

// 渲染营养分析图表
function renderNutritionChart() {
  const chartDom = document.getElementById("nutritionChart");
  if (!chartDom || !echarts) return;

  // 计算总营养
  let totalCarbs = 0, totalFat = 0, totalProtein = 0;
  selectedFoods.forEach(item => {
    const ratio = item.weight / 100;
    totalCarbs += (item["碳水化合物"] || 0) * ratio;
    totalFat += (item["脂肪"] || 0) * ratio;
    totalProtein += (item["蛋白质"] || 0) * ratio;
  });

  // 初始化图表
  if (myChart) {
    myChart.dispose();
  }
  myChart = echarts.init(chartDom);

  const option = {
    title: { text: "营养摄入概览" },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: totalProtein, name: "蛋白质", itemStyle: { color: "#4299e1" } },
          { value: totalFat, name: "脂肪", itemStyle: { color: "#f6ad55" } },
          { value: totalCarbs, name: "碳水化合物", itemStyle: { color: "#48bb78" } }
        ]
      }
    ]
  };

  myChart.setOption(option);
}

// 页面初始化
window.onload = () => {
  initFoodSelect();
  bindSearch();
  bindAddFood();
  renderSelectedFoods();
  // 绑定生成报告按钮
  const reportBtn = document.getElementById("genReportBtn");
  if (reportBtn) {
    reportBtn.addEventListener("click", renderNutritionChart);
  }
};