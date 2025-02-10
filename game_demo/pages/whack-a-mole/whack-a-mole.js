Page({
  data: {
    score: 0,                // 玩家得分
    time: 30,                // 游戏时长（秒）
    gameStarted: false,      // 游戏状态
    // 初始化 9 个地洞，每个地洞对象记录地鼠是否显示以及是否被击中
    holes: Array.from({ length: 9 }, () => ({ moleVisible: false, hit: false })),
    moleSrc: '/images/mole_normal.png',  // 地鼠初始形象
    hitMoleSrc: '/images/mole_hit.png',    // 被打后的形象
    gameTimer: null,         // 游戏倒计时定时器句柄
    moleTimer: null,         // 地鼠出现定时器句柄
    currentMoleIndex: -1,    // 当前显示地鼠的地洞索引
    config: {
      moleShowTime: 800,     // 地鼠显示时长
      moleInterval: 1000,    // 地鼠出现间隔
      hitShowTime: 500       // 击中后显示时长
    }
  },

  // 定义一个变量，用于存储当前地鼠自动隐藏的定时器
  hideTimer: null,

  // 开始游戏
  startGame: function() {
    this.setData({
      score: 0,
      time: 30,
      gameStarted: true,
      holes: Array.from({ length: 9 }, () => ({ moleVisible: false, hit: false })),
      currentMoleIndex: -1
    });

    // 启动倒计时
    this.data.gameTimer = setInterval(() => {
      if (this.data.time > 0) {
        this.setData({ time: this.data.time - 1 });
      } else {
        clearInterval(this.data.gameTimer);
        clearInterval(this.data.moleTimer);
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = null;
        }
        this.setData({ gameStarted: false });
        wx.showModal({
          title: '游戏结束',
          content: '你的得分：' + this.data.score,
          showCancel: false
        });
      }
    }, 1000);

    // 使用 setInterval 统一控制地鼠出现的节奏
    this.data.moleTimer = setInterval(() => {
      this.showMole();
    }, this.data.config.moleInterval);
  },

  // 随机显示地鼠
  showMole: function() {
    // 先隐藏当前正在显示的地鼠（如果有）
    if (this.data.currentMoleIndex !== -1) {
      let prevHoles = this.data.holes;
      prevHoles[this.data.currentMoleIndex].moleVisible = false;
      this.setData({ holes: prevHoles });
    }

    // 生成新地鼠
    let index = Math.floor(Math.random() * 9);
    let newHoles = this.data.holes;
    newHoles[index].moleVisible = true;
    newHoles[index].hit = false;
    
    this.setData({ 
      holes: newHoles,
      currentMoleIndex: index 
    });

    // 清除之前的隐藏定时器
    if (this.hideTimer) clearTimeout(this.hideTimer);
    
    // 设置新定时器
    this.hideTimer = setTimeout(() => {
      newHoles[index].moleVisible = false;
      this.setData({ 
        holes: newHoles,
        currentMoleIndex: -1 
      });
    }, this.data.config.moleShowTime);
  },

  // 玩家点击地鼠触发
  hitMole: function(e) {
    let index = e.currentTarget.dataset.index;
    // 只有当前显示的地鼠才能响应点击
    if (index !== this.data.currentMoleIndex) return;

    let holes = this.data.holes;
    if (holes[index].moleVisible && !holes[index].hit) {
      holes[index].hit = true;  // 标记为已被击中
      this.setData({
        score: this.data.score + 1,
        holes: holes
      });

      // 点击后，先清除自动隐藏的定时器，避免冲突
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      // 500ms 后隐藏地鼠（显示击中效果后再隐藏）
      setTimeout(() => {
        holes[index].moleVisible = false;
        holes[index].hit = false;
        this.setData({ 
          holes: holes,
          // 注意：这里不再重置 currentMoleIndex，否则会影响下一个地鼠的点击
        });
      }, this.data.config.hitShowTime);
    }
  },

  // 页面卸载时清除所有定时器，防止内存泄漏
  onUnload: function() {
    clearInterval(this.data.gameTimer);
    clearInterval(this.data.moleTimer);
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
});