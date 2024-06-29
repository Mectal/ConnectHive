import React from 'react';
import Navbar from './Navbar'; // Make sure NavBar is set up correct
import ContentImage from '../assets/content_image1.jpeg'; // Ensure the path is correct
import './Home.css'; // Assuming the CSS is set up correctly

const Home = () => {
    return (
        <div className="hero">
            <Navbar />  {/* Navbar component */}
            <div className="content">
                <h1 className="anim">Find<br/>Your Hive</h1>
                <p className="anim">
                    <strong>ConnectHive, a friend group finder platform. Imagine Tinder, except instead of helping you find dates,
                    we help you find a group of friends or like minded people that are very similar to you.</strong>
                </p>
                <a href="/register" className="btn anim">Find My Hive</a>
            </div>
            <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
        </div>
    );
};

export default Home;
