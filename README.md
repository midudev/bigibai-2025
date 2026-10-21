<div align="center">

<strong><h1>Web Oficial de BigIbai 2025</h1></strong>

<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br>

<a href="https://www.bigibai.com/" target="_blank" rel="noopener noreferrer">
  <img width="300px" height="150px" src="https://raw.githubusercontent.com/midudev/bigibai-2025/refs/heads/main/public/logo-a.svg" alt="Logo" width="800" />
</div>

</a>

<br>
<br>
<br>

## 📎 Descripción:

BigIbai 2025 **(&copy; Salad Brands SL.)** es un evento anual organizado por [Ibai Llanos][twitter-ibai-llanos] que combina un calendario de adviento interactivo con sorteos, contenidos exclusivos y experiencias para los **_reals_**. Esta web es el proyecto oficial desarrollado de forma abierta por la comunidad de Midudev.

Este repositorio contiene el desarrollo **_open source_** de la web oficial de BigIbai 2025.

El proyecto se construye en stream, a través de la plataforma [Twitch](https://www.twitch.tv/midudev 'Twitch de Midudev') & [Youtube](https://www.youtube.com/midudev 'Youtube de Midudev'), de manera colaborativa por la comunidad de Miguel Ángel Durán ~ _@midudev_.

<p align="right">
    (<strong><a href="#readme-top">regresar</a></strong>)
    (<a href="#readme-index">índice</a>)
</p>

<a name="readme-index"></a>

---

## 🗂️ Índice:

<details open>
    <summary>
        <a href="#readme-index" title="Más...">Web Oficial de BigIbai 2025</a>
    </summary>

    - 📎 <a href="#readme-top" title="Ir a la Descripción">Descripción</a>
    - 🗂️ <a href="#readme-index" title="Ir al Índice"><strong>Índice</strong></a> <span><strong>< Tú estás aquí ></strong></span>
    - 🚀 <a href="#readme-stack" title="Ir al Stack Tecnologico">Tech Stack</a>
    - ☝️🖥️ <a href="#readme-contribute" title="Ir a Contribuir">¿Cómo Contribuir?</a>
    - 🧑🖥️ <a href="#readme-clone" title="Ir a Clonar Repositorio">Desarrollo Local</a>

</details>

<p align="right">
    (<a href="#readme-top">regresar</a>)
    (<strong><a href="#readme-index">índice</a></strong>)
</p>

<a name="readme-stack"></a>

---

## 🚀 Tech Stack:

- [![Astro][astro-badge]][astro-url] - The web framework for content-driven websites.
- [![Typescript][typescript-badge]][typescript-url] - JavaScript with syntax for types.
- [![Tailwind CSS][tailwind-badge]][tailwind-url] - A utility-first CSS framework for rapidly building custom designs.
- [![@midudev/tailwind-animations][midu-animations-badge]][midu-animations-url] - Easy peasy animations for your Tailwind project.
- [![Supabase][supabase-badge]][supabase-url] - The open source Firebase alternative.

<p align="right">
    (<a href="#readme-top">regresar</a>)
    (<a href="#readme-index">índice</a>)
</p>

<a name="readme-contribute"></a>

---

## ☝️🖥️ ¿Cómo Contribuir?

> [!IMPORTANT]
> ¡Toda ayuda es bienvenida! Si quieres formar parte de la construcción, adelante.

1.  Haz un [Fork][how-to-fork-tutorial] de este repositorio.

2.  Crea una rama para tu feature:

    ```bash
    git checkout -b {rama}/{nombre-de-implementación}

    # Recomendado : Git >= 2.23.
    git switch -c {rama}/{nombre-de-implementación}
    ```

    **Te aconsejamos seguir el siguiente patrón al nombrar una rama para tu feature:**

    | {rama}    | Utilidad                |
    | --------- | ----------------------- |
    | feat/     | nueva feature           |
    | refactor/ | refactorizado           |
    | chore/    | tareas de mantenimiento |
    | fix/      | corrección de issue     |
    | docs/     | documentación           |
    | test/     | testing                 |
    | style/    | cambíos de estilo       |

3.  Añade tus cambios a tu Fork:

    ```bash
    # Añadir todos los archivos.
    git add .

    # Añadir archivos especificos.
    git add src/components/A.astro, public/b.svg, c.ts
    ```

4.  Confirma los cambios con un mensaje:

    ```bash
    git commit -m "{rama}: {describa su cambio brevemente}"
    ```

5.  Haz push a tu rama:

    ```bash
    git push origin {rama}/{nombre-de-implementación}
    ```

    > [!WARNING]
    > Este comando debe recibir el nombre de su rama y su implementación exactamente como lo definío en el paso dos.

6.  Abre un Pull Request & explica claramente qué hiciste...

<p align="right">
    (<a href="#readme-top">regresar</a>)
    (<a href="#readme-index">índice</a>)
</p>

<a name="readme-clone"></a>

---

## 🧑🖥️ Desarrollo Local:

> [!IMPORTANT]
> Deberás tener instalado [Bun][bun-url]

<details>
    <summary>Script automatizado...</summary>

<br>

- **Linux/MacOS:**
  ```bash
  git clone https://github.com/midudev/bigibai-2025.git &&
  cd bigibai-2025 &&
  cp .env.example .env &&
  bun install &&
  bun run dev &&
  open "http://localhost:4321"
  ```
- **Windows:**
  ```powershell
  git clone https://github.com/midudev/bigibai-2025.git &&
  cd bigibai-2025 &&
  copy .env.example .env &&
  bun install &&
  bun run dev &&
  Start-Process "http://localhost:4321"
  ```

</details>

<br>

1. Clona el repositorio:

   ```bash
   git clone https://github.com/midudev/bigibai-2025.git
   ```

2. Entra en el repositorio:

    ```bash
    cd bigibai-2025
    ```

3. Instale las dependencias:

   ```bash
   bun install
   ```

4. Configure el archivo .env:

   ```bash
   # Linux/MacOS:
   cp .env.example .env

   # Windows:
   copy .env.example .env
   ```

> [!NOTE]
> Recuerda establecer correctamente las credenciales correspondientes en el archivo **.env** si requieres un buen funcionamiento del _backend_; de lo contrario solo se renderizará el _frontend_.

5. Inicia el servidor en modo desarrollo:

   ```bash
   bun run dev
   ```

6. Abre el navegador en la siguiente URL:

   ==> [http://localhost:4321](http://localhost:4321)

<p align="right">
    (<a href="#readme-top">regresar</a>)
    (<a href="#readme-index">índice</a>)
</p>

---

<br>
<br>
<br>

<div align="center">

**¡Gracias a todos los colaboradores por su granito de arena!**

[![Contribuidores](https://contrib.rocks/image?repo=midudev/bigibai-2025&max=500&columns=20)](https://github.com/midudev/bigibai-2025/graphs/contributors)

</div>

<!-- Repository Links -->

[contributors-shield]: https://img.shields.io/github/contributors/midudev/bigibai-2025.svg?style=for-the-badge
[contributors-url]: https://github.com/midudev/bigibai-2025/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/midudev/bigibai-2025.svg?style=for-the-badge
[forks-url]: https://github.com/midudev/bigibai-2025/network/members
[stars-shield]: https://img.shields.io/github/stars/midudev/bigibai-2025.svg?style=for-the-badge
[stars-url]: https://github.com/midudev/bigibai-2025/stargazers
[issues-shield]: https://img.shields.io/github/issues/midudev/bigibai-2025.svg?style=for-the-badge
[issues-url]: https://github.com/midudev/bigibai-2025/issues

<!-- Repository Links -->

<!-- Tech Stack Links -->

[astro-url]: https://astro.build/
[typescript-url]: https://www.typescriptlang.org/
[tailwind-url]: https://tailwindcss.com/
[midu-animations-url]: https://tailwindcss-animations.vercel.app/
[supabase-url]: https://supabase.com/
[bun-url]: https://bun.com/docs/installation
[astro-badge]: https://img.shields.io/badge/Astro-fff?style=for-the-badge&logo=astro&logoColor=bd303a&color=352563
[typescript-badge]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwind-badge]: https://img.shields.io/badge/Tailwind-ffffff?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8
[midu-animations-badge]: https://img.shields.io/badge/@midudev/tailwind-animations-ff69b4?style=for-the-badge&logo=node.js&logoColor=white&color=blue
[supabase-badge]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white

<!-- Tech Stack Links -->

<!-- Another Links -->

[twitter-ibai-llanos]: https://www.x.com/IbaiLlanos
[how-to-fork-tutorial]: https://youtu.be/watch?v=niPExbK8lSw&t=2135s

<!-- Another Links -->

## Diseño compartido de la edición 2026

La identidad visual se define en `src/styles/tokens.css`: colores, superficies, tipografía, radios, anchuras y espaciado. Para adaptar la web, cambia primero estos valores; evita añadir copias de los colores dentro de cada página.

- `Layout.astro` incorpora la cabecera, el pie, el fondo, los metadatos y las notificaciones. Las páginas no deben volver a incluir `Header` o `Footer`.
- `PageLayout.astro` añade el contenedor principal y el espaciado de las páginas interiores. `LegalLayout.astro` aplica la composición de lectura a los documentos legales.
- `src/components/ui/` contiene `Container`, `Surface`, `SectionHeading`, `Button` (en `components/`), `Field`, `CodeInput`, `Notice`, `Badge`, `BrandLogo`, `Modal`, `StatCard`, `WinnerCard` y `CalendarDoor`.
- `src/styles/components.css` define los estilos de esas piezas. `ui/styles.ts` comparte las clases de los botones con los controles que administración genera en el navegador; `ui/feedback.ts` hace lo mismo con los avisos de formulario.
- `Surface` admite estados `info`, `warning`, `success` y `error`; `Badge` y `Notice` usan la misma paleta de estados para los resultados de los formularios y de administración.
- `AccountOverview` y `AdminOverview` reciben datos mediante propiedades. Las páginas conservan la autenticación y las consultas; los componentes organizan la presentación.
- `src/sections/home/` separa la portada, los pasos de participación, los llaveros, el localizador de tiendas, el estado de campaña y el arcade. `Hero.astro` compone esos bloques; los diseños de los llaveros viven en `src/data/keychains.ts`.
- `GameLayout` comparte el marco, la ficha de resultado y el vídeo de los juegos, incluido el anagrama. `CalendarDoor` se utiliza en la home y en la cuenta. El dibujo de cada juego conserva sus elementos propios.

Una página interior puede usar esta estructura:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro'
import Surface from '@/components/ui/Surface.astro'
import SectionHeading from '@/components/ui/SectionHeading.astro'
import Button from '@/components/Button.astro'
---

<PageLayout title="Mi página | Big Ibai">
  <SectionHeading as="h1" size="page" title="Título de la página" />
  <Surface padded class="mt-8">
    <p>Contenido de la página.</p>
    <Button href="/dashboard" variant="brand">Mis participaciones</Button>
  </Surface>
</PageLayout>
```
