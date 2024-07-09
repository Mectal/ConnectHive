/*import React from 'react';
import './Footer.css'; // Import the footer CSS

const Footer = () => {
    return (
        <footer>
            <div className="footer-nav">
                <div className="socials">
                    <h4>Making friends has never been easier.</h4>
                    <img src="img/Flag-logo.png" alt="Flag logo"/>
                    <select id="country">
                        <option value="English">English, USA</option>
                        <option value="Spanish">Spanish, MEX</option>
                        <option value="French">French, FRA</option>
                        <option value="Chinese">Chinese, PRC</option>
                        <option value="Japanese">Japanese, JPN</option>
                    </select>
                    <br/>
                    <img src="img/twitter-svg.svg" width="24px" alt="Twitter"/>
                    <img src="img/instagram-svg.svg" width="24px" alt="Instagram"/>
                    <img src="img/facebook-svg.svg" width="24px" alt="Facebook"/>
                    <img src="img/youtube-svg.svg" width="24px" alt="YouTube"/>
                </div>
                <div className="space"></div>
                <div className="column">
                    <h5>Partnered Schools</h5>
                    <a href="#">CSUN</a>
                    <a href="#">UCLA</a>
                    <a href="#">UC San Diego</a>
                    <a href="#">CSU Long Beach</a>
                    <a href="#">USC</a>
                    <a href="#">CalTech</a>
                </div>
                <div className="column">
                    <h5>Company</h5>
                    <a href="#">About</a>
                    <a href="#">Jobs</a>
                    <a href="#">Branding</a>
                    <a href="#">Website</a>
                    <a href="#">Other projects</a>
                </div>
                <div className="column">
                    <h5>Resources</h5>
                    <a href="#">Contact us</a>
                    <a href="#">Legal/Safety</a>
                    <a href="#">ConnectHive Blog</a>
                    <a href="#">Feedback</a>
                    <a href="#">Partners</a>
                    <a href="#">Payments</a>
                    <a href="#">Developers</a>
                    <a href="#">Profile Guide</a>
                    <a href="#">Source code</a>
                    <a href="#">Security</a>
                    <a href="#">Administration</a>
                </div>
                <div className="column">
                    <h5>Policies</h5>
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                    <a href="#">Chat Rules</a>
                    <a href="#">Profile Rules</a>
                    <a href="#">Licenses</a>
                </div>
            </div>
            <div className="footer-nav-mobile">
                <div className="socials">
                    <h4>Making friends has never been easier.</h4>
                    <img src="img/Flag-logo.png" alt="Flag logo"/>
                    <select id="country">
                        <option value="English">English, USA</option>
                        <option value="Hindi">Hindi, India</option>
                        <option value="Polski">Polski, Poland</option>
                        <option value="French">French, France</option>
                        <option value="Kurdish">Kurdish, Turkey</option>
                    </select>
                    <br/>
                    <img src="img/twitter-svg.svg" width="24px" alt="Twitter"/>
                    <img src="img/instagram-svg.svg" width="24px" alt="Instagram"/>
                    <img src="img/facebook-svg.svg" width="24px" alt="Facebook"/>
                    <img src="img/youtube-svg.svg" width="24px" alt="YouTube"/>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td className="heading">Partnered</td>
                            <td className="heading">Company</td>
                        </tr>
                        <tr>
                            <td><a href="#">CSUN</a></td>
                            <td><a href="#">About</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">UCLA</a></td>
                            <td><a href="#">Jobs</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">UC San Diego</a></td>
                            <td><a href="#">Branding</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">CSU Long Beach</a></td>
                            <td><a href="#">Website</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">USC</a></td>
                            <td><a href="#">Other projects</a></td>
                        </tr>
                    </tbody>
                    <tbody>
                        <tr>
                            <td className="heading">Resources</td>
                            <td className="heading">Policies</td>
                        </tr>
                        <tr>
                            <td><a href="#">Contact us</a></td>
                            <td><a href="#">Terms</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Legal/Safety</a></td>
                            <td><a href="#">Privacy</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">ConnectHive Blog</a></td>
                            <td><a href="#">Chat Rules</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Feedback</a></td>
                            <td><a href="#">Profile Rules</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Partners</a></td>
                            <td><a href="#">Licenses</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Payments</a></td>
                            <td><a href="#"></a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Developers</a></td>
                            <td><a href="#"></a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Profile Guide</a></td>
                            <td><a href="#"></a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Source code</a></td>
                            <td><a href="#"></a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="footer-bar">
                <img src="D:/ConnectHive Home/img/ConnectHive Logo 1.webp" alt="ConnectHive Logo"/>
            </div>
        </footer>
    );
};

export default Footer; */

import React from 'react';
import './Footer.css'; // Import the footer CSS
import ConnectHiveLogo from '../assets/ConnectHive_Logo_1.jpeg';

const Footer = () => {
    return (
        <footer>
            <div className="footer-nav">
                <div className="footer-section socials">
                    <h4>Making friends has never been easier.</h4>
                    <select id="country" className="language-select">
                        <option value="English">English, USA</option>
                        <option value="Spanish">Spanish, MEX</option>
                        <option value="French">French, FRA</option>
                        <option value="Chinese">Chinese, PRC</option>
                        <option value="Japanese">Japanese, JPN</option>
                    </select>
                    
                </div>
                <div className="footer-section">
                    <h5>Partnered Schools</h5>
                    <a href="#">CSUN</a>
                    <a href="#">UCLA</a>
                    <a href="#">UC San Diego</a>
                    <a href="#">CSU Long Beach</a>
                    <a href="#">USC</a>
                    <a href="#">CalTech</a>
                </div>
                <div className="footer-section">
                    <h5>Company</h5>
                    <a href="#">About</a>
                    <a href="#">Jobs</a>
                    <a href="#">Branding</a>
                    <a href="#">Website</a>
                    <a href="#">Other projects</a>
                </div>
                <div className="footer-section">
                    <h5>Resources</h5>
                    <a href="#">Contact us</a>
                    <a href="#">Legal/Safety</a>
                    <a href="#">ConnectHive Blog</a>
                    <a href="#">Feedback</a>
                    <a href="#">Partners</a>
                    <a href="#">Payments</a>
                    <a href="#">Developers</a>
                    <a href="#">Profile Guide</a>
                    <a href="#">Source code</a>
                    <a href="#">Security</a>
                    <a href="#">Administration</a>
                </div>
                <div className="footer-section">
                    <h5>Policies</h5>
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                    <a href="#">Chat Rules</a>
                    <a href="#">Profile Rules</a>
                    <a href="#">Licenses</a>
                </div>
            </div>
            <div className="footer-bar">
            <img src={ConnectHiveLogo} className="logo" alt="ConnectHive Logo" />
            </div>
        </footer>
    );
};

export default Footer;
