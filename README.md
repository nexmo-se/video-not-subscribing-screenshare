# Sample app (not subscribing to screen-sharing)

## About the application

This application demonstrates how to create a video conferencing application that allows you to share your screen while other users can't see it. If you record the video session, the screen sharing stream will be included in the recording even though it was not visible for other users. The users who publishes the screen-sharing stream will see a small thumbnail view of the screen-share at the top left.

## Application Structure

The application has a server side and a client side.

### Server side

The server side is a basic nodeJS server needed to generate credentials and start/stop archives. The `index.js` file contains the routes of the application. The logic related to the Video API is handled within the `opentok.js` file.

### Client side

The client side is a ReactJS application with three hooks. UsePublisher, useScreenSharing and UseSession which will handle most of the application logic. These hooks are consumed in the src/components/Main component.

## Install the app

1. Run `npm install` on the root directory to install dependencies
2. Populate a `.env.development` file on the server side as per the `.env.example`
3. Run `npm install` to install dependencies
4. Run the server by running `npm run server-dev`
5. Run the client side by running `npm start`

## Use the app

In order to use the app users have to navigate to the same roomName http://localhost:3000/room/${roomName} and you will start publishing video from your camera. When starting screen sharing, you can select the Window or browser tab that you want to share rather than sharing the entire screen. You can select on the pop up menu when you click on the screensharing button.

You can then either start the recording by hitting on the recording button
