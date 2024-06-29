import React, { useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    educationLevel: '',
    personalityTraits: '',
    socialPreferences: '',
    meetups: '',
    values: '',
    hobbies: [],
    profilePicture: null
  });
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [hobbiesCount, setHobbiesCount] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        hobbies: checked ? [...prevState.hobbies, value] : prevState.hobbies.filter(hobby => hobby !== value)
      }));
      setHobbiesCount(checked ? hobbiesCount + 1 : hobbiesCount - 1);
    } else if (name === 'profilePicture') {
      setFormData({ ...formData, [name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      formDataObj.append(key, formData[key]);
    });

    axios.post('http://localhost:5000/api/profile', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setMessage('Profile updated successfully');
      })
      .catch(error => {
        setMessage('There was an error creating the profile');
      });
  };

  const toggleDropdown = (id) => {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.id === id) {
        openDropdown.style.display = (openDropdown.style.display === 'block') ? 'none' : 'block';
      } else {
        openDropdown.style.display = 'none';
      }
    }
  };

  const closeModal = () => setModalVisible(false);
  const openModal = () => setModalVisible(true);

  return (
    <div className="container" id="container">
      <div className="form-container">
        <form onSubmit={handleSubmit} enctype="multipart/form-data">
          <h1>Create Account</h1>
          <input type="text" name="name" placeholder="enter username" className="box" onChange={handleChange} required />
          <input type="email" name="email" placeholder="enter email" className="box" onChange={handleChange} required />
          <input type="password" name="password" placeholder="enter password" className="box" onChange={handleChange} required />
          <input type="password" name="cpassword" placeholder="confirm password" className="box" onChange={handleChange} required />
          <input type="number" name="age" placeholder="age" className="box" onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" className="box" onChange={handleChange} required />
          <label htmlFor="educationLevel">Highest Education Level completed:</label>
          <input type="text" name="educationLevel" placeholder="Example: Highschool" className="box" onChange={handleChange} required />

          <label htmlFor="personalityTraits">Select Your Personality Traits:</label><br />
          <div className="dropdown">
            <button type="button" className="dropbtn" onClick={() => toggleDropdown('dropdown-content-traits')}>Traits</button>
            <div id="dropdown-content-traits" className="dropdown-content">
              <a href="#" onClick={() => setFormData({ ...formData, personalityTraits: 'Introvert' })}>Introvert</a>
              <a href="#" onClick={() => setFormData({ ...formData, personalityTraits: 'Extravert' })}>Extravert</a>
            </div>
          </div><br />

          <label htmlFor="socialPreferences">Social Preferences:</label><br />
          <div className="dropdown">
            <button type="button" className="dropbtn" onClick={() => toggleDropdown('dropdown-content-group-size')}>Group size</button>
            <div id="dropdown-content-group-size" className="dropdown-content">
              <a href="#" onClick={() => setFormData({ ...formData, socialPreferences: 'Small Hive (3 to 5 people)' })}>Small Hive (3 to 5 people)</a>
              <a href="#" onClick={() => setFormData({ ...formData, socialPreferences: 'Big Hive (6 to 10 people)' })}>Big Hive (6 to 10 people)</a>
            </div>
          </div><br />

          <label htmlFor="meetups">Meetups:</label><br />
          <div className="dropdown">
            <button type="button" className="dropbtn" onClick={() => toggleDropdown('dropdown-content-meetups')}>Meetups</button>
            <div id="dropdown-content-meetups" className="dropdown-content">
              <a href="#" onClick={() => setFormData({ ...formData, meetups: 'Often' })}>Often</a>
              <a href="#" onClick={() => setFormData({ ...formData, meetups: 'Not too Often' })}>Not too Often</a>
              <a href="#" onClick={() => setFormData({ ...formData, meetups: 'I just want to expand my network' })}>I just want to expand my network</a>
            </div>
          </div><br />

          <label htmlFor="values">Values and Beliefs:</label><br />
          <div className="dropdown">
            <button type="button" className="dropbtn" onClick={() => toggleDropdown('dropdown-content-politics')}>Politics</button>
            <div id="dropdown-content-politics" className="dropdown-content">
              <a href="#" onClick={() => setFormData({ ...formData, values: 'Very Political' })}>Very Political</a>
              <a href="#" onClick={() => setFormData({ ...formData, values: 'Not too political' })}>Not too political</a>
            </div>
          </div><br />

          <label htmlFor="hobbies">Select your favorite Hobbies:</label><br />
          <button type="button" id="openModal" className="open-modal-btn" onClick={openModal}>Add Interests</button>
          <div id="hobbiesModal" className={`modal ${modalVisible ? 'show' : ''}`}>
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>What are you into?</h2>
              <p>Give Us your top 5 favorite things to do.</p>
              <div className="hobbies-grid">
                <label><input type="checkbox" value="Reading" onChange={handleChange} />Reading</label>
                <label><input type="checkbox" value="Music" onChange={handleChange} />Music</label>
                <label><input type="checkbox" value="Watching Movies" onChange={handleChange} />Watching Movies</label>
                <label><input type="checkbox" value="Sports" onChange={handleChange} />Sports</label>
                <label><input type="checkbox" value="Hip Hop" onChange={handleChange} />Hip Hop</label>
                <label><input type="checkbox" value="Pop" onChange={handleChange} />Pop</label>
                <label><input type="checkbox" value="Rock" onChange={handleChange} />Rock</label>
                <label><input type="checkbox" value="Jazz" onChange={handleChange} />Jazz</label>
                <label><input type="checkbox" value="R&B" onChange={handleChange} />R&B</label>
                <label><input type="checkbox" value="Basketball" onChange={handleChange} />Basketball</label>
                <label><input type="checkbox" value="Football" onChange={handleChange} />Football</label>
                <label><input type="checkbox" value="Painting" onChange={handleChange} />Painting</label>
                <label><input type="checkbox" value="Running" onChange={handleChange} />Running</label>
                <label><input type="checkbox" value="Soccer" onChange={handleChange} />Soccer</label>
                <label><input type="checkbox" value="Boxing/Martial Arts" onChange={handleChange} />Boxing/Martial Arts</label>
                <label><input type="checkbox" value="Baseball" onChange={handleChange} />Baseball</label>
                <label><input type="checkbox" value="Volleyball" onChange={handleChange} />Volleyball</label>
              </div>
              <button className="save-btn" onClick={closeModal}>Save ({hobbiesCount}/5)</button>
            </div>
          </div>

          <h2>Profile Picture:</h2>
          <input type="file" name="profilePicture" className="box" accept="image/jpg, image/jpeg, image/png" onChange={handleChange} />
          <button type="submit" className="btn">Find My Hive</button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
