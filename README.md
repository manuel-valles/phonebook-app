# PHONEBOOK API
A phone book application for the challenge https://app.hackajob.co/hack/1414

### Main Commands:
- **npm run dev**: Nodemon with dev environment variables
- **npm test**: Jest with test environment variables

### Notes:
- To run the app, you need to create first a config folder with the environment files **dev.env** & **test.env** and its variables:
    ```javascript
        PORT=3000
        JWT_SECRET=hackajob2020
        MONGODB_URL=mongodb://localhost/phonebook-app
    ```
