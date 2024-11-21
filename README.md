# SecuredMessageBoard

This project is a RESTful API for a message board where users can create threads, post replies, report threads/replies, and delete them using a password. The API handles operations related to threads and replies, including creation, reporting, and deletion, while ensuring that sensitive actions (deletion and reporting) require passwords for security.

## Features

- **Create threads**: Users can post new threads with text and a password.
- **Post replies**: Users can post replies to threads with text and a password.
- **Report threads/replies**: Users can report threads and replies, marking them as flagged.
- **Delete threads/replies**: Users can delete threads and replies using a password.
- **View threads**: Users can view a list of threads, including up to 3 most recent replies for each. The threads are sorted by their most recent activity (bumped).
  
## API Endpoints

### 1. **Create a new thread**

- **URL**: `/api/threads/:board`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "text": "Thread text",
      "delete_password": "password"
    }
    ```
- **Response**:
    - `200 OK`: On successful thread creation.
    - `400 Bad Request`: Missing required fields.
    - `404 Not Found`: If the board is not found.

### 2. **View threads**

- **URL**: `/api/threads/:board`
- **Method**: `GET`
- **Response**:
    - `200 OK`: Returns a list of threads with up to 3 replies each. Each thread will have:
      - `thread_id`: The unique identifier of the thread.
      - `text`: The content of the thread.
      - `created_on`: The creation timestamp.
      - `bumped_on`: The last bump timestamp (updated with each reply).
      - `replies`: A list of the most recent 3 replies to the thread.

### 3. **Create a reply**

- **URL**: `/api/replies/:board`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "text": "Reply text",
      "delete_password": "password",
      "thread_id": "thread_id"
    }
    ```
- **Response**:
    - `200 OK`: On successful reply creation.
    - `400 Bad Request`: Missing required fields.
    - `404 Not Found`: If the thread is not found.

### 4. **Report a thread**

- **URL**: `/api/threads/:board`
- **Method**: `PUT`
- **Body**:
    ```json
    {
      "thread_id": "thread_id"
    }
    ```
- **Response**:
    - `200 OK`: On successful report of the thread. The thread's `reported` field is set to true.
    - `404 Not Found`: If the thread is not found.

### 5. **Report a reply**

- **URL**: `/api/replies/:board`
- **Method**: `PUT`
- **Body**:
    ```json
    {
      "thread_id": "thread_id",
      "reply_id": "reply_id"
    }
    ```
- **Response**:
    - `200 OK`: On successful report of the reply. The reply's `reported` field is set to true.
    - `404 Not Found`: If the thread or reply is not found.

### 6. **Delete a thread**

- **URL**: `/api/threads/:board`
- **Method**: `DELETE`
- **Body**:
    ```json
    {
      "thread_id": "thread_id",
      "delete_password": "password"
    }
    ```
- **Response**:
    - `200 OK`: On successful thread deletion.
    - `400 Bad Request`: Incorrect password.
    - `404 Not Found`: If the thread is not found.

### 7. **Delete a reply**

- **URL**: `/api/replies/:board`
- **Method**: `DELETE`
- **Body**:
    ```json
    {
      "thread_id": "thread_id",
      "reply_id": "reply_id",
      "delete_password": "password"
    }
    ```
- **Response**:
    - `200 OK`: On successful reply deletion.
    - `400 Bad Request`: Incorrect password.
    - `404 Not Found`: If the thread or reply is not found.

## Installation

1. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/Azaam86msn/SecuredMessageBoard.git
    cd SecuredMessageBoard
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    npm start
    ```

   The app will be accessible at `http://localhost:3000`.

## Testing

To run the tests for this API, run the following command:
```bash
npm test
```

The tests cover the major functionalities of the API, including thread creation, reply creation, reporting, and deletion.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Chai (for testing)
- Mocha (for testing)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### Updates:
- Updated the API documentation to reflect clearer information about the response format, especially around the `reported` fields.
- Provided more precise and consistent example responses for the `POST`, `PUT`, and `DELETE` endpoints.
