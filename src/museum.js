import { museumStops } from './museum-stops.js';

const assets = import.meta.env.BASE_URL + 'assets/';
const number = (n) => String(n + 1).padStart(2, '0');

export function initMuseum() {
  const exhibit = document.querySelector('.museum-exhibition');
  const find = (key) => exhibit.querySelector('[data-museum="' + key + '"]');
  const view = find('view'),
    selection = find('index'),
    listen = find('listen');
  const audio = new Audio();
  audio.preload = 'none';
  audio.lang = 'yue-Hant-HK';
  let current = 0,
    scene,
    request,
    active = false,
    continueTour = false,
    initialized = false;
  museumStops.forEach((stop, i) => selection.add(new Option(number(i) + '　' + stop.title, i)));
  function updateVoice() {
    const playing = !audio.paused && !audio.ended;
    listen.textContent = playing ? 'Ⅱ　暫停導賞' : '▷　聽廣東話導賞';
    listen.setAttribute('aria-pressed', String(playing));
  }
  function play() {
    continueTour = true;
    audio.play().catch((error) => {
      if (error.name === 'AbortError') return;
      continueTour = false;
      find('notice').textContent = '語音暫時未能播放，可以閱讀下方導賞詞。';
      updateVoice();
    });
  }
  function stopVoice() {
    continueTour = false;
    audio.pause();
    updateVoice();
  }
  function select(i, withVoice = false) {
    const stop = museumStops[i];
    current = i;
    audio.pause();
    audio.src = assets + 'museum/stop-' + i + '.mp3';
    find('notice').textContent = '';
    find('title').textContent = stop.title;
    find('en').textContent = stop.english;
    find('page').textContent = number(i) + ' / ' + number(museumStops.length - 1);
    find('words').textContent = stop.words;
    find('caption').textContent = stop.caption;
    find('credit').textContent = stop.credit;
    find('link').href = '#' + stop.target;
    find('link').textContent = stop.link + '　↗';
    const image = find('image');
    image.src = assets + stop.image;
    image.alt = stop.caption;
    find('rai').src = assets + 'museum/' + stop.pose + '-idle.webp';
    selection.value = i;
    find('prev').disabled = i === 0;
    find('next').textContent = i === museumStops.length - 1 ? '返回序廳　↺' : '下一展區　→';
    scene?.select(i);
    if (withVoice && active) play();
    else updateVoice();
  }
  function setActive(on) {
    if (!on && !active) return;
    active = on;
    if (!on) {
      stopVoice();
      scene?.setActive(false);
      return;
    }
    if (!initialized) {
      initialized = true;
      select(0);
    }
    if (!request) {
      request = import('./museum-scene.js')
        .then(({ createMuseumScene }) => {
          scene = createMuseumScene(view, audio);
          scene.select(current);
          scene.setActive(active);
          updateVoice();
        })
        .catch(() => {
          view.classList.remove('museum-ready');
        });
    } else scene?.setActive(true);
  }
  selection.addEventListener('change', () => select(Number(selection.value), continueTour));
  find('prev').addEventListener('click', () => select(Math.max(0, current - 1), continueTour));
  find('next').addEventListener('click', () => select((current + 1) % museumStops.length, continueTour));
  listen.addEventListener('click', () => (audio.paused ? play() : stopVoice()));
  audio.addEventListener('playing', updateVoice);
  audio.addEventListener('pause', updateVoice);
  audio.addEventListener('ended', () => {
    if (active && continueTour && current < museumStops.length - 1) select(current + 1, true);
    else stopVoice();
  });
  audio.addEventListener('error', () => {
    stopVoice();
    find('notice').textContent = '語音暫時未能播放，可以閱讀下方導賞詞。';
  });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) stopVoice();
  }).observe(exhibit);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVoice();
  });
  window.addEventListener('pagehide', stopVoice);
  find('link').addEventListener('click', stopVoice);
  return setActive;
}
