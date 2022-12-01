# blinkies.cafe

## Project structure

- [.fonts/](.fonts/): Extracted font files, used when making blinkies. For use in [fontData.js](src/server/fontData.js)
- [assets/](assets/)
    - [blinkies-bg/](assets/blinkies-bg/): frames used when creating blinkies.
        - [components/](assets/blinkies-bg/components/): PNG's used as an overlay.
        - [png/](assets/blinkies-bg/png/): PNG's used as a background.
    - [blinkies-frames](assets/blinkies-frames/): Temp storage of blinkie frames. Contents created during runtime.
- [fonts-full/](fonts-full/): Original ZIP files of the fonts in [.fonts](.fonts/).
- *logs/*: Usage logs created during runtime.
- [public/](public/): Files that are provided statically (as-is).
    - [blinkies-public/display/](public/blinkies-public/display/): Examples of generate-able blinkies. File-names must correspond to the equivalent generator in [blinkieData.js](src/server/blinkieData.js).
      - [archive/](public/blinkies-public/display/archive/): Examples of blinkies the generators are based on, displayed on [blinkies.cafe/archive](https://blinkies.cafe/archive).
    - [static/](public/static/): Static files for use in the HTML. CSS, client-side Javascript, favicons and non-blinkie images.
- [src/](src/): Server-side scripts.
    - [gen/gen-blinkie.sh](src/gen/gen-blinkie.sh): (Legacy) Bash script to generate blinkies
    - [server/](src/server/): Server-side Javascript
        - [blinkieData.js](src/server/blinkieData.js): Data about available blinkie generators.
        - [blinkiegen.js](src/server/blinkiegen.js): Script to generate blinkies!
        - [controller.js](src/server/controller.js): Script with serve functions, for use in [routes.js](src/server/routes.js).
        - [fontData.js](src/server/fontData.js): Script that contains font data.
        - [logger.js](src/server/logger.js): Script for logging.
        - [routes.js](src/server/routes.js): Script that handles Express routing (serving static files, setting /api/ routes etc)
        - [sanitize.js](src/server/sanitize.js): Functions for sanitizing strings, for use in other scripts.
- [views/pages/](views/pages/): .ejs files & .txt files for generating HTML.
    - [blog/](views/pages/blog/): .ejs files for blog posts.
    - [components/](views/pages/components/): .html files to include in other templates/views.
- [blt.sh](blt.sh): Multi-use Bash script to control the Docker container.
- [server.js](server.js): Entrypoint/main script for Express/the website.


## License
The code in this project is licensed under the [GNU General Public License v3.0](license.txt). Any original blinkies are licensed under [CC BY-NC](https://creativecommons.org/licenses/by-nc/4.0/).