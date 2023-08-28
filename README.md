# Visa Free Travel Data Visualization

This project is a web-based data visualization tool that displays information about visa-free travel between countries using interactive maps. It leverages D3.js, a JavaScript library for creating data-driven documents, to render the visualizations.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation and Usage](#installation-and-usage)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The "Visa Free Travel" application provides users with an interactive visualization of visa-free travel connections between various countries. It allows users to explore and analyze the data through two types of maps: a flow map and a proportional symbol map. The flow map shows connections between countries as curved paths, while the proportional symbol map represents countries with circles whose sizes are proportional to the number of travel connections.

## Features

- **Interactive Maps**: Users can switch between two types of maps - flow map and proportional symbol map.
- **Zooming**: Users can zoom in and out on the maps to explore details.
- **Hover and Click Interactions**: Hovering over a country displays a tooltip with the country name, and clicking on a country provides detailed information about the country's visa-free travel data.
- **Data Visualization**: The flow map visualizes travel connections as curved paths, while the proportional symbol map uses circle sizes to represent the number of connections.

## Installation and Usage

1. Clone or download the repository to your local machine.
2. Open a terminal window and navigate to the project directory.
3. Install the `http-server` package globally by running: `npm install -g http-server`.
4. Start the HTTP server by running: `http-server`.
5. Open a web browser and navigate to the provided server address.

## Data Sources

The project uses the following data sources:

- `world-map.geojson`: GeoJSON file containing world map geometries for countries.
- `visa-data.json`: JSON file containing visa-free travel data, including country names, outgoing connections, GDP per capita, incoming connections, and connection information.