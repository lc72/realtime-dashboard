// 实时数据演示系统 - 核心逻辑
class RealtimeDashboard {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 5;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5秒自动切换
        this.isPlaying = true;
        this.charts = {};
        this.lastDataHash = '';

        this.init();
    }

    async init() {
        await this.loadData();
        this.renderSlides();
        this.setupNavigation();
        this.startAutoPlay();
        this.startDataPolling();
        this.hideLoading();
    }

    // 从localStorage加载数据（模拟后端）
    async loadData() {
        const stored = localStorage.getItem('dashboard_data');
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            // 默认演示数据
            this.data = this.getDefaultData();
            this.saveData();
        }
        this.lastDataHash = this.hashData(this.data);
    }

    // 默认演示数据
    getDefaultData() {
        return {
            title: "员工培训实时数据看板",
            slides: [
                {
                    title: "📈 培训总览",
                    type: "overview",
                    kpis: [
                        { label: "本月培训场次", value: 24, change: "+12%", up: true },
                        { label: "参训人次", value: 186, change: "+28%", up: true },
                        { label: "培训覆盖率", value: "87%", change: "+5%", up: true },
                        { label: "平均满意度", value: "4.6", change: "+0.3", up: true }
                    ],
                    chartType: "line",
                    chartData: {
                        labels: ["1月", "2月", "3月", "4月", "5月"],
                        datasets: [{
                            label: "培训场次",
                            data: [15, 18, 20, 22, 24],
                            borderColor: "#2563eb",
                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                            fill: true,
                            tension: 0.4
                        }]
                    }
                },
                {
                    title: "👥 部门培训分布",
                    type: "departments",
                    kpis: [
                        { label: "技术部", value: 45, change: "12场", up: true },
                        { label: "销售部", value: 38, change: "10场", up: true },
                        { label: "运营部", value: 52, change: "15场", up: true },
                        { label: "人事部", value: 51, change: "8场", up: true }
                    ],
                    chartType: "doughnut",
                    chartData: {
                        labels: ["技术部", "销售部", "运营部", "人事部", "财务部"],
                        datasets: [{
                            data: [45, 38, 52, 51, 28],
                            backgroundColor: ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"]
                        }]
                    }
                },
                {
                    title: "📚 课程类型分析",
                    type: "courses",
                    kpis: [
                        { label: "技能类", value: 42, change: "60%", up: true },
                        { label: "管理类", value: 18, change: "25%", up: true },
                        { label: "合规类", value: 8, change: "11%", up: false },
                        { label: "通识类", value: 12, change: "4%", up: true }
                    ],
                    chartType: "bar",
                    chartData: {
                        labels: ["技能培训", "管理培训", "合规培训", "通识教育", "安全培训"],
                        datasets: [{
                            label: "课程数量",
                            data: [42, 18, 8, 12, 6],
                            backgroundColor: ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"],
                            borderRadius: 8
                        }]
                    }
                },
                {
                    title: "✅ 培训完成进度",
                    type: "progress",
                    tableData: [
                        { name: "新员工入职培训", progress: 95, target: 100, status: "即将完成" },
                        { name: "领导力提升计划", progress: 72, target: 100, status: "进行中" },
                        { name: "Python技能进阶", progress: 58, target: 80, status: "进行中" },
                        { name: "销售技巧强化", progress: 100, target: 100, status: "已完成" },
                        { name: "数据安全意识", progress: 45, target: 60, status: "进行中" },
                        { name: "跨部门协作", progress: 30, target: 50, status: "刚开始" }
                    ]
                },
                {
                    title: "🏆 培训效果评估",
                    type: "evaluation",
                    kpis: [
                        { label: "知识掌握率", value: "82%", change: "+8%", up: true },
                        { label: "行为改变率", value: "65%", change: "+12%", up: true },
                        { label: "业绩提升", value: "23%", change: "+5%", up: true },
                        { label: "ROI回报", value: "3.2x", change: "+0.4", up: true }
                    ],
                    chartType: "radar",
                    chartData: {
                        labels: ["知识掌握", "技能应用", "态度转变", "业绩提升", "团队协作", "创新能力"],
                        datasets: [{
                            label: "当前季度",
                            data: [82, 75, 68, 73, 85, 70],
                            borderColor: "#2563eb",
                            backgroundColor: "rgba(37, 99, 235, 0.2)",
                            pointBackgroundColor: "#2563eb"
                        }, {
                            label: "上季度",
                            data: [70, 65, 60, 68, 78, 62],
                            borderColor: "#94a3b8",
                            backgroundColor: "rgba(148, 163, 184, 0.2)",
                            pointBackgroundColor: "#94a3b8"
                        }]
                    }
                }
            ]
        };
    }

    // 保存数据到localStorage
    saveData() {
        localStorage.setItem('dashboard_data', JSON.stringify(this.data));
    }

    // 数据哈希（用于检测变化）
    hashData(data) {
        return JSON.stringify(data).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0).toString();
    }

    // 渲染所有幻灯片
    renderSlides() {
        const container = document.getElementById('slideshow-container');
        const dotsContainer = document.getElementById('slide-dots');

        container.innerHTML = '';
        dotsContainer.innerHTML = '';

        this.data.slides.forEach((slide, index) => {
            // 创建幻灯片
            const slideEl = document.createElement('div');
            slideEl.className = `slide slide-bg-${(index % 5) + 1} ${index === 0 ? 'active' : ''}`;
            slideEl.id = `slide-${index}`;

            slideEl.innerHTML = `
                <div class="slide-content">
                    <h2 class="slide-title">
                        <span class="icon">${slide.title.split(' ')[0]}</span>
                        ${slide.title.split(' ').slice(1).join(' ')}
                    </h2>
                    ${this.renderSlideContent(slide, index)}
                </div>
            `;

            container.appendChild(slideEl);

            // 创建导航点
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.onclick = () => this.goToSlide(index);
            dotsContainer.appendChild(dot);
        });

        // 初始化图表
        setTimeout(() => this.initCharts(), 100);
    }

    // 渲染单个幻灯片内容
    renderSlideContent(slide, index) {
        let html = '';

        // KPI卡片
        if (slide.kpis) {
            html += '<div class="kpi-grid">';
            slide.kpis.forEach(kpi => {
                const changeClass = kpi.up !== undefined ? (kpi.up ? 'up' : 'down') : '';
                const arrow = kpi.up !== undefined ? (kpi.up ? '↑' : '↓') : '';
                html += `
                    <div class="kpi-card animate-in" style="animation-delay: ${index * 0.1}s">
                        <div class="kpi-label">${kpi.label}</div>
                        <div class="kpi-value">${kpi.value}</div>
                        <div class="kpi-change ${changeClass}">${arrow} ${kpi.change}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 图表或表格
        if (slide.chartType) {
            html += `
                <div class="chart-container">
                    <canvas id="chart-${index}"></canvas>
                </div>
            `;
        }

        if (slide.tableData) {
            html += `
                <div class="chart-container" style="overflow: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>培训项目</th>
                                <th>当前进度</th>
                                <th>目标</th>
                                <th>完成度</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${slide.tableData.map(row => `
                                <tr>
                                    <td><strong>${row.name}</strong></td>
                                    <td>${row.progress}</td>
                                    <td>${row.target}</td>
                                    <td>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${(row.progress/row.target*100)}%"></div>
                                        </div>
                                    </td>
                                    <td>${row.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return html;
    }

    // 初始化Chart.js图表
    initCharts() {
        this.data.slides.forEach((slide, index) => {
            if (!slide.chartType) return;

            const ctx = document.getElementById(`chart-${index}`);
            if (!ctx) return;

            // 销毁旧图表
            if (this.charts[index]) {
                this.charts[index].destroy();
            }

            const config = {
                type: slide.chartType,
                data: slide.chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Noto Sans SC', size: 12 },
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    },
                    scales: slide.chartType === 'doughnut' || slide.chartType === 'radar' ? {} : {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { font: { family: 'Noto Sans SC' } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Noto Sans SC' } }
                        }
                    }
                }
            };

            this.charts[index] = new Chart(ctx, config);
        });
    }

    // 导航控制
    setupNavigation() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') this.nextSlide();
            if (e.key === 'ArrowLeft') this.prevSlide();
        });

        // 触摸滑动（移动端）
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        document.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;

        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');

        slides[this.currentSlide].classList.remove('active');
        slides[this.currentSlide].classList.add(this.currentSlide < index ? 'prev' : '');

        slides[index].classList.remove('prev');
        slides[index].classList.add('active');

        dots[this.currentSlide].classList.remove('active');
        dots[index].classList.add('active');

        this.currentSlide = index;
        document.getElementById('slide-counter').textContent = `${index + 1} / ${this.totalSlides}`;

        // 重新动画KPI卡片
        const cards = slides[index].querySelectorAll('.kpi-card');
        cards.forEach((card, i) => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = `fadeInUp 0.6s ease forwards`;
                card.style.animationDelay = `${i * 0.1}s`;
            }, 10);
        });
    }

    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.totalSlides);
    }

    prevSlide() {
        this.goToSlide((this.currentSlide - 1 + this.totalSlides) % this.totalSlides);
    }

    // 自动播放
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.isPlaying) this.nextSlide();
        }, this.autoPlayDelay);
    }

    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('play-btn').textContent = this.isPlaying ? '⏸ 暂停' : '▶ 播放';
    }

    // 全屏
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // 数据轮询（每3秒检查一次数据变化）
    startDataPolling() {
        setInterval(() => {
            const stored = localStorage.getItem('dashboard_data');
            if (stored) {
                const newData = JSON.parse(stored);
                const newHash = this.hashData(newData);

                if (newHash !== this.lastDataHash) {
                    this.data = newData;
                    this.lastDataHash = newHash;
                    this.showUpdateToast();
                }
            }
        }, 3000);
    }

    showUpdateToast() {
        const toast = document.getElementById('update-toast');
        toast.classList.remove('hidden');
        document.getElementById('last-update').textContent = '更新于: ' + new Date().toLocaleTimeString();

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// 全局函数（供HTML调用）
let dashboard;

function prevSlide() { dashboard.prevSlide(); }
function nextSlide() { dashboard.nextSlide(); }
function toggleAutoPlay() { dashboard.toggleAutoPlay(); }
function toggleFullscreen() { dashboard.toggleFullscreen(); }

// 启动
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new RealtimeDashboard();
});
