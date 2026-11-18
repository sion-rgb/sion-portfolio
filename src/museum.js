import { museumStops } from './museum-stops.js';

import walkLines from './museum-walk-lines.json';

const assets = import.meta.env.BASE_URL + 'assets/';
const number = (i) => String(i + 1).padStart(2, '0');

export function initMuseum() {
  const exhibit = document.querySelector('.museum-exhibition');
  const find = (key) => exhibit.querySelector('[data-museum="' + key + '"]');
  const place = document.createComment('museum-exhibition');
  exhibit.before(place);
  const theatre = document.createElement('dialog');
  theatre.className = 'museum-theatre';
  theatre.setAttribute('aria-label', 'RAI 第一身博物館導賞');
  place.after(theatre);
  const expand = find('immersive');
  function enlarge() {
    if (theatre.open) return;
    theatre.append(exhibit);
    theatre.showModal();
    document.body.classList.add('museum-open');
    expand.textContent = '返回作品集　×';
    expand.setAttribute('aria-expanded', 'true');
    view.focus({ preventScroll: true });
  }
  function leave() {
    if (!theatre.open) return;
    theatre.close();
    place.after(exhibit);
    document.body.classList.remove('museum-open');
    expand.textContent = '放大展館　⛶';
    expand.setAttribute('aria-expanded', 'false');
    stop();
    expand.focus({ preventScroll: true });
  }
  expand.addEventListener('click', () => (theatre.open ? leave() : enlarge()));
  theatre.addEventListener('cancel', (e) => {
    e.preventDefault();
    leave();
  });
  const view = find('view'),
    select = find('index'),
    listen = find('listen'),
    next = find('next'),
    prev = find('prev');
  const audio = new Audio();
  audio.preload = 'none';
  audio.lang = 'yue-Hant-HK';
  let scene,
    request,
    active = false,
    current = 0,
    mode = 'loading',
    continuous = false,
    paused = false,
    started = false,
    fallback = false;
  museumStops.forEach((s, i) => select.add(new Option(number(i) + '　' + s.title, i)));
  function status(text) {
    find('status').textContent = text;
  }
  function controls() {
    const loading = mode === 'loading',
      entrance = mode === 'entrance',
      walking = mode === 'walking';
    listen.disabled = loading;
    select.disabled = loading;
    prev.disabled = loading || entrance || current === 0;
    next.disabled = loading;
    next.hidden = entrance || loading;
    listen.textContent = loading
      ? '準備展館中…'
      : entrance
        ? fallback
          ? '開始語音導賞'
          : '跟 RAI 入館　→'
        : walking
          ? paused
            ? '繼續跟隨　▷'
            : '停步　Ⅱ'
          : audio.paused
            ? '聽廣東話導賞　▷'
            : '暫停導賞　Ⅱ';
    listen.setAttribute('aria-pressed', String(walking ? !paused : !audio.paused));
    next.textContent = current === museumStops.length - 1 ? '行返第一站　↺' : '行去下一站　→';
    view.classList.toggle('is-walking', walking);
    if (walking) find('pad').open = false;
    exhibit.dataset.mode = mode;
  }
  function content(i) {
    const s = museumStops[i];
    find('page').textContent = number(i) + ' / ' + number(museumStops.length - 1);
    find('title').textContent = s.title;
    find('en').textContent = s.english;
    find('words').textContent = s.words;
    find('caption').textContent = s.caption;
    find('credit').textContent = s.credit;
    find('link').href = '#' + s.target;
    find('link').textContent = s.link + '　↗';
    if (fallback) {
      find('image').src = assets + s.image;
      find('image').alt = s.caption;
      find('rai').src = assets + 'museum/' + s.pose + '-idle.webp';
    }
  }
  function silence() {
    continuous = false;
    audio.pause();
    controls();
  }
  function play() {
    continuous = true;
    audio.play().catch((error) => {
      if (error.name === 'AbortError') return;
      silence();
      find('notice').textContent = '撳「聽廣東話導賞」可重試播放。';
    });
  }
  function arrive(i) {
    if (i !== current) return;
    mode = 'exhibit';
    paused = false;
    content(i);
    audio.src = assets + 'museum/stop-' + i + '.mp3';
    status((fallback ? '文字導覽　' : '已抵達　') + museumStops[i].title);
    controls();
    if (continuous && active) play();
  }
  function go(i, withVoice = true) {
    if (mode === 'loading') return;
    current = i;
    select.value = String(i);
    continuous = withVoice;
    paused = false;
    audio.pause();
    started = true;
    find('notice').textContent = '';
    if (fallback) {
      arrive(i);
      return;
    }
    mode = 'walking';
    scene.setPaused(false);
    status('正前往　' + museumStops[i].title);
    find('page').textContent = number(i) + ' / ' + number(museumStops.length - 1);
    find('title').textContent = museumStops[i].title;
    find('en').textContent = museumStops[i].english;
    controls();
    find('words').textContent = walkLines[i].words;
    if (withVoice && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      audio.src = assets + 'museum/walk-' + i + '.mp3';
      audio.play().catch(() => {});
    }
    scene.travel(i, withVoice ? walkLines[i].mouth.length / 16 : 0);
  }
  function pauseWalk() {
    paused = !paused;
    scene?.setPaused(paused);
    if (paused) audio.pause();
    else if (continuous && !audio.ended && audio.currentSrc.includes('/walk-'))
      audio.play().catch(() => {});
    status((paused ? '已停步　' : '正前往　') + museumStops[current].title);
    controls();
  }
  function entrance() {
    mode = 'entrance';
    status(fallback ? '文字及語音導覽' : 'RAI 正在入口等你');
    find('page').textContent = 'ENTRANCE';
    find('title').textContent = '展館入口';
    find('en').textContent = 'The entrance hall';
    find('words').textContent = fallback
      ? '可以用廣東話旁白同展品圖片繼續參觀。'
      : '你好，我係 RAI。跟我入嚟，我帶你行過八個展區，睇吓 Sion 點樣由攝影一路做到互動設計。';
    controls();
  }
  function restored() {
    fallback = false;
    view.classList.remove('museum-fallback-active');
    find('notice').textContent = '';
    if (started) go(current, continuous && active);
    else entrance();
  }
  function unavailable() {
    fallback = true;
    silence();
    status('文字及語音導覽');
    view.classList.remove('museum-ready');
    view.classList.add('museum-fallback-active');
    find('notice').textContent = '3D 展館暫時未能顯示，可以繼續聽語音導賞。';
    if (started) arrive(current);
    else {
      content(0);
      entrance();
    }
  }
  function stop() {
    if (mode === 'walking' && !paused) pauseWalk();
    if (mode !== 'walking') silence();
  }
  function activate(on) {
    if (!on && !active) return;
    active = on;
    if (!on) {
      leave();
      stop();
      scene?.setActive(false);
      return;
    }
    if (!request) {
      content(0);
      status('正在佈置展館…');
      controls();
      request = import('./museum-scene.js')
        .then(async ({ createMuseumScene }) => {
          scene = await createMuseumScene(view, audio, arrive, status, unavailable, restored);
          scene.setActive(active);
          entrance();
        })
        .catch(unavailable);
    } else scene?.setActive(true);
  }
  listen.addEventListener('click', () => {
    if (mode === 'entrance') {
      if (!fallback) enlarge();
      go(0);
      return;
    }
    if (mode === 'walking') {
      pauseWalk();
      return;
    }
    if (audio.paused) play();
    else silence();
  });
  select.addEventListener('change', () => go(Number(select.value)));
  prev.addEventListener('click', () => go(Math.max(0, current - 1)));
  next.addEventListener('click', () => go((current + 1) % museumStops.length));
  find('centre').addEventListener('click', () => scene?.recenter());
  for (const button of exhibit.querySelectorAll('[data-stride]')) {
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      scene?.stride(button.dataset.stride, true);
    });
    button.addEventListener('lostpointercapture', () => scene?.stride(button.dataset.stride, false));
    button.addEventListener('click', (e) => {
      if (e.detail === 0) scene?.nudge(button.dataset.stride);
    });
  }
  audio.addEventListener('playing', controls);
  audio.addEventListener('pause', controls);
  audio.addEventListener('ended', () => {
    if (mode !== 'exhibit') return;
    if (active && continuous && current < museumStops.length - 1) go(current + 1);
    else silence();
  });
  audio.addEventListener('error', () => {
    if (mode === 'walking') return;
    silence();
    find('notice').textContent = '未能載入旁白，可以閱讀導賞詞。';
  });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && active) stop();
  }).observe(exhibit);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  window.addEventListener('pagehide', stop);
  find('link').addEventListener('click', () => {
    leave();
    stop();
  });
  return activate;
}
