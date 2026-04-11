# Job Tracker

A desktop application built with Neutralino and React for tracking job applications with AI-powered job description cleaning.

## Features

- **AI-Powered Cleaning**: Automatically extracts company name, job title, location, and role ID from job descriptions
- **Clean Formatting**: Organizes job descriptions into standardized sections (About the Company, Position Overview, Responsibilities, Qualifications, Additional Information)
- **Local Storage**: Stores job data locally using Neutralino's storage API
- **Dark Mode UI**: Modern dark theme with clean, organized interface

## Prerequisites

- Node.js (v18 or higher)
- Neutralino CLI
- OpenRouter API key (for AI cleaning functionality)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-tracker-neutralino
```

2. Install dependencies:
```bash
npm install
```

3. Install Neutralino CLI globally:
```bash
npm install -g @neutralinojs/neu
```

## Configuration

1. Get an OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Run the application
3. Go to Settings and enter your API key
4. Click "Save Settings"

## Development

To run the app in development mode:
```bash
neu run
```

## Building

To build the application for distribution:
```bash
neu build
```

The built application will be in the `dist/Job Tracker/` directory.

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Desktop Framework**: Neutralino
- **AI**: OpenRouter API with Claude 3 Haiku
- **Storage**: Neutralino Storage API

## License

MIT

## Icon credits

- `trayIcon.png` - Made by [Freepik](https://www.freepik.com) and downloaded from [Flaticon](https://www.flaticon.com)
