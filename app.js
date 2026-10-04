(function(){
"use strict";

function $(id){ return document.getElementById(id); }
function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }
function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }
function escapeHtml(str){
  if(str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}
function nowTime(){
  var d = new Date();
  return ("0"+d.getHours()).slice(-2) + ":" + ("0"+d.getMinutes()).slice(-2);
}
function formatSize(bytes){
  if(bytes < 1024) return bytes + " Б";
  if(bytes < 1048576) return (bytes/1024).toFixed(1) + " КБ";
  return (bytes/1048576).toFixed(1) + " МБ";
}

var user = null;
var currentTheme = "dark";
var currentAccent = "blue";
var currentWallpaper = "default";
var currentChatId = "favorites";
var chats = { favorites:{ type:"favorites", name:"Избранное", messages:[] } };
var customChats = {};
var stories = [];
var starsAmount = 1000;

var ACCENTS_PASTEL = {
  blue:{ color:"#8ab4d8", hover:"#6f9cc5", name:"Голубой" },
  lavender:{ color:"#a898d8", hover:"#9080c5", name:"Лаванда" },
  mint:{ color:"#88c8a8", hover:"#70b090", name:"Мята" },
  peach:{ color:"#e8b090", hover:"#d49870", name:"Персик" },
  rose:{ color:"#d898b8", hover:"#c580a0", name:"Роза" },
  sky:{ color:"#90c8d8", hover:"#78b0c5", name:"Небо" },
  sand:{ color:"#d8c098", hover:"#c5a878", name:"Песок" },
  lilac:{ color:"#c8a8d8", hover:"#b088c5", name:"Сирень" },
  sage:{ color:"#a8c8b8", hover:"#90b0a0", name:"Шалфей" },
  coral:{ color:"#e8a8a8", hover:"#d59090", name:"Коралл" }
};

var ACCENTS_BRIGHT = {
  blue_b:{ color:"#4a90e2", hover:"#3a7bc8", name:"Синий" },
  green_b:{ color:"#52c234", hover:"#44a02b", name:"Зелёный" },
  red_b:{ color:"#ff4757", hover:"#e63946", name:"Красный" },
  purple_b:{ color:"#a55eea", hover:"#8e4dd6", name:"Фиолетовый" },
  orange_b:{ color:"#f0932b", hover:"#d97f1e", name:"Оранжевый" },
  pink_b:{ color:"#ff6b9d", hover:"#e65888", name:"Розовый" },
  cyan_b:{ color:"#00d2ff", hover:"#00b8e0", name:"Голубой яркий" },
  teal_b:{ color:"#00b894", hover:"#009f7e", name:"Бирюзовый" },
  yellow_b:{ color:"#f9ca24", hover:"#e0b210", name:"Жёлтый" },
  dark_b:{ color:"#546e7a", hover:"#455a64", name:"Серый" }
};

var ACCENTS = Object.assign({}, ACCENTS_PASTEL, ACCENTS_BRIGHT);

var WALLPAPERS = [
  { id:"default", name:"По умолчанию", css:"none" },
  { id:"gradient1", name:"Голубой", css:"linear-gradient(135deg,#1a2836,#0e1621)" },
  { id:"gradient2", name:"Лаванда", css:"linear-gradient(135deg,#221a33,#150e21)" },
  { id:"gradient3", name:"Мятный", css:"linear-gradient(135deg,#1a2e24,#0e1a14)" },
  { id:"gradient4", name:"Персиковый", css:"linear-gradient(135deg,#2e1f1a,#1a1210)" },
  { id:"pattern1", name:"Сетка", css:"url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\"><path d=\"M0 0h40v40H0z\" fill=\"none\" stroke=\"%23ffffff10\" stroke-width=\"1\"/></svg>')" },
  { id:"pattern2", name:"Точки", css:"url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"%23ffffff15\"/></svg>')" },
  { id:"dark", name:"Чёрный", css:"#000" }
];

var GIFTS = [
  { id:"heart", emoji:"❤️", name:"Сердце", price:5 },
  { id:"rose", emoji:"🌹", name:"Роза", price:10 },
  { id:"cake", emoji:"🎂", name:"Торт", price:25 },
  { id:"bear", emoji:"🧸", name:"Мишка", price:50 },
  { id:"rocket", emoji:"🚀", name:"Ракета", price:100 },
  { id:"crown", emoji:"👑", name:"Корона", price:200 },
  { id:"trophy", emoji:"🏆", name:"Кубок", price:300 },
  { id:"diamond", emoji:"💎", name:"Алмаз", price:500 },
  { id:"ring", emoji:"💍", name:"Кольцо", price:1000 }
];
var selectedGift = null;

var AVATAR_COLORS_PASTEL = [
  "linear-gradient(135deg,#b8d4f0,#a3c1e0)",
  "linear-gradient(135deg,#f4c2c2,#e8a5a5)",
  "linear-gradient(135deg,#c5e0c5,#a8d0a8)",
  "linear-gradient(135deg,#d8c5e8,#c4a8dd)",
  "linear-gradient(135deg,#f5d8a8,#e8c283)",
  "linear-gradient(135deg,#f5c5dd,#e8a8c5)",
  "linear-gradient(135deg,#a8dcdc,#8bc5c5)",
  "linear-gradient(135deg,#c8d4e8,#a8b8d8)",
  "linear-gradient(135deg,#e8c8d4,#d8a8b8)",
  "linear-gradient(135deg,#c8dcc8,#a8c8a8)"
];

var AVATAR_COLORS_BRIGHT = [
  "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  "linear-gradient(135deg,#4a90e2,#2c6fb4)",
  "linear-gradient(135deg,#52c234,#2e8b1e)",
  "linear-gradient(135deg,#a55eea,#6c5ce7)",
  "linear-gradient(135deg,#f9ca24,#f0932b)",
  "linear-gradient(135deg,#ff6b9d,#c44569)",
  "linear-gradient(135deg,#00d2ff,#3a7bd5)",
  "linear-gradient(135deg,#ee0979,#ff6a00)",
  "linear-gradient(135deg,#2c3e50,#4ca1af)",
  "linear-gradient(135deg,#c44569,#8e2a4a)"
];

var AVATAR_COLORS = AVATAR_COLORS_PASTEL.concat(AVATAR_COLORS_BRIGHT);

var BANNER_COLORS_PASTEL = [
  "linear-gradient(135deg,#b8d4f0,#c5e0f5)",
  "linear-gradient(135deg,#f4c2c2,#f5d5d5)",
  "linear-gradient(135deg,#c5e0c5,#d5f0d5)",
  "linear-gradient(135deg,#d8c5e8,#e8d5f5)",
  "linear-gradient(135deg,#f5d8a8,#f5e8c8)",
  "linear-gradient(135deg,#f5c5dd,#f5d5e8)",
  "linear-gradient(135deg,#a8dcdc,#c5e8e8)",
  "linear-gradient(135deg,#c8d4e8,#d8e0f0)",
  "linear-gradient(135deg,#e8c8d4,#f0d8e0)",
  "linear-gradient(135deg,#c8dcc8,#d8e8d8)"
];

var BANNER_COLORS_BRIGHT = [
  "linear-gradient(135deg,#4a90e2,#6c5ce7)",
  "linear-gradient(135deg,#ff6b6b,#ee5a24)",
  "linear-gradient(135deg,#52c234,#2e8b1e)",
  "linear-gradient(135deg,#f9ca24,#f0932b)",
  "linear-gradient(135deg,#a55eea,#6c5ce7)",
  "linear-gradient(135deg,#00d2ff,#3a7bd5)",
  "linear-gradient(135deg,#ee0979,#ff6a00)",
  "linear-gradient(135deg,#2c3e50,#4ca1af)",
  "linear-gradient(135deg,#ff6b9d,#c44569)",
  "linear-gradient(135deg,#f0932b,#c44569)"
];

var BANNER_COLORS = BANNER_COLORS_PASTEL.concat(BANNER_COLORS_BRIGHT);

var tempAvatar = { type:"color", value: AVATAR_COLORS_PASTEL[4] };
var pickerTarget = "user";
var pickerKind = "avatar";
var editMode = null;
var createMode = null;
var activeMessageIndex = -1;
var contextMessageIndex = -1;
var contextStoryIndex = -1;
var editingMessageIndex = -1;
var replyToIndex = -1;
var currentStoryIndex = 0;
var currentStoryList = [];
var storyTimer = null;
var currentStoryReactions = {};
var longPressTimer = null;
var giftHideTimer = null;

var mediaRecorder = null;
var audioChunks = [];
var audioStream = null;
var recordingTimer = null;
var recordingSeconds = 0;

var splash = $("splash");
var authScreen = $("authScreen");
var appScreen = $("appScreen");
var regName = $("regName");
var regUsername = $("regUsername");
var registerBtn = $("registerBtn");
var authError = $("authError");
var regAvatar = $("regAvatar");
var regAvatarIcon = $("regAvatarIcon");
var chatList = $("chatList");
var addChatBtn = $("addChatBtn");
var messagesContainer = $("messagesContainer");
var messageInput = $("messageInput");
var sendBtn = $("sendBtn");
var headerAvatar = $("headerAvatar");
var headerName = $("headerName");
var favCount = $("favCount");
var attachBtn = $("attachBtn");
var attachMenu = $("attachMenu");
var emojiBtn = $("emojiBtn");
var emojiPanel = $("emojiPanel");
var giftBtn = $("giftBtn");
var photoInput = $("photoInput");
var videoInput = $("videoInput");
var fileInput = $("fileInput");
var storyPhotoInput = $("storyPhotoInput");
var themeToggle = $("themeToggle");
var settingsBtn = $("settingsBtn");
var starsBtn = $("starsBtn");
var searchBtn = $("searchBtn");
var reactionPicker = $("reactionPicker");
var hint = $("hint");
var storiesBar = $("storiesBar");
var myStoryItem = $("myStoryItem");
var myStoryAvatar = $("myStoryAvatar");
var storyViewer = $("storyViewer");
var storyViewerImage = $("storyViewerImage");
var storyViewerAvatar = $("storyViewerAvatar");
var storyViewerName = $("storyViewerName");
var storyViewerTime = $("storyViewerTime");
var storyCloseBtn = $("storyCloseBtn");
var storyDeleteBtn = $("storyDeleteBtn");
var storyProgressBar = $("storyProgressBar");
var storyCaption = $("storyCaption");
var storyReplyInput = $("storyReplyInput");
var storySendBtn = $("storySendBtn");
var storyReactionsRow = $("storyReactionsRow");
var storyTapLeft = $("storyTapLeft");
var storyTapRight = $("storyTapRight");
var storyContextMenu = $("storyContextMenu");
var ctxReply = $("ctxReply");
var ctxReact = $("ctxReact");
var ctxDelete = $("ctxDelete");
var messageMenu = $("messageMenu");
var mmReply = $("mmReply");
var mmCopy = $("mmCopy");
var mmEdit = $("mmEdit");
var mmDelete = $("mmDelete");
var searchScreen = $("searchScreen");
var searchInput = $("searchInput");
var searchCancel = $("searchCancel");
var searchResults = $("searchResults");
var replyPreview = $("replyPreview");
var replyAuthor = $("replyAuthor");
var replyText = $("replyText");
var replyCloseBtn = $("replyCloseBtn");
var settingsScreen = $("settingsScreen");
var settingsBack = $("settingsBack");
var settingsProfileName = $("settingsProfileName");
var settingsProfileUsername = $("settingsProfileUsername");
var settingsThemeValue = $("settingsThemeValue");
var settingsAccentValue = $("settingsAccentValue");
var settingsWallpaperValue = $("settingsWallpaperValue");
var settingsStarsValue = $("settingsStarsValue");
var editNameBtn = $("editNameBtn");
var editUsernameBtn = $("editUsernameBtn");
var editBioBtn = $("editBioBtn");
var editBirthdayBtn = $("editBirthdayBtn");
var editChannelBtn = $("editChannelBtn");
var changeThemeBtn = $("changeThemeBtn");
var changeAccentBtn = $("changeAccentBtn");
var changeWallpaperBtn = $("changeWallpaperBtn");
var openStarsBtn = $("openStarsBtn");
var logoutBtn = $("logoutBtn");
var profileBanner = $("profileBanner");
var profileAvatar = $("profileAvatar");
var profileAvatarIcon = $("profileAvatarIcon");
var profileBio = $("profileBio");
var birthdayItem = $("birthdayItem");
var birthdayValue = $("birthdayValue");
var channelItem = $("channelItem");
var channelValue = $("channelValue");
var bioValue = $("bioValue");
var birthdayItemValue = $("birthdayItemValue");
var channelItemValue = $("channelItemValue");
var chatSettingsScreen = $("chatSettingsScreen");
var chatSettingsBack = $("chatSettingsBack");
var chatSettingsTitle = $("chatSettingsTitle");
var chatBanner = $("chatBanner");
var chatAvatar = $("chatAvatar");
var chatAvatarIcon = $("chatAvatarIcon");
var chatSettingsName = $("chatSettingsName");
var chatSettingsType = $("chatSettingsType");
var chatSettingsDesc = $("chatSettingsDesc");
var chatLinkItem = $("chatLinkItem");
var chatLinkValue = $("chatLinkValue");
var chatNameValue = $("chatNameValue");
var chatDescValue = $("chatDescValue");
var chatLinkValue2 = $("chatLinkValue2");
var chatEditNameBtn = $("chatEditNameBtn");
var chatEditDescBtn = $("chatEditDescBtn");
var chatEditLinkBtn = $("chatEditLinkBtn");
var chatDeleteBtn = $("chatDeleteBtn");
var starsScreen = $("starsScreen");
var starsClose = $("starsClose");
var starsBalanceEl = $("starsBalanceEl");
var giftBalanceEl = $("giftBalanceEl");
var createTypeModal = $("createTypeModal");
var createNameModal = $("createNameModal");
var createNameTitle = $("createNameTitle");
var createNameInput = $("createNameInput");
var createDescInput = $("createDescInput");
var createNameCancel = $("createNameCancel");
var createNameSave = $("createNameSave");
var giftModal = $("giftModal");
var giftsGrid = $("giftsGrid");
var giftCancel = $("giftCancel");
var giftSendBtn = $("giftSendBtn");
var giftTextInput = $("giftTextInput");
var pollModal = $("pollModal");
var pollQuestionInput = $("pollQuestionInput");
var pollOpt1 = $("pollOpt1");
var pollOpt2 = $("pollOpt2");
var pollOpt3 = $("pollOpt3");
var pollCancel = $("pollCancel");
var pollCreateBtn = $("pollCreateBtn");
var accentModal = $("accentModal");
var accentGrid = $("accentGrid");
var wallpaperModal = $("wallpaperModal");
var wallpaperGrid = $("wallpaperGrid");
var editModal = $("editModal");
var editModalTitle = $("editModalTitle");
var editModalLabel = $("editModalLabel");
var editModalInput = $("editModalInput");
var editModalHint = $("editModalHint");
var editModalCancel = $("editModalCancel");
var editModalSave = $("editModalSave");
var bioModal = $("bioModal");
var bioModalTitle = $("bioModalTitle");
var bioInput = $("bioInput");
var bioCancel = $("bioCancel");
var bioSave = $("bioSave");
var birthdayModal = $("birthdayModal");
var birthdayInput = $("birthdayInput");
var birthdayCancel = $("birthdayCancel");
var birthdaySave = $("birthdaySave");
var channelModal = $("channelModal");
var channelInput = $("channelInput");
var channelCancel = $("channelCancel");
var channelSave = $("channelSave");
var createStoryModal = $("createStoryModal");
var storyCaptionInput = $("storyCaptionInput");
var createStoryCancel = $("createStoryCancel");
var createStorySelectPhoto = $("createStorySelectPhoto");
var avatarPicker = $("avatarPicker");
var avatarGrid = $("avatarGrid");
var avatarUpload = $("avatarUpload");
var avatarFileInput = $("avatarFileInput");
var bannerPicker = $("bannerPicker");
var bannerGrid = $("bannerGrid");
var bannerUpload = $("bannerUpload");
var bannerFileInput = $("bannerFileInput");
var giftTgAnim = $("giftTgAnim");
var giftTgBackdrop = $("giftTgBackdrop");
var giftTgGlow = $("giftTgGlow");
var giftTgGift = $("giftTgGift");
var giftTgCaption = $("giftTgCaption");
var giftTgCapEmoji = $("giftTgCapEmoji");
var giftTgCapName = $("giftTgCapName");
var giftTgCapPrice = $("giftTgCapPrice");
var giftTgCapText = $("giftTgCapText");
var toastContainer = $("toastContainer");
var micBtn = $("micBtn");
var recordingBar = $("recordingBar");
var recordingTime = $("recordingTime");
var recordingWave = $("recordingWave");
var recordingCancel = $("recordingCancel");
var recordingSend = $("recordingSend");

function applyTheme(theme){
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  if(themeToggle && themeToggle.querySelector("i")){
    themeToggle.querySelector("i").className = theme === "light" ? "fas fa-sun" : "fas fa-moon";
  }
  if(settingsThemeValue) settingsThemeValue.textContent = theme === "dark" ? "Тёмная" : "Светлая";
  try { localStorage.setItem("sgram-theme", theme); } catch(e){}
}
function applyAccent(key){
  currentAccent = key;
  var a = ACCENTS[key] || ACCENTS_PASTEL.blue;
  document.documentElement.style.setProperty("--accent", a.color);
  document.documentElement.style.setProperty("--accent-hover", a.hover);
  if(settingsAccentValue) settingsAccentValue.textContent = a.name;
  try { localStorage.setItem("sgram-accent", key); } catch(e){}
}
function applyWallpaper(id){
  currentWallpaper = id;
  var w = null;
  for(var i = 0; i < WALLPAPERS.length; i++){ if(WALLPAPERS[i].id === id){ w = WALLPAPERS[i]; break; } }
  if(!w) w = WALLPAPERS[0];
  document.documentElement.style.setProperty("--chat-wallpaper", w.css);
  if(settingsWallpaperValue) settingsWallpaperValue.textContent = w.name;
  try { localStorage.setItem("sgram-wallpaper", id); } catch(e){}
}

on(themeToggle, "click", function(){
  applyTheme(currentTheme === "light" ? "dark" : "light");
});

function showToast(text, type){
  if(!toastContainer) return;
  var toast = document.createElement("div");
  toast.className = "toast" + (type === "success" ? " success" : "");
  toast.innerHTML = '<i class="fas fa-' + (type === "success" ? "check-circle" : "info-circle") + '"></i>' + escapeHtml(text);
  toastContainer.appendChild(toast);
  setTimeout(function(){
    toast.classList.add("hiding");
    setTimeout(function(){ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
  }, 1600);
}

function validateUsername(val){
  var cleaned = String(val).replace(/^@/, "");
  return { valid: /^[a-zA-Z0-9_]+$/.test(cleaned), cleaned: cleaned };
}
on(regUsername, "input", function(){
  var res = validateUsername(regUsername.value);
  regUsername.classList.toggle("error", regUsername.value && !res.valid);
});

function updateRegAvatar(){
  if(!regAvatar) return;
  regAvatar.style.background = tempAvatar.value;
  regAvatar.style.backgroundSize = "cover";
  regAvatar.style.backgroundPosition = "center";
  if(regAvatarIcon) regAvatarIcon.style.display = tempAvatar.type === "image" ? "none" : "block";
}
on(regAvatar, "click", function(){ pickerTarget = "reg"; pickerKind = "avatar"; openPicker(); });

on(registerBtn, "click", function(){
  var name = regName.value.trim();
  var usernameRaw = regUsername.value.trim();
  if(authError) authError.textContent = "";
  if(regName) regName.classList.remove("error");
  if(regUsername) regUsername.classList.remove("error");

  if(name.length < 2){
    if(authError) authError.textContent = "Введите имя (минимум 2 символа)";
    if(regName){ regName.classList.add("error"); regName.focus(); }
    return;
  }
  var res = validateUsername(usernameRaw);
  if(!res.valid){
    if(authError) authError.textContent = "Только английские буквы, цифры и _";
    if(regUsername){ regUsername.classList.add("error"); regUsername.focus(); }
    return;
  }
  if(res.cleaned.length < 3){
    if(authError) authError.textContent = "Username минимум 3 символа";
    if(regUsername){ regUsername.classList.add("error"); regUsername.focus(); }
    return;
  }

  user = {
    name:name, username:"@" + res.cleaned,
    avatar:tempAvatar, banner:{ type:"color", value:BANNER_COLORS_PASTEL[0] },
    bio:"", birthday:"", channel:"",
    initial:name.charAt(0).toUpperCase()
  };
  starsAmount = 1000;
  saveUser();
  showApp();
});

function saveUser(){
  try {
    localStorage.setItem("sgram-user", JSON.stringify(user));
    localStorage.setItem("sgram-stars", starsAmount);
  } catch(e){}
}
function saveStories(){ try { localStorage.setItem("sgram-stories", JSON.stringify(stories)); } catch(e){} }
function saveCustomChats(){ try { localStorage.setItem("sgram-chats", JSON.stringify(customChats)); } catch(e){} }

function showApp(){
  hide(authScreen);
  setTimeout(function(){
    show(appScreen);
    appScreen.classList.add("entering");
    setTimeout(function(){ appScreen.classList.remove("entering"); }, 900);
    try {
      applyUserToUI();
      renderChatList();
      switchChat("favorites");
      updateStarsUI();
      renderStories();
      if(!localStorage.getItem("sgram-hint-shown") && hint){
        setTimeout(function(){
          hint.classList.add("show");
          setTimeout(function(){ hint.classList.remove("show"); }, 3200);
          try { localStorage.setItem("sgram-hint-shown", "1"); } catch(e){}
        }, 1400);
      }
    } catch(e){ console.error(e); }
  }, 200);
}

function updateMyStoryAvatar(){
  if(!myStoryAvatar) return;
  if(user && user.avatar && user.avatar.type === "image"){
    myStoryAvatar.style.background = "url('" + user.avatar.value + "') center/cover";
    myStoryAvatar.innerHTML = "";
  } else if(user && user.avatar && user.avatar.type === "color"){
    myStoryAvatar.style.background = user.avatar.value;
    myStoryAvatar.innerHTML = '<i class="fas fa-camera"></i>';
  }
}

function applyUserToUI(){
  if(!user) return;
  if(headerAvatar){
    headerAvatar.style.background = user.avatar.type === "image" ? "url('" + user.avatar.value + "') center/cover" : user.avatar.value;
  }
  if(profileAvatar){
    if(user.avatar.type === "image"){
      profileAvatar.style.background = "url('" + user.avatar.value + "') center/cover";
      if(profileAvatarIcon) profileAvatarIcon.style.display = "none";
    } else {
      profileAvatar.style.background = user.avatar.value;
      if(profileAvatarIcon) profileAvatarIcon.style.display = "block";
    }
  }
  if(settingsProfileName) settingsProfileName.textContent = user.name;
  if(settingsProfileUsername) settingsProfileUsername.textContent = user.username;
  if(user.banner && profileBanner){
    profileBanner.style.background = user.banner.type === "image" ? "url('" + user.banner.value + "') center/cover" : user.banner.value;
  }
  if(user.bio && profileBio){
    profileBio.textContent = user.bio;
    profileBio.classList.remove("empty");
    if(bioValue) bioValue.textContent = user.bio.substring(0, 20) + (user.bio.length > 20 ? "…" : "");
  } else if(profileBio){
    profileBio.textContent = "Нажмите, чтобы добавить описание";
    profileBio.classList.add("empty");
    if(bioValue) bioValue.textContent = "—";
  }
  if(user.birthday && birthdayItem && birthdayValue){
    var d = new Date(user.birthday);
    var formatted = d.toLocaleDateString("ru-RU", {day:"numeric", month:"long", year:"numeric"});
    birthdayItem.style.display = "flex";
    birthdayValue.textContent = formatted;
    if(birthdayItemValue) birthdayItemValue.textContent = formatted;
  } else if(birthdayItem){
    birthdayItem.style.display = "none";
    if(birthdayItemValue) birthdayItemValue.textContent = "—";
  }
  if(user.channel && channelItem && channelValue){
    channelItem.style.display = "flex";
    channelItem.href = user.channel;
    channelValue.textContent = "@" + user.channel.replace(/^https?:\/\/(t\.me|telegram\.me)\//i,"").replace(/\/$/,"");
    if(channelItemValue) channelItemValue.textContent = channelValue.textContent;
  } else if(channelItem){
    channelItem.style.display = "none";
    if(channelItemValue) channelItemValue.textContent = "—";
  }
  updateStarsUI();
  updateMyStoryAvatar();
}

function updateStarsUI(){
  var val = String(starsAmount);
  if(starsBalanceEl) starsBalanceEl.textContent = val;
  if(giftBalanceEl) giftBalanceEl.textContent = val;
  if(settingsStarsValue) settingsStarsValue.textContent = val + " ⭐";
}

function renderStories(){
  if(!storiesBar) return;
  var items = storiesBar.querySelectorAll(".story-item:not(.mine)");
  for(var i = 0; i < items.length; i++) items[i].remove();

  stories.forEach(function(story, idx){
    var item = document.createElement("div");
    item.className = "story-item" + (story.seen ? " seen" : "");
    var wrap = document.createElement("div");
    wrap.className = "story-avatar-wrap";
    var av = document.createElement("div");
    av.className = "story-avatar";
    av.style.background = "url('" + story.image + "') center/cover";
    wrap.appendChild(av);
    var name = document.createElement("div");
    name.className = "story-name";
    name.textContent = story.author || "You";
    item.appendChild(wrap);
    item.appendChild(name);

    item.addEventListener("click", function(e){
      if(e.target.closest(".my-plus-badge")) return;
      openStoryViewer(idx);
    });

    item.addEventListener("touchstart", function(){
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(function(){
        openStoryContextMenu(idx, item);
        if(navigator.vibrate) navigator.vibrate(15);
      }, 500);
    }, {passive:true});
    item.addEventListener("touchend", function(){ clearTimeout(longPressTimer); });
    item.addEventListener("touchmove", function(){ clearTimeout(longPressTimer); });

    storiesBar.appendChild(item);
  });
}

function openStoryContextMenu(idx, anchorEl){
  contextStoryIndex = idx;
  var rect = anchorEl.getBoundingClientRect();
  var mw = 200, mh = 160;
  var left = rect.left + rect.width/2 - mw/2;
  if(left < 10) left = 10;
  if(left + mw > window.innerWidth - 10) left = window.innerWidth - mw - 10;
  var top = rect.bottom + 8;
  if(top + mh > window.innerHeight) top = rect.top - mh - 8;
  storyContextMenu.style.left = left + "px";
  storyContextMenu.style.top = top + "px";
  storyContextMenu.classList.add("show");
}
function hideStoryContextMenu(){
  storyContextMenu.classList.remove("show");
  contextStoryIndex = -1;
}

on(ctxReply, "click", function(){
  if(contextStoryIndex < 0) return;
  hideStoryContextMenu();
  openStoryViewer(contextStoryIndex);
  setTimeout(function(){ if(storyReplyInput) storyReplyInput.focus(); }, 350);
});
on(ctxReact, "click", function(){
  if(contextStoryIndex < 0) return;
  hideStoryContextMenu();
  openStoryViewer(contextStoryIndex);
});
on(ctxDelete, "click", function(){
  if(contextStoryIndex < 0) return;
  if(!confirm("Удалить историю?")){ hideStoryContextMenu(); return; }
  stories.splice(contextStoryIndex, 1);
  saveStories();
  renderStories();
  hideStoryContextMenu();
  showToast("История удалена", "success");
});

on(myStoryItem, "click", function(e){
  if(e.target.closest(".my-plus-badge") || e.target.closest(".story-avatar-wrap")){
    if(storyCaptionInput) storyCaptionInput.value = "";
    createStoryModal.classList.add("show");
    setTimeout(function(){ if(storyCaptionInput) storyCaptionInput.focus(); }, 100);
  }
});
on(createStoryCancel, "click", function(){ createStoryModal.classList.remove("show"); });
on(createStorySelectPhoto, "click", function(){ if(storyPhotoInput) storyPhotoInput.click(); });
on(storyPhotoInput, "change", function(e){
  var file = e.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    stories.unshift({
      image:ev.target.result,
      caption: storyCaptionInput ? storyCaptionInput.value.trim() : "",
      author: user ? user.name.split(" ")[0] : "Я",
      time: Date.now(), seen:false, mine:true
    });
    saveStories();
    renderStories();
    createStoryModal.classList.remove("show");
    showToast("История добавлена", "success");
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});

function openStoryViewer(startIdx){
  currentStoryList = stories;
  currentStoryIndex = startIdx;
  storyViewer.classList.add("show");
  showStory(startIdx);
}
function showStory(idx){
  if(idx < 0 || idx >= currentStoryList.length){ closeStoryViewer(); return; }
  var story = currentStoryList[idx];
  story.seen = true;
  saveStories();
  renderStories();

  storyViewerImage.style.backgroundImage = "url('" + story.image + "')";
  if(user && user.avatar){
    if(user.avatar.type === "image"){
      storyViewerAvatar.style.background = "url('" + user.avatar.value + "') center/cover";
      storyViewerAvatar.textContent = "";
    } else {
      storyViewerAvatar.style.background = user.avatar.value;
      storyViewerAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
  }
  storyViewerName.textContent = story.author;
  storyViewerTime.textContent = formatStoryTime(story.time);
  storyDeleteBtn.style.display = story.mine ? "flex" : "none";

  if(story.caption){
    storyCaption.style.display = "block";
    storyCaption.textContent = story.caption;
  } else {
    storyCaption.style.display = "none";
  }

  currentStoryReactions = story.reactions || {};
  if(storyReactionsRow){
    var btns = storyReactionsRow.querySelectorAll(".story-reaction-btn");
    for(var b = 0; b < btns.length; b++){
      btns[b].classList.toggle("selected", !!currentStoryReactions[btns[b].getAttribute("data-emoji")]);
    }
  }

  storyProgressBar.innerHTML = "";
  for(var i = 0; i < currentStoryList.length; i++){
    var seg = document.createElement("div");
    seg.className = "story-progress-segment";
    var fill = document.createElement("div");
    fill.className = "story-progress-fill";
    if(i < idx) fill.classList.add("done");
    if(i === idx) fill.classList.add("active");
    seg.appendChild(fill);
    storyProgressBar.appendChild(seg);
  }

  if(storyTimer) clearTimeout(storyTimer);
  storyTimer = setTimeout(function(){ nextStory(); }, 5000);
}
function nextStory(){
  currentStoryIndex++;
  if(currentStoryIndex >= currentStoryList.length){ closeStoryViewer(); return; }
  showStory(currentStoryIndex);
}
function prevStory(){
  currentStoryIndex--;
  if(currentStoryIndex < 0) currentStoryIndex = 0;
  showStory(currentStoryIndex);
}
function closeStoryViewer(){
  storyViewer.classList.remove("show");
  if(storyTimer) clearTimeout(storyTimer);
  currentStoryIndex = 0;
}
function formatStoryTime(ts){
  var diff = Math.floor((Date.now() - ts) / 1000);
  if(diff < 60) return "только что";
  if(diff < 3600) return Math.floor(diff / 60) + " мин назад";
  if(diff < 86400) return Math.floor(diff / 3600) + " ч назад";
  return Math.floor(diff / 86400) + " д назад";
}

on(storyCloseBtn, "click", closeStoryViewer);
on(storyTapLeft, "click", prevStory);
on(storyTapRight, "click", nextStory);

on(storyDeleteBtn, "click", function(){
  if(currentStoryIndex < 0 || currentStoryIndex >= currentStoryList.length) return;
  var story = currentStoryList[currentStoryIndex];
  if(!story.mine) return;
  if(!confirm("Удалить историю?")) return;
  stories.splice(currentStoryIndex, 1);
  saveStories();
  renderStories();
  closeStoryViewer();
  showToast("История удалена", "success");
});

if(storyReactionsRow){
  var srbtns = storyReactionsRow.querySelectorAll(".story-reaction-btn");
  for(var srb = 0; srb < srbtns.length; srb++){
    (function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var emoji = btn.getAttribute("data-emoji");
        if(!currentStoryReactions) currentStoryReactions = {};
        if(currentStoryReactions[emoji]) delete currentStoryReactions[emoji];
        else currentStoryReactions[emoji] = true;
        if(currentStoryList[currentStoryIndex]){
          currentStoryList[currentStoryIndex].reactions = currentStoryReactions;
          var origIdx = stories.indexOf(currentStoryList[currentStoryIndex]);
          if(origIdx >= 0) stories[origIdx].reactions = currentStoryReactions;
          saveStories();
        }
        var allBtns = storyReactionsRow.querySelectorAll(".story-reaction-btn");
        for(var a = 0; a < allBtns.length; a++){
          allBtns[a].classList.toggle("selected", !!currentStoryReactions[allBtns[a].getAttribute("data-emoji")]);
        }
        if(user){
          chats.favorites.messages.push({
            type:"outgoing",
            text:"🔔 Реакция: " + emoji,
            time: nowTime()
          });
          if(currentChatId === "favorites") renderMessages();
        }
      });
    })(srbtns[srb]);
  }
}

on(storyReplyInput, "keydown", function(e){
  if(e.key === "Enter"){ e.preventDefault(); sendStoryReply(); }
});
on(storySendBtn, "click", sendStoryReply);
function sendStoryReply(){
  var text = storyReplyInput.value.trim();
  if(!text) return;
  if(user){
    var storyAuthor = currentStoryList[currentStoryIndex] ? (currentStoryList[currentStoryIndex].author || "—") : "—";
    chats.favorites.messages.push({
      type:"outgoing",
      text:"↩️ Ответ на историю (" + storyAuthor + "): " + text,
      time: nowTime()
    });
    if(currentChatId === "favorites") renderMessages();
  }
  storyReplyInput.value = "";
  showToast("Отправлено", "success");
}

/* ===== ГОЛОСОВЫЕ ===== */
function startRecording(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    showToast("Запись не поддерживается", "info");
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
    audioStream = stream;
    audioChunks = [];
    recordingSeconds = 0;

    try {
      var options = { mimeType: 'audio/webm' };
      if(!MediaRecorder.isTypeSupported(options.mimeType)) options = {};
      mediaRecorder = new MediaRecorder(stream, options);
    } catch(e){
      try { mediaRecorder = new MediaRecorder(stream); }
      catch(e2){ showToast("Запись не поддерживается", "info"); stopAudioStream(); return; }
    }

    mediaRecorder.ondataavailable = function(e){
      if(e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.start();
    if(micBtn) micBtn.classList.add("recording");
    if(recordingBar) recordingBar.classList.add("show");
    if(recordingTime) recordingTime.textContent = "0:00";

    if(recordingWave){
      recordingWave.innerHTML = "";
      for(var i = 0; i < 30; i++){
        var bar = document.createElement("span");
        bar.style.height = (4 + Math.random() * 14) + "px";
        recordingWave.appendChild(bar);
      }
    }

    recordingTimer = setInterval(function(){
      recordingSeconds++;
      var mins = Math.floor(recordingSeconds / 60);
      var secs = recordingSeconds % 60;
      if(recordingTime) recordingTime.textContent = mins + ":" + ("0"+secs).slice(-2);
      if(recordingWave){
        var bars = recordingWave.querySelectorAll("span");
        for(var b = 0; b < bars.length; b++){
          bars[b].style.height = (4 + Math.random() * 14) + "px";
        }
      }
      if(recordingSeconds >= 300){ stopAndSendRecording(); }
    }, 1000);

    if(navigator.vibrate) navigator.vibrate(30);
  }).catch(function(){ showToast("Нет доступа к микрофону", "info"); });
}

function stopAudioStream(){
  if(audioStream){ audioStream.getTracks().forEach(function(t){ t.stop(); }); audioStream = null; }
  if(recordingTimer){ clearInterval(recordingTimer); recordingTimer = null; }
  if(micBtn) micBtn.classList.remove("recording");
  if(recordingBar) recordingBar.classList.remove("show");
}

function cancelRecording(){
  if(mediaRecorder && mediaRecorder.state !== "inactive"){
    mediaRecorder.onstop = null;
    try { mediaRecorder.stop(); } catch(e){}
  }
  audioChunks = [];
  stopAudioStream();
}

function stopAndSendRecording(){
  if(!mediaRecorder) return;
  var dur = recordingSeconds;
  mediaRecorder.onstop = function(){
    var blob = new Blob(audioChunks, { type: 'audio/webm' });
    var reader = new FileReader();
    reader.onload = function(ev){
      var chat = getCurrentChat();
      if(chat && chat.messages){
        var msg = {
          type:"outgoing", time:nowTime(),
          voice:{ src: ev.target.result, duration: dur }
        };
        if(replyToIndex >= 0) msg.replyTo = replyToIndex;
        chat.messages.push(msg);
        clearReply();
        renderMessages();
        showToast("Голосовое отправлено", "success");
      }
      stopAudioStream();
    };
    reader.readAsDataURL(blob);
  };
  try { mediaRecorder.stop(); } catch(e){ stopAudioStream(); }
}

on(micBtn, "click", function(e){
  e.stopPropagation();
  if(messageInput && messageInput.value.trim()){ sendMessage(); return; }
  startRecording();
});
on(recordingCancel, "click", function(){ cancelRecording(); });
on(recordingSend, "click", function(){ stopAndSendRecording(); });

function renderChatList(){
  if(!chatList) return;
  var items = chatList.querySelectorAll(".chat-item");
  for(var i = 0; i < items.length; i++){
    var id = items[i].getAttribute("data-chat");
    if(id !== "favorites") items[i].remove();
  }
  var addWrap = chatList.querySelector(".add-btn-wrap");
  for(var cid in customChats){
    if(!customChats.hasOwnProperty(cid)) continue;
    (function(cid){
      var chat = customChats[cid];
      var el = document.createElement("div");
      el.className = "chat-item";
      el.setAttribute("data-chat", cid);
      var av = document.createElement("div");
      av.className = "avatar " + (chat.type === "channel" ? "avatar-channel" : "avatar-group");
      if(chat.avatar){
        if(chat.avatar.type === "image"){
          av.style.background = "url('" + chat.avatar.value + "') center/cover";
        } else {
          av.style.background = chat.avatar.value;
          av.innerHTML = chat.type === "channel" ? '<i class="fas fa-bullhorn"></i>' : '<i class="fas fa-users"></i>';
        }
      } else {
        av.innerHTML = chat.type === "channel" ? '<i class="fas fa-bullhorn"></i>' : '<i class="fas fa-users"></i>';
      }
      el.appendChild(av);
      el.addEventListener("click", function(){ switchChat(cid); });
      chatList.insertBefore(el, addWrap);
    })(cid);
  }
}

var favChatItem = chatList ? chatList.querySelector('.chat-item[data-chat="favorites"]') : null;
on(favChatItem, "click", function(){ switchChat("favorites"); });

function switchChat(chatId){
  currentChatId = chatId;
  clearReply();
  var isFav = chatId === "favorites";
  if(isFav){
    if(headerName) headerName.textContent = "Избранное" + (user ? " · " + user.name : "");
    if(headerAvatar){
      headerAvatar.className = "chat-header-avatar avatar-star";
      headerAvatar.style.background = "";
      headerAvatar.innerHTML = '<i class="fas fa-star"></i>';
    }
    if(messageInput) messageInput.placeholder = "Заметка...";
    if(giftBtn) giftBtn.classList.remove("hidden");
  } else {
    var chat = customChats[chatId];
    if(!chat) return;
    if(headerName) headerName.textContent = chat.name;
    if(headerAvatar){
      headerAvatar.className = "chat-header-avatar " + (chat.type === "channel" ? "avatar-channel" : "avatar-group");
      headerAvatar.style.background = "";
      headerAvatar.innerHTML = chat.type === "channel" ? '<i class="fas fa-bullhorn"></i>' : '<i class="fas fa-users"></i>';
      if(chat.avatar){
        if(chat.avatar.type === "image"){
          headerAvatar.style.background = "url('" + chat.avatar.value + "') center/cover";
          headerAvatar.innerHTML = "";
        } else {
          headerAvatar.style.background = chat.avatar.value;
          headerAvatar.innerHTML = "";
        }
      }
    }
    if(messageInput) messageInput.placeholder = "Сообщение...";
    if(giftBtn) giftBtn.classList.add("hidden");
  }
  if(chatList){
    var items = chatList.querySelectorAll(".chat-item");
    for(var i = 0; i < items.length; i++){
      items[i].classList.toggle("active", items[i].getAttribute("data-chat") === chatId);
    }
  }
  updateHeaderInfo();
  renderMessages();
}

function updateHeaderInfo(){
  var chat = getCurrentChat();
  if(!chat || !favCount) return;
  if(currentChatId === "favorites"){
    var n = chat.messages.length;
    favCount.textContent = n + " " + (n === 1 ? "заметка" : "заметок");
  } else {
    favCount.textContent = chat.messages.length + " сообщений";
  }
}
function getCurrentChat(){
  if(currentChatId === "favorites") return chats.favorites;
  return customChats[currentChatId] || null;
}
function scrollToBottom(){
  setTimeout(function(){
    if(messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 30);
}

function renderEmptyState(){
  if(!messagesContainer) return;
  var chat = getCurrentChat();
  var isFav = currentChatId === "favorites";
  var icon = '<i class="fas fa-star"></i>';
  var title = "", desc = "";
  if(isFav){
    title = "Добро пожаловать" + (user ? ", " + user.name.split(" ")[0] : "") + "!";
    desc = "Сохраняйте здесь свои заметки, ссылки, фото и файлы.";
  } else if(chat && chat.type === "channel"){
    icon = '<i class="fas fa-bullhorn"></i>';
    title = "Это ваш канал"; desc = "Публикуйте здесь новости, статьи, ссылки.";
  } else {
    icon = '<i class="fas fa-users"></i>';
    title = "Это ваша группа"; desc = "Общайтесь с участниками.";
  }
  messagesContainer.innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-icon">' + icon + '</div>' +
      '<h3>' + title + '</h3><p>' + desc + '</p>' +
    '</div>';
  updateHeaderInfo();
} 


/* ===== РЕНДЕР СООБЩЕНИЙ С ИСПРАВЛЕННЫМИ ПОДАРКАМИ ===== */
function renderMessages(){
  if(!messagesContainer) return;
  var chat = getCurrentChat();
  if(!chat || chat.messages.length === 0){ renderEmptyState(); return; }
  messagesContainer.innerHTML = "";

  chat.messages.forEach(function(msg, index){
    var messageEl = document.createElement("div");
    messageEl.className = "message " + (msg.type || "outgoing");
    messageEl.setAttribute("data-index", index);

    /* ===== ПОДАРОК — ОТДЕЛЬНАЯ ЧИСТАЯ СТРУКТУРА ===== */
    if(msg.gift){
      var giftWrap = document.createElement("div");
      giftWrap.className = "message-gift-wrap";
      var giftInnerHTML = '';
      giftInnerHTML += '<div class="message-gift">';
      giftInnerHTML += '<div class="gift-emoji">' + msg.gift.emoji + '</div>';
      giftInnerHTML += '<div class="gift-name">' + escapeHtml(msg.gift.name) + '</div>';
      if(msg.gift.text) giftInnerHTML += '<div class="gift-text">«' + escapeHtml(msg.gift.text) + '»</div>';
      giftInnerHTML += '<div class="gift-stars"><i class="fas fa-star"></i>' + msg.gift.price + '</div>';
      giftInnerHTML += '<span class="message-meta">';
      giftInnerHTML += '<span class="message-time">' + msg.time + '</span>';
      if(msg.type === "outgoing" || !msg.type){
        giftInnerHTML += '<span class="message-check"><i class="fas fa-check"></i><i class="fas fa-check"></i></span>';
      }
      giftInnerHTML += '</span></div>';
      giftWrap.innerHTML = giftInnerHTML;
      messageEl.appendChild(giftWrap);

      var pressTimerG = null;
      giftWrap.addEventListener("touchstart", function(){
        pressTimerG = setTimeout(function(){
          showMessageMenu(index, messageEl);
          if(navigator.vibrate) navigator.vibrate(15);
        }, 450);
      }, {passive:true});
      giftWrap.addEventListener("touchend", function(){ if(pressTimerG) clearTimeout(pressTimerG); });
      giftWrap.addEventListener("touchmove", function(){ if(pressTimerG) clearTimeout(pressTimerG); });
      giftWrap.addEventListener("dblclick", function(e){ e.preventDefault(); toggleReaction(index, "❤️"); });

      if(msg.reactions && Object.keys(msg.reactions).length > 0){
        var rrow = document.createElement("div");
        rrow.className = "reactions-row";
        Object.keys(msg.reactions).forEach(function(emoji){
          var chip = document.createElement("div");
          chip.className = "reaction-chip" + (msg.reactions[emoji].mine ? " mine" : "");
          chip.innerHTML = emoji + ' <span class="count">' + msg.reactions[emoji].count + '</span>';
          chip.addEventListener("click", function(e){ e.stopPropagation(); toggleReaction(index, emoji); });
          rrow.appendChild(chip);
        });
        messageEl.appendChild(rrow);
      }
      messagesContainer.appendChild(messageEl);
      return;
    }

    /* ===== ГОЛОСОВОЕ ===== */
    if(msg.voice){
      var bubbleV = document.createElement("div");
      bubbleV.className = "message-bubble";
      var voiceEl = document.createElement("div");
      voiceEl.className = "voice-message";
      var dur = msg.voice.duration || 0;
      var durStr = Math.floor(dur/60) + ":" + ("0"+(dur%60)).slice(-2);
      var waveHTML = "";
      for(var w = 0; w < 30; w++) waveHTML += '<span style="height:' + (4 + Math.random() * 16) + 'px"></span>';
      voiceEl.innerHTML =
        '<div class="voice-play"><i class="fas fa-play"></i></div>' +
        '<div class="voice-info">' +
          '<div class="voice-wave">' + waveHTML + '</div>' +
          '<div class="voice-duration">' + durStr + '</div>' +
        '</div>';
      var audio = document.createElement("audio");
      audio.src = msg.voice.src;
      audio.preload = "metadata";
      var playBtn = voiceEl.querySelector(".voice-play");
      var waveEls = voiceEl.querySelectorAll(".voice-wave span");
      playBtn.addEventListener("click", function(ev){
        ev.stopPropagation();
        var all = document.querySelectorAll("audio");
        for(var a = 0; a < all.length; a++){ if(all[a] !== audio) all[a].pause(); }
        if(audio.paused) audio.play(); else audio.pause();
      });
      audio.addEventListener("play", function(){ playBtn.classList.add("playing"); playBtn.querySelector("i").className = "fas fa-pause"; });
      audio.addEventListener("pause", function(){ playBtn.classList.remove("playing"); playBtn.querySelector("i").className = "fas fa-play"; });
      audio.addEventListener("timeupdate", function(){
        if(!audio.duration) return;
        var pct = audio.currentTime / audio.duration;
        var played = Math.floor(pct * waveEls.length);
        for(var we = 0; we < waveEls.length; we++) waveEls[we].classList.toggle("played", we < played);
      });
      audio.addEventListener("ended", function(){
        playBtn.classList.remove("playing");
        playBtn.querySelector("i").className = "fas fa-play";
        for(var we2 = 0; we2 < waveEls.length; we2++) waveEls[we2].classList.remove("played");
      });
      bubbleV.appendChild(voiceEl);
      bubbleV.appendChild(audio);
      var metaV = document.createElement("span");
      metaV.className = "message-meta";
      var timeV = document.createElement("span");
      timeV.className = "message-time";
      timeV.textContent = msg.time;
      metaV.appendChild(timeV);
      if(msg.type === "outgoing" || !msg.type){
        var checkV = document.createElement("span");
        checkV.className = "message-check";
        checkV.innerHTML = '<i class="fas fa-check"></i><i class="fas fa-check"></i>';
        metaV.appendChild(checkV);
      }
      bubbleV.appendChild(metaV);
      messageEl.appendChild(bubbleV);

      var pressV = null;
      bubbleV.addEventListener("touchstart", function(){
        pressV = setTimeout(function(){ showMessageMenu(index, messageEl); if(navigator.vibrate) navigator.vibrate(15); }, 450);
      }, {passive:true});
      bubbleV.addEventListener("touchend", function(){ if(pressV) clearTimeout(pressV); });
      bubbleV.addEventListener("touchmove", function(){ if(pressV) clearTimeout(pressV); });

      messagesContainer.appendChild(messageEl);
      return;
    }

    /* ===== ОБЫЧНОЕ ===== */
    var bubbleEl = document.createElement("div");
    bubbleEl.className = "message-bubble";

    if(msg.replyTo !== undefined && chat.messages[msg.replyTo]){
      var rmsg = chat.messages[msg.replyTo];
      var replyEl = document.createElement("div");
      replyEl.className = "message-reply";
      replyEl.innerHTML =
        '<div class="message-reply-author">' + (rmsg.type === "outgoing" ? (user ? user.name : "Я") : "Ответ") + '</div>' +
        '<div class="message-reply-text">' + (rmsg.text ? escapeHtml(rmsg.text.substring(0,60)) : "📎 медиа") + '</div>';
      replyEl.addEventListener("click", function(){
        var target = messagesContainer.querySelector('[data-index="' + msg.replyTo + '"]');
        if(target){
          target.scrollIntoView({behavior:"smooth", block:"center"});
          target.style.transition = "background .5s";
          target.style.background = "rgba(138,180,216,.15)";
          setTimeout(function(){ target.style.background = ""; }, 1200);
        }
      });
      bubbleEl.appendChild(replyEl);
    }

    if(msg.media){
      if(msg.media.kind === "image"){
        var d1 = document.createElement("div"); d1.className = "message-media";
        var img = document.createElement("img"); img.src = msg.media.src; img.alt = ""; img.loading = "lazy";
        d1.appendChild(img); bubbleEl.appendChild(d1);
      } else if(msg.media.kind === "video"){
        var d2 = document.createElement("div"); d2.className = "message-media";
        var v = document.createElement("video"); v.src = msg.media.src; v.controls = true;
        d2.appendChild(v); bubbleEl.appendChild(d2);
      } else if(msg.media.kind === "file"){
        var d3 = document.createElement("div"); d3.className = "message-file";
        d3.innerHTML = '<i class="fas fa-file-alt"></i><div class="message-file-info"><div class="message-file-name">' + escapeHtml(msg.media.name) + '</div><div class="message-file-size">' + msg.media.size + '</div></div>';
        bubbleEl.appendChild(d3);
      }
    }

    if(msg.poll){
      var pollEl = document.createElement("div");
      pollEl.className = "poll-block";
      var totalVotes = msg.poll.options.reduce(function(sum, opt){ return sum + (opt.votes || 0); }, 0);
      var pollHTML = '<div class="poll-question">' + escapeHtml(msg.poll.question) + '</div><div class="poll-options">';
      msg.poll.options.forEach(function(opt, oi){
        var pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
        var voted = msg.poll.myVote === oi;
        pollHTML +=
          '<div class="poll-option" data-poll-opt="' + oi + '">' +
            '<div class="poll-option-fill" style="width:' + pct + '%"></div>' +
            '<div class="poll-option-content">' +
              '<span>' + escapeHtml(opt.text) + (voted ? ' ✓' : '') + '</span>' +
              '<span class="poll-pct">' + pct + '%</span>' +
            '</div>' +
          '</div>';
      });
      pollHTML += '</div><div class="poll-total">' + totalVotes + ' голосов</div>';
      pollEl.innerHTML = pollHTML;
      pollEl.querySelectorAll(".poll-option").forEach(function(optEl){
        optEl.addEventListener("click", function(e){
          e.stopPropagation();
          var oi = parseInt(optEl.getAttribute("data-poll-opt"), 10);
          votePoll(index, oi);
        });
      });
      bubbleEl.appendChild(pollEl);
    }

    if(msg.text && !msg.poll){
      var textEl = document.createElement("div");
      textEl.style.whiteSpace = "pre-wrap";
      textEl.style.wordBreak = "break-word";
      textEl.textContent = msg.text;
      bubbleEl.appendChild(textEl);
    }

    var metaEl = document.createElement("span");
    metaEl.className = "message-meta";
    if(msg.edited){
      var editEl = document.createElement("span");
      editEl.style.fontSize = "10px";
      editEl.style.marginRight = "3px";
      editEl.style.opacity = ".7";
      editEl.textContent = "изменено";
      metaEl.appendChild(editEl);
    }
    var timeEl = document.createElement("span");
    timeEl.className = "message-time";
    timeEl.textContent = msg.time;
    metaEl.appendChild(timeEl);

    if(msg.type === "outgoing" || !msg.type){
      var checkEl = document.createElement("span");
      checkEl.className = "message-check";
      checkEl.innerHTML = '<i class="fas fa-check"></i><i class="fas fa-check"></i>';
      metaEl.appendChild(checkEl);
    }
    bubbleEl.appendChild(metaEl);
    messageEl.appendChild(bubbleEl);

    if(msg.reactions && Object.keys(msg.reactions).length > 0){
      var reactionsRow = document.createElement("div");
      reactionsRow.className = "reactions-row";
      Object.keys(msg.reactions).forEach(function(emoji){
        var chip = document.createElement("div");
        chip.className = "reaction-chip" + (msg.reactions[emoji].mine ? " mine" : "");
        chip.innerHTML = emoji + ' <span class="count">' + msg.reactions[emoji].count + '</span>';
        chip.addEventListener("click", function(e){ e.stopPropagation(); toggleReaction(index, emoji); });
        reactionsRow.appendChild(chip);
      });
      messageEl.appendChild(reactionsRow);
    }

    var pressTimer = null;
    bubbleEl.addEventListener("touchstart", function(){
      pressTimer = setTimeout(function(){ showMessageMenu(index, messageEl); if(navigator.vibrate) navigator.vibrate(15); }, 450);
    }, {passive:true});
    bubbleEl.addEventListener("touchend", function(){ if(pressTimer) clearTimeout(pressTimer); });
    bubbleEl.addEventListener("touchmove", function(){ if(pressTimer) clearTimeout(pressTimer); });
    bubbleEl.addEventListener("mousedown", function(){ pressTimer = setTimeout(function(){ showMessageMenu(index, messageEl); }, 450); });
    bubbleEl.addEventListener("mouseup", function(){ if(pressTimer) clearTimeout(pressTimer); });
    bubbleEl.addEventListener("mouseleave", function(){ if(pressTimer) clearTimeout(pressTimer); });
    bubbleEl.addEventListener("dblclick", function(e){ e.preventDefault(); toggleReaction(index, "❤️"); });

    messagesContainer.appendChild(messageEl);
  });
  scrollToBottom();
  updateHeaderInfo();
}

function showMessageMenu(index, messageEl){
  contextMessageIndex = index;
  var chat = getCurrentChat();
  var msg = chat.messages[index];
  if(!msg) return;

  var isMine = msg.type === "outgoing" || !msg.type;
  if(isMine && msg.text && !msg.gift && !msg.poll && !msg.media && !msg.voice){
    mmEdit.style.display = "flex";
  } else {
    mmEdit.style.display = "none";
  }
  if(msg.text){ mmCopy.style.display = "flex"; } else { mmCopy.style.display = "none"; }

  var rect = messageEl.getBoundingClientRect();
  var mw = 200, mh = 200;
  var left = rect.right - mw;
  if(left < 10) left = 10;
  if(left + mw > window.innerWidth - 10) left = window.innerWidth - mw - 10;
  var top = rect.top - mh - 8;
  if(top < 10) top = rect.bottom + 8;
  if(top + mh > window.innerHeight) top = window.innerHeight - mh - 10;

  messageMenu.style.left = left + "px";
  messageMenu.style.top = top + "px";
  messageMenu.classList.add("show");
}
function hideMessageMenu(){ messageMenu.classList.remove("show"); contextMessageIndex = -1; }

on(mmReply, "click", function(){
  if(contextMessageIndex < 0) return;
  replyToIndex = contextMessageIndex;
  var chat = getCurrentChat();
  var msg = chat.messages[replyToIndex];
  replyAuthor.textContent = msg.type === "outgoing" ? (user ? user.name : "Я") : "Ответ";
  replyText.textContent = msg.text ? msg.text.substring(0,80) : "📎 медиа";
  replyPreview.classList.add("show");
  hideMessageMenu();
  if(messageInput) messageInput.focus();
});
on(mmCopy, "click", function(){
  if(contextMessageIndex < 0) return;
  var chat = getCurrentChat();
  var msg = chat.messages[contextMessageIndex];
  if(msg.text && navigator.clipboard){
    navigator.clipboard.writeText(msg.text).then(function(){ showToast("Сообщение скопировано", "success"); }).catch(function(){});
  }
  hideMessageMenu();
});
on(mmEdit, "click", function(){
  if(contextMessageIndex < 0) return;
  editingMessageIndex = contextMessageIndex;
  var chat = getCurrentChat();
  var msg = chat.messages[editingMessageIndex];
  messageInput.value = msg.text || "";
  messageInput.focus();
  if(sendBtn && sendBtn.querySelector("i")) sendBtn.querySelector("i").className = "fas fa-check";
  showToast("Редактирование", "info");
  hideMessageMenu();
});
on(mmDelete, "click", function(){
  if(contextMessageIndex < 0) return;
  if(!confirm("Удалить сообщение?")){ hideMessageMenu(); return; }
  var chat = getCurrentChat();
  chat.messages.splice(contextMessageIndex, 1);
  hideMessageMenu();
  renderMessages();
  showToast("Сообщение удалено", "success");
});

document.addEventListener("click", function(e){
  if(messageMenu && !messageMenu.contains(e.target)) hideMessageMenu();
  if(storyContextMenu && !storyContextMenu.contains(e.target) && !e.target.closest(".story-item")) hideStoryContextMenu();
});

function clearReply(){ replyToIndex = -1; if(replyPreview) replyPreview.classList.remove("show"); }
on(replyCloseBtn, "click", clearReply);

on(reactionPicker, "click", function(e){
  if(e.target.tagName !== "SPAN") return;
  e.stopPropagation();
  if(activeMessageIndex < 0) return;
  toggleReaction(activeMessageIndex, e.target.getAttribute("data-emoji"));
  hideReactionPicker();
});
function hideReactionPicker(){ if(reactionPicker) reactionPicker.classList.remove("show"); activeMessageIndex = -1; }
function toggleReaction(index, emoji){
  var chat = getCurrentChat();
  if(!chat || !chat.messages) return;
  var msg = chat.messages[index];
  if(!msg) return;
  if(!msg.reactions) msg.reactions = {};
  if(!msg.reactions[emoji]){ msg.reactions[emoji] = { count:1, mine:true }; }
  else if(msg.reactions[emoji].mine){
    msg.reactions[emoji].count--;
    msg.reactions[emoji].mine = false;
    if(msg.reactions[emoji].count <= 0) delete msg.reactions[emoji];
  } else {
    msg.reactions[emoji].count++;
    msg.reactions[emoji].mine = true;
  }
  renderMessages();
}
document.addEventListener("click", function(e){
  if(reactionPicker && !reactionPicker.contains(e.target)) hideReactionPicker();
  if(attachMenu && !attachMenu.contains(e.target) && e.target !== attachBtn) attachMenu.classList.remove("show");
  if(emojiPanel && !emojiPanel.contains(e.target) && e.target !== emojiBtn) emojiPanel.classList.remove("show");
});

function sendMessage(){
  var text = messageInput.value.trim();
  if(!text) return;
  var chat = getCurrentChat();
  if(!chat || !chat.messages) return;

  if(editingMessageIndex >= 0){
    chat.messages[editingMessageIndex].text = text;
    chat.messages[editingMessageIndex].edited = true;
    editingMessageIndex = -1;
    messageInput.value = "";
    if(sendBtn && sendBtn.querySelector("i")) sendBtn.querySelector("i").className = "fas fa-paper-plane";
    renderMessages();
    return;
  }

  var msg = { type:"outgoing", text:text, time:nowTime() };
  if(replyToIndex >= 0) msg.replyTo = replyToIndex;
  chat.messages.push(msg);
  messageInput.value = "";
  clearReply();
  renderMessages();
  setTimeout(function(){ messageInput.focus(); }, 50);
}
on(sendBtn, "click", function(e){ e.preventDefault(); sendMessage(); });
on(messageInput, "keydown", function(e){
  if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); }
});

function sendMedia(kind, file){
  var chat = getCurrentChat();
  if(!chat || !chat.messages) return;
  var time = nowTime();
  if(kind === "photo"){
    var r1 = new FileReader();
    r1.onload = function(e){
      var msg = {type:"outgoing", time:time, media:{kind:"image", src:e.target.result}};
      if(replyToIndex >= 0) msg.replyTo = replyToIndex;
      chat.messages.push(msg); clearReply(); renderMessages();
    };
    r1.readAsDataURL(file);
  } else if(kind === "video"){
    var r2 = new FileReader();
    r2.onload = function(e){
      var msg = {type:"outgoing", time:time, media:{kind:"video", src:e.target.result}};
      if(replyToIndex >= 0) msg.replyTo = replyToIndex;
      chat.messages.push(msg); clearReply(); renderMessages();
    };
    r2.readAsDataURL(file);
  } else if(kind === "file"){
    var msg2 = {type:"outgoing", time:time, media:{kind:"file", name:file.name, size:formatSize(file.size)}};
    if(replyToIndex >= 0) msg2.replyTo = replyToIndex;
    chat.messages.push(msg2); clearReply(); renderMessages();
  }
}

on(attachBtn, "click", function(e){
  e.stopPropagation();
  attachMenu.classList.toggle("show");
  emojiPanel.classList.remove("show");
});
if(attachMenu){
  attachMenu.querySelectorAll(".attach-menu-item").forEach(function(item){
    item.addEventListener("click", function(){
      var type = item.getAttribute("data-type");
      if(type === "photo") photoInput.click();
      if(type === "video") videoInput.click();
      if(type === "file") fileInput.click();
      if(type === "story"){ storyCaptionInput.value = ""; createStoryModal.classList.add("show"); }
      if(type === "poll"){ openPollModal(); }
      attachMenu.classList.remove("show");
    });
  });
}
on(photoInput, "change", function(e){ if(e.target.files[0]) sendMedia("photo", e.target.files[0]); e.target.value = ""; });
on(videoInput, "change", function(e){ if(e.target.files[0]) sendMedia("video", e.target.files[0]); e.target.value = ""; });
on(fileInput, "change", function(e){ if(e.target.files[0]) sendMedia("file", e.target.files[0]); e.target.value = ""; });
on(emojiBtn, "click", function(e){
  e.stopPropagation();
  emojiPanel.classList.toggle("show");
  attachMenu.classList.remove("show");
});
if(emojiPanel){
  emojiPanel.querySelectorAll("span").forEach(function(s){
    s.addEventListener("click", function(){
      messageInput.value += s.textContent;
      messageInput.focus();
    });
  });
}

function openPollModal(){
  pollQuestionInput.value = ""; pollOpt1.value = ""; pollOpt2.value = ""; pollOpt3.value = "";
  pollModal.classList.add("show");
  setTimeout(function(){ pollQuestionInput.focus(); }, 100);
}
on(pollCancel, "click", function(){ pollModal.classList.remove("show"); });
on(pollCreateBtn, "click", function(){
  var q = pollQuestionInput.value.trim();
  var o1 = pollOpt1.value.trim(); var o2 = pollOpt2.value.trim(); var o3 = pollOpt3.value.trim();
  if(!q || !o1 || !o2){ showToast("Заполните вопрос и 2 варианта", "info"); return; }
  var options = [{text:o1, votes:0}, {text:o2, votes:0}];
  if(o3) options.push({text:o3, votes:0});
  var chat = getCurrentChat();
  var msg = { type:"outgoing", time:nowTime(), poll:{ question:q, options:options, myVote:-1 } };
  if(replyToIndex >= 0) msg.replyTo = replyToIndex;
  chat.messages.push(msg); clearReply(); pollModal.classList.remove("show"); renderMessages();
});

function votePoll(msgIndex, optIndex){
  var chat = getCurrentChat();
  var msg = chat.messages[msgIndex];
  if(!msg || !msg.poll) return;
  if(msg.poll.myVote === optIndex){
    msg.poll.options[optIndex].votes--; msg.poll.myVote = -1;
  } else {
    if(msg.poll.myVote >= 0) msg.poll.options[msg.poll.myVote].votes--;
    msg.poll.options[optIndex].votes++; msg.poll.myVote = optIndex;
  }
  renderMessages();
}

on(searchBtn, "click", function(){
  searchScreen.classList.add("show");
  searchInput.value = "";
  searchResults.innerHTML = '<div class="search-empty">Введите запрос</div>';
  setTimeout(function(){ searchInput.focus(); }, 200);
});
on(searchCancel, "click", function(){ searchScreen.classList.remove("show"); });
on(searchInput, "input", function(){
  var q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";
  if(!q){ searchResults.innerHTML = '<div class="search-empty">Введите запрос</div>'; return; }
  var foundAny = false;
  var chatResults = [];
  if("избранное".indexOf(q) >= 0) chatResults.push({ id:"favorites", name:"Избранное", type:"favorites" });
  Object.keys(customChats).forEach(function(cid){
    var c = customChats[cid];
    if(c.name.toLowerCase().indexOf(q) >= 0) chatResults.push({ id:cid, name:c.name, type:c.type });
  });
  if(chatResults.length > 0){
    foundAny = true;
    var titleEl = document.createElement("div");
    titleEl.className = "search-section-title";
    titleEl.textContent = "Чаты";
    searchResults.appendChild(titleEl);
    chatResults.forEach(function(c){
      var el = document.createElement("div");
      el.className = "search-result";
      var icon = c.type === "favorites" ? "star" : (c.type === "channel" ? "bullhorn" : "users");
      el.innerHTML = '<div class="search-result-avatar"><i class="fas fa-' + icon + '"></i></div>' +
        '<div class="search-result-info"><div class="search-result-title">' + escapeHtml(c.name) + '</div></div>';
      el.addEventListener("click", function(){ switchChat(c.id); searchScreen.classList.remove("show"); });
      searchResults.appendChild(el);
    });
  }
  var chat = getCurrentChat();
  if(chat && chat.messages){
    var msgResults = [];
    chat.messages.forEach(function(msg, idx){
      if(msg.text && msg.text.toLowerCase().indexOf(q) >= 0) msgResults.push({ msg:msg, idx:idx });
    });
    if(msgResults.length > 0){
      foundAny = true;
      var t2 = document.createElement("div");
      t2.className = "search-section-title";
      t2.textContent = "Сообщения";
      searchResults.appendChild(t2);
      msgResults.slice(0, 30).forEach(function(r){
        var el = document.createElement("div");
        el.className = "search-result";
        var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
        var highlighted = escapeHtml(r.msg.text).replace(re, "<mark>$1</mark>");
        el.innerHTML = '<div class="search-result-avatar"><i class="fas fa-comment"></i></div>' +
          '<div class="search-result-info"><div class="search-result-title">' + r.msg.time + '</div>' +
          '<div class="search-result-text">' + highlighted + '</div></div>';
        el.addEventListener("click", function(){
          searchScreen.classList.remove("show");
          var target = messagesContainer.querySelector('[data-index="' + r.idx + '"]');
          if(target){
            target.scrollIntoView({behavior:"smooth", block:"center"});
            target.style.transition = "background .5s";
            target.style.background = "rgba(138,180,216,.2)";
            setTimeout(function(){ target.style.background = ""; }, 1500);
          }
        });
        searchResults.appendChild(el);
      });
    }
  }
  if(!foundAny) searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
});

on(starsBtn, "click", function(){ starsScreen.classList.add("show"); updateStarsUI(); });
on(starsClose, "click", function(){ starsScreen.classList.remove("show"); });
on(openStarsBtn, "click", function(){ starsScreen.classList.add("show"); updateStarsUI(); });
document.querySelectorAll(".stars-pack").forEach(function(pack){
  pack.addEventListener("click", function(){ alert("Покупка звёзд будет доступна в следующем обновлении!"); });
});

/* ===== ПОДАРКИ — БЕЗ НАЛОЖЕНИЯ ===== */
on(giftBtn, "click", function(){
  renderGifts();
  giftTextInput.value = "";
  giftModal.classList.add("show");
  updateStarsUI();
});
function renderGifts(){
  giftsGrid.innerHTML = "";
  selectedGift = null;
  GIFTS.forEach(function(gift){
    var card = document.createElement("div");
    card.className = "gift-card";
    card.innerHTML = '<span class="gift-emoji">' + gift.emoji + '</span>' +
      '<div class="gift-name">' + gift.name + '</div>' +
      '<div class="gift-price"><i class="fas fa-star"></i>' + gift.price + '</div>';
    card.addEventListener("click", function(){
      giftsGrid.querySelectorAll(".gift-card").forEach(function(c){ c.classList.remove("selected"); });
      card.classList.add("selected");
      selectedGift = gift;
    });
    giftsGrid.appendChild(card);
  });
}
on(giftCancel, "click", function(){ giftModal.classList.remove("show"); selectedGift = null; });
on(giftSendBtn, "click", function(){
  if(!selectedGift){ showToast("Выберите подарок", "info"); return; }
  if(starsAmount < selectedGift.price){ showToast("Недостаточно звёзд!", "info"); return; }
  var giftText = giftTextInput.value.trim();
  starsAmount -= selectedGift.price;
  var chat = getCurrentChat();
  if(chat && chat.messages){
    var msg = { type:"outgoing", time:nowTime(),
      gift:{ emoji:selectedGift.emoji, name:selectedGift.name, price:selectedGift.price, text:giftText || "" } };
    if(replyToIndex >= 0) msg.replyTo = replyToIndex;
    chat.messages.push(msg); clearReply();
  }
  saveUser(); updateStarsUI();
  var snap = { emoji:selectedGift.emoji, name:selectedGift.name, price:selectedGift.price, text:giftText };
  giftModal.classList.remove("show");
  selectedGift = null;

  /* Запускаем анимацию */
  playGiftAnimation(snap);

  /* Через 2.2 сек — принудительно скрываем оверлей + рендерим сообщение */
  if(giftHideTimer) clearTimeout(giftHideTimer);
  giftHideTimer = setTimeout(function(){
    /* Принудительно прячем оверлей */
    if(giftTgAnim){
      giftTgAnim.classList.remove("show");
      giftTgAnim.style.display = "none";
      giftTgAnim.style.visibility = "hidden";
      giftTgAnim.style.opacity = "0";
    }
    /* Сбрасываем анимации */
    [giftTgGift, giftTgGlow, giftTgBackdrop, giftTgCaption].forEach(function(el){
      if(el){ el.style.animation = ""; el.style.opacity = ""; }
    });
    /* Рендерим чат */
    renderMessages();
    showToast("Подарок отправлен!", "success");
  }, 2200);
});
on(giftModal, "click", function(e){
  if(e.target === giftModal){ giftModal.classList.remove("show"); selectedGift = null; }
});

function playGiftAnimation(gift){
  if(!giftTgAnim) return;

  giftTgGift.textContent = gift.emoji;
  giftTgCapEmoji.textContent = gift.emoji;
  giftTgCapName.textContent = gift.name;
  giftTgCapPrice.textContent = gift.price;
  if(gift.text){ giftTgCapText.textContent = "«" + gift.text + "»"; giftTgCapText.style.display = "block"; }
  else { giftTgCapText.style.display = "none"; }

  /* Ресет всех элементов */
  [giftTgBackdrop, giftTgGlow, giftTgGift, giftTgCaption].forEach(function(el){
    if(el){ el.style.animation = "none"; el.style.opacity = ""; void el.offsetWidth; }
  });

  /* Показываем оверлей */
  giftTgAnim.classList.add("show");
  giftTgAnim.style.display = "block";
  giftTgAnim.style.visibility = "visible";
  giftTgAnim.style.opacity = "1";

  /* Запускаем анимации */
  giftTgBackdrop.style.animation = "giftBackdropIn .25s ease forwards";
  giftTgGlow.style.animation = "giftGlowPulse 2s ease-out .1s forwards";
  giftTgGift.style.animation = "giftArrive .55s cubic-bezier(.34,1.4,.64,1) forwards";

  setTimeout(function(){
    if(giftTgCaption) giftTgCaption.style.animation = "giftCaptionIn .35s ease forwards";
  }, 900);

  setTimeout(function(){
    if(giftTgGift) giftTgGift.style.animation = "giftLeave .7s cubic-bezier(.6,0,.4,1) forwards";
  }, 1700);

  setTimeout(function(){
    if(giftTgBackdrop) giftTgBackdrop.style.animation = "giftBackdropOut .35s ease forwards";
    if(giftTgCaption) giftTgCaption.style.opacity = "0";
  }, 2300);
}

on(addChatBtn, "click", function(){ createTypeModal.classList.add("show"); });
createTypeModal.querySelectorAll(".create-type-item").forEach(function(item){
  item.addEventListener("click", function(){
    createMode = item.getAttribute("data-type");
    createTypeModal.classList.remove("show");
    createNameTitle.textContent = createMode === "channel" ? "Создать канал" : "Создать группу";
    createNameInput.value = ""; createDescInput.value = "";
    createNameModal.classList.add("show");
    setTimeout(function(){ createNameInput.focus(); }, 100);
  });
});
on(createTypeModal, "click", function(e){ if(e.target === createTypeModal) createTypeModal.classList.remove("show"); });
on(createNameCancel, "click", function(){ createNameModal.classList.remove("show"); createMode = null; });
on(createNameSave, "click", function(){
  var name = createNameInput.value.trim();
  if(!name){ createNameInput.classList.add("error"); setTimeout(function(){ createNameInput.classList.remove("error"); }, 400); return; }
  var id = "chat_" + Date.now();
  customChats[id] = {
    type:createMode, name:name,
    description:createDescInput.value.trim(), link:"",
    avatar:{ type:"color", value: createMode === "channel" ? "linear-gradient(135deg,#8ab4d8,#a898d8)" : "linear-gradient(135deg,#88c8a8,#70b090)" },
    banner:{ type:"color", value: createMode === "channel" ? "linear-gradient(135deg,#8ab4d8,#a898d8)" : "linear-gradient(135deg,#88c8a8,#70b090)" },
    messages:[]
  };
  saveCustomChats();
  renderChatList();
  createNameModal.classList.remove("show");
  switchChat(id);
  showToast(createMode === "channel" ? "Канал создан!" : "Группа создана!", "success");
  createMode = null;
});

on(settingsBtn, "click", function(){ settingsScreen.classList.add("show"); applyUserToUI(); });
on(settingsBack, "click", function(){ settingsScreen.classList.remove("show"); });
on(chatSettingsBack, "click", function(){ chatSettingsScreen.classList.remove("show"); });

on(profileAvatar, "click", function(){ pickerTarget = "user"; pickerKind = "avatar"; openPicker(); });
on(profileBanner, "click", function(){ pickerTarget = "user"; pickerKind = "banner"; openPicker(); });
on(chatAvatar, "click", function(){ pickerTarget = "chat"; pickerKind = "avatar"; openPicker(); });
on(chatBanner, "click", function(){ pickerTarget = "chat"; pickerKind = "banner"; openPicker(); });

on(chatEditNameBtn, "click", function(){
  editMode = "chatName";
  editModalTitle.textContent = "Изменить название";
  editModalLabel.textContent = "Название";
  editModalInput.value = customChats[currentChatId].name;
  editModalInput.maxLength = 40;
  editModalHint.textContent = "";
  editModal.classList.add("show");
  setTimeout(function(){ editModalInput.focus(); }, 100);
});
on(chatEditDescBtn, "click", function(){
  editMode = "chatDesc";
  bioModalTitle.textContent = "Изменить описание";
  bioInput.value = customChats[currentChatId].description || "";
  bioModal.classList.add("show");
  setTimeout(function(){ bioInput.focus(); }, 100);
});
on(chatSettingsDesc, "click", function(){ if(chatEditDescBtn) chatEditDescBtn.click(); });
on(chatEditLinkBtn, "click", function(){
  editMode = "chatLink";
  editModalTitle.textContent = "Ссылка канала";
  editModalLabel.textContent = "Ссылка";
  editModalInput.value = customChats[currentChatId].link || "";
  editModalInput.maxLength = 100;
  editModalHint.textContent = "";
  editModal.classList.add("show");
  setTimeout(function(){ editModalInput.focus(); }, 100);
});
on(chatDeleteBtn, "click", function(){
  var chat = customChats[currentChatId];
  if(!chat) return;
  if(!confirm("Удалить этот канал?")) return;
  delete customChats[currentChatId];
  saveCustomChats();
  chatSettingsScreen.classList.remove("show");
  renderChatList();
  switchChat("favorites");
});

function openPicker(){
  var colorsPastel = pickerKind === "avatar" ? AVATAR_COLORS_PASTEL : BANNER_COLORS_PASTEL;
  var colorsBright = pickerKind === "avatar" ? AVATAR_COLORS_BRIGHT : BANNER_COLORS_BRIGHT;
  var gridEl = pickerKind === "avatar" ? avatarGrid : bannerGrid;
  var currentValue = "";
  if(pickerTarget === "user" && user){
    var obj = pickerKind === "avatar" ? user.avatar : user.banner;
    currentValue = obj ? obj.value : "";
  } else if(pickerTarget === "chat" && customChats[currentChatId]){
    var chat = customChats[currentChatId];
    var chatObj = pickerKind === "avatar" ? chat.avatar : chat.banner;
    currentValue = chatObj ? chatObj.value : "";
  } else if(pickerTarget === "reg"){
    currentValue = tempAvatar.value;
  }
  gridEl.innerHTML = "";

  function addColors(arr){
    arr.forEach(function(color){
      var div = document.createElement("div");
      div.style.cssText = "aspect-ratio:1;border-radius:12px;cursor:pointer;transition:transform .12s;border:3px solid transparent;position:relative;";
      div.style.background = color;
      if(color === currentValue){
        div.style.borderColor = "var(--accent)";
        div.style.transform = "scale(1.05)";
        var check = document.createElement("div");
        check.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;";
        check.innerHTML = '<i class="fas fa-check"></i>';
        div.appendChild(check);
      }
      div.addEventListener("click", function(){ applyPickedItem({type:"color", value:color}); });
      gridEl.appendChild(div);
    });
  }

  var label1 = document.createElement("div");
  label1.style.cssText = "grid-column:1/-1;color:var(--text-secondary);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:2px;";
  label1.textContent = "Пастельные";
  gridEl.appendChild(label1);
  addColors(colorsPastel);

  var label2 = document.createElement("div");
  label2.style.cssText = "grid-column:1/-1;color:var(--text-secondary);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:12px 0 2px;";
  label2.textContent = "Яркие";
  gridEl.appendChild(label2);
  addColors(colorsBright);

  var pickerModal = pickerKind === "avatar" ? avatarPicker : bannerPicker;
  pickerModal.classList.add("show");
}

function applyPickedItem(item){
  if(pickerTarget === "user" && user){
    if(pickerKind === "avatar") user.avatar = item; else user.banner = item;
    saveUser(); applyUserToUI();
    showToast(pickerKind === "avatar" ? "Аватар обновлён" : "Баннер обновлён", "success");
  } else if(pickerTarget === "chat" && customChats[currentChatId]){
    var chat = customChats[currentChatId];
    if(pickerKind === "avatar") chat.avatar = item; else chat.banner = item;
    saveCustomChats();
    renderChatList();
    if(pickerKind === "avatar" && headerAvatar){
      if(item.type === "image"){
        headerAvatar.style.background = "url('" + item.value + "') center/cover";
        headerAvatar.innerHTML = "";
      } else {
        headerAvatar.style.background = item.value;
        headerAvatar.innerHTML = "";
      }
    }
    showToast(pickerKind === "avatar" ? "Аватар обновлён" : "Баннер обновлён", "success");
  } else if(pickerTarget === "reg"){
    tempAvatar = item;
    updateRegAvatar();
  }
  avatarPicker.classList.remove("show");
  bannerPicker.classList.remove("show");
}
on(avatarUpload, "click", function(){ avatarFileInput.click(); });
on(bannerUpload, "click", function(){ bannerFileInput.click(); });
on(avatarFileInput, "change", function(e){
  var file = e.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){ applyPickedItem({type:"image", value:ev.target.result}); };
  reader.readAsDataURL(file);
  e.target.value = "";
});
on(bannerFileInput, "change", function(e){
  var file = e.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){ applyPickedItem({type:"image", value:ev.target.result}); };
  reader.readAsDataURL(file);
  e.target.value = "";
});
on(avatarPicker, "click", function(e){ if(e.target === avatarPicker) avatarPicker.classList.remove("show"); });
on(bannerPicker, "click", function(e){ if(e.target === bannerPicker) bannerPicker.classList.remove("show"); });

on(editNameBtn, "click", function(){
  editMode = "name";
  editModalTitle.textContent = "Изменить имя";
  editModalLabel.textContent = "Имя";
  editModalInput.value = user ? user.name : "";
  editModalInput.maxLength = 30;
  editModalHint.textContent = "";
  editModal.classList.add("show");
  setTimeout(function(){ editModalInput.focus(); }, 100);
});
on(editUsernameBtn, "click", function(){
  editMode = "username";
  editModalTitle.textContent = "Изменить username";
  editModalLabel.textContent = "Username (без @)";
  editModalInput.value = user ? user.username.replace("@","") : "";
  editModalInput.maxLength = 20;
  editModalHint.textContent = "Только латиница, цифры и _";
  editModal.classList.add("show");
  setTimeout(function(){ editModalInput.focus(); }, 100);
});
on(editModalInput, "input", function(){
  if(editMode === "username"){
    var res = validateUsername(editModalInput.value);
    if(editModalInput.value && !res.valid){
      editModalInput.classList.add("error");
      editModalHint.textContent = "Только английские буквы, цифры и _";
      editModalHint.classList.add("error");
    } else {
      editModalInput.classList.remove("error");
      editModalHint.textContent = "Только латиница, цифры и _";
      editModalHint.classList.remove("error");
    }
  }
});
on(editModalCancel, "click", function(){ editModal.classList.remove("show"); editMode = null; });
on(editModalSave, "click", function(){
  var value = editModalInput.value.trim(); if(!value) return;
  if(editMode === "name"){
    if(value.length < 2){ editModalInput.classList.add("error"); editModalHint.textContent = "Минимум 2 символа"; editModalHint.classList.add("error"); return; }
    user.name = value; user.initial = value.charAt(0).toUpperCase();
  } else if(editMode === "username"){
    var res = validateUsername(value);
    if(!res.valid){ editModalInput.classList.add("error"); editModalHint.textContent = "Только английские буквы"; editModalHint.classList.add("error"); return; }
    if(res.cleaned.length < 3){ editModalInput.classList.add("error"); editModalHint.textContent = "Минимум 3 символа"; editModalHint.classList.add("error"); return; }
    user.username = "@" + res.cleaned;
  } else if(editMode === "chatName"){
    customChats[currentChatId].name = value;
    saveCustomChats(); renderChatList();
    headerName.textContent = value;
    showToast("Сохранено", "success");
    editModal.classList.remove("show"); editMode = null; return;
  } else if(editMode === "chatLink"){
    var link = value.trim();
    if(link && !/^https?:\/\//i.test(link)) link = "https://" + link;
    customChats[currentChatId].link = link;
    saveCustomChats();
    showToast("Сохранено", "success");
    editModal.classList.remove("show"); editMode = null; return;
  }
  saveUser(); applyUserToUI(); updateHeaderInfo();
  showToast("Сохранено", "success");
  editModal.classList.remove("show"); editMode = null;
});
on(editModal, "click", function(e){ if(e.target === editModal){ editModal.classList.remove("show"); editMode = null; } });

on(editBioBtn, "click", function(){
  bioModalTitle.textContent = "Описание";
  editMode = "userBio";
  bioInput.value = user ? (user.bio || "") : "";
  bioModal.classList.add("show");
  setTimeout(function(){ bioInput.focus(); }, 100);
});
on(bioCancel, "click", function(){ bioModal.classList.remove("show"); editMode = null; });
on(bioSave, "click", function(){
  if(editMode === "chatDesc"){
    customChats[currentChatId].description = bioInput.value.trim();
    saveCustomChats();
    showToast("Сохранено", "success");
  } else {
    user.bio = bioInput.value.trim();
    saveUser(); applyUserToUI();
    showToast("Сохранено", "success");
  }
  bioModal.classList.remove("show"); editMode = null;
});
on(bioModal, "click", function(e){ if(e.target === bioModal){ bioModal.classList.remove("show"); editMode = null; } });
on(profileBio, "click", function(){ if(editBioBtn) editBioBtn.click(); });

on(editBirthdayBtn, "click", function(){
  birthdayInput.value = user && user.birthday ? user.birthday : "";
  birthdayModal.classList.add("show");
});
on(birthdayCancel, "click", function(){ birthdayModal.classList.remove("show"); });
on(birthdaySave, "click", function(){
  user.birthday = birthdayInput.value;
  saveUser(); applyUserToUI();
  showToast("Сохранено", "success");
  birthdayModal.classList.remove("show");
});
on(birthdayModal, "click", function(e){ if(e.target === birthdayModal) birthdayModal.classList.remove("show"); });

on(editChannelBtn, "click", function(){
  channelInput.value = user && user.channel ? user.channel : "";
  channelModal.classList.add("show");
  setTimeout(function(){ channelInput.focus(); }, 100);
});
on(channelCancel, "click", function(){ channelModal.classList.remove("show"); });
on(channelSave, "click", function(){
  var val = channelInput.value.trim();
  if(val && !/^https?:\/\//i.test(val)) val = "https://" + val;
  user.channel = val;
  saveUser(); applyUserToUI();
  showToast("Сохранено", "success");
  channelModal.classList.remove("show");
});
on(channelModal, "click", function(e){ if(e.target === channelModal) channelModal.classList.remove("show"); });

on(changeThemeBtn, "click", function(){ applyTheme(currentTheme === "light" ? "dark" : "light"); });
on(changeAccentBtn, "click", function(){
  accentGrid.innerHTML = "";
  var label1 = document.createElement("div");
  label1.className = "accent-row-label";
  label1.textContent = "Пастельные";
  accentGrid.appendChild(label1);
  Object.keys(ACCENTS_PASTEL).forEach(function(key){
    var a = ACCENTS_PASTEL[key];
    var div = document.createElement("div");
    div.className = "accent-color" + (key === currentAccent ? " selected" : "");
    div.style.background = a.color;
    div.title = a.name;
    div.addEventListener("click", function(){ applyAccent(key); accentModal.classList.remove("show"); });
    accentGrid.appendChild(div);
  });
  var label2 = document.createElement("div");
  label2.className = "accent-row-label";
  label2.textContent = "Яркие";
  accentGrid.appendChild(label2);
  Object.keys(ACCENTS_BRIGHT).forEach(function(key){
    var a = ACCENTS_BRIGHT[key];
    var div = document.createElement("div");
    div.className = "accent-color" + (key === currentAccent ? " selected" : "");
    div.style.background = a.color;
    div.title = a.name;
    div.addEventListener("click", function(){ applyAccent(key); accentModal.classList.remove("show"); });
    accentGrid.appendChild(div);
  });
  accentModal.classList.add("show");
});
on(accentModal, "click", function(e){ if(e.target === accentModal) accentModal.classList.remove("show"); });

on(changeWallpaperBtn, "click", function(){
  wallpaperGrid.innerHTML = "";
  WALLPAPERS.forEach(function(w){
    var div = document.createElement("div");
    div.className = "wallpaper-item" + (w.id === currentWallpaper ? " selected" : "");
    if(w.css !== "none") div.style.background = w.css;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
    div.style.backgroundColor = "#1c2733";
    div.addEventListener("click", function(){ applyWallpaper(w.id); wallpaperModal.classList.remove("show"); });
    wallpaperGrid.appendChild(div);
  });
  wallpaperModal.classList.add("show");
});
on(wallpaperModal, "click", function(e){ if(e.target === wallpaperModal) wallpaperModal.classList.remove("show"); });

on(logoutBtn, "click", function(){
  if(!confirm("Выйти из аккаунта?")) return;
  user = null;
  customChats = {};
  chats.favorites.messages = [];
  stories = [];
  starsAmount = 1000;
  try {
    localStorage.removeItem("sgram-user");
    localStorage.removeItem("sgram-chats");
    localStorage.removeItem("sgram-stars");
    localStorage.removeItem("sgram-stories");
  } catch(e){}
  settingsScreen.classList.remove("show");
  hide(appScreen);
  show(authScreen);
  regName.value = "";
  regUsername.value = "";
  tempAvatar = { type:"color", value: AVATAR_COLORS_PASTEL[4] };
  updateRegAvatar();
});

function init(){
  try {
    var savedAccent = localStorage.getItem("sgram-accent");
    if(savedAccent && ACCENTS[savedAccent]) currentAccent = savedAccent;
    var savedWallpaper = localStorage.getItem("sgram-wallpaper");
    if(savedWallpaper) currentWallpaper = savedWallpaper;
    var savedTheme = localStorage.getItem("sgram-theme");
    if(savedTheme) currentTheme = savedTheme;
  } catch(e){}

  updateRegAvatar();
  applyTheme(currentTheme);
  applyAccent(currentAccent);
  applyWallpaper(currentWallpaper);

  var hasSavedUser = false;
  try {
    var savedUser = localStorage.getItem("sgram-user");
    if(savedUser){
      user = JSON.parse(savedUser);
      if(user && user.name){
        hasSavedUser = true;
        if(!user.avatar) user.avatar = { type:"color", value: AVATAR_COLORS_PASTEL[4] };
        if(!user.banner) user.banner = { type:"color", value: BANNER_COLORS_PASTEL[0] };
        if(!user.bio) user.bio = "";
        if(!user.birthday) user.birthday = "";
        if(!user.channel) user.channel = "";
      }
    }
    var savedStars = localStorage.getItem("sgram-stars");
    if(savedStars) starsAmount = parseInt(savedStars, 10) || 1000;
    var savedChats = localStorage.getItem("sgram-chats");
    if(savedChats) customChats = JSON.parse(savedChats);
    var savedStories = localStorage.getItem("sgram-stories");
    if(savedStories) stories = JSON.parse(savedStories);
  } catch(e){}

  setTimeout(function(){
    try {
      splash.classList.add("hidden");
      setTimeout(function(){
        try {
          if(hasSavedUser && user) showApp();
          else show(authScreen);
        } catch(err){ show(authScreen); }
      }, 350);
    } catch(err){ show(authScreen); }
  }, 1500);
}

init();

})();