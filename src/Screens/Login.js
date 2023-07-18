import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/loginuser", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const json = await response.json();

      if (json.success) {
        // Save the auth token and user email to local storage
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('authToken', json.authToken);
        navigate('/');
      } else {
        alert('Enter valid credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className='container'>
        <form className='w-50 m-auto mt-5 border bg-dark border-success rounded' onSubmit={handleSubmit}>
          <div className='m-3'>
            <label htmlFor='exampleInputEmail1' className='form-label'>Email address</label>
            <input type='email' className='form-control' name='email' value={credentials.email} onChange={onChange} aria-describedby='emailHelp' />
            <div id='emailHelp' className='form-text'>We'll never share your email with anyone.</div>
          </div>
          <div className='m-3'>
            <label htmlFor='exampleInputPassword1' className='form-label'>Password</label>
            <input type='password' className='form-control' value={credentials.password} onChange={onChange} name='password' />
          </div>
          <button type='submit' className='m-3 btn btn-success'>Submit</button>
          <Link to='/signup' className='m-3 mx-1 btn btn-danger'>New User</Link>
        </form>
      </div>
    </div>
  );
}
