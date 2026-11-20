# Antes de conectar

FMC habla con tu reloj directamente desde el navegador, sin una app del teléfono de por medio. Esta página explica qué cambia en el reloj y los problemas con los que la gente se ha encontrado de verdad.

## Qué puede hacer FMC y qué no

- **Instala esferas con el instalador del propio reloj.** La carga sigue los mismos pasos que la app oficial. FMC inicia una instalación, describe el archivo, lo envía por partes y termina. El reloj responde a cada paso y puede rechazar el archivo. Cuando lo hace, FMC te muestra el rechazo y se detiene.
- **El firmware es la parte arriesgada.** Desde el estante de firmware, FMC instala imágenes no oficiales de forma inalámbrica, y una imagen mala puede dejar un reloj inservible. FMC ofrece una imagen solo a un Watch Pro 2 con 50 % de batería o más, comprueba las sumas de verificación de la imagen y que se hizo para ese reloj, y espera a que marques que aceptas el riesgo.
- **Las esferas también pueden fallar.** Normalmente el reloj rechaza el archivo, o lo instala y se ve mal, y lo borras en el reloj. Una vez, una esfera con una imagen mucho más grande que la pantalla hizo que un Watch 3 Pro se reiniciara en bucle. Mira «El reloj se reinicia en bucle» más abajo.
- **No te vamos a decir que nada puede salir mal.** Hacemos y probamos FMC en un CMF Watch Pro 2. Un firmware que no hemos visto puede comportarse de otra forma, y no podemos prometer nada sobre él. Si algo se rompe, [cuéntanos](https://github.com/freethinkel/fmc/issues). La solución para Nothing X de abajo existe porque alguien lo hizo.

## Solo una app puede tener el reloj a la vez

El reloj acepta una sola conexión Bluetooth. Si Nothing X está conectado, aunque sea en segundo plano, **Conectar** en FMC se queda colgado y al final se agota el tiempo. Cierra Nothing X o desconecta el reloj desde ahí primero.

También pasa al revés. Mientras una pestaña de FMC tiene el reloj, Nothing X no puede alcanzarlo. Cuando termines, cierra la pestaña o pulsa **Olvidar dispositivo** en el panel del reloj. Dos pestañas de FMC se bloquean entre sí de la misma forma.

## Nothing X dejó de ver el reloj después de usar FMC

Parece un reloj inservible, pero no lo es. El teléfono tiene un conflicto de emparejamiento Bluetooth, y volver a emparejar lo resuelve.

1. Cierra la pestaña de FMC para que nada retenga el reloj.
2. Apaga el Bluetooth del teléfono, espera unos segundos y vuelve a encenderlo.
3. Olvida el reloj en los ajustes de Bluetooth del teléfono.
4. Pon el reloj en modo de emparejamiento y agrégalo de nuevo en Nothing X.

<p class="note type-caption">Un usuario lo informó en el <a href="https://github.com/freethinkel/fmc/issues/27">issue #27</a>. Otro usuario respondió con estos pasos unas horas después, y nadie ha necesitado un restablecimiento de fábrica.</p>

## Borrar una esfera en el reloj

No necesitas FMC ni Nothing X para esto. Mantén pulsada la esfera actual hasta que aparezca la lista de esferas instaladas. Desliza hasta la que quieras quitar y deslízala hacia arriba.

Un Watch Pro 2 admite {WF_CAPACITY} esferas, un Watch 3 Pro {WF_CAPACITY_PRO3}. Cuando están todas ocupadas, FMC pregunta cuál sobrescribir. Las esferas de fábrica también cuentan, y Nothing X puede reinstalarlas.

## El reloj se reinicia en bucle

El reloj tiene que guardar en memoria todas las imágenes de una esfera. Una esfera con una imagen de 1386×1386, tres veces la pantalla, dejó sin memoria a un CMF Watch 3 Pro: mostraba el logo, se ponía en negro y se reiniciaba una y otra vez, y nada podía conectarse a él.

Ahora FMC lo evita en dos lugares. Las imágenes que agregas en el editor se reducen para caber en la pantalla. Antes de cualquier instalación, FMC también revisa el archivo y lo rechaza si una imagen mide más de {MAX_IMAGE_SIDE} px de lado, venga de donde venga el archivo. Por encima de {SAFE_IMAGE_SIDE} px, más grande que lo que usan las esferas de fábrica, te pide confirmar antes de instalar.

Un segundo bucle aparece solo en la pantalla siempre activa: la pantalla parpadea a brillo máximo una y otra vez hasta que cambias a una esfera de fábrica. La esfera que hizo esto en un Watch 3 Pro había perdido la pequeña miniatura que lleva cada pantalla siempre activa de fábrica. Es nuestra mejor pista, no una causa confirmada. Ahora FMC rechaza un archivo así antes de instalarlo, y el editor vuelve a poner la miniatura, así que abre la esfera en el editor e instálala desde ahí.

Si tu reloj ya está atrapado en el bucle, todavía no tenemos una solución confirmada. Esto es lo que vale la pena probar, en orden:

1. Justo después de que se reinicie, mantén la pantalla encendida tocándola. La imagen grande del caso reportado era la de la pantalla siempre activa, así que el fallo puede llegar solo cuando la pantalla se atenúa.
2. Si la esfera aparece aunque sea un momento, mantenla pulsada y deslízala para quitarla. Si te da tiempo, desactiva también la pantalla siempre activa en los ajustes.
3. Si el reloj se pone en negro tras el logo pero sigue apareciendo en el selector de Bluetooth, prueba la [página de rescate](/rescue): envía un restablecimiento de fábrica en cuanto el reloj nos deja entrar, y no pide nada más. Usa el navegador desde el que instalaste la esfera.
4. Deja que la batería se agote por completo, luego cárgala y vuelve a intentarlo.
5. Si nada de eso funciona, contacta con el soporte de Nothing. Una esfera no toca el firmware, así que es una reparación que pueden hacer.

<p class="note type-caption">Si uno de estos pasos te funcionó, u otra cosa, por favor <a href="https://github.com/freethinkel/fmc/issues">cuéntanos</a> para ponerlo al principio de esta lista.</p>

## Cuando el reloj rechaza una carga

FMC muestra lo que dijo el reloj. Normalmente el reloj está lleno, la ranura que elegiste se borró mientras tanto, o el reloj rechazó el archivo terminado. Vuelve a conectar e inténtalo de nuevo. Si la misma esfera falla dos veces, el problema es el archivo, no el reloj.

## Qué navegadores funcionan

Para conectar hace falta Web Bluetooth, es decir, Chrome o Edge en computadora, o Chrome en Android. Firefox no lo admite. En iPhone, Safari y Chrome tampoco, pero Bluefy sí (ver abajo).

## En iPhone: Bluefy

Safari no tiene Web Bluetooth, y todos los demás navegadores de iPhone usan el mismo motor. [Bluefy](https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055), un navegador gratuito de la App Store, lo agrega.

1. Instala Bluefy y abre este sitio en él.
2. **Primero suelta el reloj.** Mientras otra app del iPhone tiene el reloj, Bluefy no lo ve y su selector aparece vacío. Abre Ajustes → Bluetooth: si el reloj dice **Conectado**, una app lo tiene, normalmente Nothing X o una app de fitness que sincroniza entrenamientos. Cierra esa app desde el selector de apps hasta que el reloj diga **No conectado**. Olvidar el reloj en Ajustes no sirve, porque la app lo vuelve a conectar.
3. En Bluefy, abre el panel del reloj y pulsa **Conectar**. Elige el reloj y confirma el emparejamiento en el reloj si lo pide.
4. Mantén Bluefy en primer plano y la pantalla encendida hasta que termine la instalación. La conexión se corta cuando el navegador pasa a segundo plano.

Cuando termines, cierra la pestaña y la otra app podrá recuperar el reloj.

<p class="note type-caption">Si aún no conecta, pulsa <strong>Copiar registro</strong> en el panel del reloj y pégalo en un <a href="https://github.com/freethinkel/fmc/issues">issue</a>.</p>

---

¿Tu reloj hizo algo que esta página no describe? [Abre un issue](https://github.com/freethinkel/fmc/issues) con tu navegador, el modelo del reloj y la versión de firmware que muestra el panel del reloj. Con eso nos basta para reproducirlo.
