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
- 🗂️ <a href="#readme-index" title="Ir al Índice"><strong>Índice</strong></a> <span><strong>< Usted está aquí ></strong></span>
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

1.  Haga un [Fork][how-to-fork-tutorial] de este repositorio.

2.  Cree una rama para su feature:

    ```bash
    git checkout -b {rama}/{nombre-de-implementación}

    # Recomendado : Git >= 2.23.
    git switch -c {rama}/{nombre-de-implementación}
    ```

    **Le aconsejamos seguir el siguiente patrón al nombrar una rama para su feature:**

    | {rama}    | Utilidad                |
    | --------- | ----------------------- |
    | feat/     | nueva feature           |
    | refactor/ | refactorizado           |
    | chore/    | tareas de mantenimiento |
    | fix/      | corrección de issue     |
    | docs/     | documentación           |
    | test/     | testing                 |
    | style/    | cambíos de estilo       |

3.  Ánexe sus cambios a su Fork:

    ```bash
    # Añadir todos los archivos.
    git add .

    # Añadir archivos especificos.
    git add src/components/A.astro, public/b.svg, c.ts
    ```

4.  Confirme los cambios con un mensaje:

    ```bash
    git commit -m "{rama}: {describa su cambio brevemente}"
    ```

5.  Realice Push a su rama:

    ```bash
    git push origin {rama}/{nombre-de-implementación}
    ```

    > [!WARNING]
    > Este comando debe recibir el nombre de su rama y su implementación exactamente como lo definío en el paso dos.

6.  Abra un Pull Request & explique claramente qué hizo...

<p align="right">
    (<a href="#readme-top">regresar</a>)
    (<a href="#readme-index">índice</a>)
</p>

<a name="readme-clone"></a>

---

## 🧑🖥️ Desarrollo Local:

> [!IMPORTANT]
> Deberá requerir tener instalado [pnpm][pnpm-url]

<details>
    <summary>Script automatizado...</summary>

<br>

- **Linux/MacOS:**
  ```bash
  git clone https://github.com/midudev/bigibai-2025.git &&
  cd bigibai-2025 &&
  cp .env.example .env &&
  pnpm install &&
  pnpm run dev &&
  open "http://localhost:4321"
  ```
- **Windows:**
  ```powershell
  git clone https://github.com/midudev/bigibai-2025.git &&
  cd bigibai-2025 &&
  copy .env.example .env &&
  pnpm install &&
  pnpm run dev &&
  Start-Process "http://localhost:4321"
  ```

</details>

<br>

1. Clone el repositorio:

   ```bash
   git clone https://github.com/midudev/bigibai-2025.git
   ```

2. Entre en el repositorio:

   ```bash
    cd bigibai-2025
   ```

3. Instale las dependencias:

   ```bash
   pnpm install
   ```

4. Configure el archivo .env:

   ```bash
   # Linux/MacOS:
   cp .env.example .env

   # Windows:
   copy .env.example .env
   ```

> [!NOTE]
> Recuerde establecer correctamente las credenciales correspondientes en el archivo **.env** si requiere un buen funcionamiento del _backend_, de lo contrario solamente renderizará el _frontend_.

5. Inicie el servidor en modo desarrollo:

   ```bash
   pnpm run dev
   ```

6. Abra el navegador en la siguiente URL:

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
[pnpm-url]: https://pnpm.io/installation
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
