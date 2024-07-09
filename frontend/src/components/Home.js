/*import React from 'react';
import Navbar from './Navbar';
import ContentImage from '../assets/content_image1.jpeg';
import './Home.css';
import Footer from './Footer';

const Home = () => {
    return (
        <div className="page-container">
            <div className="content-wrap">
                <Navbar />
                <div className="hero">
                    <div className="content">
                        <h1 className="anim">Find<br />Your Hive</h1>
                        <p className="anim">
                            <strong>ConnectHive, a friend group finder platform. Imagine Tinder, except instead of helping you find dates,
                            we help you find a group of friends or like-minded people that are very similar to you.</strong>
                        </p>
                        <a href="/register" className="btn anim">Find My Hive</a>
                        <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
                    </div>
                    <div class="container" data-aos="fade-up">
                         <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
                         <div class="description">
                            <h2>Making a friend</h2>
                             <p>Our algorithm will make sure you find someone you will connect with for a long time.</p>
                        </div>
                    </div>
                    <div class="container2" data-aos="fade-up">
                           <div class="description">
                            <h2>Making Hives</h2>
                            <p>Soon enough, you will have an entire network of friends you can talk to with easy-to-use group chat functions.</p>
                            </div>
                           <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
                    </div>
                    <div class="container" data-aos="fade-up">
                            <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
                            <div class="description">
                            <h2>No one left behind</h2>
                            <p>No matter who you are or what defines you as a person, ConnectHive will make sure you establish a connection with someone.</p>
                            </div>
                    </div>
                    <div class="bottom-container" data-aos="fade-up">
                           <div class="description">
                            <h2>Express yourself!</h2>
                            <p>ConnectHive lets you give a great first impression when you make your profile.</p>
                            </div>
       
                    </div>

                    <div class="last-message">
                        <h4>Ready to make friends?</h4>
		                <a href="#">Find My Hive</a>
                    </div>
                    

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home; */

import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ContentImage from '../assets/content_image1.jpeg'; 
import FriendImage from '../assets/makinganewfriend.jpg';
import HivesImage from '../assets/makinghives.jpg'; 
import NoOneLeftBehindImage from '../assets/nooneleftbehind.jpg';
import './Home.css';


const Home = () => {
    useEffect(() => {
        const handleScroll = () => {
            const elements = document.querySelectorAll('.fade-in');
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top <= window.innerHeight - 100) {
                    element.classList.add('visible');
                } else {
                    element.classList.remove('visible');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="page-container">
           <Navbar />
            <div className="content-wrap">
                <div className="hero">
                    <div className="content">
                        <h1 className="anim">Find<br />Your Hive</h1>
                        <p className="anim">
                            <strong>ConnectHive, a friend group finder platform. Imagine Tinder, except instead of helping you find dates,
                            we help you find a group of friends or like-minded people that are very similar to you.</strong>
                        </p>
                        <a href="/register" className="btn anim">Find My Hive</a>
                    </div>
                    <img src={ContentImage} className="feature-img anim" alt="Group of friends" />
                </div>
                <div className="container fade-in">
                    <img src={FriendImage} className="container-img" alt="Making a friend" />
                    <div className="description">
                        <h2>Making a friend</h2>
                        <p>Our algorithm will make sure you find someone you will connect with for a long time.</p>
                    </div>
                </div>
                <div className="container2 fade-in">
                    <div className="description">
                        <h2>Making Hives</h2>
                        <p>Soon enough, you will have an entire network of friends you can talk to with easy-to-use group chat functions.</p>
                    </div>
                    <img src={HivesImage} className="container-img" alt="Making Hives" />
                </div>
                <div className="container fade-in">
                    <img src={NoOneLeftBehindImage} className="container-img" alt="No one left behind" />
                    <div className="description">
                        <h2>No one left behind</h2>
                        <p>No matter who you are or what defines you as a person, ConnectHive will make sure you establish a connection with someone.</p>
                    </div>
                </div>
                <div className="bottom-container fade-in">
                    <div className="description">
                        <h2>Express yourself!</h2>
                        <p>ConnectHive lets you give a great first impression when you make your profile.</p>
                    </div>
                </div>
                <div className="last-message fade-in">
                    <h4>Ready to make friends?</h4>
                    <a href="#">Find My Hive</a>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
