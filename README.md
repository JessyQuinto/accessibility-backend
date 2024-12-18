# Accessibility Backend Project

This project is an accessibility analysis backend service built with Node.js and Express. It allows users to submit URLs for accessibility scanning and generates reports based on the findings.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Technologies Used](#technologies-used)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd accessibility-backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and specify the desired port (optional):
   ```
   PORT=3000
   ```

## Usage

To start the server, run:
```
npm run dev
```
This will start the server using Nodemon, which automatically restarts the server on file changes.

## Endpoints

- **POST /api/analyze**
  - Description: Analyzes the provided URL for accessibility issues.
  - Request Body: 
    ```json
    {
      "url": "https://example.com"
    }
    ```
  - Response: Returns a JSON object with the analysis results or an error message if the URL is invalid.

## Technologies Used

- Node.js
- Express
- CORS
- dotenv
- body-parser
- Puppeteer
- axe-core
- PDFKit

## License

This project is licensed under the MIT License.