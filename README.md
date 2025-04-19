# blinkies.cafe

blinkies.cafe is a web application that allows users to generate and customize animated blinkies (small GIFs with text and styles). It provides a fun and nostalgic way to create personalized graphics.

## Features

- **Blinkie Generator**: Create custom blinkies with various styles, fonts, and colors.
- **Gallery**: Browse and explore pre-made blinkies.
- **Customization**: Adjust text, font, colors, and animation speed.
- **API**: Programmatic access to generate blinkies.

## Project Structure

### Assets
- `assets/blinkies-bg/`: Background and overlay images for blinkies.
- `assets/blinkies-frames/`: Temporary storage for blinkie frames during generation.
- `.fonts/`: Extracted font files used in blinkie generation.

### Public
- `public/static/`: Static files such as CSS, JavaScript, and images.
- `public/blinkies-public/display/`: Examples of generated blinkies.

### Source Code
- `src/blinkiegen.js`: Main script for generating blinkies.
- `src/controller.js`: Handles server-side logic and routing.
- `src/routes.js`: Defines API and static file routes.
- `src/data/`: Contains data files for blinkie templates, fonts, and more.

### Views
- `views/pages/`: EJS templates for rendering HTML pages.
- `views/pages/components/`: Reusable HTML components.

### Logs
- `logs/`: Runtime logs for debugging and monitoring.

### Scripts
- `blt.sh`: Bash script for managing the Docker container.
- `src/gen/gen-blinkie.sh`: Legacy script for blinkie generation.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blinkies.cafe.git
   ```
2. Navigate to the project directory:
   ```bash
   cd blinkies.cafe
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

### Using `blt.sh`

The `blt.sh` script provides several commands to manage the Docker container for the project:

- **Build the Docker image**:
   ```bash
   ./blt.sh --build
   ```

- **Run the container in production mode**:
   ```bash
   ./blt.sh --run
   ```

- **Test the container in development mode**:
   ```bash
   ./blt.sh --test
   ```

- **Remove all stopped containers**:
   ```bash
   ./blt.sh --rm
   ```

- **Remove all unused Docker images**:
   ```bash
   ./blt.sh --rmi
   ```

- **Pull the latest Docker image**:
   ```bash
   ./blt.sh --pull
   ```

- **Push the Docker image to the repository**:
   ```bash
   ./blt.sh --push
   ```

- **Deploy to production**:
   ```bash
   ./blt.sh --prod
   ```

## API Endpoints

- **POST /api/pour**: Generate a blinkie with custom parameters.
- **GET /styleList.json**: Retrieve a list of available styles.
- **GET /sourceList.json**: Retrieve a list of source URLs for blinkie styles.

## License

The code in this project is licensed under the [GNU General Public License v3.0](license.txt). Original blinkies are licensed under [CC BY](https://creativecommons.org/licenses/by/4.0/).