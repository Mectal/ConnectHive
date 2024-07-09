import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Compressor from 'compressorjs';
import './Register.css';
import CreateNav from './CreateNav';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        cpassword: '',
        month: '',
        day: '',
        year: '',
        gender: '',
        location: '',
        educationLevel: '',
        personalityTraits: '',
        socialPreferences: '',
        meetups: '',
        values: '',
        beliefs: '',
        hobbies: [],
        profilePicture: null,
    });

    const [message, setMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [hobbiesCount, setHobbiesCount] = useState(0);
    const [initialHobbies, setInitialHobbies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setHobbiesCount(formData.hobbies.length);
    }, [formData.hobbies]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            if (checked && hobbiesCount >= 5) {
                alert('You can only select up to 5 hobbies.');
                e.target.checked = false;
                return;
            }
            setFormData((prevState) => ({
                ...prevState,
                hobbies: checked ? [...prevState.hobbies, value] : prevState.hobbies.filter((hobby) => hobby !== value),
            }));
            setHobbiesCount(checked ? hobbiesCount + 1 : hobbiesCount - 1);
        } else if (name === 'profilePicture' && files[0]) {
            new Compressor(files[0], {
                quality: 0.8, // Adjust quality as needed
                success: (compressedFile) => {
                    setFormData({ ...formData, [name]: compressedFile });
                },
                error: (err) => {
                    console.error('Image compression error:', err);
                    alert('Failed to compress the image. Please try again.');
                },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDropdownChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            for (const key in formData) {
                if (key === 'hobbies') {
                    data.append(key, JSON.stringify(formData[key])); // Convert hobbies array to JSON string
                } else {
                    data.append(key, formData[key]);
                }
            }

            await axios.post('http://localhost:5000/api/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage('Registration successful! Redirecting to sign in page');
            setTimeout(() => {
                navigate('/login'); // Adjust the path to login
            }, 2000);
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'An error occurred. Please try again.');
        }
    };

    const closeModal = () => {
        setFormData((prevState) => ({
            ...prevState,
            hobbies: initialHobbies,
        }));
        setHobbiesCount(initialHobbies.length);
        setModalVisible(false);
    };

    const openModal = () => {
        setInitialHobbies(formData.hobbies);
        setModalVisible(true);
    };

    const saveInterests = () => {
        setModalVisible(false);
    };

    const handleGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    axios
                        .get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then((response) => {
                            const city = response.data.address.city || response.data.address.town || response.data.address.village || response.data.address.state;
                            setFormData((prevState) => ({
                                ...prevState,
                                location: city,
                            }));
                        })
                        .catch((error) => {
                            console.error('Error fetching location:', error);
                            alert('Unable to fetch location. Please try again.');
                        });
                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                    alert('Unable to access your location. Please enter it manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className="container" id="container">
            <CreateNav />
            <div className="form-container sign-up-container">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <h1>Create Account</h1>
                    <input type="text" name="name" placeholder="Enter name" className="box" onChange={handleChange} required />
                    <input type="text" name="username" placeholder="Enter username" className="box" onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Enter email" className="box" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Enter password" className="box" onChange={handleChange} required />
                    <input type="password" name="cpassword" placeholder="Confirm password" className="box" onChange={handleChange} required />

                    <label htmlFor="birthday">Birthday:</label>
                    <div className="birthday">
                        <div className="birthday-labels">
                            <label>Month</label>
                            <label>Day</label>
                            <label>Year</label>
                        </div>
                        <div className="birthday-inputs">
                            <input type="text" name="month" placeholder="MM" className="birthday-input" onChange={handleChange} required />
                            <input type="text" name="day" placeholder="DD" className="birthday-input" onChange={handleChange} required />
                            <input type="text" name="year" placeholder="YYYY" className="birthday-input" onChange={handleChange} required />
                        </div>
                    </div>

                    <label htmlFor="gender">Gender:</label>
                    <div className="gender-selection">
                        <label>
                            <input type="radio" name="gender" value="Male" onChange={handleChange} /> Male
                        </label>
                        <label>
                            <input type="radio" name="gender" value="Female" onChange={handleChange} /> Female
                        </label>
                        <label>
                            <input type="radio" name="gender" value="Other" onChange={handleChange} /> Other
                        </label>
                    </div>

                    <div className="location-container">
                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            className="box"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                        <button type="button" className="geo-btn" onClick={handleGeolocation}>Use My Location</button>
                    </div>

                    <label htmlFor="educationLevel">Highest Education Level completed:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Education</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('educationLevel', 'Highschool/GED'); }}>Highschool/GED</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('educationLevel', 'College+'); }}>College+</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('educationLevel', 'Other'); }}>Other</a>
                        </div>
                        {formData.educationLevel && <span className="selected-option">{formData.educationLevel}</span>}
                    </div>

                    <label htmlFor="personalityTraits">Select Your Personality Traits:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Traits</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('personalityTraits', 'Introvert'); }}>Introvert</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('personalityTraits', 'Extravert'); }}>Extravert</a>
                        </div>
                        {formData.personalityTraits && <span className="selected-option">{formData.personalityTraits}</span>}
                    </div>

                    <label htmlFor="socialPreferences">Social Preferences:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Group size</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('socialPreferences', 'Small Hive (3 to 5 people)'); }}>Small Hive (3 to 5 people)</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('socialPreferences', 'Big Hive (6 to 10 people)'); }}>Big Hive (6 to 10 people)</a>
                        </div>
                        {formData.socialPreferences && <span className="selected-option">{formData.socialPreferences}</span>}
                    </div>

                    <label htmlFor="meetups">Meetups:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Meetups</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('meetups', 'Often'); }}>Often</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('meetups', 'Not too Often'); }}>Not too Often</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('meetups', 'I just want to expand my network'); }}>I just want to expand my network</a>
                        </div>
                        {formData.meetups && <span className="selected-option">{formData.meetups}</span>}
                    </div>

                    <label htmlFor="values">Values:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Politics</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('values', 'Very Political'); }}>Very Political</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('values', 'Not too political'); }}>Not too political</a>
                        </div>
                        {formData.values && <span className="selected-option">{formData.values}</span>}
                    </div>

                    <label htmlFor="beliefs">Beliefs:</label>
                    <div className="dropdown">
                        <button type="button" className="dropbtn">Beliefs</button>
                        <div className="dropdown-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('beliefs', 'Religious'); }}>Religious</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownChange('beliefs', 'Non-religious'); }}>Non-religious</a>
                        </div>
                        {formData.beliefs && <span className="selected-option">{formData.beliefs}</span>}
                    </div>

                    <label htmlFor="hobbies">Select your favorite Hobbies:</label>
                    <div className="open-modal-btn-container">
                        <button type="button" id="openModal" className="open-modal-btn" onClick={openModal}>Add Interests</button>
                    </div>
                    <div id="hobbiesModal" className={`modal ${modalVisible ? 'show' : ''}`}>
                        <div className="modal-content">
                            <span className="close" onClick={closeModal}>&times;</span>
                            <h2>What are you into?</h2>
                            <p>Give Us your top 5 favorite things to do.</p>
                            <div className="hobbies-grid">
                                <label className={formData.hobbies.includes('Reading') ? 'selected' : ''}>
                                    <input type="checkbox" value="Reading" onChange={handleChange} checked={formData.hobbies.includes('Reading')} />Reading
                                </label>
                                <label className={formData.hobbies.includes('Music') ? 'selected' : ''}>
                                    <input type="checkbox" value="Music" onChange={handleChange} checked={formData.hobbies.includes('Music')} />Music
                                </label>
                                <label className={formData.hobbies.includes('Watching Movies') ? 'selected' : ''}>
                                    <input type="checkbox" value="Watching Movies" onChange={handleChange} checked={formData.hobbies.includes('Watching Movies')} />Watching Movies
                                </label>
                                <label className={formData.hobbies.includes('Sports') ? 'selected' : ''}>
                                    <input type="checkbox" value="Sports" onChange={handleChange} checked={formData.hobbies.includes('Sports')} />Sports
                                </label>
                                <label className={formData.hobbies.includes('Hip Hop') ? 'selected' : ''}>
                                    <input type="checkbox" value="Hip Hop" onChange={handleChange} checked={formData.hobbies.includes('Hip Hop')} />Hip Hop
                                </label>
                                <label className={formData.hobbies.includes('Pop') ? 'selected' : ''}>
                                    <input type="checkbox" value="Pop" onChange={handleChange} checked={formData.hobbies.includes('Pop')} />Pop
                                </label>
                                <label className={formData.hobbies.includes('Rock') ? 'selected' : ''}>
                                    <input type="checkbox" value="Rock" onChange={handleChange} checked={formData.hobbies.includes('Rock')} />Rock
                                </label>
                                <label className={formData.hobbies.includes('Jazz') ? 'selected' : ''}>
                                    <input type="checkbox" value="Jazz" onChange={handleChange} checked={formData.hobbies.includes('Jazz')} />Jazz
                                </label>
                                <label className={formData.hobbies.includes('R&B') ? 'selected' : ''}>
                                    <input type="checkbox" value="R&B" onChange={handleChange} checked={formData.hobbies.includes('R&B')} />R&B
                                </label>
                                <label className={formData.hobbies.includes('Basketball') ? 'selected' : ''}>
                                    <input type="checkbox" value="Basketball" onChange={handleChange} checked={formData.hobbies.includes('Basketball')} />Basketball
                                </label>
                                <label className={formData.hobbies.includes('Football') ? 'selected' : ''}>
                                    <input type="checkbox" value="Football" onChange={handleChange} checked={formData.hobbies.includes('Football')} />Football
                                </label>
                                <label className={formData.hobbies.includes('Painting') ? 'selected' : ''}>
                                    <input type="checkbox" value="Painting" onChange={handleChange} checked={formData.hobbies.includes('Painting')} />Painting
                                </label>
                                <label className={formData.hobbies.includes('Running') ? 'selected' : ''}>
                                    <input type="checkbox" value="Running" onChange={handleChange} checked={formData.hobbies.includes('Running')} />Running
                                </label>
                                <label className={formData.hobbies.includes('Soccer') ? 'selected' : ''}>
                                    <input type="checkbox" value="Soccer" onChange={handleChange} checked={formData.hobbies.includes('Soccer')} />Soccer
                                </label>
                                <label className={formData.hobbies.includes('Boxing/Martial Arts') ? 'selected' : ''}>
                                    <input type="checkbox" value="Boxing/Martial Arts" onChange={handleChange} checked={formData.hobbies.includes('Boxing/Martial Arts')} />Boxing/Martial Arts
                                </label>
                                <label className={formData.hobbies.includes('Baseball') ? 'selected' : ''}>
                                    <input type="checkbox" value="Baseball" onChange={handleChange} checked={formData.hobbies.includes('Baseball')} />Baseball
                                </label>
                                <label className={formData.hobbies.includes('Volleyball') ? 'selected' : ''}>
                                    <input type="checkbox" value="Volleyball" onChange={handleChange} checked={formData.hobbies.includes('Volleyball')} />Volleyball
                                </label>
                            </div>
                            <button type="button" className="save-btn" onClick={saveInterests}>Save ({hobbiesCount}/5)</button>
                        </div>
                    </div>
                    {formData.hobbies.length > 0 && (
                        <div className="selected-interests">
                            {formData.hobbies.map((hobby) => (
                                <span key={hobby} className="selected-option">{hobby}</span>
                            ))}
                        </div>
                    )}

                    <h2>Profile Picture:</h2>
                    <input type="file" name="profilePicture" className="box" accept="image/jpg, image/jpeg, image/png" onChange={handleChange} />
                    <button type="submit" className="btn">Find My Hive</button>

                    {message && <p className="message">{message}</p>}
                </form>
                <div className="login-link">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
