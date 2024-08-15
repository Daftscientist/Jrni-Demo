# Booking Demo Application

This project is a demo application developed during a software development work experience at **[Booking Lab](https://www.bookinglab.co.uk/)**. The goal of this project is to create a simple service booking system using React, showcasing integration with the **[JRNI API](https://jrni.com/)**. This system allows users to navigate through the stages of a booking process, including service selection, details input, and confirmation.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Routes](#routes)
- [State Management](#state-management)
- [License](#license)

## Project Overview

The Booking Demo Application consists of several stages of a typical booking flow, including:

1. **Service Selection**: Users can select a service, view available resources, and choose appointment times.
2. **Details Input**: Users input their personal information, including address and other relevant details.
3. **Confirmation Page**: After the booking is completed, a confirmation page is displayed summarizing the user's booking details.

This demo application integrates with the **JRNI API**, simulating a booking system similar to those used in real-world applications for managing appointments and services.

## Features

- **Dynamic Service Selection**: Services and available times are dynamically fetched using the **JRNI API** based on user input.
- **Form Validation**: Input fields are validated to ensure correct data entry.
- **Axios Integration**: The app uses Axios for making HTTP requests to the JRNI API.
- **React Context**: Axios is provided via a context to avoid prop drilling and maintain clean code.
- **Error Handling**: Error banners are displayed when an error occurs during data fetching or submission.
- **Routing**: The app utilizes React Router for route-based navigation between service selection, details input, and confirmation pages.

## Technologies Used

- **React**: Frontend framework for building the UI components.
- **TypeScript**: Strongly typed JavaScript to ensure type safety and better development experience.
- **Axios**: For making HTTP requests to backend services, including the JRNI API.
- **React Router**: For handling route-based navigation within the app.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/booking-demo.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm start
   ```
4. The app should now be running locally on `http://localhost:3000`.

## Routes

1. **Index Route (`index.tsx`)**:
   - This route is the main entry point for viewing available services. It:
     - Fetches a list of services from the **JRNI API** using Axios.
     - Displays a table listing each service's name and available durations.
     - Provides an action button for each service, allowing users to navigate to a detailed view of the selected service.
   - Includes error handling via an `ErrorBanner` component to alert the user if the data fetch fails.
   - Uses React Router's `Link` component to enable seamless navigation between the services listing and the service details page.

2. **Service Route (`service.tsx`)**:
   - This route manages the service selection process.
   - It fetches available resources and times from the **JRNI API** based on the selected service.
   - It allows users to choose a time slot for the selected service.

3. **Details Route (`details.tsx`)**:
   - This route handles user input during the details entry stage.
   - Includes form elements like text input and dropdowns for address selection and other details.
   - This route integrates validation logic to ensure that required information is provided before proceeding.

4. **Confirmation Route (`confirmation.tsx`)**:
   - This route fetches checkout data from localStorage and displays the final confirmation after a successful booking.
   - It cleans up localStorage after the booking process is completed, ensuring that sensitive data is not retained unnecessarily.

## State Management

The project uses React's **Context API** for state management related to Axios, which simplifies data fetching across the different routes without the need for prop drilling.

- **FetchContext (`FetchContext.tsx`)**:
  - A custom context is created using `createContext` to store the configured Axios instance.
  - This instance is globally accessible across all components via the custom hook `useAxios`, which leverages `useContext` to retrieve the Axios instance from the context.
  
- **Axios Instance**:
  - The Axios instance is pre-configured with a base URL and necessary headers for communicating with the **JRNI API**.
  - This ensures that all requests made throughout the app follow a consistent configuration and reduces the overhead of configuring Axios individually within each component.

By centralizing the Axios instance in the context, the application maintains a clean and scalable approach to data fetching, especially as it interacts with multiple endpoints within the JRNI API.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
