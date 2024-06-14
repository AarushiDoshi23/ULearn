import { useEffect } from 'react';
import './App.css';
import tutoringImage from '../assets/images/img2.png';
import PersonalInfoPage from './PersonalInfo/PersonalInfoPage';
import { useNavigate } from "react-router-dom";
import { SignUp, SignedIn, SignedOut, SignInButton, useUser,RedirectToSignIn } from "@clerk/clerk-react";
import axios from 'axios';

function App() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && user) {
      const clerkId = user.id;
      const email = String(user.primaryEmailAddress);
      const name = user.fullName;
  
      axios.post(`http://localhost:3001/login`, { email })
        .then(response => {
          if (response.data === "not found") {
            console.log(clerkId);
            axios.post(`http://localhost:3001/register`, { clerkId, email, name })
              .then(response => {
                console.log(response.data);
              });
          } 
        });
    }
  }, [isSignedIn, user]);
  

  useEffect(() => {
    if (isSignedIn) {
      navigate("/personalInfo"); }
  }, [isSignedIn]);

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

export default App;