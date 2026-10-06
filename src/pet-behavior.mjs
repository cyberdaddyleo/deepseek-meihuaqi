// Pure local behavior: callers supply monotonic milliseconds. No timers, DOM,
// network, global mouse/keyboard observation, or background work lives here.
const DROWSY_AFTER = 45_000;
const SLEEP_AFTER = 120_000;
const FEEDBACK_GAP = 200;
const BURST_WINDOW = 700;
const durations = {
  look: 1500, wave: 1500, stretch: 1800, yawn: 1800, wake: 1800,
  wiggle: 1200, love: 1200, hop: 850, surprise: 850, spin: 1100, land: 550,
  walk: 6000, dance: 2400, peek: 2200, shake: 1600,
  crawl: 6000, eat: 4000, work: 5000,
};
const personalities = {
  cyberdad: {
    idle: ['eat', 'work', 'wave', 'peek', 'yawn', 'dance'], click: ['wave', 'love', 'surprise', 'dance', 'peek'], play: 'wave',
    text: {look:'扶扶眼镜，认真想一想', wave:'嗨，老爸一直在呢', stretch:'一起伸个懒腰吧', wiggle:'小小摇摆，快乐充电', hop:'好耶，给你点个赞', spin:'转个圈，换个好心情', love:'给你一颗暖暖的心', surprise:'嘿，被你发现啦', drag:'抱稳啦，换个地方陪你', land:'站稳啦，这里也不错', yawn:'啊呜…先打个小哈欠', wake:'睡醒啦，继续陪你', walk:'迈迈小短腿，溜达一圈', eat:'咔嚓，饼干真香', work:'戴好眼镜，陪你认真工作', dance:'小步摇摇，开心一会儿', peek:'悄悄探头，你在忙呀', shake:'抖抖精神，继续加油'},
  },
  whalegirl: {
    travel: 'crawl', idle: ['eat', 'work', 'peek', 'yawn', 'shake'], click: ['love', 'wave', 'peek', 'surprise'], play: 'love',
    text: {look:'看看你在忙什么', wave:'小鳍鳍挥挥，你好呀', stretch:'伸个懒腰，继续陪你', wiggle:'轻轻摇一摇', hop:'开心冒个小泡泡', spin:'转一圈，把快乐送给你', love:'蹭蹭你，喜欢和你一起', surprise:'呀，被你发现啦', drag:'轻轻抱起来，出发', land:'这里也很舒服', yawn:'啊呜…打个小哈欠', wake:'醒啦，继续陪着你', crawl:'慢慢爬过去，看看你', eat:'啊呜一口，谢谢款待', work:'认真陪你工作一会儿', dance:'小鳍鳍，跳个舞', peek:'探出脑袋，偷偷看你', shake:'抖抖身子，精神啦'},
  },
  robot: {
    idle: ['dance', 'peek', 'shake', 'wave', 'look', 'stretch'], click: ['wave', 'look', 'love', 'surprise', 'dance', 'peek', 'shake'], play: 'wave',
    text: {look: '让我想一想…', wave: '收到，挥挥手！', stretch: '活动一下小关节', wiggle: '快乐信号已收到', hop: '快乐能量 +1！', spin: '转一圈，重启好心情', love: '给你一颗电子心', surprise: '哔！我在这里', drag: '准备搬家啦', land: '着陆成功', yawn: '省电模式准备中…', wake: '开机啦，我在！', walk: '小步巡逻，马上回来', dance: '滴答滴答，跳支小舞', peek: '探个脑袋，找到你啦', shake: '抖一抖，烦恼清零'},
  },
  cat: {
    idle: ['peek', 'stretch', 'wave', 'dance', 'shake', 'wiggle'], click: ['stretch', 'wave', 'love', 'surprise', 'peek', 'shake', 'dance'], play: 'stretch',
    text: {look: '看看有什么新鲜事', wave: '洗洗脸，继续陪你', stretch: '伸个大大的懒腰', wiggle: '轻轻摇摇小尾巴', hop: '扑一下，抓到快乐', spin: '追一追小尾巴', love: '蹭蹭你，喵', surprise: '耳朵竖起来啦', drag: '轻轻抱着我哦', land: '四只爪爪站稳啦', yawn: '哈欠…有点困了', wake: '喵，睡醒伸个腰', walk: '小爪爪，溜达一圈', dance: '猫猫扭扭，快乐加倍', peek: '偷偷探头，喵？', shake: '抖抖毛，又蓬松啦'},
  },
  whale: {
    idle: ['wiggle', 'dance', 'peek', 'shake', 'wave', 'stretch'], click: ['wiggle', 'look', 'love', 'surprise', 'dance', 'peek', 'shake'], play: 'wave',
    text: {look: '水面上有什么呢', wave: '噗噜，送你一串泡泡', stretch: '舒舒服服游一圈', wiggle: '摆摆尾巴，噗噜', hop: '跃出一朵小浪花', spin: '在水里转个圈', love: '一颗海蓝色的心', surprise: '噗！发现你啦', drag: '一起换片海游泳', land: '轻轻游到这里', yawn: '慢慢游，有点困', wake: '醒啦，吐个小泡泡', walk: '在这片小海里游一游', dance: '小鳍摇摇，水里跳舞', peek: '探出水面看看你', shake: '抖抖小水珠，噗噜'},
  },
  generic: {
    idle: ['dance', 'peek', 'shake', 'wave', 'stretch'], click: ['wave', 'wiggle', 'love', 'surprise', 'dance', 'peek', 'shake'], play: 'wave',
    text: {look: '看看周围的小世界', wave: '嗨，陪你一会儿', stretch: '活动一下，真舒服', wiggle: '轻轻摇一摇', hop: '开心地跳一下', spin: '快乐转个圈', love: '给你一颗小心心', surprise: '嘿，我在这里', drag: '一起挪个位置', land: '这里也很舒服', yawn: '有一点点困了', wake: '醒啦，继续陪你', walk: '小步走走，陪你左右', dance: '开心扭扭，跳个小舞', peek: '偷偷看看你在不在', shake: '抖抖身子，精神啦'},
  },
};

export class PetBehavior {
  constructor({ pet = 'robot', now = 0, random = Math.random } = {}) {
    if (!Number.isFinite(now)) throw new TypeError('now 必须是有限的毫秒数');
    this._random = typeof random === 'function' ? random : Math.random;
    this._wallNow = now;
    this._time = 0;
    this._paused = false;
    this._value = { mood: 'awake', action: 'idle', effect: 'none', message: '', revision: 0 };
    this._reset(pet);
  }

  snapshot() { return { ...this._value }; }

  _reset(pet) {
    this._pet = typeof pet === 'string' ? pet : 'generic';
    this._profile = Object.hasOwn(personalities, this._pet) ? personalities[this._pet] : personalities.generic;
    this._lastActivity = this._time;
    this._actionUntil = 0;
    this._dragging = false;
    this._releasedWhilePaused = false;
    this._forcedSleep = false;
    this._lastIdleAction = null;
    this._lastCuteAction = null;
    this._firstAutonomous = true;
    this._nextAwakeWalk = true;
    this._lastClickAction = null;
    this._lastPlayAction = null;
    this._lastBurstAction = null;
    this._clickTimes = [];
    this._lastFeedback = -Infinity;
    this._change('awake', 'idle', 'none', '');
    this._schedule(true);
  }

  _roll() {
    const n = this._random();
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
  }

  _choose(list, previous) {
    const choices = list.filter(action => action !== previous);
    const available = choices.length ? choices : list;
    return available[Math.min(available.length - 1, Math.floor(this._roll() * available.length))];
  }

  _schedule(first = false) {
    this._nextIdleAt = this._time + (first ? 6000 : 10_000) + Math.round(this._roll() * (first ? 3000 : 6000));
  }

  _change(mood, action, effect, message, restart = false) {
    const old = this._value;
    if (restart || old.mood !== mood || old.action !== action || old.effect !== effect || old.message !== message) {
      this._value = { mood, action, effect, message, revision: old.revision + 1 };
    }
  }

  _effect(action) {
    if (action === 'love') return 'heart';
    if (this._pet === 'whale' && ['wave', 'wiggle', 'wake', 'walk', 'dance'].includes(action)) return 'bubbles';
    if (['hop', 'spin', 'surprise', 'dance'].includes(action)) return 'sparkle';
    return 'none';
  }

  _act(action, { mood = this._value.mood, effect = this._effect(action), restart = true } = {}) {
    this._actionUntil = this._time + (durations[action] || Infinity);
    this._change(mood, action, effect, this._profile.text[action] || '', restart);
  }

  _sleep() {
    this._actionUntil = 0;
    this._change('sleeping', 'idle', 'sleep', '');
  }

  _idle() {
    this._actionUntil = 0;
    this._change(this._value.mood, 'idle', 'none', '');
  }

  _activity() {
    this._lastActivity = this._time;
    this._forcedSleep = false;
    this._schedule(this._firstAutonomous);
  }

  _advance(now) {
    if (!Number.isFinite(now)) throw new TypeError('now 必须是有限的毫秒数');
    // Ignore backwards deltas defensively, e.g. an older queued pointer event.
    const monotonic = Math.max(this._wallNow, now);
    if (!this._paused) this._time += monotonic - this._wallNow;
    this._wallNow = monotonic;
  }

  _update(allowAutonomous = true) {
    if (this._paused || this._dragging) return;
    const inactive = this._time - this._lastActivity;
    if (this._forcedSleep || inactive >= SLEEP_AFTER) { this._sleep(); return; }
    if (inactive >= DROWSY_AFTER && this._value.mood === 'awake') {
      this._act('yawn', { mood: 'drowsy' });
      this._lastIdleAction = 'yawn';
      this._schedule();
      return;
    }
    if (this._value.action !== 'idle' && this._time >= this._actionUntil) this._idle();
    if (allowAutonomous && this._value.action === 'idle' && this._time >= this._nextIdleAt) {
      let action;
      if (this._value.mood === 'drowsy') {
        action = this._choose(['look', 'yawn'], this._lastIdleAction);
      } else {
        const travel = this._profile.travel || 'walk';
        action = this._nextAwakeWalk ? travel : this._choose(this._profile.idle, this._lastCuteAction);
        if (action !== travel) this._lastCuteAction = action;
        this._nextAwakeWalk = !this._nextAwakeWalk;
        this._firstAutonomous = false;
      }
      this._lastIdleAction = action;
      this._act(action);
      this._schedule();
    }
  }

  tick(now) {
    this._advance(now);
    this._update();
    return this.snapshot();
  }

  interact(kind, now) {
    this._advance(now);
    if (this._paused) {
      // Ending a real drag must release the guard even while frozen. No land or
      // click is queued; resume reconciles the frozen drag picture to idle.
      if (this._dragging && (kind === 'drag-end' || kind === 'cancel')) {
        this._dragging = false;
        this._releasedWhilePaused = true;
      }
      return this.snapshot();
    }
    // A click arriving exactly when a walk is due takes precedence: do not
    // consume the pending autonomous step behind an immediate user response.
    this._update(false);
    if (kind === 'nap') {
      this._dragging = false;
      this._forcedSleep = true;
      this._clickTimes = [];
      this._sleep();
      return this.snapshot();
    }
    if (kind === 'drag-start') {
      if (!this._dragging) {
        this._dragging = true;
        this._clickTimes = [];
        this._activity();
        this._act('drag', { mood: 'awake' });
      }
      return this.snapshot();
    }
    if (kind === 'drag-end' || kind === 'cancel') {
      if (this._dragging) {
        this._dragging = false;
        this._activity();
        if (kind === 'drag-end') this._act('land', { mood: 'awake' });
        else this._change('awake', 'idle', 'none', '');
      }
      return this.snapshot();
    }
    const special = ['whalegirl', 'cyberdad'].includes(this._pet) && ['eat', 'work', 'yawn'].includes(kind);
    if (this._dragging || (!special && !['click', 'play', 'wake', 'walk'].includes(kind))) return this.snapshot();
    const wasSleepy = this._value.mood !== 'awake';
    if (kind === 'walk') {
      this._firstAutonomous = false;
      this._nextAwakeWalk = false;
    }
    this._activity();
    if (special) {
      this._clickTimes = [];
      this._lastFeedback = this._time;
      this._act(kind, { mood: 'awake' });
    } else if (kind === 'walk') {
      this._clickTimes = [];
      this._lastFeedback = this._time;
      this._act(this._profile.travel || 'walk', { mood: 'awake' });
    } else if (kind === 'wake') {
      this._clickTimes = [];
      this._lastFeedback = this._time;
      this._act('wake', { mood: 'awake' });
    } else if (kind === 'play') {
      this._clickTimes = [];
      this._lastFeedback = this._time;
      const action = this._lastPlayAction === null ? this._profile.play : this._choose([this._profile.play, 'hop', 'spin', 'dance', 'peek', 'shake'], this._lastPlayAction);
      this._lastPlayAction = action;
      this._act(action, { mood: 'awake' });
    } else {
      this._clickTimes = [...this._clickTimes.filter(at => this._time - at <= BURST_WINDOW), this._time].slice(-3);
      if (wasSleepy) {
        this._lastFeedback = this._time;
        this._act('wake', { mood: 'awake' });
      } else if (['walk', 'crawl', 'eat', 'work', 'yawn'].includes(this._value.action) || this._time - this._lastFeedback >= FEEDBACK_GAP) {
        this._lastFeedback = this._time;
        if (this._clickTimes.length >= 3) {
          const action = this._choose(['hop', 'spin'], this._lastBurstAction);
          this._lastBurstAction = action;
          this._act(action, { mood: 'awake', effect: 'sparkle' });
        } else {
          const action = this._choose(this._profile.click, this._lastClickAction);
          this._lastClickAction = action;
          this._act(action, { mood: 'awake' });
        }
      }
    }
    return this.snapshot();
  }

  setPet(id, now) {
    this._advance(now);
    this._reset(id);
    return this.snapshot();
  }

  setPaused(paused, now) {
    this._advance(now);
    if (!this._paused) this._update();
    const next = Boolean(paused);
    if (next !== this._paused) {
      this._paused = next;
      this._clickTimes = [];
      this._lastFeedback = -Infinity;
      if (!next && this._releasedWhilePaused) {
        this._releasedWhilePaused = false;
        this._activity();
        this._change('awake', 'idle', 'none', '');
      }
    }
    return this.snapshot();
  }
}
