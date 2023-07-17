import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';

export default function Signup() {
  const [credentials, setCredentials] = useState({
    prefix: '',
    Fname: '',
    Mname: '',
    Lname: '',
    mobile: '',
    email: '',
    password: '',
    isVerified: false,
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/createuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        alert('Email sent successfully! Please check your inbox.');
        navigate('/login');
      } else {
        alert('Enter Valid Credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };


  const handleChange = (e) => {
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <form
          className="w-50 m-auto mt-5 border bg-dark border-success rounded"
          onSubmit={handleSubmit}
        >
          <div className="m-3">
            <label htmlFor="prefix" className="form-label">
              Prefix
            </label>
            <input
              type="text"
              className="form-control"
              name="prefix"
              value={credentials.prefix}
              onChange={handleChange}
              placeholder="Enter prefix (e.g., Mr, Mrs, etc)"
              required
            />
          </div>
          <div className="m-3">
            <label htmlFor="Fname" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              name="Fname"
              value={credentials.Fname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="m-3">
            <label htmlFor="Mname" className="form-label">
              Middle Name
            </label>
            <input
              type="text"
              className="form-control"
              name="Mname"
              value={credentials.Mname}
              onChange={handleChange}
            />
          </div>
          <div className="m-3">
            <label htmlFor="Lname" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              name="Lname"
              value={credentials.Lname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="m-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="m-3">
            <label htmlFor="mobile" className="form-label">
              Mobile Number
            </label>
            <input
              type="number"
              className="form-control"
              name="mobile"
              value={credentials.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="m-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="m-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="emailVerification"
              checked={credentials.isVerified}
              onChange={(e) =>
                setCredentials((prevCredentials) => ({
                  ...prevCredentials,
                  isVerified: e.target.checked,
                }))
              }
              required
            />
            <label className="form-check-label" htmlFor="emailVerification">
              Verify Email
            </label>
          </div>
          <button type="submit" className="m-3 btn btn-success">
            Submit
          </button>
          <Link to="/login" className="m-3 mx-1 btn btn-danger">
            Already a user
          </Link>
        </form>
      </div>
    </>
  );
}
