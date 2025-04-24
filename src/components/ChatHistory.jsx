import React from "react";

const ChatHistory = ({
    showHistory,
    chatHistory,
    activeChat,
    chatFlow,
    setActiveChat,
    setChatFlow,
    setShowChat,
    setShowHelpOptions,
    setChatHistory
}) => {

    const handleCloseChat = () => {
        if (activeChat) {
            const updated = chatHistory.map(entry =>
                entry === activeChat
                    ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                    : entry
            );
            setChatHistory(updated);
        }
        setActiveChat(null);
        setChatFlow([]);
        setShowChat(false);
    };

    const handleOpenChat = (entry) => {
        setActiveChat(entry);
        setChatFlow([...entry.flow]);
        setShowChat(true);
        setShowHelpOptions(true);
    };

    return (
        <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
            {chatHistory.length === 0 ? (
                <div className="no-chats-message">
                    <h3>Aún no hay chats guardados.</h3>
                </div>) : (
                <ul>
                    {chatHistory.map((entry, index) => (
                        <li
                            key={index}
                            className={`chat-bubble ${entry.isNew ? "new-entry" : ""}`}
                        >
                            <div className="chat-preview">
                                {entry.title || "Chat sin título"}
                            </div>

                            <div className="chat-timestamp">
                                <small>{entry.timestamp}</small>
                            </div>
                            {/* Botón para abrir o cerrar el chat */}
                            {activeChat === entry ? (
                                <button
                                    className="help-btn blue"
                                    onClick={async () => {
                                        if (activeChat) {
                                            // Guarda los cambios antes de cerrar
                                            const updated = chatHistory.map(entry =>
                                                entry === activeChat
                                                    ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                                                    : entry
                                            );
                                            setChatHistory(updated);
                                        }

                                        setActiveChat(null);
                                        setChatFlow([]);
                                        setShowChat(false);
                                    }}
                                >
                                    📁 Cerrar chat
                                </button>

                            ) : (
                                <button
                                    className="help-btn blue"
                                    onClick={() => {
                                        setActiveChat(entry);
                                        setChatFlow([...entry.flow]); // Restaura el flujo completo del chat
                                        setShowChat(true);
                                        setShowHelpOptions(true);
                                    }}
                                >
                                    📂 Abrir chat
                                </button>

                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChatHistory;
