using UnityEngine;
using TMPro;
using UnityEngine.UI;
using SocketIOClient;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class SocketClient : MonoBehaviour
{
    public TMP_InputField inputField;
    public Button sendButton;
    public TMP_Text responseText;    

    private SocketIO socket;
    private const string ServerUrl = "http://localhost:80";
    private string responseBuffer = "";
    private readonly Queue<System.Action> _executeOnMainThread = new Queue<System.Action>();

    void Start()
    {
        responseText.text = "";

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

    void Update()
    {
        // Execute all actions on the main thread.
        while (_executeOnMainThread.Count > 0)
        {
            _executeOnMainThread.Dequeue().Invoke();
        }
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

        // Queue the UI update to be executed on the main thread.
        _executeOnMainThread.Enqueue(() => responseText.text += received);
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
