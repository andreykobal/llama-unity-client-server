using UnityEngine;
using UnityEngine.UI;
using SocketIOClient;
using System.Text.RegularExpressions;


public class SocketClient : MonoBehaviour
{
    public InputField inputField;
    public Button sendButton;
    public Text responseText;
    

    private SocketIO socket;
    private const string ServerUrl = "http://localhost:80";
    private string responseBuffer = "";


    void Start()
    {
        socket = new SocketIO(ServerUrl);

        // Assigning the SendButton click event to call the Send function.
        sendButton.onClick.AddListener(Send);

        // Corrected this line to use the += operator to subscribe to the OnConnected event.
        socket.OnConnected += Socket_OnConnected;
        socket.On("response", (response) => Response(response));
        socket.On("chatend", (response) => Debug.Log("\nChat session ended"));
        socket.On("error", (response) => Debug.LogError($"\nServer error: {response.GetValue<string>()}"));
        socket.On("connect_error", (response) => Debug.LogError($"\nConnection error: {response.GetValue<string>()}"));
        socket.On("connect_timeout", (response) => Debug.LogError($"\nConnection timeout: {response.GetValue<string>()} ms"));

        socket.ConnectAsync();
    }

    // Added a handler for the OnConnected event.
    private void Socket_OnConnected(object sender, System.EventArgs e)
    {
        Debug.Log("Connected to server");
    }

    private void Response(SocketIOResponse response)
    {
        string received = response.GetValue<string>();

        // Remove ANSI escape sequences
        string pattern = @"\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]";
        received = Regex.Replace(received, pattern, "");

        Debug.Log("Received: " + received);

        // Directly updating the UI text.
        responseText.text += received;
    }

    // Send function to emit the message to the server.
    public void Send()
    {
        string message = inputField.text.Trim();
        if (!string.IsNullOrEmpty(message))
        {
            socket.EmitAsync("message", message);
            inputField.text = "";
        }
    }
    void OnDestroy()
    {
        if (socket != null)
        {
            socket.DisconnectAsync();
        }
    }
}
