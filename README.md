# blinkies.cafe

## How-to
### Clone & run locally (Docker)
This requires *git*, *Docker* & *imagemagick* to be installed.
```sh
git clone https://github.com/piconaut/blinkies.cafe.git
cd blinkies.cafe

./blt.sh -b  # build assets
./blt.sh --test  # development mode
```
See [blt.sh](blt.sh) for more options.

### Clone & run locally (Node.JS)
This requires *git*, *Node.js*, *imagemagick* and a shell to be installed locally.
```sh
git clone https://github.com/piconaut/blinkies.cafe.git
cd blinkies.cafe
npm install

npm run test  # development
npm start  # production
```

## Reference
### Project structure

- [assets/](assets/)
    - [blinkies-bg/](assets/blinkies-bg/): frames used when creating blinkies.
        - [components/](assets/blinkies-bg/components/): PNG's used as an overlay.
        - [png/](assets/blinkies-bg/png/): PNG's used as a background.
    - [blinkies-frames](assets/blinkies-frames/): Temp storage of blinkie frames. Contents created during runtime.
    - [.fonts/](.fonts/): Extracted font files, used when making blinkies. For use in [fontData.js](src/server/fontData.js)
    - [fonts-full/](fonts-full/): Original ZIP files of the fonts in [.fonts](.fonts/).
- *logs/*: Usage logs created during runtime.
- [public/](public/): Files that are provided statically (as-is).
    - [blinkies-public/display/](public/blinkies-public/display/): Examples of generate-able blinkies. File-names must correspond to the equivalent generator in [blinkieData.js](src/server/blinkieData.js).
        - [archive/](public/blinkies-public/display/archive/): Examples of blinkies the generators are based on, for [blinkies.cafe/archive](https://blinkies.cafe/archive).
    - [static/](public/static/): Static files for use in the HTML. CSS, client-side Javascript, favicons and non-blinkie images.
    - [txt/](public/txt/): Public text files.
- [src/](src/): Server-side scripts.
    - [data/](data/)
        - [blinkieData.js](src/data/blinkieData.js): Blinkie template data used to generate blinkies.
        - [fontData.js](src/data/fontData.js): Script that contains font data.
        - [subData.js](src/data/subData.js): Data for crediting template submitters.
    - [gen/gen-blinkie.sh](src/gen/gen-blinkie.sh): (Legacy) Bash script to generate blinkies
    - [blinkiegen.js](src/blinkiegen.js): Script to generate blinkies!
    - [controller.js](src/controller.js): Script with serve functions, for use in [routes.js](src/routes.js).
    - [logger.js](src/logger.js): Script for logging.
    - [routes.js](src/routes.js): Script that handles Express routing (serving static files, setting /api/ routes etc)
    - [sanitize.js](src/sanitize.js): Functions for sanitizing strings, for use in other scripts.
- [views/pages/](views/pages/): .ejs files & .txt files for generating HTML.
    - [blog/](views/pages/blog/): .ejs files for blog posts.
    - [components/](views/pages/components/): .html files to include in other templates/views.
- [blt.sh](blt.sh): Multi-use Bash script to control the Docker container.
- [server.js](server.js): Entrypoint/main script for Express/the website.


## License
The code in this project is licensed under the [GNU General Public License v3.0](license.txt). Original blinkies are licensed under [CC BY](https://creativecommons.org/licenses/by/4.0/).
