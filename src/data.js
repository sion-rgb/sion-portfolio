export const creativeWorks = [
  { id: 'union', category: 'CONTENT STRATEGY / VIDEO', title: '把空間故事，變成品牌內容。', client: 'Union Design HK', image: 'union-video.jpg', alt: 'Union Design HK 訪問影片的作品集截圖', description: '在多媒體部門主管任內，負責 YouTube 內容、影片剪輯、網站內容與 SEO 文章，並參與推廣頁面內容及視覺製作。', role: '頻道維護 · 影像製作 · SEO 內容 · WordPress', link: 'https://youtu.be/V0gkfnuA3HE', linkLabel: '查看原始影片', source: 'Visual Portfolio，第 2 頁' },
  { id: 'figma', category: 'UI / UX / DIGITAL MARKETING', title: '從使用流程，到內容轉化。', client: 'Money Plaza (Hong Kong) Limited', image: 'figma-design.jpg', alt: 'Money Plaza 的 Figma 網頁及手機介面設計作品', description: '結合金融服務的數碼行銷需求，參與 UI／UX 設計、SEO 文章、Landing Page 規劃與推廣內容製作。圖中為作品集收錄的 Figma 介面設計。', role: 'Figma 介面設計 · SEO · Landing Page · 行銷內容', link: 'https://www.youtube.com/watch?v=G3AnItEzVv4', linkLabel: '查看影音作品', source: 'Visual Portfolio，第 4–6 頁' },
  { id: 'cell', category: 'MOTION / BRAND CONTENT', title: '讓品牌，在動態中被記住。', client: 'Cell Medical Beauty', image: 'cell-motion.jpg', alt: 'Cell Medical Beauty 社交媒體動畫的作品集圖片', description: '製作醫學美容品牌的平面視覺、社交媒體動畫及影音素材，配合不同平台規劃內容與後期製作。', role: 'Motion Graphics · 社交內容 · 影音後期', link: 'https://youtube.com/shorts/mCuYoCHadlU', linkLabel: '查看動畫作品', source: 'Visual Portfolio，第 3–4 頁' },
  { id: 'studio', category: 'PHOTOGRAPHY / FILM', title: '以鏡頭，留下真實的細節。', client: 'Raymond Wong Studio · 合作紀錄', image: 'studio-film.jpg', alt: 'Raymond Wong Studio 食物攝影教學影片的作品集圖片', description: '於攝影助理及合作製作期間參與拍攝、記錄與影片製作。作品集亦收錄 Pegasus Studio HK、HQ Hair Therapy 與畢業攝影作品。', role: '攝影協作 · 記錄拍攝 · 影片製作', link: 'https://www.youtube.com/watch?v=1qILJE3MsP0', linkLabel: '查看教學影片', source: 'Visual Portfolio，第 7–12 頁' }
];

export const projects = [
  { id:'sakura-walk', title:'Sakura Walk', subtitle:'在櫻花下，慢一點。', category:'games', image:'sakura-walk.jpg', imageSource:'GitHub README 畫面', description:'Three.js 櫻花陪伴散步體驗，探索第一／第三人稱視角與日夜氛圍。', tags:['Three.js','TypeScript','WebGL'], demo:'https://sion-rgb.github.io/sakura-walk/' },
  { id:'pixel-media-toolbox', title:'Pixel Media Toolbox', subtitle:'讓影音工作，回到本機。', category:'tools', image:'pixel-toolbox.jpg', imageSource:'GitHub README 畫面', description:'以像素視覺整合影音轉換、剪輯工作室及素材工具的本機多媒體應用。', tags:['TypeScript','FFmpeg','Desktop'] },
  { id:'canto-suite', title:'Canto Suite', subtitle:'為香港廣東話而設。', category:'tools', initials:'粵', color:'sage', description:'整合 Android 會議錄音與 Windows 媒體轉錄，採用本機語音推論及 TXT／SRT 輸出。', tags:['Dart','C# / C++','Local AI'] },
  { id:'tactical-slash', title:'Tactical Slash', subtitle:'在方格之間，思考下一步。', category:'games', initials:'TS', color:'clay', description:'Godot 4 製作的 3D 回合制戰術 RPG，結合劍士、弓箭手、牧師與職業行動。', tags:['Godot 4','GDScript','3D RPG'], demo:'https://sion-rgb.github.io/tactical-slash/' },
  { id:'auto-publisher', title:'AI Content Publisher', subtitle:'從素材，到有依據的草稿。', category:'tools', initials:'AP', color:'sand', description:'Windows AI 內容發佈工具，整合素材審閱、依據來源的草稿及排程工作。外部帳戶整合需自行設定，公開版未完成真實帳戶驗證。', tags:['TypeScript','AI Workflow','Windows'] },
  { id:'picopals-8bit', title:'PicoPals 8-Bit', subtitle:'口袋裡的一個小世界。', category:'games', image:'picopals.jpg', imageSource:'GitHub README 畫面', description:'原創 8-bit 虛擬寵物 PWA，包含離線遊玩、進化及小遊戲。', tags:['TypeScript','PWA','Pixel Art'], demo:'https://sion-rgb.github.io/picopals-8bit/' },
  { id:'pixel-quickcut', title:'Pixel QuickCut', subtitle:'在手機上，跟著節奏剪輯。', category:'tools', image:'pixel-quickcut.jpg', imageSource:'GitHub README 畫面', description:'Android 觸控影音編輯器，結合本機節拍分析與原生 Media3 輸出。', tags:['Kotlin','Android','Media3'] },
  { id:'8bit-life-simulator', title:'8-Bit Life Simulator', subtitle:'讓每一段人生，都有可能。', category:'games', initials:'8B', color:'clay', description:'離線程序生成的 8-bit 人生模擬遊戲，從香港、古代中國到修仙與未來世界。', tags:['TypeScript','Offline','Simulation'], demo:'https://sion-rgb.github.io/8bit-life-simulator/' },
  { id:'daily-bible-app', title:'每日聖經靈修', subtitle:'給每天一點安靜的空間。', category:'content', initials:'每日', color:'sage', description:'繁體中文聖經靈修應用，提供閱讀及日常靈修內容。', tags:['Traditional Chinese','Devotional'], demo:'https://sion-rgb.github.io/daily-bible-app/' },
  { id:'bencao-neijing-tiaoyang', title:'本草內經・體質調養', subtitle:'把經典知識，帶進日常。', category:'content', initials:'本草', color:'sage', description:'手機優先的繁體中文 PWA，整理傳統中醫體質、經典知識與養生教育內容。', tags:['TypeScript','PWA','Education'], demo:'https://sion-rgb.github.io/bencao-neijing-tiaoyang/' },
  { id:'sakura-sprint', title:'月白花徑 · Sakura Sprint', subtitle:'月光中的角色與互動探索。', category:'games', image:'sakura-sprint.jpg', imageSource:'GitHub README 角色檢視', description:'月光櫻花 3D 跑步遊戲及角色檢視專案。公開 README 保留模型修復歷程，整體美術還原狀態為 PARTIAL。', tags:['3D','Character','Prototype'] },
  { id:'starlight-arena-prototype', title:'Starlight Arena', subtitle:'即時互動的一次試驗。', category:'games', initials:'SA', color:'sand', description:'以 TypeScript 製作的瀏覽器競技場原型，探索操作、戰鬥及互動體驗。', tags:['TypeScript','Web','Prototype'], demo:'https://sion-rgb.github.io/starlight-arena-prototype/' }
];

export const experience = [
  { date:'2023.09 — 至今', company:'Union Design HK', title:'Head of Multimedia Department', cn:'多媒體部門主管', description:'負責 YouTube 頻道、網站及社交媒體內容；結合 SEO 文章、影片製作與 AI 輔助工作流。' },
  { date:'2023.02 — 2023.08', company:'Cell Medical Beauty', title:'Multimedia Editor', cn:'多媒體編輯', description:'製作品牌平面視覺、社交媒體動畫與短影音，協調拍攝及後期內容。' },
  { date:'2020.04 — 2023.02', company:'Money Plaza (Hong Kong) Limited', title:'Digital Marketing Manager', cn:'數碼行銷經理', description:'參與數碼行銷基礎建設，負責 SEO、Google Ads、Landing Page 及金融服務推廣影音。' },
  { date:'2017.07 — 2020.02', company:'HQ Hair Therapy', title:'Marketing Accountant & Specialist', cn:'行銷企劃與素材製作', description:'涵蓋社群經營、SEO 文章、EDM、平面設計、影片拍攝及網頁介面。' },
  { date:'2015.01 — 2017.07', company:'Ming Tat Hong Hardware Supplier Co., Ltd.', title:'Senior Graphic Designer & IT Support', cn:'高級平面設計師兼 IT 支援', description:'企業視覺、B2B 產品型錄及商業產品攝影，兼顧官網與 Alibaba 後台管理。2016.08 起轉兼職。' },
  { date:'2013 — 2016 · 兼職', company:'Raymond Wong Studio', title:'Photographic Assistant', cn:'攝影助理', description:'攝影協作、拍攝記錄與製作支援。資料來源：Visual Portfolio。' }
];
