# Política de privacidad

Última actualización: 18 de noviembre de 2026

Abarca fmc.tools y la app FMC Companion.

## fmc.tools

El sitio cuenta eventos anónimos con Aptabase, que alojamos nosotros mismos: páginas abiertas, una esfera vista, el editor
abierto, un reloj conectado y una esfera instalada. Sin cookies, sin guardar la dirección IP, sin id de dispositivo. Si creas una
cuenta, fmc.tools guarda tu correo, nombre, avatar, las esferas que subes y tus me gusta. La instalación en un reloj desde el
sitio ocurre en tu navegador por Web Bluetooth; no se nos envía nada sobre el reloj.

## FMC Companion

FMC Companion (iOS y Android) instala esferas, firmware y apps en el CMF Watch Pro 2 y pasa datos
entre el teléfono y las apps del reloj. No tiene anuncios ni rastreo, y no vende ni comparte tus datos.
Cuenta eventos de uso anónimos (ver abajo).

### Lo que se queda en tu teléfono y tu reloj

- **Bluetooth.** La app se comunica con tu reloj por Bluetooth. Las claves del reloj y la lista de esferas que tiene se guardan
  en el teléfono.
- **Permisos que das a las apps del reloj.** Tus respuestas se guardan solo en el teléfono. Si borras una app del reloj
  con FMC Companion, se olvidan.
- **Calendario.** Si permites que una app del reloj use tus calendarios, los próximos eventos se leen en el teléfono y se envían
  al reloj por Bluetooth. No se envían a ningún otro sitio.
- **Notificaciones (Android).** Si permites que una app del reloj use las notificaciones, su texto se envía solo al reloj.

### Lo que sale del teléfono

- **fmc.tools.** El catálogo de esferas, apps y firmware viene de fmc.tools. Si inicias sesión, tu cuenta de fmc.tools
  (correo, nombre, avatar) y tus me gusta los gestiona fmc.tools según sus propios términos.
- **Clima y ciudad.** Si permites que una app del reloj use la ubicación o el clima, la ubicación del teléfono se usa para obtener
  el clima y el nombre de la ciudad. En iOS esto pasa por WeatherKit y el geocodificador de Apple; en Android, por
  Open-Meteo (ubicación redondeada a unos 1 km) y el geocodificador del sistema. El reloj recibe solo la ciudad y el
  clima, con la ubicación redondeada a unos 10 km.
- **Solicitudes web de las apps del reloj.** Una app del reloj solo puede acceder a una dirección `https://` en un host que hayas permitido para ella.
- **Actualizaciones (Android).** La app busca en GitHub una versión más reciente.

### Estadísticas de uso anónimas

La app envía eventos de uso anónimos a Aptabase, que alojamos nosotros mismos, para ver qué funciones se usan.
Los eventos son: la app se inició, se conectó un reloj (con firmware de fábrica o modificado), se instaló una esfera
(su id de fmc.tools), se instaló o borró una app del reloj (su nombre), y se actualizó el App Loader o el firmware.
Un evento lleva la versión de la app, el sistema operativo, el idioma y el país deducido de la dirección
IP. La dirección IP en sí no se guarda, y no hay id de dispositivo, cuenta ni cookie, así que los eventos no pueden vincularse
contigo. Nunca llevan tu ubicación, calendario, notificaciones ni nada que escribas.

El tráfico Bluetooth hacia el reloj no tiene cifrado de extremo a extremo: cualquiera cerca con un escáner Bluetooth podría leer lo que
se envía al reloj.

## Contacto

Preguntas: abre un issue en https://github.com/fmctools/companion/issues.
