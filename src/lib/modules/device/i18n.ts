import { dict, plural } from "$lib/shared/i18n";
import helpEn from "./pages/troubleshooting.md?raw";
import helpRu from "./pages/troubleshooting.ru.md?raw";
import helpUk from "./pages/troubleshooting.uk.md?raw";
import helpEs from "./pages/troubleshooting.es.md?raw";
import helpHi from "./pages/troubleshooting.hi.md?raw";

export const t = dict(
  {
    // watch-sheet
    connectYourWatch: "Connect your watch",
    overWebBluetooth: "CMF Watch Pro 2 / Pro 3 over Web Bluetooth.",
    connecting: "Connecting…",
    connect: "Connect",
    forgetHint:
      "Clear Chrome's device permission and the saved auth key — does not affect pairing state on the watch itself",
    forgetting: "Forgetting…",
    forgetDevice: "Forget device",
    beforeYouConnect: "Before you connect",
    noteOneApp:
      "The watch talks to one app at a time. Close Nothing X before you connect, and close this tab when you're done.",
    noteInstaller:
      "Watchfaces go through the watch's own installer, and the watch can refuse them.",
    noteIphoneBefore: "On an iPhone, use ",
    noteIphoneAfter:
      ", and first swipe away every app that holds the watch, like Nothing X or a fitness app. In Settings → Bluetooth the watch should read Not Connected.",
    noteNothingX:
      "If Nothing X loses the watch afterwards, pair it again. Turn Bluetooth off and on, forget the watch, add it back.",
    readFullNotes: "Read the full notes",
    copyLog: "Copy log",
    battery: "Battery",
    firmware: "Firmware",
    serial: "Serial",
    developer: "Developer",
    watchfacesOnWatch: (used: number, capacity: number) =>
      `Watchfaces on the watch (${used} of ${capacity})`,
    reportedNone: "the watch reported none",
    companionApp: "FMC Companion mobile app",
    // watch-selector
    removeFromList: (name: string) => `Remove ${name} from this list`,
    removeHint: "Deleted it on the watch? FMC can't see that. Remove it from this list.",
    // size-dialog / slot-dialog
    tooBig: "This face may be too big for the watch",
    cancel: "Cancel",
    installAnyway: "Install anyway",
    watchFull: "The watch is full",
    pickToReplace:
      "Pick the watchface to replace — its slot number matches the order the watch shows them in.",
    // dev-sheet
    onTheWatch: "On the watch",
    connectFirst: "Connect the watch first.",
    checkingWatch: "Checking the watch…",
    stockNoStub: "Stock firmware — no App Loader stub, apps can't go on.",
    slot: (n: string) => `Slot ${n}`,
    localBuild: "Local build",
    localBuildDesc:
      "An app or App Loader .wp2app, or a firmware image, from your disk — through the same checks as the store. After a rebuild, Install again sends the new file.",
    anotherFile: "Another file",
    pickFile: "Pick a file",
    installAgain: "Install again",
    install: "Install",
    fileMeta: (kb: string, time: string) => `${kb} KB, modified ${time}`,
    firmwareRisk:
      "A firmware image can brick the watch. Battery at 50% or more, on the charger, tab open until it's done.",
    acceptRisk: "I accept the risk",
    installingOnWatch: "Installing on the watch",
    isOnWatch: (name: string) => `${name} is on the watch.`,
    sentRestarts: "Sent. The watch installs it and restarts.",
    // ble.model / dev.model / rescue.model
    connectFirstErr: "connect the watch first",
    lowBattery: (battery: number, min: number) =>
      `battery at ${battery}% — charge it to ${min}% and keep it on the charger`,
    stockFirmwareErr: "the watch runs stock firmware — flash the patched firmware first",
    forgot: (n: number) => `forgot ${n} device(s) — connect to pick again`,
    nothingToForget: "nothing to forget",
    filePickerDesc: "App package or firmware image",
    sendingReset: "sending factory reset…",
    // rescue page
    rescueTitle: "Rescue — FMC",
    rescue: "Rescue",
    rescueIntro:
      "For a watch that shows the CMF logo, goes black and stays there, but still shows up in the Bluetooth picker. This sends the watch a <strong>factory reset</strong> and nothing else: no file, no sync. Everything on the watch is wiped, including the face that broke it.",
    rescueBrowser:
      "Use the same browser you installed the face from — pairing needs a tap on the watch, and the key saved from that install is the only way around a screen that doesn't light up. Close Nothing X first so it isn't holding the watch.",
    factoryReset: "Factory reset the watch",
    rescueSent: (href: string) =>
      `Sent. The watch should restart on its own within a minute. If it does, or if the step above is where it stopped, <a href="${href}">tell us</a> — nobody has confirmed this path yet.`,
    sendLog: "Whatever happened, send us this log:",
    backToBefore: "Back to “Before you connect”",
    // troubleshooting page
    helpTitle: "Before you connect — FMC",
    helpDescription:
      "What FMC does to your CMF watch, what it cannot do, and how to fix the Bluetooth conflict with the Nothing X app.",
    help: helpEn,
    backToFaces: "Back to the watchfaces",
  },
  {
    ru: {
      connectYourWatch: "Подключите часы",
      overWebBluetooth: "CMF Watch Pro 2 / Pro 3 через Web Bluetooth.",
      connecting: "Подключение…",
      connect: "Подключить",
      forgetHint:
        "Сбросить разрешение Chrome на устройство и сохранённый ключ — сопряжение на самих часах не меняется",
      forgetting: "Сброс…",
      forgetDevice: "Забыть устройство",
      beforeYouConnect: "Перед подключением",
      noteOneApp:
        "Часы работают только с одним приложением за раз. Закройте Nothing X перед подключением, а когда закончите — эту вкладку.",
      noteInstaller: "Циферблаты ставит штатный установщик часов, и часы могут их отклонить.",
      noteIphoneBefore: "На iPhone используйте ",
      noteIphoneAfter:
        ", а сначала смахните все приложения, которые держат часы, например Nothing X или фитнес-приложение. В Настройки → Bluetooth у часов должно быть «Не подключено».",
      noteNothingX:
        "Если потом Nothing X перестанет видеть часы, подключите их заново: выключите и включите Bluetooth, забудьте часы и добавьте снова.",
      readFullNotes: "Подробнее",
      copyLog: "Скопировать лог",
      battery: "Батарея",
      firmware: "Прошивка",
      serial: "Серийный №",
      developer: "Разработчик",
      watchfacesOnWatch: (used: number, capacity: number) =>
        `Циферблаты на часах (${used} из ${capacity})`,
      reportedNone: "часы не сообщили ни одного",
      companionApp: "Мобильное приложение FMC Companion",
      removeFromList: (name: string) => `Убрать ${name} из списка`,
      removeHint: "Удалили его на часах? FMC этого не видит. Уберите его из списка.",
      tooBig: "Циферблат может оказаться слишком большим для часов",
      cancel: "Отмена",
      installAnyway: "Всё равно установить",
      watchFull: "На часах нет места",
      pickToReplace: "Выберите циферблат для замены — номер слота совпадает с порядком на часах.",
      onTheWatch: "На часах",
      connectFirst: "Сначала подключите часы.",
      checkingWatch: "Проверяем часы…",
      stockNoStub: "Стоковая прошивка — без stub от App Loader приложения не установить.",
      slot: (n: string) => `Слот ${n}`,
      localBuild: "Локальная сборка",
      localBuildDesc:
        "Приложение или App Loader в .wp2app либо образ прошивки с диска — с теми же проверками, что и в магазине. После пересборки «Установить снова» отправит новый файл.",
      anotherFile: "Другой файл",
      pickFile: "Выбрать файл",
      installAgain: "Установить снова",
      install: "Установить",
      fileMeta: (kb: string, time: string) => `${kb} КБ, изменён в ${time}`,
      firmwareRisk:
        "Образ прошивки может превратить часы в кирпич. Заряд от 50%, часы на зарядке, вкладка открыта до конца установки.",
      acceptRisk: "Я принимаю риск",
      installingOnWatch: "Установка на часы",
      isOnWatch: (name: string) => `«${name}» уже на часах.`,
      sentRestarts: "Отправлено. Часы установят прошивку и перезагрузятся.",
      connectFirstErr: "сначала подключите часы",
      lowBattery: (battery: number, min: number) =>
        `заряд ${battery}% — зарядите до ${min}% и оставьте на зарядке`,
      stockFirmwareErr: "на часах стоковая прошивка — сначала установите патченую",
      forgot: (n: number) =>
        `забыто ${n} ${plural("ru", n, { one: "устройство", few: "устройства", many: "устройств" })} — подключитесь, чтобы выбрать снова`,
      nothingToForget: "забывать нечего",
      filePickerDesc: "Пакет приложения или образ прошивки",
      sendingReset: "отправка сброса до заводских настроек…",
      rescueTitle: "Восстановление — FMC",
      rescue: "Восстановление",
      rescueIntro:
        "Для часов, которые показывают логотип CMF, гаснут и так и остаются, но всё ещё видны в списке Bluetooth. Здесь часам отправляется <strong>сброс до заводских настроек</strong> и больше ничего: ни файлов, ни синхронизации. С часов стирается всё, включая циферблат, который их сломал.",
      rescueBrowser:
        "Используйте тот же браузер, из которого ставили циферблат: для сопряжения нужно нажать на часах, а ключ, сохранённый при той установке, — единственный способ обойти неработающий экран. Сначала закройте Nothing X, чтобы оно не держало часы.",
      factoryReset: "Сбросить часы до заводских",
      rescueSent: (href: string) =>
        `Отправлено. Часы должны сами перезагрузиться в течение минуты. Если так и вышло или всё остановилось на шаге выше, <a href="${href}">напишите нам</a> — этот путь ещё никто не подтвердил.`,
      sendLog: "Что бы ни случилось, пришлите нам этот лог:",
      backToBefore: "Назад к «Перед подключением»",
      helpTitle: "Перед подключением — FMC",
      helpDescription:
        "Что FMC делает с вашими часами CMF, чего он не умеет и как решить конфликт Bluetooth с приложением Nothing X.",
      help: helpRu,
      backToFaces: "К циферблатам",
    },
    uk: {
      connectYourWatch: "Підключіть годинник",
      overWebBluetooth: "CMF Watch Pro 2 / Pro 3 через Web Bluetooth.",
      connecting: "Підключення…",
      connect: "Підключити",
      forgetHint:
        "Скинути дозвіл Chrome на пристрій і збережений ключ — сполучення на самому годиннику не зміниться",
      forgetting: "Скидання…",
      forgetDevice: "Забути пристрій",
      beforeYouConnect: "Перед підключенням",
      noteOneApp:
        "Годинник працює лише з одним застосунком водночас. Закрийте Nothing X перед підключенням, а коли закінчите — цю вкладку.",
      noteInstaller:
        "Циферблати встановлює власний інсталятор годинника, і годинник може їх відхилити.",
      noteIphoneBefore: "На iPhone користуйтеся ",
      noteIphoneAfter:
        ", а спершу змахніть усі застосунки, що тримають годинник, як-от Nothing X чи фітнес-застосунок. У Параметри → Bluetooth годинник має бути «Не під’єднано».",
      noteNothingX:
        "Якщо потім Nothing X перестане бачити годинник, сполучіть його знову: вимкніть і ввімкніть Bluetooth, забудьте годинник і додайте ще раз.",
      readFullNotes: "Докладніше",
      copyLog: "Скопіювати лог",
      battery: "Батарея",
      firmware: "Прошивка",
      serial: "Серійний №",
      developer: "Розробник",
      watchfacesOnWatch: (used: number, capacity: number) =>
        `Циферблати на годиннику (${used} з ${capacity})`,
      reportedNone: "годинник не повідомив жодного",
      companionApp: "Мобільний застосунок FMC Companion",
      removeFromList: (name: string) => `Прибрати ${name} зі списку`,
      removeHint: "Видалили його на годиннику? FMC цього не бачить. Приберіть його зі списку.",
      tooBig: "Циферблат може бути завеликим для годинника",
      cancel: "Скасувати",
      installAnyway: "Усе одно встановити",
      watchFull: "На годиннику немає місця",
      pickToReplace:
        "Виберіть циферблат для заміни — номер слота збігається з порядком на годиннику.",
      onTheWatch: "На годиннику",
      connectFirst: "Спершу підключіть годинник.",
      checkingWatch: "Перевіряємо годинник…",
      stockNoStub: "Стокова прошивка — без stub від App Loader застосунки не встановити.",
      slot: (n: string) => `Слот ${n}`,
      localBuild: "Локальна збірка",
      localBuildDesc:
        "Застосунок чи App Loader у .wp2app або образ прошивки з диска — з тими самими перевірками, що й у магазині. Після перезбирання «Встановити знову» надішле новий файл.",
      anotherFile: "Інший файл",
      pickFile: "Вибрати файл",
      installAgain: "Встановити знову",
      install: "Встановити",
      fileMeta: (kb: string, time: string) => `${kb} КБ, змінено о ${time}`,
      firmwareRisk:
        "Образ прошивки може перетворити годинник на цеглину. Заряд від 50%, годинник на зарядці, вкладка відкрита до кінця встановлення.",
      acceptRisk: "Я приймаю ризик",
      installingOnWatch: "Встановлення на годинник",
      isOnWatch: (name: string) => `«${name}» уже на годиннику.`,
      sentRestarts: "Надіслано. Годинник установить прошивку й перезавантажиться.",
      connectFirstErr: "спершу підключіть годинник",
      lowBattery: (battery: number, min: number) =>
        `заряд ${battery}% — зарядіть до ${min}% і залиште на зарядці`,
      stockFirmwareErr: "на годиннику стокова прошивка — спершу встановіть патчену",
      forgot: (n: number) =>
        `забуто ${n} ${plural("uk", n, { one: "пристрій", few: "пристрої", many: "пристроїв" })} — підключіться, щоб вибрати знову`,
      nothingToForget: "нічого забувати",
      filePickerDesc: "Пакет застосунку або образ прошивки",
      sendingReset: "надсилання скидання до заводських налаштувань…",
      rescueTitle: "Відновлення — FMC",
      rescue: "Відновлення",
      rescueIntro:
        "Для годинника, який показує логотип CMF, гасне й так і лишається, але досі видимий у списку Bluetooth. Тут годиннику надсилається <strong>скидання до заводських налаштувань</strong> і більше нічого: ні файлів, ні синхронізації. З годинника стирається все, зокрема циферблат, що його зламав.",
      rescueBrowser:
        "Використовуйте той самий браузер, з якого встановлювали циферблат: для сполучення треба торкнутися годинника, а ключ, збережений під час того встановлення, — єдиний спосіб обійти екран, що не світиться. Спершу закрийте Nothing X, щоб він не тримав годинник.",
      factoryReset: "Скинути годинник до заводських",
      rescueSent: (href: string) =>
        `Надіслано. Годинник має сам перезавантажитися протягом хвилини. Якщо так і сталося або все зупинилося на кроці вище, <a href="${href}">напишіть нам</a> — цей шлях ще ніхто не підтвердив.`,
      sendLog: "Хай що сталося, надішліть нам цей лог:",
      backToBefore: "Назад до «Перед підключенням»",
      helpTitle: "Перед підключенням — FMC",
      helpDescription:
        "Що FMC робить з вашим годинником CMF, чого він не вміє і як усунути конфлікт Bluetooth із застосунком Nothing X.",
      help: helpUk,
      backToFaces: "До циферблатів",
    },
    es: {
      connectYourWatch: "Conecta tu reloj",
      overWebBluetooth: "CMF Watch Pro 2 / Pro 3 por Web Bluetooth.",
      connecting: "Conectando…",
      connect: "Conectar",
      forgetHint:
        "Borra el permiso del dispositivo en Chrome y la clave guardada — no cambia el emparejamiento en el propio reloj",
      forgetting: "Olvidando…",
      forgetDevice: "Olvidar dispositivo",
      beforeYouConnect: "Antes de conectar",
      noteOneApp:
        "El reloj habla con una sola app a la vez. Cierra Nothing X antes de conectar y cierra esta pestaña cuando termines.",
      noteInstaller:
        "Las esferas pasan por el instalador del propio reloj, y el reloj puede rechazarlas.",
      noteIphoneBefore: "En iPhone, usa ",
      noteIphoneAfter:
        " y antes cierra del todo cada app que tenga el reloj, como Nothing X o una app de fitness. En Ajustes → Bluetooth el reloj debe decir No conectado.",
      noteNothingX:
        "Si después Nothing X pierde el reloj, vuelve a emparejarlo: apaga y enciende el Bluetooth, olvida el reloj y agrégalo de nuevo.",
      readFullNotes: "Leer las notas completas",
      copyLog: "Copiar registro",
      battery: "Batería",
      firmware: "Firmware",
      serial: "N.º de serie",
      developer: "Desarrollador",
      watchfacesOnWatch: (used: number, capacity: number) =>
        `Esferas en el reloj (${used} de ${capacity})`,
      reportedNone: "el reloj no informó ninguna",
      companionApp: "App móvil FMC Companion",
      removeFromList: (name: string) => `Quitar ${name} de esta lista`,
      removeHint: "¿La borraste en el reloj? FMC no puede verlo. Quítala de esta lista.",
      tooBig: "Esta esfera puede ser demasiado grande para el reloj",
      cancel: "Cancelar",
      installAnyway: "Instalar igual",
      watchFull: "El reloj está lleno",
      pickToReplace:
        "Elige la esfera que quieres reemplazar — su número de ranura coincide con el orden en que el reloj las muestra.",
      onTheWatch: "En el reloj",
      connectFirst: "Primero conecta el reloj.",
      checkingWatch: "Revisando el reloj…",
      stockNoStub: "Firmware de fábrica — sin el stub de App Loader no se pueden instalar apps.",
      slot: (n: string) => `Ranura ${n}`,
      localBuild: "Build local",
      localBuildDesc:
        "Una app o App Loader en .wp2app, o una imagen de firmware, desde tu disco — con las mismas comprobaciones que la tienda. Tras recompilar, Instalar de nuevo envía el archivo nuevo.",
      anotherFile: "Otro archivo",
      pickFile: "Elegir archivo",
      installAgain: "Instalar de nuevo",
      install: "Instalar",
      fileMeta: (kb: string, time: string) => `${kb} KB, modificado a las ${time}`,
      firmwareRisk:
        "Una imagen de firmware puede dejar el reloj inservible. Batería al 50 % o más, en el cargador y la pestaña abierta hasta que termine.",
      acceptRisk: "Acepto el riesgo",
      installingOnWatch: "Instalando en el reloj",
      isOnWatch: (name: string) => `${name} ya está en el reloj.`,
      sentRestarts: "Enviado. El reloj lo instala y se reinicia.",
      connectFirstErr: "primero conecta el reloj",
      lowBattery: (battery: number, min: number) =>
        `batería al ${battery} % — cárgalo hasta el ${min} % y déjalo en el cargador`,
      stockFirmwareErr:
        "el reloj tiene el firmware de fábrica — instala primero el firmware modificado",
      forgot: (n: number) =>
        `${n} ${plural("es", n, { one: "dispositivo olvidado", other: "dispositivos olvidados" })} — conecta para elegir de nuevo`,
      nothingToForget: "no hay nada que olvidar",
      filePickerDesc: "Paquete de app o imagen de firmware",
      sendingReset: "enviando restablecimiento de fábrica…",
      rescueTitle: "Rescate — FMC",
      rescue: "Rescate",
      rescueIntro:
        "Para un reloj que muestra el logo de CMF, se pone en negro y se queda así, pero sigue apareciendo en el selector de Bluetooth. Esto le envía al reloj un <strong>restablecimiento de fábrica</strong> y nada más: ni archivos ni sincronización. Se borra todo lo que hay en el reloj, incluida la esfera que lo rompió.",
      rescueBrowser:
        "Usa el mismo navegador desde el que instalaste la esfera — el emparejamiento pide un toque en el reloj, y la clave guardada en esa instalación es la única forma de saltarse una pantalla que no enciende. Cierra antes Nothing X para que no retenga el reloj.",
      factoryReset: "Restablecer el reloj de fábrica",
      rescueSent: (href: string) =>
        `Enviado. El reloj debería reiniciarse solo en menos de un minuto. Si lo hace, o si se quedó en el paso de arriba, <a href="${href}">cuéntanos</a> — nadie ha confirmado todavía este camino.`,
      sendLog: "Pase lo que pase, envíanos este registro:",
      backToBefore: "Volver a «Antes de conectar»",
      helpTitle: "Antes de conectar — FMC",
      helpDescription:
        "Qué le hace FMC a tu reloj CMF, qué no puede hacer y cómo resolver el conflicto de Bluetooth con la app Nothing X.",
      help: helpEs,
      backToFaces: "Volver a las esferas",
    },
    hi: {
      connectYourWatch: "अपनी घड़ी कनेक्ट करें",
      overWebBluetooth: "CMF Watch Pro 2 / Pro 3, Web Bluetooth से।",
      connecting: "कनेक्ट हो रहा है…",
      connect: "कनेक्ट करें",
      forgetHint:
        "Chrome की डिवाइस अनुमति और सेव की गई कुंजी हटाता है — घड़ी पर पेयरिंग पर इसका असर नहीं पड़ता",
      forgetting: "भुलाया जा रहा है…",
      forgetDevice: "डिवाइस भूलें",
      beforeYouConnect: "कनेक्ट करने से पहले",
      noteOneApp:
        "घड़ी एक समय में एक ही ऐप से बात करती है। कनेक्ट करने से पहले Nothing X बंद करें, और काम पूरा होने पर यह टैब बंद करें।",
      noteInstaller: "वॉचफ़ेस घड़ी के अपने इंस्टॉलर से जाते हैं, और घड़ी उन्हें मना कर सकती है।",
      noteIphoneBefore: "iPhone पर ",
      noteIphoneAfter:
        " इस्तेमाल करें, और पहले हर वह ऐप स्वाइप करके बंद करें जो घड़ी से जुड़ा है, जैसे Nothing X या कोई फ़िटनेस ऐप। Settings → Bluetooth में घड़ी Not Connected दिखनी चाहिए।",
      noteNothingX:
        "अगर बाद में Nothing X घड़ी को नहीं ढूंढ पाता, तो उसे फिर से पेयर करें। Bluetooth बंद करके चालू करें, घड़ी को भूलें, फिर से जोड़ें।",
      readFullNotes: "पूरे नोट्स पढ़ें",
      copyLog: "लॉग कॉपी करें",
      battery: "बैटरी",
      firmware: "फ़र्मवेयर",
      serial: "सीरियल",
      developer: "डेवलपर",
      watchfacesOnWatch: (used: number, capacity: number) =>
        `घड़ी पर वॉचफ़ेस (${capacity} में से ${used})`,
      reportedNone: "घड़ी ने कोई नहीं बताया",
      companionApp: "FMC Companion मोबाइल ऐप",
      removeFromList: (name: string) => `${name} को इस सूची से हटाएं`,
      removeHint: "घड़ी पर हटा दिया? FMC यह नहीं देख सकता। इसे इस सूची से हटाएं।",
      tooBig: "यह वॉचफ़ेस घड़ी के लिए बहुत बड़ा हो सकता है",
      cancel: "रद्द करें",
      installAnyway: "फिर भी इंस्टॉल करें",
      watchFull: "घड़ी भर गई है",
      pickToReplace: "बदलने के लिए वॉचफ़ेस चुनें — उसका स्लॉट नंबर घड़ी पर दिखने वाले क्रम से मेल खाता है।",
      onTheWatch: "घड़ी पर",
      connectFirst: "पहले घड़ी कनेक्ट करें।",
      checkingWatch: "घड़ी जांची जा रही है…",
      stockNoStub: "स्टॉक फ़र्मवेयर — App Loader stub नहीं है, ऐप्स इंस्टॉल नहीं हो सकते।",
      slot: (n: string) => `स्लॉट ${n}`,
      localBuild: "लोकल बिल्ड",
      localBuildDesc:
        "आपकी डिस्क से कोई ऐप या App Loader .wp2app, या फ़र्मवेयर इमेज — स्टोर जैसी ही जांच के साथ। दोबारा बिल्ड करने के बाद, “फिर से इंस्टॉल करें” नई फ़ाइल भेजता है।",
      anotherFile: "दूसरी फ़ाइल",
      pickFile: "फ़ाइल चुनें",
      installAgain: "फिर से इंस्टॉल करें",
      install: "इंस्टॉल करें",
      fileMeta: (kb: string, time: string) => `${kb} KB, ${time} पर बदली गई`,
      firmwareRisk:
        "फ़र्मवेयर इमेज घड़ी को हमेशा के लिए खराब (ब्रिक) कर सकती है। बैटरी 50% या ज़्यादा हो, घड़ी चार्जर पर हो, और काम पूरा होने तक टैब खुला रहे।",
      acceptRisk: "जोखिम मुझे मंज़ूर है",
      installingOnWatch: "घड़ी पर इंस्टॉल हो रहा है",
      isOnWatch: (name: string) => `${name} घड़ी पर है।`,
      sentRestarts: "भेज दिया। घड़ी इसे इंस्टॉल करके रीस्टार्ट होगी।",
      connectFirstErr: "पहले घड़ी कनेक्ट करें",
      lowBattery: (battery: number, min: number) =>
        `बैटरी ${battery}% है — इसे ${min}% तक चार्ज करें और चार्जर पर ही रखें`,
      stockFirmwareErr: "घड़ी पर स्टॉक फ़र्मवेयर है — पहले पैच किया हुआ फ़र्मवेयर फ़्लैश करें",
      forgot: (n: number) => `${n} डिवाइस भुला दिए गए — फिर से चुनने के लिए कनेक्ट करें`,
      nothingToForget: "भूलने के लिए कुछ नहीं है",
      filePickerDesc: "ऐप पैकेज या फ़र्मवेयर इमेज",
      sendingReset: "फ़ैक्टरी रीसेट भेजा जा रहा है…",
      rescueTitle: "रेस्क्यू — FMC",
      rescue: "रेस्क्यू",
      rescueIntro:
        "उस घड़ी के लिए जो CMF लोगो दिखाकर काली हो जाती है और वैसी ही रहती है, लेकिन Bluetooth पिकर में अब भी दिखती है। यह घड़ी को सिर्फ़ <strong>फ़ैक्टरी रीसेट</strong> भेजता है, और कुछ नहीं: न कोई फ़ाइल, न सिंक। घड़ी पर सब कुछ मिट जाता है, उस वॉचफ़ेस समेत जिसने उसे खराब किया।",
      rescueBrowser:
        "वही ब्राउज़र इस्तेमाल करें जिससे आपने वॉचफ़ेस इंस्टॉल किया था — पेयरिंग के लिए घड़ी पर टैप करना पड़ता है, और उस इंस्टॉल में सेव हुई कुंजी ही ऐसी स्क्रीन से बचने का एकमात्र तरीका है जो जलती नहीं। पहले Nothing X बंद करें ताकि वह घड़ी को पकड़े न रहे।",
      factoryReset: "घड़ी को फ़ैक्टरी रीसेट करें",
      rescueSent: (href: string) =>
        `भेज दिया। घड़ी को एक मिनट के अंदर अपने आप रीस्टार्ट होना चाहिए। अगर ऐसा होता है, या ऊपर वाले चरण पर ही रुक जाता है, तो <a href="${href}">हमें बताएं</a> — अभी तक किसी ने इस तरीके की पुष्टि नहीं की है।`,
      sendLog: "जो भी हुआ हो, हमें यह लॉग भेजें:",
      backToBefore: "“कनेक्ट करने से पहले” पर वापस",
      helpTitle: "कनेक्ट करने से पहले — FMC",
      helpDescription:
        "FMC आपकी CMF घड़ी के साथ क्या करता है, क्या नहीं कर सकता, और Nothing X ऐप के साथ Bluetooth की टक्कर कैसे ठीक करें।",
      help: helpHi,
      backToFaces: "वॉचफ़ेस पर वापस",
    },
  },
);
