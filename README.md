# Node.js Wrapper for Llama C++ with Unity Client

This project is a Node.js wrapper for interacting with a C++ program (llama) using Socket.IO, which allows communication between the server and a Unity client.

## Getting Started

Clone the repository to your local machine.

```bash
git clone https://github.com/andreykobal/llama-unity-client-server
```

### Prerequisites

- Node.js
- Unity
- C++ Compiler (e.g., g++)

## Server Setup

Navigate to the server directory and install the dependencies.

```bash
cd server
npm install
```

Run the server.

```bash
npm start
```

Your server will start and listen on port `80`.

Server code snippet:

```javascript
// server.js
import express from 'express';
const app = express();
app.post("/llm-api/message", (req, res) => {
  // handling message
});
```

## Unity Client Setup

Open your Unity project and import the provided `SocketClient` script into your project. Attach the `SocketClient` script to a GameObject.

Unity client code snippet:

```csharp
// SocketClient.cs
public class SocketClient : MonoBehaviour
{
    public void Send()
    {
        socket.EmitAsync("message", message);
    }
}
```

## Usage

1. Start the server by running `npm start` in the server directory.
2. Open your Unity project and play the scene that contains the GameObject with the `SocketClient` script attached.
3. Enter a message in the input field and click the send button to send a message to the server, which will communicate with the llama C++ program.

The server will process the message and send a response back, which will be displayed in your Unity client.

## Contributing

If you would like to contribute to this project, please fork the repository, make your changes, and submit a pull request.

## License

This project is open-source, and it is licensed under the [MIT License](LICENSE).

## Acknowledgments

A huge thanks to everyone who contributed to this project. Your contributions are greatly appreciated.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
