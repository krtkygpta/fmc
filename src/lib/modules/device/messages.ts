// What the watch connection says — BLE statuses and the errors of ble.ts, ota-image.ts, wp2.ts
// and the flash checks in editor/core/format/bin.ts — in the UI language.
//
// Those files keep writing English: the log (Copy log) and analytics (reasonOf) read it, and the
// protocol code shouldn't know about languages. The text is translated where it reaches a store
// the user reads, by matching the English sentence. ponytail: matching on the English text means
// a reworded message in lib/ falls back to English until its rule here is updated —
// tests/ble-messages.browser.test.ts fails when a message has no rule.
import type { StoreValue } from "effector";
import { dict } from "$lib/shared/i18n";

const en = {
  // statuses
  requesting: "requesting device…",
  disconnected: "disconnected",
  connecting: "connecting…",
  repicking: "re-picking device…",
  pairingHidden: "pairing service hidden — reconnecting…",
  connected: "connected",
  decode: (m: string) => `decode: ${m}`,
  uploading: (name: string) => `uploading “${name}”…`,
  uploadingPct: (name: string, pct: string) => `uploading “${name}”… ${pct}%`,
  askingUpdate: "asking the watch to update…",
  updatingPct: (pct: string) => `updating firmware… ${pct}%`,
  fwSent: "firmware sent — the watch installs it and restarts",
  installing: (name: string) => `installing ${name}…`,
  confirmOnWatch: "pairing — confirm on the watch",
  authenticating: "authenticating…",
  // connecting
  noWebBluetooth:
    "Web Bluetooth isn't available here — open this page in Chrome or Edge, or in Bluefy on an iPhone",
  timedOut: (what: string) =>
    `${what} timed out — the watch is probably connected to another app or browser tab; close it (phone app, fmc CLI, old editor tab) and retry`,
  charNotFound: (key: string) => `characteristic ${key} not found`,
  timeoutWaiting: (cmd: string) => `timeout waiting for ${cmd}`,
  pairingNotFound:
    "pairing service not found — reconnect and try again; if this keeps happening the watch may be using a new service UUID (see SERVICES in ble.ts)",
  pairingRejected: (s: string) => `pairing rejected: ${s}`,
  signatureMismatch: "watch signature mismatch",
  authKeyRejected: "watch rejected the auth key",
  decryptFailed: "decrypt failed — wrong session key",
  // watchface upload
  tooLarge32: "file larger than 32 MB",
  notWatchface: "not a watchface: no 01 00 00 0x magic at offset 4",
  trailerMismatch: "trailer name mismatch — corrupted file?",
  slotsTaken: (n: string) => `all ${n} slots taken`,
  uploadRejected: (d: string) => `watch rejected the upload (${d})`,
  appendRefused: (d: string) => `append refused (${d})`,
  overwriteRefused: (d: string) => `overwrite refused (${d})`,
  uploadStalled: "upload stalled",
  dialNotInstalled: (id: string, d: string) => `dial ${id} not installed (${d})`,
  notAccepted: (why: string, kb: string) => `watch did not accept the file (${why}; ${kb} KB)`,
  storedNotActivated: "stored but not activated",
  refusedReplace: (name: string) =>
    `the watch refused to replace “${name}” — flash again and pick a different dial to replace`,
  aodNoPreview:
    "the always-on screen has no preview thumbnail, and the watch can crash in a loop on it. Open the face in the editor and flash it from there — the editor puts the thumbnail back.",
  imageOverLimit: (w: string, h: string, max: string) =>
    `an image is ${w}×${h} px, over the ${max} px limit — the watch can run out of memory loading it and restart in a loop. Resize it in the editor first.`,
  bigImage: (w: string, h: string) =>
    `This face has a ${w}×${h} px image, larger than factory faces use. The watch may run out of memory loading it and restart in a loop, and there is no confirmed way out of that loop yet.`,
  // firmware update
  noOtaChannel: "the watch didn't offer its firmware-update channel — reconnect and retry",
  refusedUpdate: (d: string) => `the watch refused the update (${d})`,
  refusedStart: (d: string) => `the watch refused to start (${d})`,
  droppedDuringUpdate: "the watch disconnected during the update",
  stoppedAsking: "the watch stopped asking for data",
  rejectedImage: (d: string) => `the watch rejected the image (${d})`,
  stoppedUpdate: (d: string) => `the watch stopped the update (${d})`,
  notFlashable: (why: string) => `not a flashable image: ${why}`,
  recordNoBoard: (device: string) => `the record is for the ${device}, a watch with no known board`,
  unknownWatch: (name: string) => `“${name}” isn't a watch with a known board — no flashing`,
  boardVsRecord: (img: string, device: string, board: string) =>
    `the image is built for board "${img}", but the record is for the ${device} (board "${board}")`,
  boardVsWatch: (img: string, name: string, device: string, board: string) =>
    `the image is built for board "${img}", but “${name}” is a ${device} (board "${board}")`,
  otaOnly: (device: string, name: string) =>
    `firmware updates are for the ${device} only, this is “${name}”`,
  // apps (the App Loader stub)
  stubReply: "unexpected stub reply",
  appRunning: (name: string) => `${name} is running on the watch — leave it and try again`,
  refusedCmd: (cmd: string, why: string) => `the watch refused ${cmd}: ${why}`,
  bytesMismatch: (have: string, want: string) => `the watch has ${have} bytes, expected ${want}`,
  cantInstall: (why: string) => `can't install this package: ${why}`,
  needsAbi: (need: string, max: string) =>
    `it needs app ABI ${need}, the watch's App Loader takes up to ${max}`,
  appSlotsTaken: (n: string) => `all ${n} app slots are taken — remove an app on the watch first`,
  // the reasons inside the sentences above, by their English words
  reasons: {
    "bad request": "bad request",
    "storage error": "storage error",
    "out of sequence": "out of sequence",
    "checksum mismatch": "checksum mismatch",
    busy: "busy",
    "invalid package": "invalid package",
    "no app": "no app",
    full: "full",
    paused: "paused",
    "not a .wp2app": "not a .wp2app",
    "header checksum": "header checksum",
    "unknown ABI": "unknown ABI",
    "too big for its slot": "too big for its slot",
    "truncated or padded": "truncated or padded",
    "body checksum": "body checksum",
    "unknown kind": "unknown kind",
  } as Record<string, string>,
};

export const bt = dict(en, {
  ru: {
    requesting: "выбор устройства…",
    disconnected: "отключено",
    connecting: "подключение…",
    repicking: "повторный выбор устройства…",
    pairingHidden: "сервис сопряжения скрыт — переподключение…",
    connected: "подключено",
    decode: (m) => `ошибка декодирования: ${m}`,
    uploading: (name) => `загрузка «${name}»…`,
    uploadingPct: (name, pct) => `загрузка «${name}»… ${pct}%`,
    askingUpdate: "запрос обновления у часов…",
    updatingPct: (pct) => `обновление прошивки… ${pct}%`,
    fwSent: "прошивка отправлена — часы установят её и перезагрузятся",
    installing: (name) => `установка ${name}…`,
    confirmOnWatch: "сопряжение — подтвердите на часах",
    authenticating: "авторизация…",
    noWebBluetooth:
      "Web Bluetooth здесь недоступен — откройте страницу в Chrome или Edge, а на iPhone в Bluefy",
    timedOut: (what) =>
      `${what}: время ожидания истекло — вероятно, часы подключены к другому приложению или вкладке; закройте его (приложение на телефоне, fmc CLI, старую вкладку редактора) и повторите`,
    charNotFound: (key) => `характеристика ${key} не найдена`,
    timeoutWaiting: (cmd) => `нет ответа на ${cmd}`,
    pairingNotFound:
      "сервис сопряжения не найден — переподключитесь и попробуйте снова; если повторяется, возможно, у часов новый UUID сервиса (см. SERVICES в ble.ts)",
    pairingRejected: (s) => `сопряжение отклонено: ${s}`,
    signatureMismatch: "подпись часов не совпадает",
    authKeyRejected: "часы отклонили ключ авторизации",
    decryptFailed: "не удалось расшифровать — неверный ключ сессии",
    tooLarge32: "файл больше 32 МБ",
    notWatchface: "это не циферблат: нет сигнатуры 01 00 00 0x по смещению 4",
    trailerMismatch: "имя в конце файла не совпадает — файл повреждён?",
    slotsTaken: (n) => `все ${n} слотов заняты`,
    uploadRejected: (d) => `часы отклонили загрузку (${d})`,
    appendRefused: (d) => `добавление отклонено (${d})`,
    overwriteRefused: (d) => `замена отклонена (${d})`,
    uploadStalled: "загрузка зависла",
    dialNotInstalled: (id, d) => `циферблат ${id} не установлен (${d})`,
    notAccepted: (why, kb) => `часы не приняли файл (${why}; ${kb} КБ)`,
    storedNotActivated: "сохранён, но не активирован",
    refusedReplace: (name) =>
      `часы отказались заменить «${name}» — загрузите ещё раз и выберите другой циферблат для замены`,
    aodNoPreview:
      "у экрана always-on нет миниатюры, и часы могут на нём зациклиться на перезагрузке. Откройте циферблат в редакторе и загрузите оттуда — редактор вернёт миниатюру.",
    imageOverLimit: (w, h, max) =>
      `изображение ${w}×${h} px больше предела в ${max} px — часам может не хватить памяти, и они зациклятся на перезагрузке. Сначала уменьшите его в редакторе.`,
    bigImage: (w, h) =>
      `В циферблате есть изображение ${w}×${h} px — больше, чем в заводских. Часам может не хватить памяти, и они зациклятся на перезагрузке, а проверенного способа выйти из этого цикла пока нет.`,
    noOtaChannel: "часы не открыли канал обновления прошивки — переподключитесь и повторите",
    refusedUpdate: (d) => `часы отклонили обновление (${d})`,
    refusedStart: (d) => `часы отказались начать (${d})`,
    droppedDuringUpdate: "часы отключились во время обновления",
    stoppedAsking: "часы перестали запрашивать данные",
    rejectedImage: (d) => `часы отклонили образ (${d})`,
    stoppedUpdate: (d) => `часы прервали обновление (${d})`,
    notFlashable: (why) => `образ нельзя прошить: ${why}`,
    recordNoBoard: (device) => `запись для ${device}, у этих часов нет известной платы`,
    unknownWatch: (name) => `у «${name}» нет известной платы — прошивка невозможна`,
    boardVsRecord: (img, device, board) =>
      `образ собран для платы "${img}", а запись для ${device} (плата "${board}")`,
    boardVsWatch: (img, name, device, board) =>
      `образ собран для платы "${img}", а «${name}» — это ${device} (плата "${board}")`,
    otaOnly: (device, name) => `обновления прошивки только для ${device}, а это «${name}»`,
    stubReply: "неожиданный ответ App Loader",
    appRunning: (name) => `${name} запущено на часах — выйдите из него и попробуйте снова`,
    refusedCmd: (cmd, why) => `часы отклонили ${cmd}: ${why}`,
    bytesMismatch: (have, want) => `на часах ${have} байт, ожидалось ${want}`,
    cantInstall: (why) => `не удаётся установить пакет: ${why}`,
    needsAbi: (need, max) =>
      `нужен ABI приложений ${need}, App Loader на часах поддерживает до ${max}`,
    appSlotsTaken: (n) =>
      `все ${n} слотов для приложений заняты — сначала удалите приложение на часах`,
    reasons: {
      "bad request": "неверный запрос",
      "storage error": "ошибка памяти",
      "out of sequence": "нарушен порядок",
      "checksum mismatch": "не совпала контрольная сумма",
      busy: "занято",
      "invalid package": "неверный пакет",
      "no app": "нет приложения",
      full: "нет места",
      paused: "на паузе",
      "not a .wp2app": "это не .wp2app",
      "header checksum": "контрольная сумма заголовка",
      "unknown ABI": "неизвестный ABI",
      "too big for its slot": "не помещается в слот",
      "truncated or padded": "файл обрезан или дополнен",
      "body checksum": "контрольная сумма данных",
      "unknown kind": "неизвестный тип",
    },
  },
  uk: {
    requesting: "вибір пристрою…",
    disconnected: "від'єднано",
    connecting: "під'єднання…",
    repicking: "повторний вибір пристрою…",
    pairingHidden: "сервіс сполучення приховано — повторне під'єднання…",
    connected: "під'єднано",
    decode: (m) => `помилка декодування: ${m}`,
    uploading: (name) => `завантаження «${name}»…`,
    uploadingPct: (name, pct) => `завантаження «${name}»… ${pct}%`,
    askingUpdate: "запит оновлення в годинника…",
    updatingPct: (pct) => `оновлення прошивки… ${pct}%`,
    fwSent: "прошивку надіслано — годинник встановить її та перезапуститься",
    installing: (name) => `встановлення ${name}…`,
    confirmOnWatch: "сполучення — підтвердьте на годиннику",
    authenticating: "автентифікація…",
    noWebBluetooth:
      "Web Bluetooth тут недоступний — відкрийте сторінку в Chrome чи Edge, а на iPhone у Bluefy",
    timedOut: (what) =>
      `${what}: час очікування вичерпано — мабуть, годинник під'єднаний до іншого застосунку чи вкладки; закрийте їх (застосунок на телефоні, fmc CLI, стару вкладку редактора) і повторіть`,
    charNotFound: (key) => `характеристику ${key} не знайдено`,
    timeoutWaiting: (cmd) => `немає відповіді на ${cmd}`,
    pairingNotFound:
      "сервіс сполучення не знайдено — під'єднайтеся знову; якщо це повторюється, можливо, годинник має новий UUID сервісу (див. SERVICES у ble.ts)",
    pairingRejected: (s) => `сполучення відхилено: ${s}`,
    signatureMismatch: "підпис годинника не збігається",
    authKeyRejected: "годинник відхилив ключ автентифікації",
    decryptFailed: "не вдалося розшифрувати — хибний ключ сесії",
    tooLarge32: "файл більший за 32 МБ",
    notWatchface: "це не циферблат: немає сигнатури 01 00 00 0x за зміщенням 4",
    trailerMismatch: "ім'я в кінці файлу не збігається — файл пошкоджено?",
    slotsTaken: (n) => `усі ${n} слотів зайняті`,
    uploadRejected: (d) => `годинник відхилив завантаження (${d})`,
    appendRefused: (d) => `додавання відхилено (${d})`,
    overwriteRefused: (d) => `заміну відхилено (${d})`,
    uploadStalled: "завантаження зависло",
    dialNotInstalled: (id, d) => `циферблат ${id} не встановлено (${d})`,
    notAccepted: (why, kb) => `годинник не прийняв файл (${why}; ${kb} КБ)`,
    storedNotActivated: "збережено, але не активовано",
    refusedReplace: (name) =>
      `годинник відмовився замінити «${name}» — завантажте ще раз і виберіть інший циферблат для заміни`,
    aodNoPreview:
      "екран always-on не має мініатюри, і годинник може циклічно перезавантажуватися на ньому. Відкрийте циферблат у редакторі й завантажте звідти — редактор поверне мініатюру.",
    imageOverLimit: (w, h, max) =>
      `зображення ${w}×${h} px перевищує межу ${max} px — годиннику може забракнути пам'яті, і він циклічно перезавантажуватиметься. Спершу зменште його в редакторі.`,
    bigImage: (w, h) =>
      `У циферблаті є зображення ${w}×${h} px — більше, ніж у заводських. Годиннику може забракнути пам'яті, і він циклічно перезавантажуватиметься, а перевіреного способу вийти з цього циклу поки немає.`,
    noOtaChannel: "годинник не відкрив канал оновлення прошивки — під'єднайтеся знову й повторіть",
    refusedUpdate: (d) => `годинник відхилив оновлення (${d})`,
    refusedStart: (d) => `годинник відмовився почати (${d})`,
    droppedDuringUpdate: "годинник від'єднався під час оновлення",
    stoppedAsking: "годинник перестав запитувати дані",
    rejectedImage: (d) => `годинник відхилив образ (${d})`,
    stoppedUpdate: (d) => `годинник перервав оновлення (${d})`,
    notFlashable: (why) => `образ не можна прошити: ${why}`,
    recordNoBoard: (device) => `запис для ${device}, у цього годинника немає відомої плати`,
    unknownWatch: (name) => `«${name}» не має відомої плати — прошивка неможлива`,
    boardVsRecord: (img, device, board) =>
      `образ зібрано для плати "${img}", а запис для ${device} (плата "${board}")`,
    boardVsWatch: (img, name, device, board) =>
      `образ зібрано для плати "${img}", а «${name}» — це ${device} (плата "${board}")`,
    otaOnly: (device, name) => `оновлення прошивки лише для ${device}, а це «${name}»`,
    stubReply: "неочікувана відповідь App Loader",
    appRunning: (name) => `${name} запущено на годиннику — вийдіть із нього й спробуйте знову`,
    refusedCmd: (cmd, why) => `годинник відхилив ${cmd}: ${why}`,
    bytesMismatch: (have, want) => `на годиннику ${have} байтів, очікувалося ${want}`,
    cantInstall: (why) => `не вдається встановити пакет: ${why}`,
    needsAbi: (need, max) =>
      `потрібен ABI застосунків ${need}, App Loader на годиннику підтримує до ${max}`,
    appSlotsTaken: (n) =>
      `усі ${n} слотів для застосунків зайняті — спершу видаліть застосунок на годиннику`,
    reasons: {
      "bad request": "хибний запит",
      "storage error": "помилка пам'яті",
      "out of sequence": "порушено порядок",
      "checksum mismatch": "контрольна сума не збігається",
      busy: "зайнято",
      "invalid package": "хибний пакет",
      "no app": "немає застосунку",
      full: "немає місця",
      paused: "на паузі",
      "not a .wp2app": "це не .wp2app",
      "header checksum": "контрольна сума заголовка",
      "unknown ABI": "невідомий ABI",
      "too big for its slot": "не вміщується в слот",
      "truncated or padded": "файл обрізано або доповнено",
      "body checksum": "контрольна сума даних",
      "unknown kind": "невідомий тип",
    },
  },
  es: {
    requesting: "eligiendo dispositivo…",
    disconnected: "desconectado",
    connecting: "conectando…",
    repicking: "volviendo a elegir dispositivo…",
    pairingHidden: "servicio de emparejamiento oculto — reconectando…",
    connected: "conectado",
    decode: (m) => `error al decodificar: ${m}`,
    uploading: (name) => `enviando «${name}»…`,
    uploadingPct: (name, pct) => `enviando «${name}»… ${pct}%`,
    askingUpdate: "pidiendo al reloj que se actualice…",
    updatingPct: (pct) => `actualizando firmware… ${pct}%`,
    fwSent: "firmware enviado — el reloj lo instala y se reinicia",
    installing: (name) => `instalando ${name}…`,
    confirmOnWatch: "emparejando — confirma en el reloj",
    authenticating: "autenticando…",
    noWebBluetooth:
      "Web Bluetooth no está disponible aquí — abre esta página en Chrome o Edge, o en Bluefy en un iPhone",
    timedOut: (what) =>
      `${what}: se agotó el tiempo — seguramente el reloj está conectado a otra app o pestaña; ciérrala (la app del teléfono, fmc CLI, una pestaña antigua del editor) y reintenta`,
    charNotFound: (key) => `no se encontró la característica ${key}`,
    timeoutWaiting: (cmd) => `sin respuesta a ${cmd}`,
    pairingNotFound:
      "no se encontró el servicio de emparejamiento — reconecta e inténtalo de nuevo; si se repite, puede que el reloj use un UUID de servicio nuevo (ver SERVICES en ble.ts)",
    pairingRejected: (s) => `emparejamiento rechazado: ${s}`,
    signatureMismatch: "la firma del reloj no coincide",
    authKeyRejected: "el reloj rechazó la clave de autenticación",
    decryptFailed: "no se pudo descifrar — clave de sesión incorrecta",
    tooLarge32: "el archivo supera los 32 MB",
    notWatchface: "no es una esfera: falta la firma 01 00 00 0x en el desplazamiento 4",
    trailerMismatch: "el nombre al final del archivo no coincide — ¿archivo dañado?",
    slotsTaken: (n) => `los ${n} espacios están ocupados`,
    uploadRejected: (d) => `el reloj rechazó el envío (${d})`,
    appendRefused: (d) => `se rechazó añadir (${d})`,
    overwriteRefused: (d) => `se rechazó reemplazar (${d})`,
    uploadStalled: "el envío se detuvo",
    dialNotInstalled: (id, d) => `la esfera ${id} no está instalada (${d})`,
    notAccepted: (why, kb) => `el reloj no aceptó el archivo (${why}; ${kb} KB)`,
    storedNotActivated: "guardado pero no activado",
    refusedReplace: (name) =>
      `el reloj se negó a reemplazar «${name}» — vuelve a enviarla y elige otra esfera para reemplazar`,
    aodNoPreview:
      "la pantalla siempre activa no tiene miniatura, y el reloj puede quedarse reiniciándose en bucle con ella. Abre la esfera en el editor y envíala desde allí — el editor repone la miniatura.",
    imageOverLimit: (w, h, max) =>
      `una imagen mide ${w}×${h} px, más del límite de ${max} px — el reloj puede quedarse sin memoria al cargarla y reiniciarse en bucle. Redúcela primero en el editor.`,
    bigImage: (w, h) =>
      `Esta esfera tiene una imagen de ${w}×${h} px, mayor que las de las esferas de fábrica. El reloj puede quedarse sin memoria al cargarla y reiniciarse en bucle, y aún no hay una forma confirmada de salir de ese bucle.`,
    noOtaChannel:
      "el reloj no ofreció su canal de actualización de firmware — reconecta y reintenta",
    refusedUpdate: (d) => `el reloj rechazó la actualización (${d})`,
    refusedStart: (d) => `el reloj se negó a empezar (${d})`,
    droppedDuringUpdate: "el reloj se desconectó durante la actualización",
    stoppedAsking: "el reloj dejó de pedir datos",
    rejectedImage: (d) => `el reloj rechazó la imagen (${d})`,
    stoppedUpdate: (d) => `el reloj detuvo la actualización (${d})`,
    notFlashable: (why) => `no es una imagen instalable: ${why}`,
    recordNoBoard: (device) => `el registro es para el ${device}, un reloj sin placa conocida`,
    unknownWatch: (name) => `«${name}» no es un reloj con placa conocida — no se instala`,
    boardVsRecord: (img, device, board) =>
      `la imagen está hecha para la placa "${img}", pero el registro es para el ${device} (placa "${board}")`,
    boardVsWatch: (img, name, device, board) =>
      `la imagen está hecha para la placa "${img}", pero «${name}» es un ${device} (placa "${board}")`,
    otaOnly: (device, name) =>
      `las actualizaciones de firmware son solo para el ${device}, este es «${name}»`,
    stubReply: "respuesta inesperada del App Loader",
    appRunning: (name) => `${name} está abierta en el reloj — sal de ella y reintenta`,
    refusedCmd: (cmd, why) => `el reloj rechazó ${cmd}: ${why}`,
    bytesMismatch: (have, want) => `el reloj tiene ${have} bytes, se esperaban ${want}`,
    cantInstall: (why) => `no se puede instalar este paquete: ${why}`,
    needsAbi: (need, max) =>
      `necesita la ABI de apps ${need}, el App Loader del reloj admite hasta ${max}`,
    appSlotsTaken: (n) =>
      `los ${n} espacios para apps están ocupados — primero elimina una app en el reloj`,
    reasons: {
      "bad request": "solicitud incorrecta",
      "storage error": "error de almacenamiento",
      "out of sequence": "fuera de orden",
      "checksum mismatch": "la suma de comprobación no coincide",
      busy: "ocupado",
      "invalid package": "paquete no válido",
      "no app": "no hay app",
      full: "sin espacio",
      paused: "en pausa",
      "not a .wp2app": "no es un .wp2app",
      "header checksum": "suma de comprobación de la cabecera",
      "unknown ABI": "ABI desconocida",
      "too big for its slot": "demasiado grande para su espacio",
      "truncated or padded": "archivo truncado o con relleno",
      "body checksum": "suma de comprobación de los datos",
      "unknown kind": "tipo desconocido",
    },
  },
  hi: {
    requesting: "डिवाइस चुना जा रहा है…",
    disconnected: "डिस्कनेक्ट हो गया",
    connecting: "कनेक्ट हो रहा है…",
    repicking: "डिवाइस फिर से चुना जा रहा है…",
    pairingHidden: "पेयरिंग सर्विस छिपी है — फिर से कनेक्ट हो रहा है…",
    connected: "कनेक्ट है",
    decode: (m) => `डिकोड त्रुटि: ${m}`,
    uploading: (name) => `“${name}” भेजा जा रहा है…`,
    uploadingPct: (name, pct) => `“${name}” भेजा जा रहा है… ${pct}%`,
    askingUpdate: "घड़ी से अपडेट शुरू करने को कहा जा रहा है…",
    updatingPct: (pct) => `फ़र्मवेयर अपडेट हो रहा है… ${pct}%`,
    fwSent: "फ़र्मवेयर भेज दिया — घड़ी इसे इंस्टॉल करके रीस्टार्ट होगी",
    installing: (name) => `${name} इंस्टॉल हो रहा है…`,
    confirmOnWatch: "पेयरिंग — घड़ी पर पुष्टि करें",
    authenticating: "प्रमाणीकरण हो रहा है…",
    noWebBluetooth:
      "यहां Web Bluetooth उपलब्ध नहीं है — यह पेज Chrome या Edge में खोलें, या iPhone पर Bluefy में",
    timedOut: (what) =>
      `${what}: समय समाप्त — घड़ी शायद किसी दूसरे ऐप या टैब से जुड़ी है; उसे बंद करें (फ़ोन ऐप, fmc CLI, एडिटर का पुराना टैब) और फिर कोशिश करें`,
    charNotFound: (key) => `कैरेक्टरिस्टिक ${key} नहीं मिली`,
    timeoutWaiting: (cmd) => `${cmd} का जवाब नहीं आया`,
    pairingNotFound:
      "पेयरिंग सर्विस नहीं मिली — फिर से कनेक्ट करके कोशिश करें; बार-बार हो तो घड़ी शायद नया सर्विस UUID इस्तेमाल कर रही है (ble.ts में SERVICES देखें)",
    pairingRejected: (s) => `पेयरिंग अस्वीकार: ${s}`,
    signatureMismatch: "घड़ी का सिग्नेचर मेल नहीं खाता",
    authKeyRejected: "घड़ी ने ऑथ की अस्वीकार कर दी",
    decryptFailed: "डिक्रिप्ट नहीं हो सका — सेशन की गलत है",
    tooLarge32: "फ़ाइल 32 MB से बड़ी है",
    notWatchface: "यह वॉच फ़ेस नहीं है: ऑफ़सेट 4 पर 01 00 00 0x मैजिक नहीं है",
    trailerMismatch: "फ़ाइल के अंत का नाम मेल नहीं खाता — फ़ाइल खराब है?",
    slotsTaken: (n) => `सभी ${n} स्लॉट भरे हैं`,
    uploadRejected: (d) => `घड़ी ने अपलोड अस्वीकार किया (${d})`,
    appendRefused: (d) => `जोड़ना अस्वीकार (${d})`,
    overwriteRefused: (d) => `बदलना अस्वीकार (${d})`,
    uploadStalled: "अपलोड रुक गया",
    dialNotInstalled: (id, d) => `फ़ेस ${id} इंस्टॉल नहीं है (${d})`,
    notAccepted: (why, kb) => `घड़ी ने फ़ाइल स्वीकार नहीं की (${why}; ${kb} KB)`,
    storedNotActivated: "सेव हुई पर चालू नहीं हुई",
    refusedReplace: (name) =>
      `घड़ी ने “${name}” को बदलने से मना किया — फिर से भेजें और बदलने के लिए दूसरा फ़ेस चुनें`,
    aodNoPreview:
      "ऑलवेज़-ऑन स्क्रीन का थंबनेल नहीं है, और घड़ी उस पर बार-बार रीस्टार्ट हो सकती है। फ़ेस को एडिटर में खोलें और वहीं से भेजें — एडिटर थंबनेल वापस जोड़ देता है।",
    imageOverLimit: (w, h, max) =>
      `एक इमेज ${w}×${h} px की है, ${max} px की सीमा से बड़ी — घड़ी की मेमोरी खत्म हो सकती है और वह बार-बार रीस्टार्ट हो सकती है। पहले एडिटर में इसे छोटा करें।`,
    bigImage: (w, h) =>
      `इस फ़ेस में ${w}×${h} px की इमेज है, जो फ़ैक्टरी फ़ेस से बड़ी है। घड़ी की मेमोरी खत्म हो सकती है और वह बार-बार रीस्टार्ट हो सकती है, और इस लूप से निकलने का कोई पक्का तरीका अभी नहीं है।`,
    noOtaChannel: "घड़ी ने फ़र्मवेयर अपडेट चैनल नहीं खोला — फिर से कनेक्ट करके कोशिश करें",
    refusedUpdate: (d) => `घड़ी ने अपडेट अस्वीकार किया (${d})`,
    refusedStart: (d) => `घड़ी ने शुरू करने से मना किया (${d})`,
    droppedDuringUpdate: "अपडेट के दौरान घड़ी डिस्कनेक्ट हो गई",
    stoppedAsking: "घड़ी ने डेटा मांगना बंद कर दिया",
    rejectedImage: (d) => `घड़ी ने इमेज अस्वीकार की (${d})`,
    stoppedUpdate: (d) => `घड़ी ने अपडेट रोक दिया (${d})`,
    notFlashable: (why) => `यह फ़्लैश करने योग्य इमेज नहीं है: ${why}`,
    recordNoBoard: (device) => `रिकॉर्ड ${device} के लिए है, जिसका बोर्ड ज्ञात नहीं है`,
    unknownWatch: (name) => `“${name}” का बोर्ड ज्ञात नहीं है — फ़्लैश नहीं होगा`,
    boardVsRecord: (img, device, board) =>
      `इमेज बोर्ड "${img}" के लिए बनी है, पर रिकॉर्ड ${device} (बोर्ड "${board}") के लिए है`,
    boardVsWatch: (img, name, device, board) =>
      `इमेज बोर्ड "${img}" के लिए बनी है, पर “${name}” एक ${device} (बोर्ड "${board}") है`,
    otaOnly: (device, name) => `फ़र्मवेयर अपडेट सिर्फ़ ${device} के लिए हैं, यह “${name}” है`,
    stubReply: "App Loader से अनपेक्षित जवाब",
    appRunning: (name) => `${name} घड़ी पर चल रहा है — उससे बाहर निकलें और फिर कोशिश करें`,
    refusedCmd: (cmd, why) => `घड़ी ने ${cmd} अस्वीकार किया: ${why}`,
    bytesMismatch: (have, want) => `घड़ी पर ${have} बाइट हैं, ${want} अपेक्षित थे`,
    cantInstall: (why) => `यह पैकेज इंस्टॉल नहीं हो सकता: ${why}`,
    needsAbi: (need, max) => `इसे ऐप ABI ${need} चाहिए, घड़ी का App Loader ${max} तक लेता है`,
    appSlotsTaken: (n) => `सभी ${n} ऐप स्लॉट भरे हैं — पहले घड़ी पर कोई ऐप हटाएं`,
    reasons: {
      "bad request": "गलत अनुरोध",
      "storage error": "स्टोरेज त्रुटि",
      "out of sequence": "क्रम से बाहर",
      "checksum mismatch": "चेकसम मेल नहीं खाता",
      busy: "व्यस्त",
      "invalid package": "अमान्य पैकेज",
      "no app": "कोई ऐप नहीं",
      full: "जगह नहीं",
      paused: "रुका हुआ",
      "not a .wp2app": ".wp2app नहीं है",
      "header checksum": "हेडर चेकसम",
      "unknown ABI": "अज्ञात ABI",
      "too big for its slot": "स्लॉट के लिए बहुत बड़ा",
      "truncated or padded": "फ़ाइल अधूरी या बढ़ी हुई",
      "body checksum": "डेटा चेकसम",
      "unknown kind": "अज्ञात प्रकार",
    },
  },
});

type Words = StoreValue<typeof bt>;
type Rule = [RegExp, (w: Words, m: string[]) => string];

const why = (w: Words, s: string) => w.reasons[s] ?? s;
const lit = (k: { [K in keyof Words]: Words[K] extends string ? K : never }[keyof Words]): Rule => [
  new RegExp(`^${en[k].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
  (w) => w[k],
];

// most specific first: "uploading “x”… 5%" before "uploading “x”…"
const RULES: Rule[] = [
  lit("requesting"),
  lit("disconnected"),
  lit("connecting"),
  lit("repicking"),
  lit("pairingHidden"),
  lit("connected"),
  [/^decode: (.+)$/s, (w, m) => w.decode(m[1])],
  [/^uploading “(.+)”… (\d+)%$/, (w, m) => w.uploadingPct(m[1], m[2])],
  [/^uploading “(.+)”…$/, (w, m) => w.uploading(m[1])],
  lit("askingUpdate"),
  [/^updating firmware… (\d+)%$/, (w, m) => w.updatingPct(m[1])],
  lit("fwSent"),
  [/^installing (.+)…$/, (w, m) => w.installing(m[1])],
  lit("confirmOnWatch"),
  lit("authenticating"),
  lit("noWebBluetooth"),
  [/^(.+) timed out — the watch is probably connected/, (w, m) => w.timedOut(m[1])],
  [/^characteristic (.+) not found$/, (w, m) => w.charNotFound(m[1])],
  [/^timeout waiting for (\S+)$/, (w, m) => w.timeoutWaiting(m[1])],
  lit("pairingNotFound"),
  [/^pairing rejected: (.+)$/s, (w, m) => w.pairingRejected(m[1])],
  lit("signatureMismatch"),
  lit("authKeyRejected"),
  lit("decryptFailed"),
  lit("tooLarge32"),
  lit("notWatchface"),
  lit("trailerMismatch"),
  [/^all (\d+) slots taken$/, (w, m) => w.slotsTaken(m[1])],
  [/^watch rejected the upload \((.+)\)$/, (w, m) => w.uploadRejected(m[1])],
  [/^append refused \((.+)\)$/, (w, m) => w.appendRefused(m[1])],
  [/^overwrite refused \((.+)\)$/, (w, m) => w.overwriteRefused(m[1])],
  lit("uploadStalled"),
  [/^dial (\S+) not installed \((.+)\)$/, (w, m) => w.dialNotInstalled(m[1], m[2])],
  [
    /^watch did not accept the file \((.+); (\d+) KB\)$/,
    (w, m) => w.notAccepted(m[1] === en.storedNotActivated ? w.storedNotActivated : m[1], m[2]),
  ],
  [/^the watch refused to replace “(.+)” — /, (w, m) => w.refusedReplace(m[1])],
  lit("aodNoPreview"),
  [
    /^an image is (\d+)×(\d+) px, over the (\d+) px limit/,
    (w, m) => w.imageOverLimit(m[1], m[2], m[3]),
  ],
  [/^This face has a (\d+)×(\d+) px image/, (w, m) => w.bigImage(m[1], m[2])],
  lit("noOtaChannel"),
  [/^the watch refused the update \((.+)\)$/, (w, m) => w.refusedUpdate(m[1])],
  [/^the watch refused to start \((.+)\)$/, (w, m) => w.refusedStart(m[1])],
  lit("droppedDuringUpdate"),
  lit("stoppedAsking"),
  [/^the watch rejected the image \((.+)\)$/, (w, m) => w.rejectedImage(m[1])],
  [/^the watch stopped the update \((.+)\)$/, (w, m) => w.stoppedUpdate(m[1])],
  [/^not a flashable image: (.+)$/, (w, m) => w.notFlashable(m[1])],
  [/^the record is for the (.+), a watch with no known board$/, (w, m) => w.recordNoBoard(m[1])],
  [/^“(.+)” isn't a watch with a known board/, (w, m) => w.unknownWatch(m[1])],
  [
    /^the image is built for board "(.+)", but the record is for the (.+) \(board "(.+)"\)$/,
    (w, m) => w.boardVsRecord(m[1], m[2], m[3]),
  ],
  [
    /^the image is built for board "(.+)", but “(.+)” is a (.+) \(board "(.+)"\)$/,
    (w, m) => w.boardVsWatch(m[1], m[2], m[3], m[4]),
  ],
  [/^firmware updates are for the (.+) only, this is “(.+)”$/, (w, m) => w.otaOnly(m[1], m[2])],
  lit("stubReply"),
  [/^(.+) is running on the watch — /, (w, m) => w.appRunning(m[1])],
  [/^the watch refused (\S+): (.+)$/, (w, m) => w.refusedCmd(m[1], why(w, m[2]))],
  [/^the watch has (\d+) bytes, expected (\d+)$/, (w, m) => w.bytesMismatch(m[1], m[2])],
  [
    /^can't install this package: it needs app ABI (\S+), the watch's App Loader takes up to (\S+)$/,
    (w, m) => w.cantInstall(w.needsAbi(m[1], m[2])),
  ],
  [/^can't install this package: (.+)$/, (w, m) => w.cantInstall(why(w, m[1]))],
  [/^all (\d+) app slots are taken/, (w, m) => w.appSlotsTaken(m[1])],
];

/** One message from the watch connection, in the UI language; anything without a rule as it
 *  came. A status line's "error: " prefix stays as it is — lib/notice and the editor key on it. */
export function bleText(w: Words, text: string): string {
  const prefix = /^error:\s*(\w*Error:\s*)?/.exec(text)?.[0] ?? "";
  const body = text.slice(prefix.length);

  for (const [re, say] of RULES) {
    const m = re.exec(body);

    if (m) return (prefix ? "error: " : "") + say(w, m);
  }
  return text;
}
