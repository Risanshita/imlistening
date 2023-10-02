# ImListening

ImListening is a web application that allows you to easily create temporary endpoints to inspect incoming HTTP requests. It serves as a handy tool for debugging, testing webhook integrations, and gathering information about incoming requests.

## Features

- Create temporary endpoints to receive HTTP requests
- Inspect incoming requests in real-time
- View request headers, body, query parameters, and more
- Copy request details to clipboard
- Secure access with authentication
- Lightweight and easy to use

## Technologies Used

- Backend: .NET Core, C#, Entity Framework
- Frontend: React.js, JavaScript, HTML, CSS
- Database: Microsoft SQL Server
- Authentication: JWT (JSON Web Tokens)
- Real-time updates: SignalR
- API Documentation: Swagger UI

## Getting Started

To run the ImListening application locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/imlistening.git`
2. Navigate to the project directory: `cd imlistening`
3. Install the dependencies: `npm install`
4. Set up the database connection in the appsettings.json file
5. Run the migrations to create the database: `dotnet ef database update`
6. Start the backend server: `dotnet run`
7. In a separate terminal, start the frontend development server: `npm start`
8. Open your browser and visit: `http://localhost:3000`

## Usage

1. Create a new endpoint by providing a unique path and selecting the desired HTTP methods.
2. Send HTTP requests to the created endpoint using tools like cURL, Postman, or any other HTTP client.
3. Visit the ImListening dashboard to view and inspect the incoming requests.
4. Copy the request details or analyze them in real-time to understand the request's structure and content.

## Contributing

Contributions are welcome! If you find a bug or have a feature suggestion, please open an issue or submit a pull request. Make sure to follow the project's coding style and guidelines.

## Acknowledgements

- The project was inspired by webhook.site (https://webhook.site)
- Special thanks to the contributors and open-source community for their valuable contributions.

## Contact

If you have any questions or feedback, feel free to contact the project maintainer at risanshita1996@gmail.com.

Enjoy using ImListening!
