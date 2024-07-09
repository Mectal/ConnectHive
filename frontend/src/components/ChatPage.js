import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import defaultUserImg from '../assets/user.png';
import profileImg from '../assets/profile.png';
import settingImg from '../assets/setting.png';
import helpImg from '../assets/help.png';
import logoutImg from '../assets/logout.png';

const ChatPage = () => {
    const [userData, setUserData] = useState({});
    const [groupData, setGroupData] = useState([]);
    const [messages, setMessages] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const messageInputRef = useRef(null);
    const messagesRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();
    let token;

    useEffect(() => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!tokenCookie) {
            navigate('/login');
        } else {
            token = tokenCookie.split('=')[1];
            fetch('http://localhost:5000/api/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch user data');
                }
            })
            .then(data => {
                if (!data || data.message === 'Unauthorized' || data.message === 'Forbidden') {
                    navigate('/login');
                } else {
                    setUserData(data);
                    fetch(`http://localhost:5000/api/group/${data.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to fetch group data');
                        }
                    })
                    .then(groupData => {
                        setGroupData(groupData);
                    })
                    .catch(err => console.error('Error fetching group data:', err));

                    // Fetch messages for the chat
                    fetch(`http://localhost:5000/api/messages/${data.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to fetch messages');
                        }
                    })
                    .then(fetchedMessages => {
                        setMessages(fetchedMessages);
                    })
                    .catch(err => console.error('Error fetching messages:', err));
                }
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                navigate('/login');
            });
        }
    }, [navigate]);

    const createMessageElement = useCallback((message) => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === userData.username ? 'my-message' : 'other-message'}`;

        const avatar = document.createElement('img');
        avatar.src = message.profile_image ? `http://localhost:5000${message.profile_image}` : 'https://via.placeholder.com/40';
        avatar.alt = 'Avatar';
        avatar.className = 'avatar';

        const messageContent = document.createElement('div');
        messageContent.className = `message-content bubble ${message.sender === userData.username ? 'my-bubble' : ''}`;

        const header = document.createElement('div');
        header.className = 'message-header';

        const sender = document.createElement('span');
        sender.className = 'sender';
        sender.textContent = message.sender;

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = message.timestamp;

        const content = document.createElement('div');
        content.className = 'content';
        content.textContent = message.content;

        header.appendChild(sender);
        header.appendChild(timestamp);
        messageContent.appendChild(header);
        messageContent.appendChild(content);
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);

        return messageElement;
    }, [userData]);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        const socket = socketRef.current;
        const messageInput = messageInputRef.current;
        const messagesContainer = messagesRef.current;

        socket.on('receiveMessage', (message) => {
            const messageElement = createMessageElement(message);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        const sendMessage = async () => {
            if (messageInput.value.trim() !== '') {
                const message = {
                    sender: userData.username,
                    content: messageInput.value,
                    timestamp: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                    profile_image: userData.profile_image,
                };
                socket.emit('sendMessage', message);
                messageInput.value = '';

                try {
                    await fetch('http://localhost:5000/api/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            receiver_id: groupData.id,  // Assuming groupData has an id
                            content: message.content,
                        }),
                    });
                } catch (error) {
                    console.error('Error saving message:', error);
                }
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };

        messageInput.addEventListener('keydown', handleKeyDown);

        return () => {
            socket.disconnect();
            messageInput.removeEventListener('keydown', handleKeyDown);
        };
    }, [userData, createMessageElement, groupData]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = async () => {
        await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        document.cookie = 'token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        navigate('/');
    };

    return (
        <div className="chat-page">
            <nav className="dashboard-nav">
                <ul className="dashboard-nav-links">
                    <li><a href="#">Find A New Hive</a></li>
                    <li><a href="#">Events Near You</a></li>
                    <li><a href="#">MyHive</a></li>
                </ul>
                <img
                    src={userData.profile_image ? `http://localhost:5000${userData.profile_image}` : defaultUserImg}
                    alt="Profile"
                    className="dashboard-profile-pic"
                    onClick={toggleMenu}
                />
                <div className={`dashboard-sub-menu-wrap ${menuOpen ? 'open-menu' : ''}`} id="subMenu">
                    <div className="dashboard-sub-menu">
                        <div className="dashboard-user-info">
                            <img
                                src={userData.profile_image ? `http://localhost:5000${userData.profile_image}` : defaultUserImg}
                                alt="User"
                            />
                            <h2>{userData.username || 'User Name'}</h2>
                        </div>
                        <hr />
                        <a href="#" className="dashboard-sub-menu-link">
                            <img src={profileImg} alt="Profile" />
                            <p>Profile</p>
                            <span>{'>'}</span>
                        </a>
                        <a href="#" className="dashboard-sub-menu-link" onClick={() => navigate('/settings')}>
                            <img src={settingImg} alt="Settings" />
                            <p>Settings</p>
                            <span>{'>'}</span>
                        </a>
                        <a href="#" className="dashboard-sub-menu-link">
                            <img src={helpImg} alt="Help & Support" />
                            <p>Help & Support</p>
                            <span>{'>'}</span>
                        </a>
                        <a href="#" className="dashboard-sub-menu-link" onClick={handleLogout}>
                            <img src={logoutImg} alt="Logout" />
                            <p>Logout</p>
                            <span>{'>'}</span>
                        </a>
                    </div>
                </div>
            </nav>
            <div id="app">
                <div className="sidebar">
                    <button id="add-hive">Add Hive</button>
                    <div className="hive-icon">H</div>
                </div>
                <div className="channels-sidebar">
                    <div className="channel">general</div>
                    <button id="add-channel">Add Channel</button>
                </div>
                <div className="hive-content">
                    <div className="chat">
                        <div className="messages" id="messages" ref={messagesRef}>
                            {messages.map((message, index) => (
                                <div key={index} className={`message ${message.sender === userData.username ? 'my-message' : 'other-message'}`}>
                                    <img src={message.profile_image ? `http://localhost:5000${message.profile_image}` : defaultUserImg} alt="Avatar" className="avatar" />
                                    <div className={`message-content bubble ${message.sender === userData.username ? 'my-bubble' : ''}`}>
                                        <div className="message-header">
                                            <span className="sender">{message.sender}</span>
                                            <span className="timestamp">{message.timestamp}</span>
                                        </div>
                                        <div className="content">{message.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input type="file" id="file-input" style={{ display: 'none' }} />
                            <button id="emoji-button">😊</button>
                            <button id="upload-button">📎</button>
                            <input type="text" placeholder="Type a message..." ref={messageInputRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
