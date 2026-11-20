// The watchface shelf, a face's showcase page, creator profiles and the Community page.
import { dict, plural } from "$lib/shared/i18n";

export const t = dict(
  {
    // market page: the filter menu and the empty shelves
    filters: "Filters",
    show: "Show",
    everyones: "Everyone's",
    mine: "Mine",
    liked: "Liked",
    device: "Device",
    allDevices: "All devices",
    sort: "Sort",
    topCreators: "Top creators",
    newest: "Newest",
    popular: "Popular",
    mostDownloaded: "Most downloaded",
    emptyMine: "Nothing here yet — create a watchface in the editor and hit Save.",
    emptyLiked: "You haven't liked anything yet — tap the heart on a watchface to keep it here.",
    emptyAll: "No community watchfaces yet — publish yours from the editor.",

    // watchface page
    watchface: "Watchface",
    share: "Share",
    like: "Like",
    signInToLike: "Sign in to like",
    showMain: "Show the main screen",
    showAod: "Show the always-on screen",
    toggleAod: "Toggle the always-on screen",
    byCreator: "Watchfaces by this creator",
    unknown: "Unknown",
    connecting: "Connecting…",
    connectToInstall: "Connect watch to install",
    installed: "Installed",
    installAgain: "Install again",
    installing: "Installing…",
    installWatchface: "Install watchface",
    edit: "Edit",
    download: "Download",
    likes: "Likes",
    downloads: "Downloads",
    flashed: "Flashed",
    publishedOn: (d: string) => `Published ${d}`,
    updatedOn: (d: string) => `updated ${d}`,
    notFound: "Watchface not found.",

    // profile page
    creator: "Creator",
    joined: (d: string) => `Joined ${d}`,
    editProfile: "Edit profile",
    watchfaces: "Watchfaces",
    nothingPublished: "Nothing published yet.",

    // creator-shelf
    noTopCreators: "No top creators yet — publish faces the community will love.",
    totals: (faces: number, downloads: number, likes: number) =>
      `${faces} ${faces === 1 ? "face" : "faces"} · ${downloads} downloads · ${likes} likes`,

    // watchface-card + watchface-list
    open: (name: string) => `Open ${name}`,
    published: "Published",
    draft: "Draft",
    more: "More",
    downloadBin: "Download .bin",
    publish: "Publish",
    unpublish: "Unpublish",
    delete: "Delete",
    nothingHere: "Nothing here yet.",
    confirmDelete: (name: string) => `Delete "${name}"?`,

    // community-panel
    joinCommunity: "Join the community",
    communityLead: "Meet other CMF Watch creators, share your work and get help.",
    comingSoon: "Coming soon",
    madeBy: (name: string) => `Made by ${name}`,
    authorLead: "Follow along for new features, previews and the occasional watchface.",
    links: {
      companion: {
        title: "FMC Companion phone app",
        description: "Watch faces, watch apps and firmware from your phone. Android and iOS beta.",
      },
      reddit: {
        title: "r/CMFWatchMods on Reddit",
        description: "Share your watchfaces, ask questions and see what others are making.",
      },
      discord: {
        title: "FMC Community on Discord",
        description:
          "Where the apps, firmware and tools are built. Findings, ideas, device testing.",
      },
      github: {
        title: "cmf-tech-community on GitHub",
        description: "The source of FMC, the app loader and SDK, and the firmware tools.",
      },
    } as Record<string, { title: string; description: string }>,

    // market model: what lands in the editor's error banner
    foreignFace:
      "this watchface belongs to someone else — export the .bin to start your own from it",
    saveFailed: (msg: string) => `save: ${msg}`,
    publishFailed: (msg: string) => `publish: ${msg}`,
  },
  {
    ru: {
      filters: "Фильтры",
      show: "Показать",
      everyones: "Все",
      mine: "Мои",
      liked: "Понравившиеся",
      device: "Устройство",
      allDevices: "Все устройства",
      sort: "Сортировка",
      topCreators: "Топ авторов",
      newest: "Новые",
      popular: "Популярные",
      mostDownloaded: "Больше скачиваний",
      emptyMine: "Здесь пока пусто — создайте циферблат в редакторе и нажмите «Сохранить».",
      emptyLiked:
        "Вы пока ничего не лайкнули — нажмите на сердечко у циферблата, и он появится здесь.",
      emptyAll: "Циферблатов от сообщества пока нет — опубликуйте свой из редактора.",

      watchface: "Циферблат",
      share: "Поделиться",
      like: "Нравится",
      signInToLike: "Войдите, чтобы поставить лайк",
      showMain: "Показать основной экран",
      showAod: "Показать экран Always-on",
      toggleAod: "Переключить экран Always-on",
      byCreator: "Циферблаты этого автора",
      unknown: "Неизвестно",
      connecting: "Подключение…",
      connectToInstall: "Подключите часы для установки",
      installed: "Установлен",
      installAgain: "Установить снова",
      installing: "Установка…",
      installWatchface: "Установить циферблат",
      edit: "Изменить",
      download: "Скачать",
      likes: "Лайки",
      downloads: "Скачивания",
      flashed: "Установки",
      publishedOn: (d) => `Опубликован ${d}`,
      updatedOn: (d) => `обновлён ${d}`,
      notFound: "Циферблат не найден.",

      creator: "Автор",
      joined: (d) => `Регистрация: ${d}`,
      editProfile: "Изменить профиль",
      watchfaces: "Циферблаты",
      nothingPublished: "Пока ничего не опубликовано.",

      noTopCreators:
        "Топ авторов пока пуст — публикуйте циферблаты, которые понравятся сообществу.",
      totals: (faces, downloads, likes) =>
        `${faces} ${plural("ru", faces, { one: "циферблат", few: "циферблата", many: "циферблатов" })} · ` +
        `${downloads} ${plural("ru", downloads, { one: "скачивание", few: "скачивания", many: "скачиваний" })} · ` +
        `${likes} ${plural("ru", likes, { one: "лайк", few: "лайка", many: "лайков" })}`,

      open: (name) => `Открыть ${name}`,
      published: "Опубликован",
      draft: "Черновик",
      more: "Ещё",
      downloadBin: "Скачать .bin",
      publish: "Опубликовать",
      unpublish: "Снять с публикации",
      delete: "Удалить",
      nothingHere: "Здесь пока пусто.",
      confirmDelete: (name) => `Удалить «${name}»?`,

      joinCommunity: "Присоединяйтесь к сообществу",
      communityLead:
        "Знакомьтесь с другими авторами для CMF Watch, делитесь работами и получайте помощь.",
      comingSoon: "Скоро",
      madeBy: (name) => `Автор — ${name}`,
      authorLead: "Новые функции, превью и иногда новые циферблаты.",
      links: {
        companion: {
          title: "Приложение FMC Companion",
          description:
            "Циферблаты, приложения и прошивки для часов с телефона. Android и бета для iOS.",
        },
        reddit: {
          title: "r/CMFWatchMods на Reddit",
          description: "Делитесь циферблатами, задавайте вопросы и смотрите, что делают другие.",
        },
        discord: {
          title: "FMC Community в Discord",
          description:
            "Здесь создаются приложения, прошивки и инструменты. Находки, идеи, тесты на часах.",
        },
        github: {
          title: "cmf-tech-community на GitHub",
          description: "Исходный код FMC, App Loader и SDK, инструменты для прошивок.",
        },
      },

      foreignFace:
        "этот циферблат принадлежит другому автору — экспортируйте .bin, чтобы сделать свой на его основе",
      saveFailed: (msg) => `сохранение: ${msg}`,
      publishFailed: (msg) => `публикация: ${msg}`,
    },
    uk: {
      filters: "Фільтри",
      show: "Показати",
      everyones: "Усі",
      mine: "Мої",
      liked: "Вподобані",
      device: "Пристрій",
      allDevices: "Усі пристрої",
      sort: "Сортування",
      topCreators: "Топ авторів",
      newest: "Нові",
      popular: "Популярні",
      mostDownloaded: "Найбільше завантажень",
      emptyMine: "Тут поки порожньо — створіть циферблат у редакторі й натисніть «Зберегти».",
      emptyLiked:
        "Ви ще нічого не вподобали — торкніться сердечка на циферблаті, і він з'явиться тут.",
      emptyAll: "Циферблатів від спільноти ще немає — опублікуйте свій із редактора.",

      watchface: "Циферблат",
      share: "Поділитися",
      like: "Подобається",
      signInToLike: "Увійдіть, щоб вподобати",
      showMain: "Показати основний екран",
      showAod: "Показати екран Always-on",
      toggleAod: "Перемкнути екран Always-on",
      byCreator: "Циферблати цього автора",
      unknown: "Невідомо",
      connecting: "Підключення…",
      connectToInstall: "Підключіть годинник, щоб встановити",
      installed: "Встановлено",
      installAgain: "Встановити знову",
      installing: "Встановлення…",
      installWatchface: "Встановити циферблат",
      edit: "Змінити",
      download: "Завантажити",
      likes: "Вподобання",
      downloads: "Завантаження",
      flashed: "Встановлення",
      publishedOn: (d) => `Опубліковано ${d}`,
      updatedOn: (d) => `оновлено ${d}`,
      notFound: "Циферблат не знайдено.",

      creator: "Автор",
      joined: (d) => `Реєстрація: ${d}`,
      editProfile: "Змінити профіль",
      watchfaces: "Циферблати",
      nothingPublished: "Ще нічого не опубліковано.",

      noTopCreators:
        "Топ авторів поки порожній — публікуйте циферблати, які сподобаються спільноті.",
      totals: (faces, downloads, likes) =>
        `${faces} ${plural("uk", faces, { one: "циферблат", few: "циферблати", many: "циферблатів" })} · ` +
        `${downloads} ${plural("uk", downloads, { one: "завантаження", few: "завантаження", many: "завантажень" })} · ` +
        `${likes} ${plural("uk", likes, { one: "вподобання", few: "вподобання", many: "вподобань" })}`,

      open: (name) => `Відкрити ${name}`,
      published: "Опубліковано",
      draft: "Чернетка",
      more: "Ще",
      downloadBin: "Завантажити .bin",
      publish: "Опублікувати",
      unpublish: "Зняти з публікації",
      delete: "Видалити",
      nothingHere: "Тут поки порожньо.",
      confirmDelete: (name) => `Видалити «${name}»?`,

      joinCommunity: "Приєднуйтеся до спільноти",
      communityLead:
        "Знайомтеся з іншими авторами для CMF Watch, діліться роботами й отримуйте допомогу.",
      comingSoon: "Незабаром",
      madeBy: (name) => `Автор — ${name}`,
      authorLead: "Нові функції, прев'ю та час від часу нові циферблати.",
      links: {
        companion: {
          title: "Застосунок FMC Companion",
          description:
            "Циферблати, застосунки й прошивки для годинника з телефона. Android і бета для iOS.",
        },
        reddit: {
          title: "r/CMFWatchMods на Reddit",
          description: "Діліться циферблатами, ставте запитання й дивіться, що роблять інші.",
        },
        discord: {
          title: "FMC Community в Discord",
          description:
            "Тут створюють застосунки, прошивки й інструменти. Знахідки, ідеї, тести на годинниках.",
        },
        github: {
          title: "cmf-tech-community на GitHub",
          description: "Вихідний код FMC, App Loader і SDK, інструменти для прошивок.",
        },
      },

      foreignFace:
        "цей циферблат належить іншому автору — експортуйте .bin, щоб зробити свій на його основі",
      saveFailed: (msg) => `збереження: ${msg}`,
      publishFailed: (msg) => `публікація: ${msg}`,
    },
    es: {
      filters: "Filtros",
      show: "Mostrar",
      everyones: "Todas",
      mine: "Mías",
      liked: "Me gustan",
      device: "Dispositivo",
      allDevices: "Todos los dispositivos",
      sort: "Orden",
      topCreators: "Mejores creadores",
      newest: "Más recientes",
      popular: "Populares",
      mostDownloaded: "Más descargadas",
      emptyMine: "Aún no hay nada — crea una esfera en el editor y pulsa Guardar.",
      emptyLiked: "Aún no te gusta nada — toca el corazón de una esfera para guardarla aquí.",
      emptyAll: "Aún no hay esferas de la comunidad — publica la tuya desde el editor.",

      watchface: "Esfera",
      share: "Compartir",
      like: "Me gusta",
      signInToLike: "Inicia sesión para dar me gusta",
      showMain: "Ver la pantalla principal",
      showAod: "Ver la pantalla siempre activa",
      toggleAod: "Alternar la pantalla siempre activa",
      byCreator: "Esferas de este creador",
      unknown: "Desconocido",
      connecting: "Conectando…",
      connectToInstall: "Conecta el reloj para instalar",
      installed: "Instalada",
      installAgain: "Reinstalar",
      installing: "Instalando…",
      installWatchface: "Instalar esfera",
      edit: "Editar",
      download: "Descargar",
      likes: "Me gusta",
      downloads: "Descargas",
      flashed: "Instalaciones",
      publishedOn: (d) => `Publicada el ${d}`,
      updatedOn: (d) => `actualizada el ${d}`,
      notFound: "Esfera no encontrada.",

      creator: "Creador",
      joined: (d) => `Se unió en ${d}`,
      editProfile: "Editar perfil",
      watchfaces: "Esferas",
      nothingPublished: "Aún no hay nada publicado.",

      noTopCreators: "Aún no hay mejores creadores — publica esferas que encanten a la comunidad.",
      totals: (faces, downloads, likes) =>
        `${faces} ${faces === 1 ? "esfera" : "esferas"} · ` +
        `${downloads} ${downloads === 1 ? "descarga" : "descargas"} · ${likes} me gusta`,

      open: (name) => `Abrir ${name}`,
      published: "Publicada",
      draft: "Borrador",
      more: "Más",
      downloadBin: "Descargar .bin",
      publish: "Publicar",
      unpublish: "Despublicar",
      delete: "Eliminar",
      nothingHere: "Aún no hay nada.",
      confirmDelete: (name) => `¿Eliminar «${name}»?`,

      joinCommunity: "Únete a la comunidad",
      communityLead: "Conoce a otros creadores de CMF Watch, comparte tu trabajo y recibe ayuda.",
      comingSoon: "Próximamente",
      madeBy: (name) => `Hecho por ${name}`,
      authorLead: "Síguelo para ver funciones nuevas, avances y alguna que otra esfera.",
      links: {
        companion: {
          title: "App FMC Companion",
          description:
            "Esferas, apps y firmware para el reloj desde tu teléfono. Android y beta de iOS.",
        },
        reddit: {
          title: "r/CMFWatchMods en Reddit",
          description: "Comparte tus esferas, haz preguntas y mira lo que hacen otros.",
        },
        discord: {
          title: "FMC Community en Discord",
          description:
            "Donde se crean las apps, el firmware y las herramientas. Hallazgos, ideas, pruebas en relojes.",
        },
        github: {
          title: "cmf-tech-community en GitHub",
          description: "El código de FMC, el App Loader y el SDK, y las herramientas de firmware.",
        },
      },

      foreignFace:
        "esta esfera es de otra persona — exporta el .bin para crear la tuya a partir de ella",
      saveFailed: (msg) => `guardar: ${msg}`,
      publishFailed: (msg) => `publicar: ${msg}`,
    },
    hi: {
      filters: "फ़िल्टर",
      show: "दिखाएं",
      everyones: "सभी के",
      mine: "मेरे",
      liked: "पसंद किए",
      device: "डिवाइस",
      allDevices: "सभी डिवाइस",
      sort: "क्रम",
      topCreators: "टॉप क्रिएटर",
      newest: "नए",
      popular: "लोकप्रिय",
      mostDownloaded: "सबसे ज़्यादा डाउनलोड",
      emptyMine: "अभी यहां कुछ नहीं है — एडिटर में वॉच फ़ेस बनाएं और सेव करें।",
      emptyLiked: "आपने अभी कुछ पसंद नहीं किया — किसी वॉच फ़ेस पर दिल टैप करें, वह यहां दिखेगा।",
      emptyAll: "समुदाय के वॉच फ़ेस अभी नहीं हैं — एडिटर से अपना प्रकाशित करें।",

      watchface: "वॉच फ़ेस",
      share: "शेयर करें",
      like: "पसंद करें",
      signInToLike: "पसंद करने के लिए साइन इन करें",
      showMain: "मुख्य स्क्रीन दिखाएं",
      showAod: "ऑलवेज़-ऑन स्क्रीन दिखाएं",
      toggleAod: "ऑलवेज़-ऑन स्क्रीन बदलें",
      byCreator: "इस क्रिएटर के वॉच फ़ेस",
      unknown: "अज्ञात",
      connecting: "कनेक्ट हो रहा है…",
      connectToInstall: "इंस्टॉल के लिए घड़ी कनेक्ट करें",
      installed: "इंस्टॉल है",
      installAgain: "फिर से इंस्टॉल करें",
      installing: "इंस्टॉल हो रहा है…",
      installWatchface: "वॉच फ़ेस इंस्टॉल करें",
      edit: "बदलें",
      download: "डाउनलोड",
      likes: "लाइक",
      downloads: "डाउनलोड",
      flashed: "इंस्टॉल",
      publishedOn: (d) => `${d} को प्रकाशित`,
      updatedOn: (d) => `${d} को अपडेट`,
      notFound: "वॉच फ़ेस नहीं मिला।",

      creator: "क्रिएटर",
      joined: (d) => `${d} से सदस्य`,
      editProfile: "प्रोफ़ाइल बदलें",
      watchfaces: "वॉच फ़ेस",
      nothingPublished: "अभी कुछ प्रकाशित नहीं हुआ।",

      noTopCreators: "अभी कोई टॉप क्रिएटर नहीं — ऐसे फ़ेस प्रकाशित करें जो समुदाय को पसंद आएं।",
      totals: (faces, downloads, likes) => `${faces} फ़ेस · ${downloads} डाउनलोड · ${likes} लाइक`,

      open: (name) => `${name} खोलें`,
      published: "प्रकाशित",
      draft: "ड्राफ़्ट",
      more: "और",
      downloadBin: ".bin डाउनलोड करें",
      publish: "प्रकाशित करें",
      unpublish: "अप्रकाशित करें",
      delete: "हटाएं",
      nothingHere: "अभी यहां कुछ नहीं है।",
      confirmDelete: (name) => `"${name}" हटाएं?`,

      joinCommunity: "समुदाय से जुड़ें",
      communityLead: "CMF Watch के दूसरे क्रिएटर से मिलें, अपना काम शेयर करें और मदद पाएं।",
      comingSoon: "जल्द आ रहा है",
      madeBy: (name) => `${name} ने बनाया`,
      authorLead: "नए फ़ीचर, प्रीव्यू और कभी-कभार नए वॉच फ़ेस के लिए फ़ॉलो करें।",
      links: {
        companion: {
          title: "FMC Companion फ़ोन ऐप",
          description: "फ़ोन से वॉच फ़ेस, घड़ी के ऐप और फ़र्मवेयर। Android और iOS बीटा।",
        },
        reddit: {
          title: "Reddit पर r/CMFWatchMods",
          description: "अपने वॉच फ़ेस शेयर करें, सवाल पूछें और देखें कि दूसरे क्या बना रहे हैं।",
        },
        discord: {
          title: "Discord पर FMC Community",
          description: "जहां ऐप, फ़र्मवेयर और टूल बनते हैं। खोजें, आइडिया, घड़ी पर टेस्टिंग।",
        },
        github: {
          title: "GitHub पर cmf-tech-community",
          description: "FMC, App Loader और SDK का सोर्स कोड, और फ़र्मवेयर टूल।",
        },
      },

      foreignFace: "यह वॉच फ़ेस किसी और का है — इससे अपना बनाने के लिए .bin एक्सपोर्ट करें",
      saveFailed: (msg) => `सेव: ${msg}`,
      publishFailed: (msg) => `प्रकाशन: ${msg}`,
    },
  },
);
