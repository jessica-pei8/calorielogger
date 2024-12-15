# Logger: A Personalized Calorie Tracker

## Project Summary:
Logger is an innovative app designed to track the fitness goals of individuals based on their schedule, behaviors, workout data, and soft biometric traits. Unlike traditional fitness trackers, Logger goes beyond tracking only exercise to include passive calorie burn from activities such as sleep, walking to work, or even fidgeting while stationary. The app is tailored to the average working American, offering a simple and intuitive interface for seamless integration into daily routines. By using machine learning and real-time data analysis, Logger provides a personalized calorie tracker that adapts to each user’s lifestyle.

## Key Features:
- **Automatic Schedule Importing**: Seamlessly import and track your daily activities.
- **Manual Schedule Creation**: Create a custom schedule to track your calorie burn.
- **Personalized Calorie Tracking**: Tracks both active and passive calorie burns from everyday activities.
- **Data Visualization**: Interactive graphs such as doughnut charts, scatter plots, and word clouds to help visualize calories burned vs calories consumed.
- **Google Calendar Integration**: Sync your Google Calendar to automatically import events and activities for more accurate tracking.
- **Weekly/Monthly Reports**: View detailed calorie data on a weekly and monthly basis.
- **Firebase Authentication**: Secure user authentication with Firebase, allowing users to create and manage accounts, log in, and track their data securely.

## Creative Components:
- **D3 Data Visualizations**: We are utilizing D3.js to build responsive and interactive visualizations. These include doughnut charts for calorie balance, connected scatter plots for time-based activity tracking, and weighted word clouds to represent how various activities impact calorie balance.
- **Google Calendar API Integration**: By integrating with the Google Calendar API, we can automate the import of user events, offering a seamless way for users to track calories burned during scheduled activities.
- **Responsive Design**: The frontend will use React for a smooth user experience, ensuring that visualizations are easily accessible and responsive on any device.

## Usefulness:
Logger provides a comprehensive solution for tracking calories burned throughout the day, not just during exercise. Many existing fitness apps like MyFitnessPal focus mainly on calories burned through major exercises like running or lifting weights. Logger, however, tracks calories burned from smaller, everyday activities such as naps, walking, and even solving puzzles. This holistic approach offers a more accurate and complete picture of a user’s daily caloric expenditure, making it easier for users to manage their health goals. 

## Data Sources:
We will use two main datasets:
1. **Calories Burnt During Exercise (Kaggle Dataset)**: This dataset contains information about 248 different exercises and the calories burned per activity. It is in CSV format and provides data on calories burned per kilogram for different weights. The dataset will need some extrapolation for users outside the weight range of 130 lbs to 205 lbs.
2. **Health and Sleep Statistics Dataset**: This dataset contains 100 data points for 11 different sleep-related parameters, which we will use to predict sleep quality and recovery times based on sleep duration and medications.

## Detailed Functionality:
- **User Interaction**: 
   - **Manual Schedule Creation**: Users can create a manual schedule through the app interface, entering activities and expected durations.
   - **Automatic Schedule Import**: Users can sync their Google Calendar to automatically import scheduled events, which will then be analyzed for calorie burn.
   - **Data Visualization**: Users can view daily, weekly, or monthly calorie burn through various types of charts, including doughnut charts for balance, scatter plots for time-based tracking, and word clouds showing the impact of activities.
   - **Google Calendar Sync**: Activities scheduled in the Google Calendar will be automatically synced, and calorie burn predictions will be based on those activities.

## Conclusion:
Logger offers a unique solution for individuals looking to track not only calories burned during workouts but also the calories burned in everyday activities. By combining machine learning, data visualization, and seamless integrations with Google Calendar, Logger provides a holistic view of a user’s caloric expenditure, making it easier for them to achieve their fitness goals.

---

**Note**: This README can be further updated as the project progresses, with additional information on deployment, setup instructions, and more detailed documentation on each feature.

# Project Setup Instructions

## Prerequisites

1. Install [Node.js](https://nodejs.org/) (which includes `npm`).
2. Install [Python 3](https://www.python.org/downloads/).
3. Ensure `yarn` is installed globally:
   ```bash
   npm install -g yarn
   ```
4. Install a virtual environment package for Python:
   ```bash
   pip install virtualenv
   ```

---

## Step 1: Start the Frontend

1. Navigate to the project directory:
   ```bash
   cd logger
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the frontend development server:
   ```bash
   yarn start
   ```
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Step 2: Start the Backend

1. Navigate to the backend directory in logger:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Create a virtual environment
   python -m virtualenv venv

   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python app.py
   ```
5. The backend server will start at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## Step 3: Verify the Setup

- The **frontend** should be running at [http://localhost:3000](http://localhost:3000).
- The **backend** should be running at [http://127.0.0.1:5000](http://127.0.0.1:5000).
- Ensure the frontend can connect to the backend by performing actions that trigger API calls.

---

